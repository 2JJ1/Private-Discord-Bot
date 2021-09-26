var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
	enabled: settings.modCommands.addRoleWhitelist.length > 0,
	data: new SlashCommandBuilder()
		.setName("addrole")
		.setDescription('Adds the selected role to the selected member.')
		.setDefaultPermission(false)
		.addUserOption(option => 
			option
				.setName("member")
				.setDescription("The member which you want to add the selected role to.")
				.setRequired(true)
		)
		.addRoleOption(option => 
			option
				.setName("role")
				.setDescription("The role which you want to add to the target member.")
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

			//Who to add the role to
			let user = interaction.options.getUser("member", true)
			let member = (await interaction.guild.members.fetch()).get(user.id)
			if(!member) throw 'Could not find user...'
		
			//What role to add
			let role = interaction.options.getRole("role", true)

			//Check if the role ID is whitelisted
			//Used find instead of indexOf for support of string and numbered role id indexes
			if(!settings.modCommands.addRoleWhitelist.find(e => e.toLowerCase() === role.name.toLowerCase())) throw "That role is not whitelisted as addable"

			//Apply the role
			await member.roles.add(role, `Added by <@${interaction.user.id}>`)
			
			//Confirm completion
			interaction.reply({content: `Added the \`@${role.name}\` role to <@${user.id}>.`, ephemeral: true})
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}