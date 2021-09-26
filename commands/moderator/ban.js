const fs = require("fs")
const path = require("path")
var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
	enabled: settings.modCommands.ban === true,
	data: new SlashCommandBuilder()
		.setName("ban")
		.setDescription("Bans the selected user from this guild.")
		.setDefaultPermission(false)
		.addMentionableOption(option => 
			option
				.setName("user")
				.setDescription("The user that you want ban.")
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
			//Must be a mod to continue
			let isMod = await permissions.IsModerator(interaction.member)
			if(isMod !== true)  throw 'You are not a moderator'

			//Who to ban
			let targetUser = interaction.options.getUser("user", true)

			//Grabs guild member from member id/snowflake
			var member = (await interaction.guild.members.fetch()).get(targetUser.id);
			//Must be a guild member to check for roles
			if(member && await permissions.IsModerator(member)) throw 'Can\'t ban a moderator!'

			//Check if the user is banned
			var bannedMember = (await interaction.guild.bans.fetch()).get(targetUser.id)
			if(bannedMember) throw "That user is already banned"
			
			//Limit global kick count per 24 hours if rate-limiting is enabled
			var kicks = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../flatdbs/kicks.json"), {encoding: "utf8", flag: "a+"}) || "[]")
			var rateLimitKicksPerDay = settings.modCommands.rateLimitKicksPerDay
			if(rateLimitKicksPerDay > 0){
				var recentKicks = kicks.filter(timestamp => timestamp > Date.now() - 1000*60*60*24)
				if(recentKicks.length >= rateLimitKicksPerDay) throw `This guild has reached the limit of ${rateLimitKicksPerDay} kicks/bans per 24 hours`
			}

			//Why they were banned
			var reason = interaction.options.getString("reason")
			//Reason character limit. If the reason is empty, use placeholder.
			reason = reason ? (reason.length > 1500 ? reason.substr(0,1500) + "..." : reason) : "Not specified"

			//DM member saying they've been banned
			//Can't send this after because of Discord limits
			if(member) await member.send(`You've been banned from the guild named, "${interaction.guild.name}". Reason: ${reason}`).catch(err=>{})

			//Bans the user
			await interaction.guild.members.ban(targetUser, {days: 7, reason: `Banned by <@${interaction.user.id}>. Reason: ${reason}`})
			
			//Confirm completion
			interaction.reply(`<@${targetUser.id}> has been banned.`)

			//Log it if rate-limiting is enabled
			if(rateLimitKicksPerDay > 0){				
				kicks.push(Date.now())
				fs.writeFileSync(path.resolve(__dirname, "../../flatdbs/kicks.json"), JSON.stringify(kicks))
			}
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}