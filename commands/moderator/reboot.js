var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
    enabled: settings.modCommands.reboot === true,
    data: new SlashCommandBuilder()
        .setName("reboot")
        .setDescription('Attempts to turn the bot on and off. Like for your PC or modem, this may fix some issues.')
        .setDefaultPermission(false),
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
            //Must be a mod to continue
            let isMod = await permissions.IsModerator(interaction.member)
            if(isMod !== true)  throw 'You are not a moderator'
            
            //Won't be able to respond after killing, so confirm prior
            await interaction.reply("Attempting reboot...")

            //Kill the process assuming the a process manager will reboot it
            process.exit(1);
        }
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
    }
}