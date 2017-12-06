const Discord = require('discord.js'),
      CommandParser = require('../src/cmdparser.js'),
      config = require('../token.json')
      
      
const client = new Discord.Client(),
      cmd = new CommandParser.CmdParser(client, "::")


cmd
    .register(() => console.log("test123456"), "test", ["t"], "test command", null, null, 2)
    .setPerms("289901361951277056", 3)
    .setOptions({
        msgcolor: 0x0cd682,
        cmdlog: "wrongoptionlel"
    })


client.login(config.token)
