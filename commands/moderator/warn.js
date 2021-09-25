var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("warn")
		.setDescription('Adds the "warned" role to the selected member.')
		.setDefaultPermission(false)
		.addUserOption(option => 
			option
				.setName("member")
				.setDescription("The member that you want to warn.")
				.setRequired(true)
		)
		.addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Leaves a note in audit logs for why you're enabling slowmode.")    
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
			if(settings.modCommands.warn === false) throw "The warn command module is disabled"

			//Only admins, moderators, and mini-moderators can use this command
			let isMod = await permissions.IsModerator(interaction.member)
			let isMiniMod = await permissions.IsMiniModerator(interaction.member)
			if(!isMod && !isMiniMod) throw "You can't execute that command"

			//Determine who to warn
			let target = interaction.options.getMember("member", true)
								
			//You can only warn non-moderators
			let targetIsMod = await permissions.IsModerator(target)
			if(targetIsMod) throw "You can't warn another mod"

			//Why they are being warned
			var reason = interaction.options.getString("reason") || "Unspecified"
			if(reason.length > 1500) throw "Your reason is too long."

			let warningMessage = `<@${interaction.user.id}> has marked you as warned. Reason: ${reason}. Please be mindful of the rules! Acting against them or participating as a disturbance can get you muted. In extreme conditions, you can even be banned.`

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
			await target.roles.add(warnRoleId, `Warned by ${interaction.user.tag}(${interaction.user.id}). Reason: ${reason}.`)

			//Send the warned user their warning
			await target.send(warningMessage)
			.then(() => interaction.reply(`<@${target.id}> Has been warned via DM`))
			.catch(() => interaction.reply('Failed to DM that user, but they can refer to your mention.'))
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}