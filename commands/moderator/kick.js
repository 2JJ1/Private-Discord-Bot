const fs = require("fs")
const path = require("path")
var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
	enabled: settings.modCommands.kick === true,
	data: new SlashCommandBuilder()
		.setName("kick")
		.setDescription('Kicks the selected member from this guild.')
		.setDefaultPermission(false)
		.addUserOption(option => 
			option
				.setName("member")
				.setDescription("The member that you want to kick.")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("reason")
				.setDescription("Why do you want to ban this user?")
				.setRequired(true)
		),
	permissions: [
		{
			roleName: 'admin',
			type: 'ROLE',
			permission: true,
		},
		{
			roleName: 'moderator',
			type: 'ROLE',
			permission: true,
		},
	],
	async execute(interaction){
		try{
			//Only mods can kick
			let isMod = await permissions.IsModerator(interaction.member)
			if(isMod !== true)  throw 'You are not a moderator'

			//Who to kick
			var targetMember = interaction.options.getMember("member", true)

			//Cant kick moderators
			if(await permissions.IsModerator(targetMember)) throw "Moderators can't be kicked"

			var kicks = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../flatdbs/kicks.json"), {encoding: "utf8", flag: "a+"}) || "[]")

			//Limit global kick count per 24 hours if rate-limiting is enabled
			var rateLimitKicksPerDay = settings.modCommands.rateLimitKicksPerDay
			if(rateLimitKicksPerDay > 0){
				var recentKicks = kicks.filter(timestamp => timestamp > Date.now() - 1000*60*60*24)
				if(recentKicks.length >= rateLimitKicksPerDay) throw `This guild has reached the limit of ${rateLimitKicksPerDay} kicks/bans per 24 hours`
			}

			//Why they were kicked
			var reason = interaction.options.getString("reason")
			//Reason character limit. If the reason is empty, use placeholder.
			reason = reason ? (reason.length > 1500 ? reason.substr(0,1500) + "..." : reason) : "Not specified"

			//DM member saying they've been kicked
			//Can't send this after because of Discord limits
			if(targetMember) await targetMember.send(`You've been kicked from the guild named, "${interaction.guild.name}". Reason: ${reason}`).catch(()=>{})

			//Log it if rate-limiting is enabled
			if(rateLimitKicksPerDay > 0){				
				kicks.push(Date.now())
				fs.writeFileSync(path.resolve(__dirname, "../../flatdbs/kicks.json"), JSON.stringify(kicks))
			}

			//Kicks the user
			await targetMember.kick(`Kicked by <@${interaction.user.id}> - Reason: ${reason}`)

			//Confirm completion
			interaction.reply(`<@${targetMember.id}> has been kicked.`)
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}