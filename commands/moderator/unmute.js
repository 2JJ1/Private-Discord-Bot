const fs = require("fs")
const path = require("path")
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = async function(msg){
	//Check if this module is enabled
	if(settings.modCommands.enabled !== true) throw "The moderator commands module is disabled"
	if(settings.modCommands.unmute !== true) throw "The unmute command module is disabled"

	//Only admins, moderators, and mini-moderators can use this command
	let isMod = await permissions.IsModerator(msg.member)
	let isMiniMod = await permissions.IsMiniModerator(msg.member)
	if(!isMod && !isMiniMod) throw "You can't execute that command"

	//Who to unmute
	if(msg.mentions.users.first() === undefined) throw 'You must mention someone'
	let targetid = msg.mentions.users.first().id;
	let target = (await msg.guild.members.fetch()).get(targetid)
	if(!target) throw 'Could not find user...'

	//Mini mods can't mute mini mods
    if(!isMod && isMiniMod && (await permissions.IsMiniModerator(target))) throw "Mini-moderators can't unmute mini-moderators"

	//Removes from the mutes database so they aren't remuted if they rejoin the guild
	var mutes = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../flatdbs/mutes.json"), {encoding: "utf8", flag: "a+"}) || "{}")
	delete mutes[targetid]
	fs.writeFileSync(path.resolve(__dirname, "../../flatdbs/mutes.json"), JSON.stringify(mutes))

	//Finds the mute role
	var mutedRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() === "muted")
	if(!mutedRole) throw "Could not find a role named 'muted' in this guild. This means the user is already unmuted."

	//Removes the role from the member
	await target.roles.remove(mutedRole)

	msg.channel.send("<@" + targetid + "> is no longer muted!");
}