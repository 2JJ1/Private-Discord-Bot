const permissions = require('../wrappers/permissions')

const muteMember = require('../my_modules/mutemember')

/* IMPORTANT: In the future, move this to MongoDB. Caching in memory will be too 
resource hauling when this bot is in many servers! */
var msgCache = {}

module.exports = async function(msg){
    var msgContent = msg.content
    //Normalize the message content
    msgContent = msgContent.toLowerCase()

    // Each text channel gets their own rate limit - Thankfully channel ids are universally unique
    //Creates a cache for the message channel if it doesn't exist
    if(!msgCache[msg.channel.id]) msgCache[msg.channel.id] = []
    let channelCache = msgCache[msg.channel.id]

    var curTime = Date.now()

    //Log the message into the cache
    channelCache.push({
        author: msg.author.id,
        content: msgContent,
        time: curTime
    })

    //Limits the message cache to 25 indexes to preserve memory
    channelCache = channelCache.slice(-25)

    //The current code would induce an error when trying to mute a moderator.
    //Moderators probably wouldn't spam anyways, so lets not filter them
    if(await permissions.IsModerator(msg.member)) return

    /* START anti-spam */
    //Checks if the message is being re-sent too frequently
    //Checks per person

    // Trigger 1: Check if the same person sent the same message at least three times in the past 10 messages
    var results = channelCache.slice(-10).filter(row => (
        //Some people just frequently use emojis or commands like !skip for music bots
        //Check if the content length is at least 10 to stop this false positive. Should be enough for most overused messages
        //Factor out custom Discord emojis from the content length - ex: <:DEVSThonk:579183189512421397>
        (msgContent.replace(/ ?\<a?\:[^:]+\:\d+\> ?/g, "").length >= 10) &&
        //Check if this message was already sent
        (row.content === msgContent) &&
        //Check if the already sent message was from the same person
        (row.author == msg.author.id)
    ))
    if(results.length >= 6) {
        msg.delete({reason: "Anti-spam"})
        .catch(()=>{}) //Do nothing with missing messages because other anti-spam-bots could have deleted it
        await muteMember({msg, hours: 1, reason: "Spamming: Repeating the same message without many responses in-between.", by: "bot"})
        .catch(()=>{}) //Mentioning a permissions error would contribute to the spam, so don't
    }
    //Warn them to stop spamming
    else if(results.length >= 3) {
        msg.delete({reason: "Anti-spam"})
        .catch(()=>{}) //Do nothing with missing messages because other anti-spam-bots could have deleted it
        msg.member.send({embed: {
            title: "Warning: Please stop spamming.",
            description: `You have sent, "${msgContent.length > 250 ? msgContent.substr(0,250) + "..." : msgContent}" ${results.length} times without anyone else responding much in-between. Continue and you may be muted for one hour.`}
        })
        .catch(()=>{}) //Their DMs may have been disabled. Warning them in chat would contribute to spam, so don't
    }

    //Trigger 2: Check if someone is flooding the chat
    var results2 = channelCache.filter(cachedMsg => (
        //Checks if the message is from the past 8 seconds
        ((new Date - new Date(cachedMsg.time)) < 1000*8) &&
        (cachedMsg.author == msg.author.id)
    ))
    //15 chats from the same person within 8 seconds? Clearly bot/abusive spamming, so mute them
    if(results2.length >= 15) {
        await muteMember({msg, hours: 1, reason: "Flooding the chat", by: "bot"})
        .catch(()=>{}) //Mentioning a permissions error would contribute to the spam, so don't
        msg.delete({reason: "Anti-spam"})
    }
    //6 chats within 8 seconds. Simply delete it to clean up spam.
    else if(results2.length >= 6) msg.delete({reason: "Anti-spam"})

    /* END anti-spam */



    /* START anti-raid */
    //Basically anti-(spam/flood) from 2+ people

    //Checks if the channel is receiving messages too fast. Basically a message rate limit
    var results3 = channelCache.filter(cachedMsg => (
        //Checks if the message is from the past 5 seconds
        ((new Date - new Date(cachedMsg.time)) < 1000*5)
    ))
    //15 chats within 5 seconds? A raid is probably going on. Delete any messages until the chat slows down
    //Note: Someone might be sending a normal message in the middle of a raid, so don't mute
    if(results3.length >= 15) msg.delete({reason: "Anti-raid"})

    //Checks if the channel is receiving the *same* message too fast
    var results4 = channelCache.filter(cachedMsg => (
        //Checks if the message is from the past 5 seconds
        ((new Date - new Date(cachedMsg.time)) < 1000*5) &&
        cachedMsg.content == msgContent
    ))
    //15 same messages within 5 seconds? A raid is probably going on. 
    //Delete the repeat message and mute the sender
    if(results4.length >= 15) {
        await muteMember({msg, hours: 1, reason: "Suspected raid participation", by: "bot"})
        .catch(()=>{}) //Mentioning a permissions error would contribute to the spam, so don't
        msg.delete({reason: "Anti-raid"})
    }

    /* END anti-raid */
}