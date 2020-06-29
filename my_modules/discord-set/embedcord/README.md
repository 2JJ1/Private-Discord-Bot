# Embedcord
A package for discord to build embeds like discord.js

# NPM
```
npm i --save embedcord
```

[![NPM](https://nodei.co/npm/embedcord.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/embedcord/)

# What's New?
- Supports Discord.JS colors
- Author should support URL
- Added more bugs to fix later 👀

[![NPM](https://nodei.co/npm/embedcord.png)](https://nodei.co/npm/embedcord/)

# Quick Example
```js
const  Embed = require("embedcord");

const embed = new Embed.DiscordEmbed()
  .setTitle("Embed Title.")
  .setAuthor("Author Name", "https://i.imgur.com/lm8s41J.png", "https://discordapp.com")
  .setColor("BLURPLE") // Supports discord.js colors
  .setDescription("Embed Description.")
  .setFooter("Embed Footer.", "http://i.imgur.com/w1vhFSR.png")
  .setImage("http://i.imgur.com/yVpymuV.png")
  .setThumbnail("http://i.imgur.com/p2qNFag.png")
  .setTimestamp(/* enter timestamp or leave it blank */)
  .setURL("https://discord.gg") // title url
  .addField("Embed Field", "Value.")
  .addBlankField() // blank field like discord.js
  .addField("Inline Field", "Value.", true)
  .addField("Another Field", "Max 25.", true);

message.channel.send(embed); // discord.js
message.channel.createMessage(embed); // Eris
```

# Using Node-Fetch [Webhooks]

```js
  const fetch = require("node-fetch");
  const webhook = "https://canary.discordapp.com/api/webhooks/1234567890/ABCDEFabcdef_wefw-fhkjshnf";
  const  Embed = require("embedcord");

  const embed = new Embed.DiscordEmbed()
    .setTitle("Embed Title.")
    .setAuthor("Author Name", "https://i.imgur.com/lm8s41J.png", "https://discordapp.com")
    .setColor("BLURPLE")
    .setDescription("Embed Description.")
    .setFooter("Embed Footer.", "http://i.imgur.com/w1vhFSR.png")
    .setImage("http://i.imgur.com/yVpymuV.png")
    .setThumbnail("http://i.imgur.com/p2qNFag.png")
    .setTimestamp()
    .setURL("https://discord.gg")
    .addField("Embed Field", "Value.")
    .addBlankField()
    .addField("Inline Field", "Value.", true)
    .addField("Another Field", "Max 25.", true);

  fetch(webhook, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ 
      embeds: [
        embed.embed
        ]
      })

  });
```

# Embed Object

```js
embed = {
    title: null,
    url: null,
    author: null,
    color: null,
    description: null,
    thumbnail: null,
    fields: [],
    image: null,
    footer: null,
    timestamp: null,
    type: 'rich'
}
```
