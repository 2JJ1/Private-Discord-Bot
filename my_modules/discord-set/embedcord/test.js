const Embed = require("./index");

const embed = new Embed.DiscordEmbed()
    .setTitle("Embed Title.")
    .setAuthor("Author Name", "https://i.imgur.com/lm8s41J.png", "https://discordapp.com")
    .setColor("BLURPLE") // Supports discord.js colors
    .setDescription("Embed Description.")
    .setFooter("Embed Footer.", "http://i.imgur.com/w1vhFSR.png")
    .setImage("http://i.imgur.com/yVpymuV.png")
    .setThumbnail("http://i.imgur.com/p2qNFag.png")
    .setTimestamp( /* enter timestamp or leave it blank */ )
    .setURL("https://discord.gg") // title url
    .addField("Embed Field", "Value.")
    .addBlankField() // blank field like discord.js
    .addField("Inline Field", "Value.", true)
    .addField("Another Field", "Max 25.", true);

console.log(embed.embed);