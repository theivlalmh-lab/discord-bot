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
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PREFIX = "-";
const TOKEN = process.env.TOKEN;
const BANK_CHANNEL = "˚₊·-͟͟͞🏛〡・الــبـنـك";

// ===== بيانات =====
let users = {};
let marriages = {};
let companies = {};
let lastDaily = {};

// ===== دوال =====
function getUser(id) {
  if (!users[id]) {
    users[id] = {
      money: 1000,
      job: null,
      company: null
    };
  }
  return users[id];
}

function inBank(channelName) {
  return channelName.includes(BANK_CHANNEL);
}

// ===== تشغيل =====
client.on("ready", () => {
  console.log(`✅ Bot Online: ${client.user.tag}`);
});

// ===== أوامر =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  if (!inBank(message.channel.name)) {
    return message.reply("❌ هذا النظام يعمل فقط في روم البنك");
  }

  const args = message.content.slice(1).split(" ");
  const cmd = args[0];
  const user = getUser(message.author.id);

  // ===== رصيدي =====
  if (cmd === "رصيدي") {
    return message.reply(`💰 رصيدك: ${user.money}`);
  }

  // ===== يومي =====
  if (cmd === "يومي") {
    const now = Date.now();
    if (lastDaily[message.author.id] && now - lastDaily[message.author.id] < 86400000) {
      return message.reply("⏳ استلمت يومي اليوم بالفعل");
    }

    user.money += 500;
    lastDaily[message.author.id] = now;

    return message.reply("🎁 أخذت 500 💰");
  }

  // ===== تحويل =====
  if (cmd === "تحويل") {
    const target = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!target) return message.reply("❌ منشن شخص");
    if (!amount || amount <= 0) return message.reply("❌ مبلغ غلط");

    if (user.money < amount)
      return message.reply("❌ فلوسك ما تكفي");

    user.money -= amount;
    getUser(target.id).money += amount;

    return message.reply("✅ تم التحويل");
  }

  // ===== كازينو =====
  if (cmd === "حظ") {
    const amount = 200;

    if (user.money < amount)
      return message.reply("❌ تحتاج 200 💰");

    const win = Math.random() < 0.5;

    if (win) {
      user.money += amount;
      return message.reply("🎉 فزت +200 💰");
    } else {
      user.money -= amount;
      return message.reply("💀 خسرت -200 💰");
    }
  }

  // ===== وظيفة =====
  if (cmd === "وظيفه") {
    user.job = "موظف";
    return message.reply("💼 تم توظيفك");
  }

  // ===== شركة =====
  if (cmd === "شركة") {
    const name = args.slice(1).join(" ");
    if (!name) return message.reply("❌ اكتب اسم الشركة");

    companies[name] = {
      owner: message.author.id,
      balance: 1000
    };

    user.company = name;

    return message.reply(`🏢 أنشأت شركة ${name}`);
  }

  // ===== توب شركات =====
  if (cmd === "توب_شركات") {
    let list = Object.entries(companies)
      .sort((a, b) => b[1].balance - a[1].balance)
      .slice(0, 5)
      .map((c, i) => `${i + 1}- ${c[0]} 💰${c[1].balance}`)
      .join("\n");

    return message.reply(`🏆 أفضل الشركات:\n${list || "لا يوجد"}`);
  }

  // ===== زواج =====
  if (cmd === "زواج") {
    const target = message.mentions.users.first();
    if (!target) return message.reply("❌ منشن شخص");

    marriages[message.author.id] = target.id;
    marriages[target.id] = message.author.id;

    return message.reply(`💍 تزوجت ${target.username}`);
  }

  // ===== توب فلوس =====
  if (cmd === "توب") {
    let list = Object.entries(users)
      .sort((a, b) => b[1].money - a[1].money)
      .slice(0, 5)
      .map((u, i) => `${i + 1}- <@${u[0]}> 💰${u[1].money}`)
      .join("\n");

    return message.reply(`🏆 أغنى اللاعبين:\n${list}`);
  }

  // ===== أوامر =====
  if (cmd === "الاوامر") {
    return message.reply(`
📋 الأوامر:

💰 البنك:
-رصيدي
-تحويل
-يومي

🎰 كازينو:
-حظ

💼 وظيفة:
-وظيفه

🏢 شركات:
-شركة [اسم]
-توب_شركات

💍 زواج:
-زواج @شخص

🏆:
-توب
`);
  }
});

client.login(TOKEN);
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;
const PREFIX = "-";
const BANK_CHANNEL = "˚₊·-͟͟͞🏛〡・الــبـنـك";

let db = { users: {}, market: {} };

// تحميل البيانات
if (fs.existsSync("data.json")) {
  db = JSON.parse(fs.readFileSync("data.json"));
}

// حفظ البيانات
function save() {
  fs.writeFileSync("data.json", JSON.stringify(db, null, 2));
}

// إنشاء مستخدم
function getUser(id) {
  if (!db.users[id]) {
    db.users[id] = {
      money: 1000,
      items: {}
    };
  }
  return db.users[id];
}

// ===== السوق =====
const items = ["سيارات", "أسهم", "أراضي", "جوالات", "قطارات"];

function updateMarket() {
  items.forEach(i => {
    db.market[i] = Math.floor(Math.random() * 5000) + 500;
  });
  save();
}

// تحديث كل 5 دقائق
setInterval(updateMarket, 300000);
updateMarket();

client.on("ready", () => {
  console.log("✅ Bot Online");
});

// ===== الأوامر =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  if (!message.channel.name.includes(BANK_CHANNEL))
    return message.reply("❌ فقط في روم البنك");

  const args = message.content.slice(1).split(" ");
  const cmd = args[0];
  const user = getUser(message.author.id);

  // 💰 رصيدي
  if (cmd === "رصيدي") {
    return message.reply(`💰 ${user.money}`);
  }

  // 🛒 السوق
  if (cmd === "السوق") {
    let msg = "📊 السوق:\n";
    items.forEach(i => {
      msg += `${i}: 💰 ${db.market[i]}\n`;
    });
    return message.reply(msg);
  }

  // 🛍 شراء
  if (cmd === "شراء") {
    const item = args[1];
    const price = db.market[item];

    if (!price) return message.reply("❌ العنصر غير موجود");
    if (user.money < price) return message.reply("❌ فلوسك ما تكفي");

    user.money -= price;
    user.items[item] = (user.items[item] || 0) + 1;

    save();
    return message.reply(`✅ اشتريت ${item}`);
  }

  // 💸 بيع
  if (cmd === "بيع") {
    const item = args[1];
    const price = db.market[item];

    if (!user.items[item])
      return message.reply("❌ ما تملك هذا");

    user.items[item]--;
    user.money += price;

    save();
    return message.reply(`✅ بعت ${item}`);
  }

  // 📦 ممتلكاتي
  if (cmd === "ممتلكاتي") {
    return message.reply(JSON.stringify(user.items, null, 2));
  }

  // 🏆 توب
  if (cmd === "توب") {
    let list = Object.entries(db.users)
      .sort((a, b) => b[1].money - a[1].money)
      .slice(0, 5)
      .map((u, i) => `${i + 1}- <@${u[0]}> 💰${u[1].money}`)
      .join("\n");

    return message.reply(list);
  }
});

client.login(TOKEN);
