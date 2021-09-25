const fs = require("fs")
const path = require("path")
var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
    data: new SlashCommandBuilder()
		.setName("clearmutes")
		.setDescription('Unmutes all members of this guild.')
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
            if(settings.adminCommands.clearMutes === false) throw "The clearMutes command module is disabled"

            //The author must be an admin
            if(!(await permissions.IsAdmin(interaction.member))) throw "You must be an admin to use this"

            //Get the mute role's id
            var mutedRole = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === "muted")
            if(!mutedRole) throw "Could not find a role named 'muted' in this guild. This means everyone is already unmuted"
            var mutedRoleId = mutedRole.id

            //Fetch guild members with mute role
            var members = (await interaction.guild.members.fetch()).filter(m => m.roles.cache.get(mutedRoleId))
            
            //Go through each guild member with the mute role and remove their role
            if(members.size > 0){
                interaction.reply(`Removing ${members.size} mute${members.size > 1 ? "s" : ""}`);
                members = [...members.values()]
                for(var i=0; i<members.length; i++){
                    await members[i].roles.remove(mutedRoleId)
                    .catch((err) => {
                        interaction.channel.send(`Failed to remove the "muted" role from: <@${members[i].id}>`)
                        console.log(err)
                    })
                };
            } 
            else interaction.reply(`Seems like no one is muted`);

            fs.writeFileSync(path.resolve(__dirname, "../../flatdbs/mutes.json"), "{}")
        }
        catch(e){
            if(typeof e === "string") interaction.reply(`Error: ${e}`)
            else console.error(e)
        }
    }
}