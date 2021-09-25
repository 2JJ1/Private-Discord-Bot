var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
	data: new SlashCommandBuilder()
        .setName("removeminimod")
        .setDescription("Removes mini-moderator permissions from the selected member.")
		.setDefaultPermission(false)
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('The mini-moderator that you would like to remove.')
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
			//Check if settings allow this command
			if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
			if(settings.modCommands.removeMinimod === false) throw "The removeMinimod command module is disabled"

			//Author must be an moderator
			if(!(await permissions.IsModerator(interaction.member))) throw "You are not a moderator"
			
			//There must be a mention
			let user = interaction.options.getUser("user", true)
			let member = (await interaction.guild.members.fetch()).get(user.id)
			if(!member) throw 'Could not find user...'
			
			//Can't remove mini-mod from someone whos not a mini mod
			if(!(await permissions.IsMiniModerator(member))) throw "That member is not a mini-moderator"

			//Find the role
			var role = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === "mini-moderator")
			if(!role) throw "Could not find a role named 'mini-moderator' in this guild. This means the user is already not a mini-moderator"
			//Removes the role from the member
			await member.roles.remove(role)
			interaction.reply(`<@${member.id}> is no longer a mini-moderator`);
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}