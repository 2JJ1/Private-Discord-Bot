var saferegex = require('safe-regex');
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = async function(msg){
	//Check if guild settings allow this command
	if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
	if(settings.modCommands.purge === false) throw "The purge command module is disabled"

	//Only moderators can purge
	let hasPerm = await permissions.IsModerator(msg.member)
	if(hasPerm !== true) throw {safe: 'You can\'t execute that command'};

	//Read how many messages the author wants to delete/sift through
	var command = msg.content.substring(1).toLowerCase().split(" ");
	var count = parseInt(command[1]) //Also delete the command
	if(!count || count === NaN) count = 100 //A count wasn't defined, so assume it is 100
	else if(count <= 0) throw "Please specify a number from 1-100"
	else if(count > 100) count = 100 //Discord API limits it to 100 messages

	//Delete messages that contain the exact string
	if(msg.opts.search){
		//Purging would probably mean they dont want to see the command either
		await msg.delete({reason: `Purge command by <@${msg.author.id}>`})

		//Normalize
		msg.opts.search = msg.opts.search.toLowerCase()

		msg.channel.messages.fetch({limit: count})
		//Grabs list of messages that include the string
		.then(messages => messages.filter(message => message.content.toLowerCase().includes(msg.opts.search)))
		//Deletes each of the matched messages
		.then(deleteQueue => {
			deleteQueue.forEach(async _msg => await _msg.delete({reason: `Purge command by <@${msg.author.id}>`}))
			msg.channel.send("<@" + msg.author.id + `> deleted ${deleteQueue.size} chat(s)`)
		})
	}
	//Delete messages that match the specified regex
	else if(msg.opts.regex){
		if(!saferegex(msg.opts.regex)) throw "That regex seems to require too much processing time. Try a faster one."

		//Purging would probably mean they dont want to see the command either
		await msg.delete({reason: `Purge command by <@${msg.author.id}>`})

		let regex = RegExp(msg.opts.regex)

		msg.channel.messages.fetch({limit: count})
		//Grabs list of messages that matched the regex
		.then(messages => messages.filter(message => regex.test(message.content)))
		//Deletes each of the matched messages
		.then(deleteQueue => {
			deleteQueue.forEach(async _msg => await _msg.delete({reason: `Purge command by <@${msg.author.id}>`}))
			msg.channel.send("<@" + msg.author.id + `> deleted ${deleteQueue.size} chat(s)`)
		})
	}
	//Deletes messages that are from the specified user
	else if(msg.opts.from){
		//Purging would probably mean they dont want to see the command either
		await msg.delete({reason: `Purge command by <@${msg.author.id}>`})

		let targetId = msg.opts.from.match(/<@!?(\d{17,19})>/)[1]
		if(!targetId) throw 'Please mention someone after "--from"'

		msg.channel.messages.fetch({limit: count})
		//Grabs list of messages that matched the regex
		.then(messages => messages.filter(message => message.author.id === targetId))
		//Deletes each of the matched messages
		.then(deleteQueue => {
			deleteQueue.forEach(async _msg => await _msg.delete({reason: `Purge command by <@${msg.author.id}>`}))
			msg.channel.send("<@" + msg.author.id + `> deleted ${deleteQueue.size} chat(s) from <@${targetId}>`)
		})
	}
	//By default, delete the specified amount of latest messages
	else {
		//Purging would probably mean they dont want to see the command either
		await msg.delete({reason: `Purge command by <@${msg.author.id}>`})

		//The actual deleting part
		msg.channel.bulkDelete(count)
		.then(messages => {
			msg.channel.send("<@" + msg.author.id + `> deleted ${messages.size} chat(s)`)
			.catch(e => {})
		})
		.catch(e => {
			msg.channel.send("Failed: I lack permissions or the messages are older than 14 days.")
			.catch(e => {})
		})
	}
}