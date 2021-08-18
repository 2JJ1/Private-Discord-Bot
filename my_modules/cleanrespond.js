//Try to respond by DM, otherwise send to text channel
module.exports = function CleanRespond(msgObj, text){
	msgObj.author.send(text)
	.then((reply) => setTimeout(()=>reply.delete(), 15000))
	.catch(()=> msgObj.reply(text).then((reply) => setTimeout(()=>reply.delete(), 15000)))
}