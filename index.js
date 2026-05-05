{
  "name": "discord-bot",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "discord.js": "^14.14.0"
  }
}
// ===== نظام اللفلات الكامل =====

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const TOKEN = process.env.TOKEN;
const PREFIX = "-";
const LEVEL_CHANNEL_NAME = "˚₊·-͟͟͞✨〡・اللــفلات";

// تخزين البيانات (مؤقت)
let usersXP = {};
let usersLevel = {};

// حساب اللفل
function getLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

client.on("ready", () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

// ===== XP من الكتابة =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const channelName = message.channel.name;

  // ===== أمر -لفلي =====
  if (message.content === `${PREFIX}لفلي`) {
    const xp = usersXP[userId] || 0;
    const level = usersLevel[userId] || 0;

    return message.reply(`✨ لفلك: ${level}\n📊 XP: ${xp}`);
  }

  // ===== فقط في روم اللفلات =====
  if (!channelName.includes(LEVEL_CHANNEL_NAME)) return;

  if (!usersXP[userId]) {
    usersXP[userId] = 0;
    usersLevel[userId] = 0;
  }

  // XP عشوائي
  const xpGain = Math.floor(Math.random() * 10) + 5;
  usersXP[userId] += xpGain;

  const newLevel = getLevel(usersXP[userId]);

  if (newLevel > usersLevel[userId]) {
    usersLevel[userId] = newLevel;
    message.reply(`🎉 لفلت! وصلت لفل ${newLevel}`);
  }
});

// ===== XP من الصوت =====
setInterval(() => {
  client.guilds.cache.forEach((guild) => {
    guild.members.cache.forEach((member) => {
      if (member.user.bot) return;

      const voice = member.voice.channel;

      if (voice) {
        const userId = member.id;

        if (!usersXP[userId]) {
          usersXP[userId] = 0;
          usersLevel[userId] = 0;
        }

        usersXP[userId] += 15;

        const newLevel = getLevel(usersXP[userId]);

        if (newLevel > usersLevel[userId]) {
          usersLevel[userId] = newLevel;

          const levelChannel = guild.channels.cache.find(c =>
            c.name.includes(LEVEL_CHANNEL_NAME)
          );

          if (levelChannel) {
            levelChannel.send(`🎉 <@${userId}> لفّل إلى ${newLevel}`);
          }
        }
      }
    });
  });
}, 60000); // كل دقيقة

client.login(TOKEN);
