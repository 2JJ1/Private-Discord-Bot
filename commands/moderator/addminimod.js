var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
    enabled: settings.modCommands.addMinimod === true,
    data: new SlashCommandBuilder()
        .setName("addminimod")
        .setDescription("Adds mini-moderator permissions to the selected member.")
        .setDefaultPermission(false)
        .addUserOption(option => 
            option
                .setName("user")
                .setDescription("The user that you'd like to be a mini-moderator")
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
            //Author must be an moderator
            if(!(await permissions.IsModerator(interaction.member))) throw "You are not a moderator"

            //There must be a mention
            let user = interaction.options.getUser("user", true)
            let member = (await interaction.guild.members.fetch()).get(user.id)
            if(!member) throw 'Could not find user...'

            //Check if they're already a mod or mini-mod
            if(await permissions.IsModerator(member)) throw "That member is already a moderator"
            if(await permissions.IsMiniModerator(member)) throw "That member is already a mini-moderator"

            //Fetch the "moderator" role's id (Should have been created during the IsMiniModerator check)
            var roleId = interaction.guild.roles.cache.find(role => role.name.toLowerCase() === "mini-moderator").id
            
            //Adds moderator role to mentioned user
            await member.roles.add(roleId)
            interaction.reply(`<@${member.id}> is now a mini-moderator`);
        }
        catch(e){
            if(typeof e === "string") interaction.reply(`Error: ${e}`)
            else console.error(e)
        }
    }
}