var inviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/

module.exports = function(msgContent){
    return inviteRegex.test(msgContent)
}