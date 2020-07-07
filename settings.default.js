module.exports = {
    /* GENERAL */

    //What initializes a command
    prefix: "!",
    //What the bot's playing status will show
    status: "",
    //true - Deleted & edited messages are logged to a text channel called #logs
    logMessages: false,
    //true - A basic anti-spam is enabled. Deleted flooded messages
    antispam: false,
    //true - Deletes Discord invite links
    antiinvite: false,
    //true - Deletes links that are known ip loggers (Ineffective for masked links)
    antiIPLog: false,
    //true - The bot will attempt to respond if a message starts with a bot mention
    //It sucks by the way... Might add an option to use a paid service
    chatbot: false,
    //The bot will remute members on guild join if they left the guild while muted
    antiMuteBypass: false,
    //The bot will check if a message contains messages that matches the checkers from settings.autoresponders
    autoResponder: false,
    //Hopefully you can figure out the pattern
    //"Uhhh hello world!!!" -> Bot responds with  "Hello world!"
    //"Uhhh hello planet!!!" -> Bot responds with  "Hello world!"
    autoResponders: {
        checkers: [
            [["hello", "hi"],["world", "planet"]],
            [["dm", "message", "pm"], "me"],
        ],
        responses: [
            "Hello world!",
            "You called?",
        ],
        dmPreffered: [
            false,
            true
        ]
    },
    //false/empty string will disable the welcome message
    welcomeMessage: "Welcome to the guild! You can find this bot's source at https://github.com/2JJ1/Private-Discord-Bot.",
    //Array of strings that should not be contained in a newly joined user's name
    //Useful to ban people/fake bots who are acting as an imposter for your brand
    bannedNameContainment: [],
    /*true - Throttles message handling according to settings.messageThrottleOptions
    Useful to prevent the bot from being overloaded if it is on a weak server. This may conflict with anti-spam
    when the throttling is activated*/
    throttleMessages: false,
    throttleMessagesOptions: {
        maxCalls: 40*15, //How many calls per time frame
		timeFrame: 15, //Time frame in seconds
    },

    /* COMMANDS - FUN */

    funCommands: {
        //false - Disables all fun commands
        enabled: false,
        //true - Allows use of the "eightball|8ball" command
        eightball: false,
        //true - Allows use of the "compile" command
        compile: false,
        //true - Allows use of the "joke" command
        joke: false,
        //true - Allows use of the "meme" command
        meme: false,
        //true - Allows use of the "roast" command
        roast: false,
    },

    /* COMMANDS - MODERATOR */

    modCommands: {
        //false - Disables all moderator commands
        enabled: false,
        //true - Allows the "mute" command to be used
        mute: false,
        //true - Allows the "unmute" command to be used
        unmute: false,
        //true - Allows use of the "addminimod" command
        addMinimod: false,
        //true - Limits bans/kicks to 25 per 24 hours
        //Aka anti-nuke
        rateLimitKicks: false,
        //true - Allows use of the "ban" command
        ban: false,
        //true - Allows use of the "unban" command
        unban: false,
        //true - Allows use of the "kick" command
        kick: false,
        //true - Allows use of the "purge" command
        purge: false,
        //true - Allows use of the "removeMinimod" command
        removeMinimod: false,
        //true - Allows use of the "warn" command
        warn: false,
        //true - Allows use of the "unwarn" command
        unwarn: false,
    },

    /* COMMANDS - ADMIN */

    adminCommands: {
        //false - Disables all admin commands
        enabled: false,
        //true - Allows the "clearbans" command to be used
        clearBans: false,
        //true - Allows the "clearmutes" command to be used
        clearMutes: false,
        //true - Allows the "clearwarns" command to be used
        clearWarns: false,
        //true - Allows the "removemoderator" command to be used
        clearWarns: false,
    }
}