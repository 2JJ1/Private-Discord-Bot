var {SlashCommandBuilder} = require('@discordjs/builders')

module.exports = {
	data: new SlashCommandBuilder()
        .setName("listmods")
        .setDescription('List all of the mini-moderators, moderators, and admins in this guild.'),
	async execute(interaction){
		var list = "Admins: ";
		//Grabs list of members with the ADMINISTRATOR permission or admin role (Except for bots)
		var admins = (await interaction.guild.members.fetch()).filter(member => { 
			return (
				(member.permissions.has("ADMINISTRATOR") || member.roles.cache.find(roles => roles.name.toLowerCase() === 'admin')) && 
				member.user.bot === false
			)
		})
		.map(member =>  `<@${member.user.id}>`) //Converts to mentions
		list += admins.join(", ")

		//Lists people with the moderator role (if any)
		let moderators = (await interaction.guild.members.fetch())
			.filter(member => 
				//Filters out pre-listed members
				!admins.find(admin => admin === `<@${member.id}>`) &&
				member.roles.cache.find(roles => roles.name.toLowerCase() === 'moderator') && 
				member.user.bot === false
			)
			.map(member =>  `<@${member.user.id}>`) //Converts to mentions
		if(moderators.length > 0) list += "\r\nModerators: " + moderators.join(", ")

		//List people with the mini-moderator role (If any)
		let miniModerators = (await interaction.guild.members.fetch())
			.filter(member => 
				//Filters out pre-listed members
				![...admins, ...moderators].find(upperRank => upperRank === `<@${member.id}>`) &&
				member.roles.cache.find(roles => roles.name.toLowerCase() === 'mini-moderator') && 
				member.user.bot === false
			)
			.map(member =>  `<@${member.user.id}>`) //Converts to mentions
		if(miniModerators.length > 0) list += "\r\nMini-Moderators: " + miniModerators.join(", ")
						
		interaction.reply({embeds: [{
			color: 3447003,
			description: list
		}]})
	}
}