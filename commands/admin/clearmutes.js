const fs = require("fs")
const path = require("path")
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = async function(msg){
    //Check if settings allow this command
    if(settings.adminCommands.enabled === false) throw "The admin commands module is disabled"
	if(settings.adminCommands.clearMutes === false) throw "The clearMutes command module is disabled"

    //The author must be an admin
    if(!(await permissions.IsAdmin(msg.member))) throw "You must be an admin to use this"

    //Get the mute role's id
    var mutedRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "muted")
    if(!mutedRole) throw "Could not find a role named 'muted' in this guild. This means everyone is already unmuted"
    var mutedRoleId = mutedRole.id

    //Fetch guild members with mute role
    var members = (await msg.guild.members.fetch()).filter(m => m.roles.cache.get(mutedRoleId))
    
    //Go through each guild member with the mute role and remove their role
    if(members.size > 0){
        msg.channel.send(`Removing ${members.size} mute${members.size > 0 ? "s" : ""}`);
        members = members.array()
        for(var i=0; i<members.length; i++){
            await members[i].roles.remove(mutedRoleId)
            .catch((err) => {
                msg.channel.send(`Failed to remove the "muted" role from: <@${members[i].id}>`)
                console.log(err)
            })
        };
    } 
    else msg.channel.send(`Seems like no one is muted`);

    fs.writeFileSync(path.resolve(__dirname, "../../flatdbs/mutes.json"), "{}")
}