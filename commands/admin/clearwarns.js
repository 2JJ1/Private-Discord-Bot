const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = async function(msg){
    //Check if settings allow this command
    if(settings.adminCommands.enabled === false) throw "The admin commands module is disabled"
	if(settings.adminCommands.clearWarns === false) throw "The clearWarns command module is disabled"

    //The author must be an admin
    if(!(await permissions.IsAdmin(msg.member))) throw "You must be an admin to use this"

    //Get the warned role's id
    var role = msg.guild.roles.cache.find(role => role.name === "warned")
    if(!role) throw "Could not find a role named 'muted' in this guild. This means everyone is already unmuted"
    var roleId = role.id

    //Fetch guild members with the warn role
    var members = (await msg.guild.members.fetch()).filter(m => m.roles.cache.get(roleId))
    
    //Go through each guild member with the warned role and remove their role
    if(members.size > 0){
        msg.channel.send(`Removing ${members.size} warn${members.size > 0 ? "s" : ""}`);
        members = members.array()
        for(var i=0; i<members.length; i++){
            await members[i].roles.remove(roleId)
            .catch((err) => {
                msg.channel.send(`Failed to remove the "warned" role from: <@${members[i].id}>`)
                console.log(err)
            })
        };
    } 
    else msg.channel.send(`Seems like no one is warned`);
}