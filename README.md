 <div align="center">
     <h1>~ discordjs-cmds ~</h1>
     <strong>Simple-to-use command parser for discord.js</strong><br><br>
     <a href="https://travis-ci.org/zekroTJA/discordjs-cmds" ><img src="https://travis-ci.org/zekroTJA/discordjs-cmds.svg?branch=master" /></a>&nbsp;
     <a href="https://zekro.de/docs/discordjs-cmds/CmdParser.html"><img src="https://img.shields.io/badge/docs-jsdocs-c918cc.svg" /></a>
     <a href="https://www.npmjs.com/package/discordjs-cmds" ><img src="https://img.shields.io/npm/v/discordjs-cmds.svg" /></a>&nbsp;
     <a href="https://www.npmjs.com/package/discordjs-cmds" ><img src="https://img.shields.io/npm/dt/discordjs-cmds.svg" /></a>
 <br>
 <br>
 <a href="https://nodei.co/npm/discordjs-cmds/"><img src="https://nodei.co/npm/discordjs-cmds.png?downloads=true"></a>
 </div>

---

```
npm install discordjs-cmds --save
```
---

## [👉 JSDOCS](https://zekro.de/docs/discordjs-cmds/CmdParser.html)

---

# Contents

- [**Disclaimer**](https://github.com/zekroTJA/discordjs-cmds#disclaimer)
- [**Usage**](https://github.com/zekroTJA/discordjs-cmds#usage)
- [**Default Commands**](https://github.com/zekroTJA/discordjs-cmds#default-commands)
- [**Changelogs**](https://github.com/zekroTJA/discordjs-cmds#changelog)
- [**To-Do**](https://github.com/zekroTJA/discordjs-cmds#to-do)

---

# Disclaimer

This project is currently in an early development phase, which means, that there could be some unidentified bugs. Also, there will be much more functions added and advanced later! Feel free to post **issues** or **pull request** if you noticed a bug or if you have improvement suggestions!

---

# Usage

> Implement the library, create your bot framework and create an instance of the CmdParser 
```js
const { Client } = require('discord.js')
const { CmdParser } = require('discordjs-cmds')

// Creating bot instance
const bot = new Client()
// Creating CmdParser  Instance
const cmd = new CmdParser(bot, "-")

// Login the bot instance with your discord token
bot.login(/*bot token*/)
```

> Now, create some methods for commands somewhere
```js
function cmd_say(msg, args) {
    msg.channel.send(args.join(' '))
}

function cmd_ping(msg, args) {
    msg.channel.send('Pong!')
}

// ...
```

> Then, you can register your commands like following
```js
cmd.register(cmd_say, "say", ["tell", "send"], "Send a message with the bot", "-say <msg>", cmd.type.CHAT, 1)
   .register(cmd_ping, "ping")
```

> For permissions, you can register specific permission levels for specific roles
```js
cmd.setPerms(["2134792837489213749", "2319480812347123431"], 1)
   .setPerms("8757023480239487232", 2)
```

> If you want to react on some events the CmdParser event manager fires, use it like following
```js
cmd.on('commandFailed', (errtype) => console.log(`Failed Command: ${errtype}`))
```

---

# Default Commands

There are some default implemented commands:

### `help`

> Sends the user a list of commands via DM

### `help <invoke>`

> Get the help message of a registered command

---

# Changelog

All changelogs (after version `0.3.0`) you can find in the [**CHANGELOG.md**](https://github.com/zekroTJA/discordjs-cmds/blob/master/CHANGELOG.md).

---

# To-Do

- [ ] Add option + function to give guilds higher perm lvl
- [ ] Method to register bot host with max perm lvl
- [x] Guild specific prefixes
- [x] Custom command types
- [x] Aliases
- [x] Permissions
- [x] Detailed help command

---
