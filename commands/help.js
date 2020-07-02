module.exports = function(msg){
    msg.channel.send({
        embed: {
            fields: [
                {
                    name: "Public Commands List",
                    value: "!8ball <question>, !joke, !meme, !roast, !compile <coding_language> <code>, !whois <@mention>, !guildinfo, !listmods, !ping, !about"
                }
            ],
        }
    })
}