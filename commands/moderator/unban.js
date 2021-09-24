var {SlashCommandBuilder} = require('@discordjs/builders')
const permissions = require('../../wrappers/permissions')
const settings = require("../../settings")

module.exports = {
    data: new SlashCommandBuilder()
		.setName("unban")
		.setDescription('Unbans the selected user from this guild.')
		.addUserOption(option => 
			option
				.setName("user")
				.setDescription("The user that you want unban.")
				.setRequired(true)
		),
    async execute(msg){
        //Check if settings allow this command
        if(settings.modCommands.enabled === false) throw "The modCommands module is disabled"
        if(settings.modCommands.unban === false) throw "The unban command module is disabled"
        
        //Must be a mod to continue
        let isMod = await permissions.IsModerator(msg.member)
        if(isMod !== true)  throw {safe: 'You are not a moderator'};

        //Grab target to unban
        var targetid;
        
        //The member isn't in the guild, so pattern check and grab the id that way
        let arr = msg.content.split(" ")
        let pattern = /<@!?(\d{17,19})>/
        for(let i=0; i<arr.length; i++){
            var match = arr[i].match(pattern)
            if(match != null){
                targetid = match[1]
                break;
            }
        }

        //A mention is required
        if(!targetid) throw "Please make sure the mention is formatted as '<@theirsnowflakeid>'"

        //Check if the user is banned
        var bannedMember = (await msg.guild.bans.fetch()).get(targetid)
        if(!bannedMember) throw "That user is not banned"
        
        //The actual unban part
        await msg.guild.members.unban(targetid, `Unbanned by <@${msg.author.id}>`)
        msg.channel.send(`<@${targetid}> has been unbanned.`)
    }
}