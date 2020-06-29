# Discord Set
A powerful module with so many features like memes, automemes, chatbot & more.

[![NPM](https://nodei.co/npm/discord-set.png)](https://nodei.co/npm/discord-set/)

# Fixed
- eightball

# Features
- Posting memes to discord directly
- Fetching random memes from reddit
- Chatbot
- Cat, Dog, Bird images
- Emojify endpoint for discord
- Cowsay
- Roast, jokes, eightball, discord welcome messages, fake discord bot tokens
- Easy to use
- Free [No api key required]

# Functions
- meme
- postAutoMemes
- enableMemeEvent
- cat
- bird
- dog
- fortune
- emojify
- chat
- cowsay
- roast
- discordWelcomeMessages
- generateToken
- eightball
- shuffle
- joke
 
# Docs
## Installing
```
npm i --save discord-set
```

## Getting Started
```js
const { Set } = require("discord-set");
const set = new Set();

set.on("SET_READY", () => {
  console.log("Yo, this is ready!");
});
```

## Fetching Random Memes
```js
const { Set } = require("discord-set");
const set = new Set();
set.enableMemeEvent(7000, ["me_irl", "Dankmemes", "funny"]); /* 7000 => interval | ["me_irl", "Dankmemes", "funny"] => Redditors || Enables MEME_GET event */

set.on("SET_READY", () => {
  console.log("Yo, this is ready!");
});

set.on("MEME_GET", (meme) => {
  if (meme.nsfw || meme.isVideo) return;
  console.log(meme.imageURL);
});
```

## Discord.js Random Memes Post
```js
const { Client, RichEmbed } = require("discord.js");
const client = new Client();

const { Set } = require("discord-set");
const set = new Set();
set.enableMemeEvent(7000, ["me_irl", "Dankmemes", "funny"]); /* 7000 => interval | ["me_irl", "Dankmemes", "funny"] => Redditors || Enables MEME_GET event */

set.on("SET_READY", () => {
  console.log("Yo, this is ready!");
});

set.on("MEME_GET", (meme) => {
  if (meme.nsfw || meme.isVideo) return;
  const embed = new RichEmbed()
  .setImage(meme.imageURL)
  .setTitle("New Meme")

  client.channels.get("channel_id").send(embed);
});

client.login("Token Goes Here");
```

## Meme Autopost Function
```js
const { Client } = require("discord.js");
const client = new Client();
const { Set } = require("discord-set");
const set = new Set();

client.on("ready", () => {
    console.log("ready!");
    let memechannel = client.channels.get("meme_channel_id");
    set.PostAutoMemes(memechannel, 7000, ["PewdiepieSubmissions", "Dankmemes", "me_irl"], { includeNSFW: false }); // posts random memes to a channel in every 7 seconds
});

client.login("Token Goes Here");
```

## Chatbot [ Discord ]
```js
const { Client } = require("discord.js");
const client = new Client();
const { Set } = require("discord-set");
const set = new Set();

client.on("ready", () => {
    console.log("ready!");
});

client.on("message", (message) => {
    if (message.author.bot || !message.guild) return;
    else {
        set.chat(message.content).then(reply => {
            message.channel.send(reply);
        });
    }
});

client.login("Token Goes Here");
```

## Example
```js
const { Client } = require("discord.js");
const client = new Client();
const { Set } = require("discord-set");
const set = new Set();

client.on("ready", () => {
    console.log("ready!");
    let memechannel = client.channels.get("meme_channel_id");
    set.PostAutoMemes(memechannel, 7000, ["PewdiepieSubmissions", "Dankmemes", "me_irl"], { includeNSFW: false });
});

client.on("message", (message) => {
    if (!message.guild || message.author.bot) return;
    const prefix = "?";
    if (!message.content.startsWith(prefix)) return;
    let args = message.content.slice(prefix.length).trim().split(" ");
    let command = args.shift().toLowerCase();
    
    if (command === "ping") {
        return message.channel.send("pong");
    } else if (command === "chat") {
        set.chat(args.join(" ")).then(reply => {
            return message.channel.send(reply);
        });
    } else if (command === "emojify") {
        let msg = set.emojify(args.join(" "));
        return message.channel.send(msg);
    } else if (command === "meme") {
        set.meme(message.channel, ["me_irl", "Dankmemes"], { readyMade: true });
    }
});

client.login("Token Goes Here");
```