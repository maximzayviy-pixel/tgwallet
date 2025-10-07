import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Функция для прямого обновления баланса
async function updateBalanceDirectly(supabase: typeof import('@/lib/supabase').supabase, userId: string, tgId: number) {
  console.log('Updating balance directly for user:', { userId, tgId })
  
  try {
    // Считаем баланс из транзакций
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .eq('status', 'completed')
    
    if (transactionError) {
      console.error('Error fetching transaction data:', transactionError)
      return
    }
    
    let totalBalance = 0
    
    transactionData?.forEach((record: { type: string; amount: number | null }) => {
      if (record.type === 'telegram_stars_topup') {
        totalBalance += Number(record.amount || 0)
      } else if (record.type === 'transfer' || record.type === 'withdrawal') {
        totalBalance -= Number(record.amount || 0)
      }
    })
    
    console.log('Calculated balance:', { totalBalance })
    
    // Обновляем баланс карты
    const { error: balanceError } = await supabase
      .from('cards')
      .update({
        balance: totalBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    
    if (balanceError) {
      console.error('Error updating card balance:', balanceError)
    } else {
      console.log('Card balance updated directly:', { totalBalance })
    }
  } catch (e) {
    console.error('Direct balance update error:', e)
  }
}

const ok = (body: Record<string, unknown> = { ok: true }) =>
  NextResponse.json(body, { status: 200 })

const runQuickly = <T,>(p: Promise<T>, ms = 800) =>
  Promise.race([p, new Promise<T | undefined>(r => setTimeout(() => r(undefined), ms))])

export async function POST(request: NextRequest) {
  try {
    const TG_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!TG_BOT_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.log('Missing required environment variables')
      return ok()
    }

    const update = await request.json()
    console.log('Webhook received update:', { 
      hasCallbackQuery: !!update?.callback_query,
      hasMessage: !!update?.message,
      callbackData: update?.callback_query?.data,
      messageText: update?.message?.text?.substring(0, 100)
    })

    // Быстрый ответ
    return ok()

    // Обработка callback query (кнопки подтверждения)
    if (update?.callback_query?.data) {
      const cq = update.callback_query
      const data = cq.data || ''
      console.log('Received callback query:', { data, from: cq.from?.id })
      
      const m = data.match(/^(pay|rej):([A-Za-z0-9-]+)$/)
      
      if (m) {
        const action = m[1] as 'pay' | 'rej'
        const reqId = m[2]
        
        console.log('Processing callback:', { action, reqId })

        // Снимаем "часики"
        try {
          await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: cq.id, text: '⏳ Обрабатываю...' }),
          })
        } catch (e) {
          console.error('answerCallbackQuery failed', e)
        }

        // Обрабатываем в фоне
        setTimeout(async () => {
          try {
            const { data: pr, error: prErr } = await supabase
              .from('payment_requests')
              .select('*')
              .eq('id', reqId)
              .maybeSingle()

            if (prErr || !pr) {
              console.log('Payment request not found:', { reqId, error: prErr })
              return
            }

            if (action === 'pay' && pr.status === 'pending') {
              console.log('Processing payment confirmation...')
              
              // Обновляем статус запроса
              await supabase
                .from('payment_requests')
                .update({
                  status: 'paid',
                  paid_amount_rub: pr.amount_rub,
                  paid_at: new Date().toISOString()
                })
                .eq('id', reqId)

              // Создаем транзакцию пополнения
              const { error: transactionError } = await supabase
                .from('transactions')
                .insert({
                  card_id: pr.card_id || null,
                  user_id: pr.user_id,
                  type: 'telegram_stars_topup',
                  amount: pr.amount_rub,
                  description: `Top-up via Telegram Stars (${pr.amount_stars} ⭐) - Confirmed`,
                  status: 'completed',
                  external_id: `stars_payment_${Date.now()}`
                })

              if (transactionError) {
                console.error('Transaction creation error:', transactionError)
              } else {
                console.log('Transaction created successfully')
                
                // Обновляем баланс карты
                try {
                  await updateBalanceDirectly(supabase, pr.user_id, pr.tg_id)
                } catch (e) {
                  console.error('Balance update failed:', e)
                }
              }

              // Уведомляем пользователя
              await runQuickly(
                fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: pr.tg_id,
                    text: `Оплата подтверждена ✅\nСумма: ${pr.amount_rub} ₽ (${pr.amount_stars} ⭐)`,
                  }),
                })
              )

              // Убираем клавиатуру
              if (cq.message?.message_id) {
                await runQuickly(
                  fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/editMessageReplyMarkup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chat_id: cq.message.chat.id,
                      message_id: cq.message.message_id,
                      reply_markup: { inline_keyboard: [] },
                    }),
                  })
                )
              }

              await runQuickly(
                fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/answerCallbackQuery`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ callback_query_id: cq.id, text: '✅ Отмечено как оплачено' }),
                })
              )
            } else if (action === 'rej' && pr.status === 'pending') {
              console.log('Processing payment rejection...')
              
              await supabase
                .from('payment_requests')
                .update({ status: 'rejected' })
                .eq('id', reqId)

              if (cq.message?.message_id) {
                await runQuickly(
                  fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/editMessageReplyMarkup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chat_id: cq.message.chat.id,
                      message_id: cq.message.message_id,
                      reply_markup: { inline_keyboard: [] },
                    }),
                  })
                )
              }

              await runQuickly(
                fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/answerCallbackQuery`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ callback_query_id: cq.id, text: '❌ Отклонено' }),
                })
              )
            }
          } catch (e) {
            console.error('Callback processing error:', e)
          }
        }, 100)
      }
    }

    // Обработка успешных платежей Stars
    const msg = update.message || update.edited_message
    const sp = msg?.successful_payment
    if (sp) {
      const fromId = Number(msg?.from?.id || 0)
      const currency = sp.currency
      const total = Number(sp.total_amount || 0)
      
      if (fromId && currency === 'XTR' && total > 0) {
        console.log('Successful payment received:', { fromId, stars: total, payload: sp.invoice_payload })
        
        const stars = total
        const amountRub = stars / 2  // курс 2⭐ = 1₽

        // Парсим payload для получения payment_request_id
        let paymentRequestId = null
        try {
          const payload = JSON.parse(sp.invoice_payload || '{}')
          paymentRequestId = payload.payment_request_id
        } catch (e) {
          console.error('Error parsing invoice payload:', e)
        }

        // Получаем user_id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('telegram_id', fromId)
          .single()

        if (userError || !userData) {
          console.error('User not found for topup:', { fromId, error: userError })
          return
        }

        const userId = userData!.id

        // Обновляем статус payment_request если есть ID
        if (paymentRequestId) {
          try {
            await supabase
              .from('payment_requests')
              .update({
                status: 'paid',
                paid_amount_rub: amountRub,
                paid_at: new Date().toISOString()
              })
              .eq('id', paymentRequestId)
            console.log('Payment request updated:', paymentRequestId)
          } catch (e) {
            console.error('Error updating payment request:', e)
          }
        }

        // Создаем транзакцию
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'telegram_stars_topup',
            amount: amountRub,
            description: `Top-up via Telegram Stars (${stars} ⭐) - Completed`,
            status: 'completed',
            external_id: `stars_payment_${Date.now()}`
          })

        if (transactionError) {
          console.error('Error creating transaction:', transactionError)
          return
        }

        // Обновляем баланс
        try {
          await updateBalanceDirectly(supabase, userId, fromId)
        } catch (e) {
          console.error('Balance update failed:', e)
        }

        // Уведомляем пользователя
        if (TG_BOT_TOKEN) {
          await runQuickly(
            fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: fromId,
                text: `✅ Оплата получена!\n💰 Сумма: ${amountRub} ₽ (${stars} ⭐)\n💳 Баланс обновится в приложении`,
              }),
            })
          )
        }
      }
    }

    return ok()
  } catch (error) {
    console.error('Webhook error:', error)
    return ok()
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
