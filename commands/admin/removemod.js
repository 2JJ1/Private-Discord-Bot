var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
	enabled: settings.adminCommands.removeMod === true,
	data: new SlashCommandBuilder()
		.setName("removemod")
		.setDescription('Removes moderator permissions from the selected member.')
		.setDefaultPermission(false)
		.addUserOption(option => 
			option
				.setName("member")
				.setDescription("The member who should lose their moderator permissions.")
				.setRequired(true)
		),
	permissions: [
		{
			roleName: 'admin',
			type: 'ROLE',
			permission: true,
		},
	],
	async execute(interaction){
		try{
			//Requester must be an admin
			if(!(await permissions.IsAdmin(interaction.member))) throw "You are not an admin"
			
			//Who to remove mod from
			let targetMember = interaction.options.getMember("member", true)

			//Gets the role
			var role = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === "moderator")
			if(!role) throw "Could not find a role named 'moderator' in this guild. This means the user is already not a moderator"
					
			//Removes the role
			await targetMember.roles.remove(role)
			interaction.reply(`<@${targetMember.id}> is no longer a moderator`);
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}