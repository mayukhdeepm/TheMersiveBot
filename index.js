require("dotenv").config();
const Discord = require("discord.js");
const axios = require("axios");
const client = new Discord.Client();
const { MessageEmbed } = require("discord.js");
const keep_alive = require ('./keep_alive.js');

let interval;
let reactionCollector;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  client.user.setPresence({
    activity: {
      name: "Cryenx Labs 🤖",
      type: "STREAMING",
      url: "https://www.twitch.tv/cryenxlabs",
    },
    status: "online",
  });
});

client.on("message", async (msg) => {
  switch (msg.content) {
    case "ping":
      msg.reply("Pong!");
      break;
    // case "!meme":
    //   msg.channel.send("Here's your meme! (Coming Soon)");
    //   const img = await getMeme();
    //   msg.channel.send(img);
    //   break;
    // case "!eye":
    //   msg.channel.send("You are now subscribed to eye reminders.");
    //   interval = setInterval(function () {
    //     msg.channel.send("Please take an eye break now!").catch(console.error);
    //   }, 3); //every hour
    //   break;
      case "!help":
        help(msg);
        break;
    case "!welcome":
      sendWelcomeEmbed(msg);
      break;
    // case "!stop":
    //   msg.channel.send("I have stopped eye reminders.");
    //   clearInterval(interval);
    //   break;
    case "!embed":
      sendEmbedWithReaction(msg);
      break;
    case "!laws":
      sendLawsEmbed(msg);
      break;
    case "!verify":
      sendTermsEmbed(msg);
      break;
    case "!delete":
      // Check if the user has permission to delete messages
      if (!msg.member.hasPermission("MANAGE_MESSAGES")) {
        return msg.reply("You don't have permission to delete messages.");
      }

      // Fetch messages in the channel
      const fetchedMessages = await msg.channel.messages.fetch();

      try {
        // Delete each message individually
        fetchedMessages.forEach(async (message) => {
          await message.delete();
        });

        // Send a confirmation message
        msg.channel
          .send(`Deleted ${fetchedMessages.size} messages.`)
          .then((sentMsg) => {
            // Automatically delete the confirmation message after 5 seconds
            sentMsg.delete({ timeout: 5000 });
          })
          .catch(console.error);
      } catch (error) {
        console.error("Error deleting messages:", error);
      }
      break;
  }
});

async function getMeme() {
  const res = await axios.get("https://memeapi.pythonanywhere.com/");
  console.log(res.data);
  return res.data.memes[0].url;
}

async function sendWelcomeEmbed(msg) {
  const embed = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("🎉 Welcome to TheMersive Community! 🚀")
    .setDescription(
      `Dive into the boundless realm where imagination merges seamlessly with cutting-edge technology. Whether you're an artist, a 3D designer, a game developer, or a visionary in AI, AR, VR, or MR, you've found your tribe!\n\nHere, we celebrate the fusion of human creativity with deep technological advancements. It's where dreams are sculpted into reality, and innovation knows no bounds.\n\nFeel free to explore, connect, and collaborate with fellow pioneers at the forefront of innovation. Let's embark on an exhilarating journey together, where every idea has the potential to reshape our world.\n\nWelcome aboard, and let the immersive adventure begin! ✨`
    )
    .setImage("https://example.com/your-image-url.jpg"); // Replace with your actual image URL

  msg.channel.send(embed).catch(console.error);
}

async function sendTermsEmbed(msg) {
  const embed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Terms and Conditions")
    .setDescription(
      "Please read and accept the following terms and conditions to continue.\n\n" +
      "1. By accepting these terms, you agree to abide by the rules and guidelines set forth by TheMersive community.\n\n" +
      "2. You understand that any violation of these terms may result in disciplinary action, including but not limited to warnings, temporary suspension, or permanent bans.\n\n" +
      "3. You acknowledge that participation in TheMersive activities is voluntary, and you take responsibility for your actions within the community.\n\n" +
      "4. You agree to respect the privacy and rights of other members, and to contribute positively to the overall atmosphere of inclusivity and collaboration.\n\n" +
      "React with the ✅ emoji below to accept the terms and conditions."
    );

  const sentMessage = await msg.channel.send(embed);
  await sentMessage.react("✅");

  const filter = (reaction, user) => reaction.emoji.name === "✅" && !user.bot;
  const reactionCollector = sentMessage.createReactionCollector(filter);

  reactionCollector.on("collect", (reaction, user) => {
    const member = reaction.message.guild.members.cache.get(user.id);
    const role = reaction.message.guild.roles.cache.find(
      (role) => role.name === "Accepted Terms"
    );
    if (role && member) {
      member.roles
        .add(role)
        .then(() => {
          console.log(`Added role to ${user.tag}`);
          msg.channel.send(
            `${user}, you have successfully accepted the terms and conditions.`
          );
        })
        .catch(console.error);
    }
  });

  reactionCollector.on("end", () => {
    console.log("Reaction collector ended.");
  });
}


async function help(msg) {
  if (msg.content === "!help") {
    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Available Commands')
      .setDescription('Here are the available commands:\n\n' +
        '1. `ping`: Responds with "Pong!"\n' +
        '2. `!welcome`: Sends a welcome message\n' +
        '3. `!embed`: Sends an embed with reactions\n' +
        '4. `!laws`: Displays the laws of TheMersive\n' +
        '5. `!verify`: Accepts terms and conditions\n' +
        '6. `!delete`: Deletes messages (requires permission)\n\n' +
        'Type any of the above commands to use them.'
      );

    msg.channel.send(embed);
  }
}

async function sendLawsEmbed(msg) {
  const embed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("📜 Laws of TheMersive 🌌")
    .setDescription(
      "1. Embrace Diversity: We cherish the multitude of perspectives, backgrounds, and talents within our community. Respect and celebrate the uniqueness of each member.\n\n" +
        "2. Foster Collaboration: Collaboration fuels our creative endeavours. Engage with fellow Mersiveans openly, share ideas generously, and support each other's growth.\n\n" +
        "3. Cultivate Innovation: Innovation is our lifeblood. Push the boundaries of imagination and technology, explore new horizons, and dare to pioneer uncharted territories.\n\n" +
        "4. Empower Creativity: Creativity knows no limits. Encourage experimentation, unleash your imagination, and fearlessly express your ideas in all their forms.\n\n" +
        "5. Uphold Integrity: Integrity is paramount in all interactions. Be honest, transparent, and accountable in your conduct within TheMersive community.\n\n" +
        "6. Promote Learning: Never stop learning and growing. Share knowledge, seek guidance, and foster a culture of continuous improvement for the betterment of all.\n\n" +
        "7. Respect Boundaries: Respect the boundaries and comfort levels of your fellow Mersiveans. Create a safe and inclusive environment where everyone feels valued and heard.\n\n" +
        "8. Honor Contributions: Recognize and appreciate the contributions of your peers. Whether big or small, every effort towards advancing TheMersive vision is worthy of acknowledgement.\n\n" +
        "9. Stay Curious: Curiosity fuels exploration and discovery. Embrace curiosity as a driving force, and remain open to new ideas, technologies, and possibilities.\n\n" +
        "10. Have Fun: Above all, let's enjoy the journey together! Embrace the joy of creation, celebrate successes, and revel in the magic of TheMersive experience."
    );

  await msg.channel.send(embed);
}

async function sendEmbedWithReaction(msg) {
  const embed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Welcome to TheMersive's Choose Category Channel!")
    .setDescription(
      "Here's where you can customize your experience by selecting the categories that resonate with your interests and expertise. React to this message with the emoji corresponding to your preferred category, and you'll gain access to exclusive discussions, resources, and collaboration opportunities tailored to your passion.\n\n" +
        "🎭 - Artists\n" +
        "🥷 - 3D Designing\n" +
        "👾 - Game Design & Development\n" +
        "👓 - Augmented Reality\n" +
        "🥽 - Virtual Reality\n" +
        "🪖 - Mixed Reality\n" +
        "🤖 - Generative AI\n" +
        "🎮 - Unity\n" +
        "🕹️ - Unreal\n" +
        "🩻 - MedTech\n\n" +
        "Once you've chosen your category, you'll unlock a world of possibilities within TheMersive community. Let's embark on this immersive journey together! 🚀"
    )
    .setImage("https://media.tenor.com/TtEyKQg3lMYAAAAe/discord-banner.png"); // Replace with your actual banner image URL

  const sentMessage = await msg.channel.send(embed);
  await sentMessage.react("🎭");
  await sentMessage.react("🥷");
  await sentMessage.react("👾");
  await sentMessage.react("👓");
  await sentMessage.react("🥽");
  await sentMessage.react("🪖");
  await sentMessage.react("🤖");
  await sentMessage.react("🎮");
  await sentMessage.react("🕹️");
  await sentMessage.react("🩻");

  const filter = (reaction, user) =>
    ["🎭", "🥷", "👾", "👓", "🥽", "🪖", "🤖", "🎮", "🕹️", "🩻"].includes(
      reaction.emoji.name
    ) && !user.bot;
  const collector = sentMessage.createReactionCollector(filter, {
    dispose: true,
  });

  collector.on("collect", async (reaction, user) => {
    const member = reaction.message.guild.members.cache.get(user.id);
    let role;
    switch (reaction.emoji.name) {
      case "🎭":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Artists"
        );
        break;
      case "🥷":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "3D Designing"
        );
        break;
      case "👾":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Game Design & Development"
        );
        break;
      case "👓":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Augmented Reality"
        );
        break;
      case "🥽":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Virtual Reality"
        );
        break;
      case "🪖":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Mixed Reality"
        );
        break;
      case "🤖":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Generative AI"
        );
        break;
      case "🎮":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Unity"
        );
        break;
      case "🕹️":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Unreal"
        );
        break;
      case "🩻":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "MedTech"
        );
        break;
    }
    if (role && member) {
      member.roles
        .add(role)
        .then(() => console.log(`Added ${role.name} to ${user.tag}`))
        .catch(console.error);
    }
  });

  collector.on("remove", async (reaction, user) => {
    const member = reaction.message.guild.members.cache.get(user.id);
    let role;
    switch (reaction.emoji.name) {
      case "🎭":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Artists"
        );
        break;
      case "🥷":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "3D Designing"
        );
        break;
      case "👾":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Game Design & Development"
        );
        break;
      case "👓":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Augmented Reality"
        );
        break;
      case "🥽":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Virtual Reality"
        );
        break;
      case "🪖":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Mixed Reality"
        );
        break;
      case "🤖":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Generative AI"
        );
        break;
      case "🎮":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Unity"
        );
        break;
      case "🕹️":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "Unreal"
        );
        break;
      case "🩻":
        role = reaction.message.guild.roles.cache.find(
          (role) => role.name === "MedTech"
        );
        break;
    }
    if (role && member) {
      member.roles
        .remove(role)
        .then(() => console.log(`Removed ${role.name} from ${user.tag}`))
        .catch(console.error);
    }
  });

  collector.on("end", () => {
    console.log("Reaction collector ended.");
  });
}

// client.login(process.env.CLIENT_TOKEN);
client.login(process.env.TOKEN);

