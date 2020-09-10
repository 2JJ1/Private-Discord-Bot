const fs = require("fs")
const path = require("path")
const permissions = require('../wrappers/permissions')

/**
 * Is a module since the mute function is complex and reused
 */
module.exports = async function(opts){
    var {msg, target, hours, days, reason} = opts

    //If the target is not specified, assume the msg author is the target
    if(!target && msg) target = msg.member

    let targetIsMod = await permissions.IsModerator(target)
    if(targetIsMod) throw "You can't mute a moderator!"
    
    //Don't continue if they're already muted
    if(
        target.roles.cache.find(role => role.name.toLowerCase() === "muted") && 
        !opts.days && //Unless they want to update the timer
        !opts.hours && //Unless they want to update the timer
        !(opts.by !== "bot") //So anti-spamraid's late processing doesn't flood the message
    ) msg && msg.channel.send("They are already muted.");

	// Handles timed mute
	var expireDate = null
    var now = Date.now()
    if(days){
        days = parseInt(days)
        //Sanitize
        if(days == NaN) throw "Invalid number for days"
        if(days <= 0 || days > 14) throw "Days must be from 1-14"
        //Create expiration date by adding the amount of days
        let daysAsMilliseconds = 1000*60*60*24*days
        expireDate = now+daysAsMilliseconds
    }
    else if(hours){
        hours = parseInt(hours)
        //Sanitize
        if(hours == NaN) throw "Invalid number for hours"
        if(hours <= 0 || hours > 336) throw "Hours must be from 1-336"
        //Create expiration date by adding the amount of hours
        let hoursAsMilliseconds = 1000*60*60*hours
        expireDate = now+hoursAsMilliseconds
    }

    //Why they were muted
    if(!reason){
        //If specified through an option
        if(msg.opts.reason) reason = msg.opts.reason
        //Otherwise, assume anything after the mention is the reason unless any other option is specified
        else if(Object.keys(msg.opts).length <= 0){
            let match = msg.content.match(/<@!?(\d{17,19})>/)
            if(match) reason = msg.content.substr(match.index + match[0].length + 1)
        }
        reason = (reason && (reason.length > 2000 ? reason.substr(0,2000) + "..." : reason)) || "Not specified"
    }

	//Fetch the "muted" role's id if it exists
	var mutedRole = target.guild.roles.cache.find(role => role.name.toLowerCase() === "muted")
	var mutedRoleId
    if(mutedRole) mutedRoleId = mutedRole.id
    //If the muted role doesn't exist, create it
	else {
        //Where the role will be placed on the role hierarchy
		let position
		//Put the role under the moderator role. 
		//The moderator role is guaranteed to exist after the target's mod check
		var modRole = target.guild.roles.cache.find(role => role.name.toLowerCase() === "moderator")
        position = modRole.position
        
		//Create the role
		let newRole = await target.guild.roles.create({
            data: {
                name: "muted",
                color: 0xf1c40f,
                hoist: false,
                position, //Change it so it will be the highest possible role
                permissions: 0 //Disabling messages will need to be disabled per text/voice channel
            }, 
            reason: "Attempted to mute member, but the role did not exist."
        })
		mutedRoleId = newRole.id

		//Disable the necessary permissions in all channels
		target.guild.channels.cache.forEach(channel => {
			let permToDisable

			if(channel.type === "text") permToDisable = "SEND_MESSAGES"
			else if(channel.type === "voice") permToDisable = "SPEAK"

			if(permToDisable){ 
					channel.updateOverwrite(newRole, {
					[permToDisable]: false
				}, `For the new mute role to work, the ${permToDisable} permission must be disabled in the channel.`)
			}
		})

		msg && msg.channel.send("Because the mute role did not exist, I have automatically created and configured it. A server admin may want to double check the muted role's hierarchical position. Members that are above the role will not be muted. They may also want to check with the text/voice channel specific permissions.");
	}

	//Applies the role
	target.roles.add(mutedRoleId, reason)
	.then(async () => {
        (opts.by !== "bot") && msg && msg.channel.send(`<@${target.id}> is muted${hours?` for ${hours} hour${hours>1?"s":""}`:''}${days?` for ${days} day${days>1?"s":""}`:''}.`)
        
        //Log to database to prevent people from rejoining
        var mutes = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../flatdbs/mutes.json"), {encoding: "utf8", flag: "a+"}) || "{}")
        mutes[target.id] = {
            expires: expireDate
        }
        fs.writeFileSync(path.resolve(__dirname, "../flatdbs/mutes.json"), JSON.stringify(mutes))
    })
    .catch(() => { throw "I can't apply the mute role right now. Please check my permissions or role positioning." })

    target.send(`You were muted in "${msg.guild.name}" by ${msg.author.tag}${hours?` for ${hours} hour${hours>1?"s":""}`:''}${days?` for ${days} day${days>1?"s":""}`:''}.${reason?` Reason: ${reason}.`:''}`)
    .catch(()=>{})
}