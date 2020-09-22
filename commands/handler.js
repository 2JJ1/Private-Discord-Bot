//Command handler

var { parseArgsStringToArgv } = require('string-argv');
var parseArgs = require('minimist')

const commands = {
    //Admin cmmands
    "addmod": require('./admin/addmod'),
    "removemod": require('./admin/removemod'),
    "unmod": require('./admin/removemod'), //alias
    "clearmutes": require('./admin/clearmutes.js'),
    "clearwarns": require('./admin/clearwarns.js'),
    "clearbans": require('./admin/clearbans.js'),
    //Moderator commands
    "addminimod": require('./moderator/addminimod'),
    "removeminimod": require('./moderator/removeminimod'),
    "unminimod": require('./moderator/removeminimod'), //alias
    "ban": require('./moderator/ban'),
    "unban": require('./moderator/unban'),
    "kick": require('./moderator/kick'),
    "mute": require('./moderator/mute'),
    "unmute": require('./moderator/unmute'),
    "warn": require('./moderator/warn'),
    "unwarn": require('./moderator/unwarn'),
    "purge": require('./moderator/purge'),
    "slowmode": require('./moderator/slowmode'),
    "addrole": require('./moderator/addrole'),
    "removerole": require('./moderator/removerole'),
    "reboot": require("./moderator/reboot"),
    //Fun commands
    "meme": require('./funcommands/meme'),
    "8ball": require('./funcommands/8ball'),
    "eightball": require('./funcommands/8ball'),
    "joke": require('./funcommands/joke'),
    "roast": require('./funcommands/roast'),
    "compile": require('./funcommands/compile'),
    //etc
    "ping": require('./ping'),
    "listmods": require('./listmods'),
    "help": require('./help'),
    "cmds": require('./help'), //alias
    "commands": require('./help'), //alias
    "whois": require('./whois'),
    "guildinfo": require('./guildinfo'),
    "about": require('./about'),
}

class Commands{
    async HandleCommand(msg){
        var command = msg.content.substring(1).toLowerCase().split(" ");

        var msgarr = parseArgsStringToArgv(msg.content)
        var opts = parseArgs(msgarr)
        delete opts._
        msg.opts = opts

        if(command[0] in commands){
            await commands[command[0]](msg)
        }
    }
}

module.exports = new Commands();