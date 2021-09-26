const fs = require("fs")
const path = require("path")
var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
	enabled: settings.modCommands.unmute === true,
	data: new SlashCommandBuilder()
		.setName("unmute")
		.setDescription('Removes the "muted" role from the selected member.')
		.setDefaultPermission(false)
		.addUserOption(option => 
			option
				.setName("member")
				.setDescription("The member that you want to unmute.")
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
			//Only admins, moderators, and mini-moderators can use this command
			let isMod = await permissions.IsModerator(interaction.member)
			let isMiniMod = await permissions.IsMiniModerator(interaction.member)
			if(!isMod && !isMiniMod) throw "You can't execute that command"

			//Who to unmute
			var targetMember = interaction.options.getMember("member", true)

			//Mini mods can't mute mini mods
			if(!isMod && isMiniMod && (await permissions.IsMiniModerator(targetMember))) throw "Mini-moderators can't unmute mini-moderators"

			//Removes from the mutes database so they aren't remuted if they rejoin the guild
			var mutes = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../flatdbs/mutes.json"), {encoding: "utf8", flag: "a+"}) || "{}")
			delete mutes[targetMember.id]
			fs.writeFileSync(path.resolve(__dirname, "../../flatdbs/mutes.json"), JSON.stringify(mutes))

			//Finds the mute role
			var mutedRole = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === "muted")
			if(!mutedRole) throw "Could not find a role named 'muted' in this guild. This means the user is already unmuted."

			//Removes the role from the member
			await targetMember.roles.remove(mutedRole)

			interaction.reply(`<@${targetMember.id}> is no longer muted.`)
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}