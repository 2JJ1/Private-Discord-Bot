const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = async function(msg){
    //Check if settings allow this command
    if(settings.adminCommands.enabled === false) throw "The admin commands module is disabled"
	if(settings.adminCommands.addmod === false) throw "The addmod command module is disabled"

    //Author must be an admin
    if(!(await permissions.IsAdmin(msg.member))) throw "You are not an admin"

    //There must be a mention
    var firstMention = msg.mentions.members.first()
    if(!firstMention) throw "You must mention someone"

    if(await permissions.IsModerator(firstMention)) throw "That member is already a moderator"

    //Fetch the "moderator" role
    var modRole = msg.guild.roles.cache.find(role => role.name === "moderator")

    //Removes mini-moderator role if they have it
	if(await permissions.IsMiniModerator(firstMention)){
        var role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "mini-moderator")
        await firstMention.roles.remove(role)
        msg.channel.send(`<@${firstMention.id}> is no longer a mini-moderator`);
    }
    
    //Adds moderator role to mentioned user
    await firstMention.roles.add(modRole)
    msg.channel.send(`<@${firstMention.id}> is now a moderator`);
}