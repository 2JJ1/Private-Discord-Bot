//Try to respond by DM, otherwise send to text channel
module.exports = function CleanRespond(msgObj, text){
	msgObj.author.send(text)
	.catch(()=> msgObj.channel.send(`<@msg.author.id> ${text}`))
}