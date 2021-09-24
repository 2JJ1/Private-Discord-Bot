var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")
const mutemember = require('../../my_modules/mutemember')

module.exports = {
	data: new SlashCommandBuilder()
		.setName("mute")
		.setDescription('Removes text and voice permissions from the selected member.')
		.addUserOption(option => 
			option
				.setName("member")
				.setDescription("The member that you want to mute.")
				.setRequired(true)
		),
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
			if(!interaction.mentions.users.first()) throw 'You must mention someone'
			let targetid = interaction.mentions.users.first().id;
			let target = (await interaction.guild.members.fetch()).get(targetid)
			if(!target) throw 'Could not find user...'

			//Mini mods can't mute mini mods
			if(!isMod && isMiniMod && (await permissions.IsMiniModerator(target))) throw "Mini-moderators can't mute mini-moderators"
								
			//Applies mute role
			await mutemember({
				interaction,
				target,
				hours: interaction.opts.hours,
				days: interaction.opts.days,
			})
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}