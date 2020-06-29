const fetch = require('node-fetch');

/**
 * Sends a message to some online chat AI and it will respond.
 * This probably isn't all too reliable.
 */
module.exports = async function(speech){
    return await fetch(`http://chathelp-it.glitch.me/talkwithmek?message=${encodeURIComponent(speech)}`)
    .then(res => res.json())
    .then(res => res.message)
    .catch(e => {
        console.log(e)
        return "Sorry, but I can't chat right now."
    })
}