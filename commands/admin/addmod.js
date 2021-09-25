var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
    data: new SlashCommandBuilder()
		.setName("addmod")
		.setDescription('Gives the selected member moderator permissions.')
		.addUserOption(option => 
			option
				.setName("member")
				.setDescription("The member to receive moderator permissions.")
				.setRequired(true)
		),
    async execute(interaction){
        try{
            //Check if settings allow this command
            if(settings.adminCommands.enabled === false) throw "The admin commands module is disabled"
            if(settings.adminCommands.addmod === false) throw "The addmod command module is disabled"

            //Requester must be an admin
            if(!(await permissions.IsAdmin(interaction.member))) throw "You are not an admin"

            //The member who should become a moderator
            let targetMember = interaction.options.getMember("member", true)

            //Check if they're already a moderator
            if(await permissions.IsModerator(targetMember)) throw "That member is already a moderator"

            //Fetch the "moderator" role
            var modRole = interaction.guild.roles.cache.find(role => role.name === "moderator")

            //Removes mini-moderator role if they have it
            if(await permissions.IsMiniModerator(targetMember)){
                var role = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === "mini-moderator")
                await targetMember.roles.remove(role)
                interaction.channel.send(`<@${targetMember.id}> is no longer a mini-moderator`);
            }
            
            //Adds moderator role to mentioned user
            await targetMember.roles.add(modRole)
            interaction.reply(`<@${targetMember.id}> is now a moderator`);
        }
        catch(e){
            if(typeof e === "string") interaction.reply(`Error: ${e}`)
            else console.error(e)
        }
    }
}