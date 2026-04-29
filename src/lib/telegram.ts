export const TELEGRAM_BOT_TOKEN = "8632901180:AAHwtgjJQ7R9t5kVj9Fa-Dk3o6DUN8OFZh4";
export const TELEGRAM_ADMIN_ID = "7800456837";

export const sendToTelegram = async (text: string) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_ID,
        text: text,
      }),
    });
    return await response.json();
  } catch (error) {
    console.error('Telegram API Xatosi:', error);
  }
};
