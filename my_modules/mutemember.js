const fs = require("fs")
const path = require("path")
const permissions = require('../wrappers/permissions')

/**
 * Is a module since the mute function is complex and reused
 */
module.exports = async function(opts){
    var {interaction, msg, target, hours, days, reason} = opts

    //If the target is not specified, assume the msg author is the target. Such as when automuted for spam.
    if(!target && msg) target = msg.member

    let targetIsMod = await permissions.IsModerator(target)
    if(targetIsMod) throw "You can't mute a moderator!"

    let requester = (interaction && interaction.user) || (msg && msg.author)
    let guild = (interaction && interaction.guild) || (msg && msg.guild)
    let channel = (interaction && interaction.channel) || (msg && msg.channel)
    
    //Don't continue if they're already muted
    if(
        target.roles.cache.find(role => role.name.toLowerCase() === "muted") && 
        !opts.days && //Unless they want to update the timer
        !opts.hours && //Unless they want to update the timer
        !(opts.by !== "bot") //So anti-spamraid's late processing doesn't flood the message
    ) channel && channel.send("They are already muted.");

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
    //If reason not specified in opts, check interaction options 
    if(!reason && interaction){
        reason = interaction.options.getString("reason")
        //Reason character limit. If the reason is empty, use placeholder.
        reason = reason ? (reason.length > 1500 ? reason.substr(0,1500) + "..." : reason) : "Not specified"
    } 
    else reason = reason || 'Not specified'

	//Fetch the "muted" role's id if it exists
	var mutedRole = (await target.guild.roles.fetch()).find(role => role.name.toLowerCase() === "muted")
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

		channel && channel.send("Because the mute role did not exist, I have automatically created and configured it. A server admin may want to double check the muted role's hierarchical position. Members that are above the role will not be muted. They may also want to check with the text/voice channel specific permissions.");
	}

	//Applies the role
	await target.roles.add(mutedRoleId, reason)
    .catch((e) => { throw "I can't apply the mute role right now. Please check my permissions or role positioning." })

    //If done by slash command, reply must be sent to complete event
    if((opts.by !== "bot") && interaction) 
        interaction.reply(`<@${target.id}> is muted${hours?` for ${hours} hour${hours>1?"s":""}`:''}${days?` for ${days} day${days>1?"s":""}`:''}.`)
    
    //Log to database to prevent people from rejoining
    var mutes = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../flatdbs/mutes.json"), {encoding: "utf8", flag: "a+"}) || "{}")
    mutes[target.id] = {
        expires: expireDate
    }
    fs.writeFileSync(path.resolve(__dirname, "../flatdbs/mutes.json"), JSON.stringify(mutes))

    target.send(`You were muted in "${guild.name}" by ${requester.tag}${hours?` for ${hours} hour${hours>1?"s":""}`:''}${days?` for ${days} day${days>1?"s":""}`:''}.${reason?` Reason: ${reason}.`:''}`)
    .catch(()=>{})
}