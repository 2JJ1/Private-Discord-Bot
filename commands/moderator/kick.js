const fs = require("fs")
const path = require("path")
var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("kick")
		.setDescription('Kicks the selected member from this guild.')
		.addUserOption(option => 
			option
				.setName("member")
				.setDescription("The member that you want to kick.")
				.setRequired(true)
		),
	async execute(interaction){
		try{
			//Check if settings allow this command
			if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
			if(settings.modCommands.kick === false) throw "The kick command module is disabled"

			//Only mods can kick
			let isMod = await permissions.IsModerator(interaction.member)
			if(isMod !== true)  throw {safe: 'You are not a moderator'};

			//Who to kick
			var target = interaction.mentions.members.first()
			if(!target) throw "You must mention someone"

			//Cant kick moderators
			if(await permissions.IsModerator(target)) throw "Moderators can't be kicked"

			var kicks = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../flatdbs/kicks.json"), {encoding: "utf8", flag: "a+"}) || "[]")

			//Limit global kick count per 24 hours if rate-limiting is enabled
			var rateLimitKicksPerDay = settings.modCommands.rateLimitKicksPerDay
			if(rateLimitKicksPerDay > 0){
				var recentKicks = kicks.filter(timestamp => timestamp > Date.now() - 1000*60*60*24)
				if(recentKicks.length >= rateLimitKicksPerDay) throw `This guild has reached the limit of ${rateLimitKicksPerDay} kicks/bans per 24 hours`
			}

			//Why they were kicked
			var reason
			//If specified through an option
			if(interaction.opts.reason) reason = interaction.opts.reason
			//Otherwise, assume anything after the mention is the reason unless any other option is specified
			else if(Object.keys(interaction.opts).length <= 0){
				let match = interaction.content.match(/<@!?(\d{17,19})>/)
				if(match) reason = interaction.content.substr(match.index + match[0].length + 1)
			}
			reason = (reason.length > 2000 ? reason.substr(0,2000) + "..." : reason) || "Not specified"

			//DM member saying they've been kicked
			//Can't send this after because of Discord limits
			if(target) await target.send(`You've been kicked from the guild named, "${interaction.guild.name}". Reason: ${reason}`).catch(()=>{})

			//Log it if rate-limiting is enabled
			if(rateLimitKicksPerDay > 0){				
				kicks.push(Date.now())
				fs.writeFileSync(path.resolve(__dirname, "../../flatdbs/kicks.json"), JSON.stringify(kicks))
			}

			//Kicks the user
			await target.kick(`Kicked by <@${interaction.author.id}> - Reason: ${reason}`)

			//Confirm completion
			interaction.react("✅")
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}