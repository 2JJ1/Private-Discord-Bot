const { Client } = require("discord.js");
const client = new Client();
const { Set } = require("../index");
const set = new Set();

client.on("ready", () => {
    console.log("ready!");
    let memechannel = client.channels.get("channel_id");
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

client.login("Token");