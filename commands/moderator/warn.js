var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("warn")
		.setDescription('Adds the "warned" role to the selected member.')
		.addUserOption(option => 
			option
				.setName("member")
				.setDescription("The member that you want to warn.")
				.setRequired(true)
		),
	async function(interaction){
		try{
			//Check if this module is enabled
			if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
			if(settings.modCommands.warn === false) throw "The warn command module is disabled"

			//Only admins, moderators, and mini-moderators can use this command
			let isMod = await permissions.IsModerator(interaction.member)
			let isMiniMod = await permissions.IsMiniModerator(interaction.member)
			if(!isMod && !isMiniMod) throw "You can't execute that command"

			//Determine who to warn
			let target = interaction.mentions.members.first()
			if(!target) throw 'You must mention someone in the guild'
			let targetid = target.id;
								
			//You can only warn non-moderators
			let targetIsMod = await permissions.IsModerator(target)
			if(targetIsMod) throw "You can't warn another mod"
							
			let warningMessage = 'A moderator has marked you as warned. Please be mindful of the rules! Acting against them or participating as a disturbance can get you muted. In extreme conditions, you can even be banned.'

			//Why they are being warned
			var reason
			//If specified through an option
			if(interaction.opts.reason) reason = interaction.opts.reason
			//Otherwise, assume anything after the mention is the reason unless any other option is specified
			else if(Object.keys(interaction.opts).length <= 0){
				let match = interaction.content.match(/<@!?(\d{17,19})>/)
				if(match) reason = interaction.content.substr(match.index + match[0].length + 1)
			}
			reason = (reason.length > 2000 ? reason.substr(0,2000) + "..." : reason) || "Not specified"

			warningMessage += `\n\nMessage from moderator: ${reason}`

			//Fetch the "warned" role's id
			var warnRole = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === "warned")
			var warnRoleId
			if(warnRole) warnRoleId = warnRole.id
			else {
				//Warned role doesn't exist, so create it
				let newRole = await interaction.guild.roles.create({
					data: {
						name: "warned",
						color: 0x95a5a6,
						hoist: false,
						position: 0,
						permissions: 0
					}, 
					reason: "Attempted to warn member, but the role did not exist."
				})
				warnRoleId = newRole.id
			}

			//Apply the role
			await target.roles.add(warnRoleId, `Warned by <@${interaction.author.id}> - (${reason})`)

			//Send the warned user their warning
			target.send(warningMessage)
			.then(() => interaction.channel.send(`<@${targetid}> Has been warned via DM`))
			.catch(() => interaction.channel.send('Failed to DM that user, but they can refer to your mention.'))
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}