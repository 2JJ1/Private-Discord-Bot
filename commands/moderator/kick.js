const fs = require("fs")
const path = require("path")
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = async function(msg){
	//Check if settings allow this command
    if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
	if(settings.modCommands.kick === false) throw "The kick command module is disabled"

	//Only mods can kick
    let isMod = await permissions.IsModerator(msg.member)
	if(isMod !== true)  throw {safe: 'You are not a moderator'};

	//Who to kick
	var target = msg.mentions.members.first()
	if(!target) throw "You must mention someone"

	//Cant kick moderators
	if(await permissions.IsModerator(target)) throw "Moderators can't be kicked"

	var kicks = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../flatdbs/kicks.json"), {encoding: "utf8", flag: "a+"}) || "[]")

	//Limit global kick count to 25 per 24 hours if rate-limiting is enabled
	if(settings.modCommands.rateLimitKicks === true){
		var recentKicks = kicks.filter(timestamp => timestamp > Date.now() - 1000*60*60*24)
		if(recentKicks.length >= 25) throw "This guild has reached the limit of 25 kicks per 24 hours"
	}

	//Why they were kicked
	var reason
	//If specified through an option
	if(msg.opts.reason) reason = msg.opts.reason
	//Otherwise, assume anything after the mention is the reason unless any other option is specified
	else if(Object.keys(msg.opts).length <= 0){
		let match = msg.content.match(/<@!?(\d{17,19})>/)
		if(match) reason = msg.content.substr(match.index + match[0].length + 1)
	}
	reason = (reason.length > 2000 ? reason.substr(0,2000) + "..." : reason) || "Not specified"

	//DM member saying they've been kicked
	//Can't send this after because of Discord limits
	if(target) await target.send(`You've been kicked from the guild named, "${msg.guild.name}". Reason: ${reason}`).catch(()=>{})

	//Log it if rate-limiting is enabled
	if(settings.modCommands.rateLimitKicks === true){				
		kicks.push(Date.now())
		fs.writeFileSync(path.resolve(__dirname, "../../flatdbs/kicks.json"), JSON.stringify(kicks))
	}

	//Kicks the user
	await target.kick(`Kicked by <@${msg.author.id}> - Reason: ${reason}`)

	//Confirm completion
	msg.react("✅")
}