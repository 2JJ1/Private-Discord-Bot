var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("removerole")
		.setDescription('Removes the selected role from the selected member.')
		.addUserOption(option => 
			option
				.setName("member")
				.setDescription("The member which you want to remove the selected role from.")
				.setRequired(true)
		)
		.addRoleOption(option => 
			option
				.setName("role")
				.setDescription("The role which you want to add to the target member.")
				.setRequired(true)
		),
	async execute(interaction){
		try{
			//Check if this module is enabled
			if(settings.modCommands.enabled !== true) throw "The moderator commands module is disabled"
			if(settings.modCommands.addRoleWhitelist.length <= 0) throw "The addrole command module is disabled"

			//Only admins, moderators, and mini-moderators can use this command
			let isMod = await permissions.IsModerator(interaction.member)
			let isMiniMod = await permissions.IsMiniModerator(interaction.member)
			if(!isMod && !isMiniMod) throw "You can't execute that command"

			//Who to add the role to
			let user = interaction.options.getUser("member", true)
			let member = (await interaction.guild.members.fetch()).get(user.id)
			if(!member) throw 'Could not find user...'
		
			//What role to remove
			let role = interaction.options.getRole("role", true)

			//Check if the role ID is whitelisted
			//Used find instead of indexOf for support of string and numbered role id indexes
			if(!settings.modCommands.addRoleWhitelist.find(e => e.toLowerCase() === role.name.toLowerCase())) throw "That role is not whitelisted as removable"

			//Apply the role
			await member.roles.remove(role, `Removed by <@${interaction.user.id}>`)
			
			//Confirm completion
			interaction.reply({content: `Removed the \`@${role.name}\` role from <@${user.id}>.`, ephemeral: true})
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}