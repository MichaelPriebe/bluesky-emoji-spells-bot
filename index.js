// Dotenv

import dotenv from "dotenv";
dotenv.config();

// Bluesky

import BlueSkyPlatform from "./platforms/bluesky.js";
const bluesky = new BlueSkyPlatform();
await bluesky.login(process.env.BLUESKY_USERNAME, process.env.BLUESKY_PASSWORD);
console.log("BlueSky: Logged in!");

// Nostr

const nostr = new NostrPlatform();
await nostr.login(process.env.NOSTR_PRIVATE_KEY);
console.log("Nostr: Logged in!");

// Cron

import { CronJob } from "cron";

// Openai

import { Configuration, OpenAIApi } from "openai";
import NostrPlatform from "./platforms/nostr.js";
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

const prompt = [
  "You are an emoji spell bot. You write emoji spells, and respond in json.",
  "Example:",
  JSON.stringify({
    spell: "🐇🔍🕰️💼💰🍀🥠🔮🎯",
    name: "Lucky Break",
    desc: "Find success and wealth with this spell. Trust your instincts and seize the opportunities around you.",
  }),
  "Example:",
  JSON.stringify({
    spell: "🌻🪴🐝🍯👩‍🍳🔪🍽️💕🙏",
    name: "Sweet Blessing",
    desc: "A spell for a happy home and delicious food. Invite abundance and gratitude into your life with this spell.",
  }),
  "Example:",
  JSON.stringify({
    spell: "🌪️🪑🛋️💨👋🏽💼🛏️👀🔎",
    name: "Spell of Disappearing Furniture",
    desc: "Helps locate lost or misplaced items through a flurry of movement and attention to detail.",
  }),
  "Example:",
  JSON.stringify({
    spell: "🔮🕰️🌟🌀🦜🧑‍💼📈💰🧨",
    name: "Time is Money",
    desc: "With this spell, you'll strike it rich! It brings financial success and opportunities, but beware of the unexpected.",
  }),
  "Rules:",
  "Spells MUST be random, but realistic and relevant to everyday life.",
  '"spell" MUST consist of 9 emojis.',
  '"desc" MUST be less than 200 characters.',
].join("\n");

const job = new CronJob("11 * * * *", async () => {
  let parsed;
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
    });

    const { content } = completion.data.choices[0].message;
    parsed = JSON.parse(content);
  } catch (e) {
    console.error("Error with OpenAI:", e);
  }

  const post = [parsed.spell, "", `${parsed.name}: ${parsed.desc}`].join("\n");

  // Bluesky
  try {
    const text = [
      post,
      "",
      "❤️ Like to empower ✨",
      "🔁 Repost to cast 🪄",
    ].join("\n");
    await bluesky.post(text);
  } catch (e) {
    console.error("Error with BlueSky:", e);
  }

  // Nostr
  try {
    const text = [
      post,
      "",
      "⚡ Zap to empower ✨",
      "🔁 Repost to cast 🪄",
    ].join("\n");
    nostr.post(text);
  } catch (e) {
    console.error("Error with Nostr:", e);
  }

  console.log("Posted:", post);
});

console.log("Starting job!");
job.start();
