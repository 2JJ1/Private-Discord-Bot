const client = require('../my_modules/DiscordJsBotClient')

class Permisisons{
    //Returns true if they have the ADMINITRATOR permission or the "admin" role
    //Recommended to use this because it will create the role if it doesn't exist
    async IsAdmin(guildMember){
        //Sanitization
        if(typeof guildMember !== "object") throw new Error("Not an object, so this is likely not a guildMember.")

        //Mightve tried to pass a non-guild member. Ex. left the server
        if(!guildMember) return false

        //Admin bots like Dyno have a repeat command which non-admins can abuse, so ignore bots
        //This is here just in case since the message handler already blocks out bots
        if(guildMember.user.bot === true) return false

        //Fetch the "admin" role's id
        let role = guildMember.guild.roles.cache.find(role => role.name.toLowerCase() === "admin")
        let roleId
        if(role) roleId = role.id
        else {
            // The role doesn't exist, so create it
            //The admin role should be right under the bot's highest role
            let botMember = await guildMember.guild.members.fetch(client.user.id)
            let position = botMember.roles.highest.position
            let newRole = await guildMember.guild.roles.create({
                data: {
                    name: "admin",
                    color: 0xc0392b,
                    hoist: true,
                    position,
                    permissions: ["MANAGE_MESSAGES"]
                }, 
                reason: "Attempted to check if a member was an admin, but the admin role did not exist"
            })
            roleId = newRole.id
        }

        //Check if guild member has the admin permission
        if(guildMember.hasPermission("ADMINISTRATOR")) return true

        //Check if the guild member has the admin role
        if(guildMember.roles.cache.get(roleId) !== undefined) return true;
        
        return false;
    }

    //Returns true if they have the "moderator" role
    //Recommended to use this because it will create the role if it doesn't exist
    async IsModerator(guildMember){
        //Sanitization
        if(typeof guildMember !== "object") throw new Error("Not an object, so this is likely not a guildMember.")

        //Mightve tried to pass a non-guild member. Ex. left the server
        if(!guildMember) return false

        //Admins qualify as moderators
        if(await this.IsAdmin(guildMember)) return true

        //Create the moderator role if it doesn't exist in the guild
        if(!guildMember.guild.roles.cache.find(role => role.name.toLowerCase() === "moderator")){
            // The role doesn't exist, so create it
            //A moderator should be right under an admin
            var position
            var adminRole = guildMember.guild.roles.cache.find(role => role.name.toLowerCase() === "admin")
            if(adminRole) position = adminRole.position
            //If the admin role doesn't exist yet, then add it under RoundBot
            else {
                let botMember = await guildMember.guild.members.fetch(client.user.id)
                position = botMember.roles.highest.position
            }

            await guildMember.guild.roles.create({
                data: {
                    name: "moderator",
                    color: 0xe74c3c,
                    hoist: true,
                    position,
                    permissions: ["MANAGE_MESSAGES"]
                }, 
                reason: "Attempted to add a moderator, but the role did not exist"
            })
        }
        
        //Check if guild member has the moderator role
        if(guildMember.roles.cache.find(role => role.name.toLowerCase() === "moderator")) return true;
        
        return false;
    }

    //Returns true if they have the "moderator" role
    //Recommended to use this because it will create the role if it doesn't exist
    async IsMiniModerator(guildMember){
        //Sanitization
        if(typeof guildMember !== "object") throw new Error("Not an object, so this is likely not a guildMember.")

        //Mightve tried to pass a non-guild member. Ex. left the server
        if(!guildMember) return false

        //Create the moderator role if it doesn't exist in the guild
        if(!guildMember.guild.roles.cache.find(role => role.name.toLowerCase() === "mini-moderator")){
            // The role doesn't exist, so create it
            //A mini-moderator should be right under a moderator
            var position;
            let moderatorRole = guildMember.guild.roles.cache.find(role => role.name.toLowerCase() === "moderator")
            let adminRole = guildMember.guild.roles.cache.find(role => role.name.toLowerCase() === "admin")
            if(moderatorRole) position = moderatorRole.position
            //If the moderator role doesn't exist yet, add it under an admin
            else if(adminRole) position = adminRole.position
            //If the admin role doesn't exist yet, add it directly under RoundBot
            else position = (await guildMember.guild.members.fetch(client.user.id)).roles.highest.position

            await guildMember.guild.roles.create({
                data: {
                    name: "mini-moderator",
                    color: 0xe74c3d,
                    hoist: false,
                    position,
                    permissions: ["MANAGE_MESSAGES"]
                }, 
                reason: "Attempted to add a mini-moderator, but the role did not exist"
            })
        }

        //Check if guild member has the moderator role
        if(guildMember.roles.cache.find(role => role.name.toLowerCase() === "mini-moderator")) return true;
        
        return false;
    }
}

module.exports = new Permisisons()