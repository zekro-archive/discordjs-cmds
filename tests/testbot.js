const Discord = require('discord.js')
const CommandParser = require('../src/cmdparser.js')


const client = new Discord.Client()
const cmd = new CommandParser.CmdParser(client, "::")

function cmdTest(msg, args, author, chan, guild) {
      return chan.send(`Rolename: ${author.highestRole.name}\ntypeof role: \`${typeof author.highestRole}\``)
}

cmd
      .setGuildPres({"287535046762561536": "_"})
      .addType("LOL")
      .register(cmdTest, "test", ["t"], "test command", null, "LOL", 2)
      .register(cmdTest, "say", ["s", "call"], "test say cmd", `abcasdasd`, null, 2)
      .setPerms("289901361951277056", 3)
      .setOptions({
          msgcolor: 0x0cd682,
          cmdlog: true,
          logfilepath: "logfiles/",
          timeformat: "Y/M/D h:m:s",
          invoketolower: false,
          ownerpermlvl: 5,
          multlogfiles: 'abc'
      })

cmd.createDocs("test.md", "md")


// cmd.event.on('logError', (msg, err) => console.log(err))
cmd.on('commandFailed', (type, msg, err) => console.log("--> ERROR:", err))

if (process.argv.includes('--ci')) {
      client.on('ready', () => {
            console.log('TEST SUCCESSFULL. SHUTTING DOWN...')
            process.exit(0)
      })
}

client.login(process.argv[2])
