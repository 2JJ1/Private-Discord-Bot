var saferegex = require('safe-regex')
var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("purge")
		.setDescription('Removes a selected messages from this text channel.')
		.addUserOption(option => 
			option
				.setName("member")
				.setDescription("The member that you want to ute.")
		),
	async execute(interaction){
		try{
			//Check if guild settings allow this command
			if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
			if(settings.modCommands.purge === false) throw "The purge command module is disabled"

			//Only moderators can purge
			let hasPerm = await permissions.IsModerator(interaction.member)
			if(hasPerm !== true) throw {safe: 'You can\'t execute that command'};

			//Read how many messages the author wants to delete/sift through
			var command = interaction.content.substring(1).toLowerCase().split(" ");
			var count = parseInt(command[1]) //Also delete the command
			if(!count || count === NaN) count = 100 //A count wasn't defined, so assume it is 100
			else if(count <= 0) throw "Please specify a number from 1-100"
			else if(count > 100) count = 100 //Discord API limits it to 100 messages

			//Delete messages that contain the exact string
			if(interaction.opts.search){
				//Purging would probably mean they dont want to see the command either
				await interaction.delete({reason: `Purge command by <@${interaction.author.id}>`})

				//Normalize
				interaction.opts.search = interaction.opts.search.toLowerCase()

				interaction.channel.messages.fetch({limit: count})
				//Grabs list of messages that include the string
				.then(messages => messages.filter(message => message.content.toLowerCase().includes(interaction.opts.search)))
				//Deletes each of the matched messages
				.then(deleteQueue => {
					deleteQueue.forEach(async _msg => await _msg.delete({reason: `Purge command by <@${interaction.author.id}>`}))
					interaction.channel.send("<@" + interaction.author.id + `> deleted ${deleteQueue.size} chat(s)`)
				})
			}
			//Delete messages that match the specified regex
			else if(interaction.opts.regex){
				if(!saferegex(interaction.opts.regex)) throw "That regex seems to require too much processing time. Try a faster one."

				//Purging would probably mean they dont want to see the command either
				await interaction.delete({reason: `Purge command by <@${interaction.author.id}>`})

				let regex = RegExp(interaction.opts.regex)

				interaction.channel.messages.fetch({limit: count})
				//Grabs list of messages that matched the regex
				.then(messages => messages.filter(message => regex.test(message.content)))
				//Deletes each of the matched messages
				.then(deleteQueue => {
					deleteQueue.forEach(async _msg => await _msg.delete({reason: `Purge command by <@${interaction.author.id}>`}))
					interaction.channel.send("<@" + interaction.author.id + `> deleted ${deleteQueue.size} chat(s)`)
				})
			}
			//Deletes messages that are from the specified user
			else if(interaction.opts.from){
				//Purging would probably mean they dont want to see the command either
				await interaction.delete({reason: `Purge command by <@${interaction.author.id}>`})

				let targetId = interaction.opts.from.match(/<@!?(\d{17,19})>/)[1]
				if(!targetId) throw 'Please mention someone after "--from"'

				interaction.channel.messages.fetch({limit: count})
				//Grabs list of messages that matched the regex
				.then(messages => messages.filter(message => message.author.id === targetId))
				//Deletes each of the matched messages
				.then(deleteQueue => {
					deleteQueue.forEach(async _msg => await _msg.delete({reason: `Purge command by <@${interaction.author.id}>`}))
					interaction.channel.send("<@" + interaction.author.id + `> deleted ${deleteQueue.size} chat(s) from <@${targetId}>`)
				})
			}
			//By default, delete the specified amount of latest messages
			else {
				//Purging would probably mean they dont want to see the command either
				await interaction.delete({reason: `Purge command by <@${interaction.author.id}>`})

				//The actual deleting part
				interaction.channel.bulkDelete(count)
				.then(messages => {
					interaction.channel.send("<@" + interaction.author.id + `> deleted ${messages.size} chat(s)`)
					.catch(e => {})
				})
				.catch(e => {
					interaction.channel.send("Failed: I lack permissions or the messages are older than 14 days.")
					.catch(e => {})
				})
			}
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}