const moment = require("moment")
const { stripIndents } = require("common-tags");
const client = require('../my_modules/DiscordJsBotClient')

module.exports = async function(msg){
    //Mention not found. The member isn't in the guild, so pattern check and grab the id that way
	var targetid;
    let arr = msg.content.split(" ")
    let pattern = /<@!?(\d{17,19})>/
    for(let i=0; i<arr.length; i++){
        var match = arr[i].match(pattern)
        if(match != null){
            targetid = match[1]
            break;
        }
    }
    if(!targetid) throw "You must mention someone"

    var mentionedUser = await client.users.fetch(targetid).catch(()=>{})
    if(!mentionedUser) throw 'The mentioned user could not be found'

    var embed = {
        title: `${mentionedUser.username}'s Information`,
        thumbnail: {
            url: mentionedUser.displayAvatarURL()
        },
        fields: [
            {name: "User Information", value: stripIndents`
            > Account type: ${mentionedUser.bot ? "Bot" : "User"}
            > Tag: ${mentionedUser.tag}
            > ID: ${mentionedUser.id}
            > Status: ${mentionedUser.presence.status}
            > Account created at: ${moment.utc(mentionedUser.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (UTC)'}`},
        ],
    }

    //Attach guild member information if they're in the guild
    let member = (await msg.guild.members.fetch()).get(mentionedUser.id)
    if(member){
        embed.fields.push({name: 'Member Information', value: stripIndents`
        > Display Name: ${member.displayName}
        > Roles: ${member.roles.cache.map(r => r.name).filter(n => n != '@everyone').join(', ') || 'None'}
        > Guild joined at: ${moment.utc(member.joinedAt).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (UTC)'}`})
    }
    
    msg.reply({embed})
}