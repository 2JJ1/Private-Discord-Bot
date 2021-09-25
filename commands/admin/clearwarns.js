var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
    data: new SlashCommandBuilder()
		.setName("clearwarns")
		.setDescription('Removes the "warned" role from all members of this guild.')
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
            //Check if settings allow this command
            if(settings.adminCommands.enabled === false) throw "The admin commands module is disabled"
            if(settings.adminCommands.clearWarns === false) throw "The clearWarns command module is disabled"

            //The author must be an admin
            if(!(await permissions.IsAdmin(interaction.member))) throw "You must be an admin to use this"

            //Get the warned role's id
            var role = interaction.guild.roles.cache.find(role => role.name === "warned")
            if(!role) throw "Could not find a role named 'muted' in this guild. This means everyone is already unmuted"
            var roleId = role.id

            //Fetch guild members with the warn role
            var members = (await interaction.guild.members.fetch()).filter(m => m.roles.cache.get(roleId))
            
            //Go through each guild member with the warned role and remove their role
            if(members.size > 0){
                interaction.reply(`Removing ${members.size} warn${members.size > 1 ? "s" : ""}`);
                members = [...members.values()]
                for(var i=0; i<members.length; i++){
                    await members[i].roles.remove(roleId)
                    .catch((err) => {
                        interaction.channel.send(`Failed to remove the "warned" role from: <@${members[i].id}>`)
                        console.log(err)
                    })
                };
            } 
            else interaction.reply(`Seems like no one is warned`);
        }
        catch(e){
            if(typeof e === "string") interaction.reply(`Error: ${e}`)
            else console.error(e)
        }
    }
}