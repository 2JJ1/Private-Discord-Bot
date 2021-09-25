var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
    data: new SlashCommandBuilder()
		.setName("unban")
		.setDescription('Unbans the selected user from this guild.')
        .setDefaultPermission(false)
		.addUserOption(option => 
			option
				.setName("user")
				.setDescription("The user that you want unban.")
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
            if(settings.modCommands.unban === false) throw "The unban command module is disabled"
            
            //Must be a mod to continue
            let isMod = await permissions.IsModerator(interaction.member)
            if(isMod !== true)  throw 'You are not a moderator'

            //Who to unban
			let targetUser = interaction.options.getUser("user", true)

            //Check if the user is banned
            var bannedMember = (await interaction.guild.bans.fetch()).get(targetUser.id)
            if(!bannedMember) throw "That user is not banned"
            
            //The actual unban part
            await interaction.guild.members.unban(targetUser.id, `Unbanned by <@${interaction.user.id}>`)
            interaction.reply(`<@${targetUser.id}> has been unbanned.`)
        }
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
    }
}