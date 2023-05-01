import { Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import config from "config";
import { ogg } from "./ogg.js";
import { openai } from "./openai.js";
import { code } from "telegraf/format";

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

const INITIAL_SESSION = {
  messages: [],
};

bot.use(session());

bot.command("new", async (context) => {
  context.session = { messages: [] };
  await context.reply("Жду вашего сообщения!");
});

bot.on(message("voice"), async (context) => {
  if (!context.session) {
    context.session = { messages: [] };
  }

  try {
    const link = await context.telegram.getFileLink(
      context.message.voice.file_id
    );
    const userId = String(context.message.from.id);

    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);

    const text = await openai.transcription(mp3Path);
    await context.reply(code(`Ваш запрос: ${text}`));

    context.session.messages.push({
      role: openai.roles.USER,
      content: text,
    });
    const response = await openai.chat(context.session.messages);

    context.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    });

    await context.reply(response.content);
  } catch (error) {
    console.log("Error while message", error.message);
  }
});

bot.on(message("text"), async (context) => {
  console.log("Request from:", context.message.from.id)
  if (!context.session) {
    context.session = INITIAL_SESSION;
  }
  console.log("Context size:", context.session.messages.reduce((prev, cur) => prev + cur.content.length, 0))

  try {
    const text = context.message.text

    await context.reply(code(`Ваш запрос: ${text}`));

    context.session.messages.push({
      role: openai.roles.USER,
      content: text,
    });
    const response = await openai.chat(context.session.messages);

    context.session.messages.push({
      role: openai.roles.ASSISTANT,
      content: response.content,
    });

    await context.reply(response.content);

    console.log("Response for:", context.message.from.id)
  } catch (error) {
    console.log("Error while message", error.message);
  }
});

bot.command("start", async (context) => {
  context.session = INITIAL_SESSION;
  await context.reply("Жду вашего сообщения!");
  await context.reply(JSON.stringify(context.message, null, 2));
});

bot.launch();

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
