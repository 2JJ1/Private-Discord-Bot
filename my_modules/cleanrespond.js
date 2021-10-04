//Try to respond by DM, otherwise send to text channel
module.exports = function CleanRespond(msgObj, text){
	var user = msgObj.author || msgObj.user
	user.send(text)
	.catch(()=> msgObj.channel.send(`<@${user.id}> ${text}`))
}