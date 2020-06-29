const { EventEmitter } = require("events");

class Handler extends EventEmitter {

    /**
     * @constructor
     * @param {Client} client Discord Client
     */

    constructor() {
        super();
        this.handle = require("./bin/handler").handle;
        let Embed = require("../embedcord");
        this.embed = new Embed.DiscordEmbed();
        this.cow = require("./util/cowsay");

        this.emit("SET_READY", "Ready");
    }

    /**
     * fetches a meme
     * @param {Channel} channel Discord Channel
     * @param {Redditors} redditors Redditors
     * @param {Object} option option
     */

    meme(channel, redditors = [], option = { readyMade: true }) {
        const def = [
            "me_irl",
            "Dankmemes",
            "funny"
        ];
        if (!channel) throw new TypeError("Channel was not provided!");
        if (redditors.length < 1) redditors = def;
        if (option.readyMade === false) {
            return this.handle(`https://api.reddit.com/r/${redditors[Math.floor(Math.random() * redditors.length)]}/random`).then(d => {
                const data = d[0].data.children[0].data;
                data.video = data.is_video;
                data.nsfw = data.over_18;
                data.createdAt = data.created_utc;
                data.imageURL = data.url;
                data.memeRatings = {
                    upvote: data.ups,
                    downvote: data.downs,
                    comments: data.comments
                };
                data.isVideo = data.is_video;
                data.getRedditor = redditor;
            });
        } else {
            this.handle(`https://api.reddit.com/r/${redditors[Math.floor(Math.random() * redditors.length)]}/random`)
                .then(d => {
                    const data = d[0].data.children[0].data;
                    const em = this.embed
                        .setTitle(`${data.title.substring(0, 256)}`)
                        .setURL(`https://reddit.com${data.permalink}`)
                        .setImage(data.url)
                        .setColor("BLURPLE")
                        .setFooter(`${data.ups} 👍 | ${data.downs} 👎 | ${data.num_comments} 💭`)
                        .setTimestamp();

                    channel.send(em);
                });
        }
    }

    /**
     * Post memes on a channel
     * @param {Channel} channel Discord channel
     * @param {Interval} interval Interval to send memes
     * @param {Redditors} redditors Redditors
     */

    PostAutoMemes(channel, interval, redditors = [], options = { includeNSFW: false }) {
        const def = [
            "me_irl",
            "Dankmemes",
            "funny"
        ];
        if (!channel) throw new TypeError("Channel was not provided.");
        if (!interval) interval = 7000;
        if (isNaN(interval)) throw new TypeError("Interval must be a number.");
        if (interval && interval < 7000) throw new TypeError("Interval may not be less than 10000.");
        if (redditors.length < 1) redditors = def;

        setInterval(() => {
            this.handle(`https://api.reddit.com/r/${redditors[Math.floor(Math.random() * redditors.length)]}/random`)
                .then(d => {
                    const data = d[0].data.children[0].data;
                    if (options.includeNSFW === false && data.over_18) return;
                    const em = this.embed
                        .setTitle(`${data.title.substring(0, 256)}`)
                        .setURL(`https://reddit.com${data.permalink}`)
                        .setImage(data.url)
                        .setColor("BLURPLE")
                        .setFooter(`${data.ups} 👍 | ${data.downs} 👎 | ${data.num_comments} 💭`)
                        .setTimestamp(data.created_utc);

                    channel.send(em);
                });
        }, parseInt(interval));
    }

    /**
     * 
     * @param {Number} interval Interval between 2 memes
     * @param {Array} redditors Redditors ["me_irl", "Dankmemes", "funny"] ...
     */

    enableMemeEvent(interval, redditors = []) {
        const def = [
            "me_irl",
            "Dankmemes",
            "funny"
        ];

        if (!interval) interval = 7000;
        if (isNaN(interval)) throw new TypeError("Interval must be a number.");
        if (interval && interval < 7000) throw new TypeError("Interval may not be less than 10000.");
        if (redditors.length < 1) redditors = def;

        setInterval(() => {
            let redditor = redditors[Math.floor(Math.random() * redditors.length)];
            this.handle(`https://api.reddit.com/r/${redditor}/random`)
                .then(d => {
                    const data = d[0].data.children[0].data;
                    data.video = data.is_video;
                    data.nsfw = data.over_18;
                    data.createdAt = data.created_utc;
                    data.imageURL = data.url;
                    data.memeRatings = {
                        upvote: data.ups,
                        downvote: data.downs,
                        comments: data.num_comments
                    };
                    data.isVideo = data.is_video;
                    data.getRedditor = redditor;

                    this.emit("MEME_GET", data);
                });
        }, parseInt(interval));
    }

    /**
     * Get random cat picture
     */

    cat() {
        return this.handle(`http://aws.random.cat/meow`).then(c => c.file);
    }

    /**
     * Get random bird picture
     */

    bird() {
        return this.handle(`http://random.birb.pw/tweet`).then(c => `http://random.birb.pw/img/${c.body}`);
    }

    /**
     * Get random dog picture
     */

    dog() {
        return this.handle(`https://dog.ceo/api/breeds/image/random`).then(c => `${ c.message }`);
    }

    /**
     * Get fortune
     */

    fortune() {
        return this.handle(`https://helloacm.com/api/fortune`);
    }

    /**
     * emojify your message
     * @param {String} message message
     */

    emojify(message) {
        if (!message) throw new TypeError("message not provided.");
        this.emojis = require("./util/emojilist");

        "abcdefghijklmnopqrstuvwxyz".split("").forEach(txt => {
            this.emojis[txt] = this.emojis[txt.toUpperCase()] = ` :regional_indicator_${txt}:`;
        });

        return message.split("").map(txt => this.emojis[txt]).join("");
    }

    /**
     * chatbot
     * @param {String} message message
     */

    chat(message) {
        if (!message) throw new TypeError(`message not provided!`);
        return this.handle(`http://chathelp-it.glitch.me/talkwithmek?message=${encodeURIComponent(message)}`).then(msg => msg.message);
    }

    /**
     * make a cow say something
     * @param {String} message message
     */

    cowsay(message) {
        if (!message) throw new TypeError("message not provided!");
        return this.cow.convert(message);
    }

    /**
     * Roast someone
     */

    roast() {
        this.roasts = require("../data/roasts");
        return this.roasts[Math.floor(Math.random() * this.roasts.length)];
    }

    /**
     * Discord welcome messages
     */

    discordWelcomeMessage() {
        this.data = require("../data/discordMessages");
        return this.data[Math.floor(Math.random() * this.data.length)];
    }

    /**
     * fake Discord bot tokens
     */

    generateToken() {
        this.data = require("../data/tokens");
        return this.data[Math.floor(Math.random() * this.data.length)];
    }

    /**
     * eightball
     */

    eightball() {
        this.data = require("../data/eightball");
        return this.data[Math.floor(Math.random() * this.data.length)];
    }

    /**
     * Shuffles an array
     * @param {Array} arr array 
     */

    shuffle(arr) {
        if (!Array.isArray(arr)) throw new TypeError("Value must be an array.");
        return shuffleArray(arr);
    }

    /**
     * joke
     * @param {Object} options options for the joke
     */

    joke(option = { type: 'all', getAll: false }) {
        this.storage = require("../data/jokes.json");

        if (option.getAll === true) {
            let final = this.storage.filter(d => d.type === option.type);
            if (final.length < 1) final = this.storage;
            return final;
        };

        if (option.type === "general") {
            const filter = this.storage.filter(d => d.type === "general");
            return filter[Math.floor(Math.random() * filter.length)];
        } else if (option.type === "programming") {
            const filter = this.storage.filter(d => d.type === "programming");
            return filter[Math.floor(Math.random() * filter.length)];
        } else if (option.type === "knock-knock") {
            const filter = this.storage.filter(d => d.type === "knock-knock");
            return filter[Math.floor(Math.random() * filter.length)];
        } else {
            return this.storage[Math.floor(Math.random() * this.storage.length)];
        }
    };

};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = Handler;