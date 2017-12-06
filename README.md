 <div align="center">
     <h1>~ discordjs-cmds ~</h1>
     <strong>Simple-to-use command parser for discord.js</strong><br><br>
     <a href="https://www.npmjs.com/package/discordjs-cmds" ><img src="https://img.shields.io/npm/v/discordjs-cmds.svg" /></a>&nbsp;
     <a href="https://www.npmjs.com/package/discordjs-cmds" ><img src="https://img.shields.io/npm/dt/discordjs-cmds.svg" /></a>

 </div>

---

```
npm install discordjs-cmds --save
```

---

# Contents

- [**Disclaimer**](https://github.com/zekroTJA/discordjs-cmds#disclaimer)
- [**Usage**](https://github.com/zekroTJA/discordjs-cmds#usage)
- [**Docs**](https://github.com/zekroTJA/discordjs-cmds#docs)
    - [Constructor](https://github.com/zekroTJA/discordjs-cmds#constructor)
    - [Properties](https://github.com/zekroTJA/discordjs-cmds#properties)
    - [Events](https://github.com/zekroTJA/discordjs-cmds#events)
    - [Methods](https://github.com/zekroTJA/discordjs-cmds#methods)

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

# Docs

## CmdParser

### Constructor

```js
new CmdParser(botinstance, prefix)
```

| Parameter | Type | Optional (Default) | Description |
|-----------|------|--------------------|-------------|
| botinstance | Discord.Client | no | The instance of the bots client |
| prefix | string | no | The default prefix commands should be executed with |

Returns **`CmdParser`** *this*

---

### PROPERTIES

### `.type`

> Some standardised enum like types for commands

- `ADMIN`: *`ADMIN`*
- `GUILDADMIN`: *`GUILDADMIN`*
- `MODERATION`: *`MODERATION`*
- `FUN`: *`FUN`*
- `SETTING`: *`SETTING`*
- `CHAT`: *`CHAT`*
- `MISC`: *`MISC`*


### `.errors`

> Some standardised enum like error codes for event emitter

- `WRONG_INVOKE`: *`0`*
- `NOT_PERMITTED`: *`1`*
- `EXECUTION_ERROR`: *`2`*
- `WRONG_CHANNEL`: *`3`*

---

### EVENTS

### `commandExecuted`

> Emitted when command was executed successfully

| Parameter | Type | Description |
|-----------|------|-------------|
| msg | Discord.Message | Message which command was parsed from |


### `commandFailed`

> Emitted when command could not be parsed correctly

| Parameter | Type | Description |
|-----------|------|-------------|
| errortype | CmdParser.errors | Error type |
| msg | Discord.Message | Message command should has parsed from |

**ATTENTION:** If errortype `EXECUTION_ERROR` appears, parameter 2 will not be a `Discord.Message`, instead there will be the error as `string` and as 3rd parameter the message! So you may need to check errortype before accessing message or there may occure errors!<br>
*This will be updated later and is only a temporary circumstance.*

---

### METHODS

### `.register(func, invoke, aliases, description, help, type, perm)`

> Register commands with their properties

| Parameter | Type | Optional (Default) | Description |
|-----------|------|--------------------|-------------|
| func | function | no | Function which will be executed |
| invoke | string | no | Primary invoke to access command |
| aliases | string[] | yes (`[]`) | Aliases to access command |
| description | string | yes (`"No description"`) | Description shown in help command |
| help | string | yes (`No help`) | Help displayed in help option |
| type | CmdParser.type | yes (`CmdParser.type.MISC`) | Type of command |
| perm | number | yes (`0`) | Permission level of command |

Returns **`CmdParser`** *this*


### `.setPerms(roles, permlvl)`

> Define permission levels to specified roles

| Parameter | Type | Optional (Default) | Description |
|-----------|------|--------------------|-------------|
| roles | string / string[] | no | Role ID's of roles |
| permlvl | number | no | Permission LvL roles will get refered to |

Returns **`CmdParser`** *this*


### `.getPermLvl(memb)`

> Get the permission level of a member

| Parameter | Type | Optional (Default) | Description |
|-----------|------|--------------------|-------------|
| memb | Discord.Member | no | Member to get perm lvl from |

Returns **`number`** *Permission Level*


### `.parse(msg)`

> Parse message as command. Defaultly, the CmdParser creates a listener for messages in public text channels which listens to messages, so just use this if you want to parse commands for example in private chats.

| Parameter | Type | Optional (Default) | Description |
|-----------|------|--------------------|-------------|
| msg | Discord.Message | no | Message to parse command |

Returns **`CmdParser`** *this*
