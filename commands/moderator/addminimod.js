const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = async function(msg){
    //Check if settings allow this command
    if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
	if(settings.modCommands.addMinimod === false) throw "The addMinimod command module is disabled"

    //Author must be an moderator
    if(!(await permissions.IsModerator(msg.member))) throw "You are not a moderator"

    //There must be a mention
    var firstMention = msg.mentions.users.first()
    if(!firstMention) throw 'You must mention someone'
	let target = (await msg.guild.members.fetch()).get(firstMention.id)
	if(!target) throw 'Could not find user...'

    //Check if they're already a mod or mini-mod
    if(await permissions.IsModerator(target)) throw "That member is already a moderator"
    if(await permissions.IsMiniModerator(target)) throw "That member is already a mini-moderator"

    //Fetch the "moderator" role's id (Should have been created during the IsMiniModerator check)
    var roleId = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "mini-moderator").id
    
    //Adds moderator role to mentioned user
    target.roles.add(roleId)
    .then(function(){
        msg.channel.send(`<@${target.id}> is now a mini-moderator`);
    })
}