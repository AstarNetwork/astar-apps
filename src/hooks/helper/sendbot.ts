import axios from 'axios';
export const sendBot = async (text: string) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const BOT_API = '5369921629:AAE6n5S70MRzs2_llhK4mr7zuHJVKArT-sM';
  const BOT_URL = `https://api.telegram.org/bot${BOT_API}/sendMessage`;

  const chat_id = Number('483103053');
  const body = JSON.stringify({
    chat_id,
    text,
  });

  try {
    await axios
      .post(BOT_URL, {
        chat_id,
        text,
      })
      .catch((error) => {
        console.error(error);
      });
    // await fetch(BOT_URL, {
    //   method: 'POST',
    //   body,
    //   headers,
    // });
  } catch (error) {
    console.log(error);
  }
};
