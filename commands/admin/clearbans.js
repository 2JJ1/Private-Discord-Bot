var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
    enabled: settings.adminCommands.clearBans === true,
    data: new SlashCommandBuilder()
		.setName("clearbans")
		.setDescription('Unbans all banned users.')
        .setDefaultPermission(false),
    permissions: [
        {
            roleName: 'admin',
            type: 'ROLE',
            permission: true,
        },
    ],
    async execute(interaction){
        try{
            //The author must be an admin
            if(!(await permissions.IsAdmin(interaction.member))) throw "You must be an admin to use this"

            //Fetch guild members with mute role
            var members = await interaction.guild.bans.fetch()
            
            //Go through each guild member with the mute role and remove their role
            if(members.size > 0){
                interaction.reply(`Removing ${members.size} ban${members.size > 1 ? "s" : ""}`);
                members = [...members.values()]
                for(var i=0; i<members.length; i++){
                    await interaction.guild.members.unban(members[i].user.id)
                    .catch((err) => {
                        interaction.channel.send(`Failed to unban <@${members[i].user.id}>`)
                        console.log(err)
                    })
                };
            } 
            else interaction.reply(`Seems like no one is banned`);
        }
        catch(e){
            if(typeof e === "string") interaction.reply(`Error: ${e}`)
            else console.error(e)
        }
    }
}