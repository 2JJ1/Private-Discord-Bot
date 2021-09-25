var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("unwarn")
		.setDescription('Removes the "warned" role from the selected member.')
		.setDefaultPermission(false)
		.addUserOption(option => 
			option
				.setName("member")
				.setDescription("The member that you want to unwarn.")
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
			//Check if this module is enabled
			if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
			if(settings.modCommands.unwarn === false) throw "The unwarn command module is disabled"

			//Only admins, moderators, and mini-moderators can use this command
			let isMod = await permissions.IsModerator(interaction.member)
			let isMiniMod = await permissions.IsMiniModerator(interaction.member)
			if(!isMod && !isMiniMod) throw "You can't execute that command"

			//Determine who to unwarn
			let target = interaction.options.getMember("member", true)

			//Fetch the warned role
			var warnRole = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === "warned")
			if(!warnRole) throw "The warned 'role' does not exist in this guild. This means the member already unwarned."
					
			//Removes the role
			await target.roles.remove(warnRole)
			
			interaction.reply("Removed warned role from <@" + target.id + ">")
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}