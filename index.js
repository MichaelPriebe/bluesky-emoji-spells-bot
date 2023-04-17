require("dotenv").config();

// Cron

const { CronJob } = require("cron");

// Openai

const { Configuration, OpenAIApi } = require("openai");
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// Bluesky

const { BskyAgent } = require("@atproto/api");

const bluesky = new BskyAgent({
  service: "https://bsky.social",
});

const prompt = [
  "You are an emoji spell bot. You write emoji spells, and respond in json.",
  "Example:", // Normal
  JSON.stringify({
    spell: "🌞🌙💫🪄🔮🕯️🌿🦉🌺",
    name: "Wilderness Wisdom",
    desc: "This spell harnesses the power of nature to provide guidance and insight. Connect with the wild and listen to its teachings.",
  }),
  "Example:", // Quirky
  JSON.stringify({
    spell: "🌪️🪑🛋️💨👋🏽💼👀🔎",
    name: "Spell of Disappearing Furniture",
    desc: "Helps locate lost or misplaced items through a flurry of movement and attention to detail.",
  }),
  "Example:", // Side-effects
  JSON.stringify({
    spell: "🔮🕰️🌟🌀🦜🧑‍💼📈💰🧨",
    name: "Time is Money",
    desc: "With this spell, you'll strike it rich! It brings financial success and opportunities, but beware of the unexpected.",
  }),
  "Rules:",
  '"desc" MUST be less than 200 characters.',
].join("\n");

bluesky
  .login({
    identifier: process.env.BLUESKY_USERNAME,
    password: process.env.BLUESKY_PASSWORD,
  })
  .then(() => {
    const job = new CronJob("0 * * * *", async () => {
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
        const parsed = JSON.parse(content);

        const post = [
          parsed.spell,
          "",
          `${parsed.name}: ${parsed.desc}`,
          "",
          "🔁 Repost to cast 🪄",
        ].join("\n");

        await bluesky.post({
          text: post,
        });

        console.log("Posted:", post);
      } catch (e) {
        console.error(e);
      }
    });

    job.start();
  });
