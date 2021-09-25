var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")
const mutemember = require('../../my_modules/mutemember')

module.exports = {
	data: new SlashCommandBuilder()
		.setName("mute")
		.setDescription('Removes text and voice permissions from the selected member.')
		.setDefaultPermission(false)
		.addUserOption(option => 
			option
				.setName("member")
				.setDescription("The member that you want to mute.")
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName("reason")
				.setDescription("Why do you want to mute this user?")
				.setRequired(true)
		)
		.addNumberOption(option =>
			option
				.setName("days")
				.setDescription("How many days do you want them to be muted?")	
		)
		.addNumberOption(option =>
			option
				.setName("hours")
				.setDescription("How many hours do you want them to be muted?")	
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
			if(settings.modCommands.enabled !== true) throw "The moderator commands module is disabled"
			if(settings.modCommands.mute !== true) throw "The mute command module is disabled"

			//Only admins, moderators, and mini-moderators can use this command
			let isMod = await permissions.IsModerator(interaction.member)
			let isMiniMod = await permissions.IsMiniModerator(interaction.member)
			if(!isMod && !isMiniMod) throw "You can't execute that command"

			//Who to mute
			var targetMember = interaction.options.getMember("member", true)

			//Mini mods can't mute mini mods
			if(!isMod && isMiniMod && (await permissions.IsMiniModerator(targetMember))) throw "Mini-moderators can't mute mini-moderators"
								
			//Applies mute role
			await mutemember({
				interaction,
				target: targetMember,
				days: interaction.options.getNumber("days"),
				hours: interaction.options.getNumber("hours"),
			})
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}