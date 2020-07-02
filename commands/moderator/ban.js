const fs = require("fs")
const path = require("path")
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = async function(msg){
	//Check if settings allow this command
	if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
	if(settings.modCommands.ban === false) throw "The ban command module is disabled"

	//Must be a mod to continue
    let isMod = await permissions.IsModerator(msg.member)
	if(isMod !== true)  throw {safe: 'You are not a moderator'};

	//Grab target to ban
	var targetid;
	//First check if a mention is valid
	if(msg.mentions.users.first() !== undefined) {
		targetid = msg.mentions.users.first().id;
	}
	else{
		//Mention not found. The member isn't in the guild, so pattern check and grab the id that way
		let arr = msg.content.split(" ")
		let pattern = /<@!?(\d{17,19})>/
		for(let i=0; i<arr.length; i++){
			var match = arr[i].match(pattern)
			if(match != null){
				targetid = match[1]
				break;
			}
		}
	}

	//Check if targetid is undefined
	if(!targetid) throw {safe: "User not found"}

	//Grabs guild member from member id/snowflake
	var member = (await msg.guild.members.fetch()).get(targetid);
	if(member){ //Must be a guild member to check for roles
		let targetIsMod = await permissions.IsModerator(member)
		if(targetIsMod)
			throw {safe: 'Can\'t ban a moderator!'};
	}

	//Check if the user is banned
    var bannedMember = (await msg.guild.fetchBans()).get(targetid)
	if(bannedMember) throw "That user is already banned"
	
	var kicks = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../flatdbs/kicks.json"), {encoding: "utf8", flag: "a+"}) || "[]")

	//Limit global kick count to 25 per 24 hours if rate-limiting is enabled
	if(settings.modCommands.rateLimitKicks === true){
		var recentKicks = kicks.filter(timestamp => timestamp > Date.now() - 1000*60*60*24)
		if(recentKicks.length >= 25) throw "This guild has reached the limit of 25 kicks per 24 hours"
	}

	//Why they were banned
	var reason
	//If specified through an option
	if(msg.opts.reason) reason = msg.opts.reason
	//Otherwise, assume anything after the mention is the reason unless any other option is specified
	else if(Object.keys(msg.opts).length <= 0){
		let match = msg.content.match(/<@!?(\d{17,19})>/)
		if(match) reason = msg.content.substr(match.index + match[0].length + 1)
	}
	reason = (reason.length > 2000 ? reason.substr(0,2000) + "..." : reason) || "Not specified"

	//DM member saying they've been banned
	//Can't send this after because of Discord limits
	if(member) await member.send(`You've been banned from the guild named, "${msg.guild.name}". Reason: ${reason}`).catch(err=>{})

	//Bans the user
	await msg.guild.members.ban(targetid, {days: 5, reason: `Banned by <@${msg.author.id}>. Reason: ${reason}`})
	.then(async user => {
		//Confirm completion
		msg.react("✅")

		//Log it if rate-limiting is enabled
		if(settings.modCommands.rateLimitKicks === true){				
			kicks.push(Date.now())
			fs.writeFileSync(path.resolve(__dirname, "../../flatdbs/kicks.json"), JSON.stringify(kicks))
		}
	})
}