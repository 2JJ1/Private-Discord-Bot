module.exports = async function(msg){
	var list = "Admins: ";
	//Grabs list of members with the ADMINISTRATOR permission or admin role (Except for bots)
	var admins = (await msg.guild.members.fetch()).filter(member => { 
		return (
			(member.hasPermission("ADMINISTRATOR") || member.roles.cache.find(roles => roles.name.toLowerCase() === 'admin')) && 
			member.user.bot === false
		)
	})
	.map(member =>  `<@${member.user.id}>`) //Converts to mentions
	list += admins.join(", ")

	//Lists people with the moderator role (if any)
	let moderators = (await msg.guild.members.fetch()).filter(member => member.roles.cache.find(roles => roles.name.toLowerCase() === 'moderator') && member.user.bot === false)
	.map(member =>  `<@${member.user.id}>`) //Converts to mentions
	if(moderators.length > 0) list += "\r\nModerators: " + moderators.join(", ")

	//List people with the mini-moderator role (If any)
	let miniModerators = (await msg.guild.members.fetch()).filter(member => member.roles.cache.find(roles => roles.name.toLowerCase() === 'mini-moderator') && member.user.bot === false)
	.map(member =>  `<@${member.user.id}>`) //Converts to mentions
	if(miniModerators.length > 0) list += "\r\nMini-Moderators: " + miniModerators.join(", ")
					
	msg.channel.send({embed: {
		color: 3447003,
		description: list
	}});
}