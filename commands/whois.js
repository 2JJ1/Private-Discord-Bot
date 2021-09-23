const moment = require("moment")
const { stripIndents } = require("common-tags");
var {SlashCommandBuilder} = require('@discordjs/builders')
const client = require('../my_modules/DiscordJsBotClient')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("whois")
        .setDescription('Profiles the selected member.')
        .addUserOption(option => 
            option
                .setName("user")
                .setDescription("Who do you want to learn about?")
                .setRequired(true)
        ),
    async execute(interaction){
        let user = interaction.options.getUser("user", true)
        if(!user) throw "You must mention someone"

        var embed = {
            title: `${user.username}'s Information`,
            thumbnail: {
                url: user.displayAvatarURL()
            },
            fields: [
                {name: "User Information", value: stripIndents`
                > Account type: ${user.bot ? "Bot" : "User"}
                > Tag: ${user.tag}
                > ID: ${user.id}
                > Account created at: ${moment.utc(user.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (UTC)'}`},
            ],
        }

        //Attach guild member information if they're in the guild
        let member = (await interaction.guild.members.fetch()).get(user.id)
        if(member){
            embed.fields.push({name: 'Member Information', value: stripIndents`
            > Display Name: ${member.displayName}
            > Status: ${member.presence ? member.presence.status : "Unknown"}
            > Roles: ${member.roles.cache.map(r => r.name).filter(n => n != '@everyone').join(', ') || 'None'}
            > Guild joined at: ${moment.utc(member.joinedAt).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (UTC)'}`})
        }
        
        interaction.reply({embeds: [embed]})
    }
}