module.exports = async function(msg){
    const m = await msg.channel.send("...");
    m.edit(`Pong! Latency is ${m.createdTimestamp - msg.createdTimestamp}ms.`);
}