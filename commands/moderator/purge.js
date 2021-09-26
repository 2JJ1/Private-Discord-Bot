var saferegex = require('safe-regex')
var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
	enabled: settings.modCommands.purge === true,
	data: new SlashCommandBuilder()
		.setName("purge")
		.setDescription('Removes a selected messages from this text channel.')
		.setDefaultPermission(false)
		.addNumberOption(option =>
			option
				.setName("count")
				.setDescription("How many messages do you want to delete? Default: 100")
		)
		.addStringOption(option =>
			option
				.setName("search")
				.setDescription("Only deletes messages containing this phrase.")
		)
		.addUserOption(option =>
			option
				.setName("from")
				.setDescription("Deletes messages only from this user.")
		)
		.addStringOption(option =>
			option
				.setName("regex")
				.setDescription("(Advanced) Deletes messages only containing this regex pattern.")
		),
	permissions: [
		{
			roleName: 'admin',
			type: 'ROLE',
			permission: true,
		},
		{
			roleName: 'moderator',
			type: 'ROLE',
			permission: true,
		},
	],
	async execute(interaction){
		try{
			//Only moderators can purge
			let hasPerm = await permissions.IsModerator(interaction.member)
			if(hasPerm !== true) throw 'You can\'t execute that command'

			//Read how many messages the author wants to delete/sift through
			var count = interaction.options.getNumber("count")
			if(count && (count < 3 || count > 100)) throw "Please specify a count from 3-100"

			//Fetch the latest messages
			let messages = await interaction.channel.messages.fetch({limit: count})
			
			//Delete messages that contain the exact string
			let search = interaction.options.getString("search")
			if(search) messages = messages.filter(message => message.content.toLowerCase().includes(search.toLowerCase()))

			//Deletes messages that are from the specified user
			let from = interaction.options.getUser("from")
			if(from) messages = messages.filter(message => message.author.id ===  from.id)

			//Delete messages that match the specified regex
			let regex = interaction.options.getString("regex")
			if(regex){
				//Some regexes can use up too much processing power and DoS the server
				if(!saferegex(regex)) throw "Sorry, I won't run that regex."

				regex = RegExp(regex)

				//Grabs list of messages that matched the regex
				messages = messages.filter(message => regex.test(message.content))
			}

			await interaction.reply(`Deleting ${messages.size} message${messages.size===1 ? "" : "s"}.`)

			//Deletes each of the matched messages
			for(let [id, message] of messages){
				message.delete()
				.catch(()=>{})
			}
		}
		catch(e){
			if(typeof e === "string") interaction.reply(`Error: ${e}`)
			else console.error(e)
		}
	}
}