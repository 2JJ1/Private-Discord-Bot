const moment = require("moment")
const fs = require("fs")
const path = require("path")
const { stripIndents } = require("common-tags")
const settings = require("../settings")

module.exports = async function(msg){
    var totalBans = (await msg.guild.fetchBans()).size
    
    //Kicks/Bans from the past 24 hours
    var recentKicks
    if(settings.modCommands.rateLimitKicks){
        var recentKicks = (JSON.parse(fs.readFileSync(path.resolve(__dirname, "../flatdbs/kicks.json"), {encoding: "utf8", flag: "a+"}) || "[]")).filter(timestamp => timestamp > Date.now() - 1000*60*60*24)
    }

    var totalMutes = (await msg.guild.members.fetch()).filter(member => member.roles.cache.filter(role => role.name.toLowerCase() === "muted").size > 0).size

    msg.reply({embed: {
        title: `${msg.guild.name}'s Guild Information`,
        thumbnail: {
            url: msg.guild.iconURL()
        },
        fields: [
            {name: "Guild Information", 
            value: stripIndents`
                > ID: ${msg.guild.id}
                > Owner: ${(await msg.guild.members.fetch(msg.guild.ownerID)).user.tag}
                > Owner ID: ${msg.guild.ownerID}
                > Members #: ${(await msg.guild.members.fetch()).size}
                > Roles #: ${msg.guild.roles.cache.size}
                > Created: ${moment.utc(msg.guild.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss") + ' (UTC)'}
                > Region: ${msg.guild.region}
                > Bans: ${totalBans}
                > Mutes: ${totalMutes}` +
                (settings.modCommands.rateLimitKicks ? `\n> Rate Limited kicks/bans: ${recentKicks.length}/25` : "")
            },
        ],
    }})
}