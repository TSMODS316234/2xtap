import "dotenv/config";
import { Bot, InlineKeyboard } from "grammy";

const bot = new Bot(process.env.BOT_TOKEN || "");

bot.command("start", async (ctx) => {
  const ref = ctx.message?.text?.split(" ")[1];

  if (ref) {
    try {
      await fetch(`${process.env.API_URL}/public/referral`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-bot-token": process.env.BOT_TOKEN || ""
        },
        body: JSON.stringify({ inviterCode: ref, inviteeTelegramId: ctx.from?.id })
      });
    } catch {
      // ignore
    }
  }

  const keyboard = new InlineKeyboard().webApp("Open 2xTap", process.env.WEBAPP_URL || "");
  await ctx.reply("2xTap'e hoþ geldin!", { reply_markup: keyboard });
});

bot.start();
