const moment = require("moment")
const fs = require("fs")
const path = require("path")
const { stripIndents } = require("common-tags")
var {SlashCommandBuilder} = require('@discordjs/builders')
const settings = require("../settings")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("guildinfo")
        .setDescription('Describes the guild.'),
    async execute(msg){
        var totalBans = (await msg.guild.bans.fetch()).size

        var rateLimitKicksPerDay = settings.modCommands.rateLimitKicksPerDay
        
        //Kicks/Bans from the past 24 hours
        var recentKicks
        if(rateLimitKicksPerDay > 0){
            recentKicks = (JSON.parse(fs.readFileSync(path.resolve(__dirname, "../flatdbs/kicks.json"), {encoding: "utf8", flag: "a+"}) || "[]")).filter(timestamp => timestamp > Date.now() - 1000*60*60*24)
        }

        var totalMutes = (await msg.guild.members.fetch()).filter(member => member.roles.cache.filter(role => role.name.toLowerCase() === "muted").size > 0).size

        msg.reply({embeds: [{
            title: `${msg.guild.name}'s Guild Information`,
            thumbnail: {
                url: msg.guild.iconURL()
            },
            fields: [
                {name: "Guild Information", 
                value: stripIndents`
                    > ID: ${msg.guild.id}
                    > Owner: ${(await msg.guild.members.fetch(msg.guild.ownerId)).user.tag}
                    > Owner ID: ${msg.guild.ownerId}
                    > Members #: ${(await msg.guild.members.fetch()).size}
                    > Roles #: ${msg.guild.roles.cache.size}
                    > Created: ${moment.utc(msg.guild.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss") + ' (UTC)'}
                    > Bans: ${totalBans}
                    > Mutes: ${totalMutes}` +
                    (rateLimitKicksPerDay > 0 ? `\n> Rate Limited kicks/bans: ${recentKicks.length}/${rateLimitKicksPerDay}` : "")
                },
            ],
        }]})
    },
}