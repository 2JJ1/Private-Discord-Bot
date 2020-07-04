const fetch = require("node-fetch")
const throttler = require("../../my_modules/throttler")
const settings = require("../../settings")

/**
 * Run code in a sandbox using WandBox's online API
 */
module.exports = async function(msg){
    //Check if settings allow this command
    if(settings.funCommands.enabled === false) throw "The funCommands module is disabled"
	if(settings.funCommands.compile === false) throw "The compile command module is disabled"

    //Only 12 compiles can be called per 5 seconds
	const throttleOptions = {
		maxCalls: 12,
        timeFrame: 5,
        burst: false
	}
    await throttler(`${msg.guild.id}-memes`, throttleOptions)
    .catch(()=>{throw "This guild is requesting compiled code too fast..."})

    //What language the user is trying to compile 
    var language = msg.content.replace(/\n/g, " ").split(" ")[1]
    if(!language) throw 'The compile command syntax is: "!compile <language> <code>"'

    //Hackily extracts the code the user is trying to run
    var code = msg.content.substr("!compile ".length + language.length + 1)

    //Figure out what compiler to use
    var compiler
    switch(language.toLowerCase()){
        case "js":
            language="javascript"
        case "javascript":
            compiler = "nodejs-10.16.0"
            break
        case "lua":
            compiler = "lua-5.3.4"
            break
        case "cpp":
            language="c++"
        case "c++":
            compiler = "gcc-9.2.0"
            break
        case "c#":
            compiler = "mono-5.8.0.108"
            break
        case "py":
            language="python"
        case "python":
            compiler = "pypy-7.2.0-3"
            break
        case "php":
            compiler = "php-7.3.3"
            break
        case "pony":
            compiler = "pony-0.14.0"
            break
        case "clang":
            compiler = "gcc-9.3.0-c"
            break
        case "java":
            compiler = "openjdk-head"
            break
        case "ts":
            language="typescript"
        case "typescript":
            comiler = "typescript-3.9.5"
            break
        case "sql":
            compiler = "sqlite-3.19.3"
            break
        case "sh":
            language="bash"
        case "bash":
            compiler="bash"
            break
    }
    if(!compiler) throw "We do not support that language!"

    //Compile with WandBox and send the output!
    var chat = await msg.channel.send("Compiling...")
    await fetch("https://wandbox.org/api/compile.json", {
        method: "post",
        body: JSON.stringify({
            compiler,
            code
        }),
        headers: {
            'User-Agent': 'request',
            "Content-Type": "application/json"
        },
    })
    .then(res => res.json())
    .then(res => {
        let description = (res.program_message || res.compiler_message)
        if(!description) description = "No output..."
        else description.substr(0,1800)

        //Limits the line count to 20
        let regexs = [...description.matchAll(/\r\n|\r|\n/g)]
        if(regexs.length > 20){
            description = description.substr(0, regexs[20].index) + "\n..."
        }

        chat.edit({embed: {
            title: "Output",
            description,
            footer: {
                text: `Compiled with ${compiler} for ${language}`
            }
        }})
    })
    .catch((e) => chat.edit("Failed."))
}
