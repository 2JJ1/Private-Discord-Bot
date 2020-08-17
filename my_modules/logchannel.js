/**
 * Logs the logContent to the #logs text channel
 * @param {*} guild (Discord.js #Guild class)
 * @param {*} logContent What will be sent to #logs channel. (String or embed JSON)
 */
module.exports = async function(guild, logContent){
    //Find the logs channel
	var logChannel = guild.channels.cache.find(channel => channel.name.toLowerCase() === "logs")
	//Create it if it doesn't exist
	if(!logChannel){
		logChannel = await guild.channels.create("logs", {
			type: "text",
			nsfw: true,
			reason: "The message log setting was enabled. RoundBot attempted to log something, but the channel did not exist."
		})
	}
	//Exit if the bot could not find or create the logs channel(E.g lacks permission)
	if(!logChannel) return

	//Logs the deleted message
	logChannel.send(logContent)
}