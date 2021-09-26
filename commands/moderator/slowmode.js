var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
    enabled: settings.modCommands.slowMode === true,
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription('Slows down the rate of messages members can send in this text channel.')
        .setDefaultPermission(false)
        .addNumberOption(option => 
            option
                .setName("seconds")
                .setDescription(`Length of time members must wait between sending each message. Must be between 0-${settings.modCommands.maxSlowMode} seconds.`)
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
            //Only admins and moderators can use this command
            let isMod = await permissions.IsModerator(interaction.member)
            if(!isMod) throw "You can't execute that command"

            //To get the time
            var time = interaction.options.getNumber("seconds", true)
            //Sanitize the time. Must be a number and shorter than the max time
            if(!/^[0-9]+$/.test(time) || time > settings.modCommands.maxSlowMode) throw `Please pick a number of seconds up to ${settings.modCommands.maxSlowMode}.`

            var reason = interaction.options.getString("reason") || "Unspecified."

            //Sets the slowmode
            interaction.channel.setRateLimitPerUser(time, `By ${interaction.user.tag}(${interaction.user.id}). Reason: ${reason}.`)

            //Report success
            interaction.reply(`Set SLOWMODE for this text channel to ${time} seconds.`)
        }
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
    }
}