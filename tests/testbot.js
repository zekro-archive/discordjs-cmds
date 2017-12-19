const Discord = require('discord.js')
const CommandParser = require('../src/cmdparser.js')
const config = require('../token.json')


const client = new Discord.Client()
const cmd = new CommandParser.CmdParser(client, "::")

function cmdTest(msg, args) {
      msg.channel.send(`Rolename: ${msg.member.highestRole.name}\ntypeof role: \`${typeof msg.member.highestRole}\``)
}

cmd
      .setGuildPres({"287535046762561536": "_"})
      .addType("LOL")
      .register(cmdTest, "test", ["t"], "test command", null, "LOL", 2)
      .setPerms("289901361951277056", 3)
      .setOptions({
          msgcolor: 0x0cd682,
          cmdlog: true,
          logfilepath: "logfiles/",
          timeformat: "Y/M/D h:m:s",
          invoketolower: false,
          guildonwerperm: 3,
      })


cmd.event.on('logError', (msg, err) => console.log(err))
cmd.event.on('commandFailed', (type, msg, err) => console.log(err))

client.login(config.token)
