const {SlashCommandBuilder} = require("@discordjs/builders")
const fetch = require("node-fetch")
const throttler = require("../../my_modules/throttler")
const settings = require("../../settings")

/**
 * Run code in a sandbox using WandBox's online API
 */
module.exports = {
    enabled: settings.funCommands.compile === true,
    data: new SlashCommandBuilder()
        .setName("code")
        .setDescription("Executes the selected code.")
        .addStringOption(option => 
            option
                .setName("language")
                .setDescription("What language is the code written in?")
                .setRequired(true)
                .addChoices([
                    ["Javascript", "nodejs-10.16.0"],
                    ["Lua", "lua-5.3.4"],
                    ["C++", "gcc-9.2.0"],
                    ["C#", "mono-5.8.0.108"],
                    ["Python", "pypy-7.2.0-3"],
                    ["PHP", "php-7.3.3"],
                    ["Pony", "pony-0.14.0"],
                    ["Clang", "gcc-9.3.0-c"],
                    ["Java", "openjdk-head"],
                    ["Typescript", "typescript-3.9.5"],
                    ["SQL", "sqlite-3.19.3"],
                    ["Bash", "bash"],
                ])
        )
        .addStringOption(option => 
            option
                .setName("code")
                .setDescription("What code do you want to run?")
                .setRequired(true)
        ),
    async execute(interaction){
        try{
            //Only 12 compiles can be called per 5 seconds
            await throttler(`${interaction.guild.id}-code`, {
                maxCalls: 12,
                timeFrame: 5,
                burst: false
            })
            .catch(()=>{throw "This guild is requesting compiled code too fast..."})

            //What executor to use
            var compiler = interaction.options.getString("language", true)

            //What code is the user trying to run
            var code = interaction.options.getString("code", true)

            //Compile with WandBox and send the output!
            await interaction.reply("Compiling...")
            var compiled = await fetch("https://wandbox.org/api/compile.json", {
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
            .catch(e => {
                interaction.editReply("The 3rd party VM has failed to respond...")
                throw e
            })

            let description = (compiled.program_message || compiled.compiler_message)
            if(!description) description = "No output..."
            else description.substr(0,1800)

            //Limits the line count to 20
            let regexs = [...description.matchAll(/\r\n|\r|\n/g)]
            if(regexs.length > 20){
                description = description.substr(0, regexs[20].index) + "\n..."
            }

            interaction.editReply({embeds: [{
                title: "Output",
                description,
                footer: {
                    text: `Ran with ${compiler}`
                }
            }]})
        }
        catch(e){
            if(typeof e === "string") interaction.reply(`Error: ${e}`)
            else console.error(e)
        }
    }
}