const EventEmitter = require('events')
const Discord = require('discord.js')
const fs = require('fs')


/**
* Create instance of command parser
* @param {string}         prefix Command Prefix
* @param {Discord.Client} bot    Bot Instance
*/
class CmdParser extends EventEmitter {
    constructor(bot, prefix) {
        super()
        this.prefix = prefix
        this.bot = bot
        this.type = {
            ADMIN: "ADMIN",
            GUILDADMIN: "GUILDADMIN",
            MODERATION: "MODERATION",
            FUN: "FUN",
            SETTING: "SETTING",
            CHAT: "CHAT",
            MISC: "MISC"
        }
        this.errors = {
            WRONG_INVOKE: 0,
            NOT_PERMITTED: 1,
            EXECUTION_ERROR: 2,
            WRONG_CHANNEL: 3
        }
        this.cmds = {}
        this.perms = {}
        this.helplist = {}
        this.host = null
        this.guildpres = {}
        this.options = {
            msgcolor: 0xd2db2b,
            cmdlog: true,
            msgedit: true,
            logfilepath: null,
            multlogfiles: null,
            timeformat: null,
            invoketolower: true,
            ownerpermlvl: null
        }
      
        /**
         * Register a command.
         * @param {function}       cmdfunc     Command Function<br>
         *                                     Getting args: {Message} message, {string[]} args, {Member} author, {Channel} channel, {Guild} guild<br>
         *                                     Must return:  {Promise} pending promise
         * @param {string}         invoke      Command Invoke
         * @param {string[]}       aliases     Command Aliases
         * @param {string}         description Command Description
         * @param {string}         help        Command Help and Usage
         * @param {CmdParser.type} type        Command Type
         * @param {number}         perm        Required permission level
         * @returns {CmdParser}
         */
        this.register = function(cmdfunc, invoke, aliases, description, help, type, perm) {
            if (type) {
                type = type.toUpperCase()
            }
            this.cmds[invoke] = {
                cmdfunc:     cmdfunc,
                invoke:      invoke,
                root:        invoke,
                description: description ? description : "no description",
                help:        help ? help : "no help",
                type:        type ? type : this.type.MISC,
                perm:        perm ? perm : 0 
            }
            if (aliases)
                if (aliases.length > 0) {
                    aliases.forEach(a => {
                        this.cmds[a] = {
                            cmdfunc:     cmdfunc,
                            invoke:      a,
                            root:        invoke,
                            description: description ? description : "no description",
                            help:        help ? help : "no help",
                            type:        type ? type : this.type.MISC,
                            perm:        perm ? perm : 0 
                        }
                    })
                }
            this.helplist[invoke] = {
                cmdfunc:     cmdfunc,
                invoke:      invoke,
                aliases:     aliases,
                description: description ? description : "no description",
                help:        help ? help : "no help",
                type:        type ? type : this.type.MISC,
                perm:        perm ? perm : 0 
            }
            return this
        }
      
        /**
         * Set some options for CmdParser.
         * @param {number}  options.msgcolor      Color for some messages like help message
         * @param {boolean} options.cmdlog        Log commands defaulty after executing in console
         * @param {boolean} options.msgedit       Parse edited messages as command message
         * @param {string}  options.logfilepath   Write command log into logfile, set to null or '' to disable
         * @param {boolean} options.multlogfiles  Write command log into logfile and create new lofile on start, set to null or '' to disable
         * @param {string}  options.timeformat    Time / Date format for log time
         * @param {boolean} options.invoketolower Set if entered invoke should be parsed case sensitive or not
         * @param {number}  options.ownerpermlvl  Permission level for guild owners
         * @returns {CmdParser}
         */
        this.setOptions = function(options) {
            if (typeof options.msgcolor == "number")
                this.options.msgcolor = options.msgcolor
            else if (options.msgcolor)
                console.log("[CMDPARSER] Invalid option set for 'msgcolor'")
            if (typeof options.cmdlog == "boolean")
                this.options.cmdlog = options.cmdlog
            else if (options.cmdlog)
                console.log("[CMDPARSER] Invalid option set for 'cmdlog'")
            if (typeof options.msgedit == "boolean")
                this.options.msgedit = options.msgedit
            else if (options.msgedit)
                console.log("[CMDPARSER] Invalid option set for 'msgedit'")
            if (typeof options.logfilepath == "string")
                this.options.logfilepath = options.logfilepath
            else if (options.logfilepath)
                console.log("[CMDPARSER] Invalid option set for 'logfilepath'")
            if (typeof options.multlogfiles == "string")
                this.options.multlogfiles = options.multlogfiles
            else if (options.multlogfiles)
                console.log("[CMDPARSER] Invalid option set for 'multlogfiles'")
            if (typeof options.timeformat == "string")
                this.options.timeformat = options.timeformat
            else if (options.timeformat)
                console.log("[CMDPARSER] Invalid option set for 'timeformat'")
            if (typeof options.invoketolower == "boolean")
                this.options.invoketolower = options.invoketolower
            else if (options.invoketolower)
                console.log("[CMDPARSER] Invalid option set for 'invoketolower'")
            if (typeof options.ownerpermlvl == "number")
                this.options.ownerpermlvl = options.ownerpermlvl
            else if (options.ownerpermlvl)
                console.log("[CMDPARSER] Invalid option set for 'ownerpermlvl'")

            return this
        }

        /**
         * Set permission levels for specific role(s).
         * ATTENTION: Need to enter ROLE ID's for roles!
         * @param {(string|string[])} roles   Role ID's
         * @param {number}            permlvl Permissiol level<br>0 - default perms<br>higher -> more perms
         * @returns {CmdParser}
         */
        this.setPerms = function(roles, permlvl) {
            if (!Array.isArray(roles))
                roles = [roles]
            roles.forEach(r => {
                this.perms[typeof r == "object" ? r.id : r] = permlvl
            })
            return this
        }
      
        /**
         * Get max permission level of member.
         * @param {Discord.Member} memb Member
         * @returns {number} Max perm lvl
         */
        this.getPermLvl = function(memb) {
            if (memb.id == this.host)
                return 999
            if (memb.guild.owner.id == memb.id && this.options.ownerpermlvl)
                return this.options.ownerpermlvl
            var max = memb.roles.map(r => this.perms[r.id] ? this.perms[r.id] : 0).sort((a, b) => b - a)
            return max ? max[0] : 0
        } 
      
        /**
         * Add custom command type(s).
         * Command times are only parsed as uppercase strings, so if you
         * enter lowercase, keep in mind it will be parsed to upper automatically.
         * Then, you can use it with cmdParser.type.YOURTYPE or directly via the
         * string "YOURTYPE"
         * @param {(string|string[])} typename Typename(s)
         * @returns {CmdParser}
         */
        this.addType = function(typename) {
            if (Array.isArray(typename))
                typename.forEach(t => {
                    if (typeof t != "string" || !t)
                        console.log("[CMDPARSER] Could not set new type: Invalid argument!")
                    else {
                        t = t.toUpperCase()
                        this.type[t] = t
                    }
                })
            else
                if (typeof typename != "string" || !typename)
                    console.log("[CMDPARSER] Could not set new type: Invalid argument!")
                else {
                    typename = typename.toUpperCase()
                    this.type[typename] = typename
                }
            return this
        }

        /**
         * Set the host of the bot for maximum permission level (100)
         * @param {(Discord.User|Discord.Member|number|string)} host Discord account of host of the bot
         * @returns {CmdParser}
         */
        this.setHost = function(host) {
            if (typeof host == 'object')
                this.host = host.id
            else if (typeof host == 'number')
                this.host = host.toString()
            else
                this.host = host
            return this
        }

        /**
         * Set guild specific prefixes.
         * @param {object} pres {"GUILD ID 1": "PREFIX",<br/> "GUILD ID 2": "PREFIX"} 
         * @returns {CmdParser}
         */
        this.setGuildPres = function(pres) {
            for (var g in pres) {
                if (typeof g == 'object')
                    this.guildpres[g.id] = pres[g]
                else
                    this.guildpres[g] = pres[g]
            }
            return this
        }

        /**
         * Create documents of registered commands to text file.
         * You can choose between different formats (yet only Markdown).
         * @param   {string}  path   Location of output file. <br>ATTENTION: 
         *                           location path needs to be existent!
         * @param   {string}  format Format:<br>
         *                           - "md" / "markdown"<br>
         *                           - "html" (not available yet)
         * @returns {Promise}        returns promise
         */
        this.createDocs = (path, format) => {

            function _serializeMarkdown(cmds, categories, elem) {
                elem.head += '# Commands\n'
                elem.output += '# Commands index\n'
                categories.sort().forEach(_cat => {
                    elem.head += `\n### ${_cat}\n\n`
                    elem.output += `\n## ${_cat}\n\n`
                    Object.keys(cmds)
                        .filter(i => cmds[i].type == _cat)
                        .sort()
                        .forEach(i => {
                            let c = cmds[i]
                            let help = c.help.replace(/`/g, '')

                            elem.head += `- [${i}](#${i})\n`
                            elem.output += `### ${i}\n\n` +
                                `> ${c.description}\n\n` +
                                '| | |\n' +
                                '| --------- | --------- |\n' +
                                `| Permission | ${c.perm} |\n` +
                                `| Group | ${c.type} |\n` +
                                `| Aliases | ${c.aliases.join(', ')} |\n\n` +
                                '**Usage**\n\n' +
                                '```php\n' +
                                help + '\n' +
                                '```\n\n\n'
                        })
                })
                return '> This content is automatically generated by [discordjs-cmds](https://github.com/zekroTJA/discordjs-cmds).\n\n---\n\n' + elem.head + '\n\n---\n\n' + elem.output
            }

            // WIP
            // function _serializeHtml(cmds, categories, elem) {
            //     elem.head += '<h1>Commands</h1>\n'
            //     elem.output += '<h1>Commands index</h1>\n'
            //     categories.sort().forEach(_cat => {
            //         elem.head += `\n<h3>${_cat}</h3>\n\n`
            //         elem.output += `\n<h3>${_cat}</h3>\n\n`
            //         Object.keys(cmds)
            //             .filter(i => cmds[i].type == _cat)
            //             .sort()
            //             .forEach(i => {
            //                 let c = cmds[i]
            //                 let help = c.help.replace(/`/g, '')

            //                 elem.head += `- <a href="#${i}">${i}</a>\n`
            //                 elem.output += `<h3>${i}</h3>\n\n` +
            //                     `> ${c.description}\n\n` +
            //                     '| | |\n' +
            //                     '| --------- | --------- |\n' +
            //                     `| Permission | ${c.perm} |\n` +
            //                     `| Group | ${c.type} |\n` +
            //                     `| Aliases | ${c.aliases.join(', ')} |\n\n` +
            //                     '**Usage**\n\n' +
            //                     '```php\n' +
            //                     help + '\n' +
            //                     '```\n\n\n'
            //             })
            //     })
            //     return '<!DOCTYPE html>\n<html>\n<head>\n<title>Commands Docs</title></head>\n<body>' + elem.head + elem.output + '</body></html>'
            // }

            return new Promise(resolve => {
                var cmds = this.helplist
                var categories = []

                var elements = {
                    output: '',
                    head:   ''
                }

                Object.keys(cmds).forEach(i => {
                    let _cat = cmds[i].type
                    if (!categories.includes(_cat))
                        categories.push(_cat)
                })

                var data
                switch (format) {
                    case "html":
                        data = _serializeHtml(cmds, categories, elements)
                        break;
                    default:
                        data = _serializeMarkdown(cmds, categories, elements)
                }

                fs.writeFile(path, data, resolve)
            })
        }

        /**
         * Parse a message from a message event.
         * @param {Discord.Message} msg Message Event
         * @returns {CmdParser}
         */
        this.parse = function(msg) {
            const cont   = msg.content,
                  author = msg.member,
                  guild  = msg.guild,
                  chan   = msg.channel
        
            if (msg.author.user.bot) return

            this.checkPrefix = function() {
                if (cont.startsWith(this.prefix)) {
                    this.currPrefix = this.prefix
                    return true
                }
                if (guild.id in this.guildpres)
                    if (cont.startsWith(this.guildpres[guild.id])) {
                        this.currPrefix = this.guildpres[guild.id]
                        return true
                    }
                return false
            }

            if (author.id != this.bot.user.id && this.checkPrefix()) {
            
                // Splitting args with " " but not in quotes
                // -> https://stackoverflow.com/questions/16261635/javascript-split-string-by-space-but-ignore-space-in-quotes-notice-not-to-spli#16261693
                var invoke = cont
                    .split(/ +/g)[0]
                    .substr(this.currPrefix.length)
                if (this.options.invoketolower)
                    invoke = invoke.toLowerCase()
                const args   = cont
                    //.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g)
                    .split(/ +/g)
                    .slice(1)
                    .map(a => a.indexOf(' ') > 0 ? a.replace('"', '').replace('"', '') : a)
            
                if (invoke == "help") {
                    this.sendHelpMsg(chan, args[0])
                }
                else if (invoke in this.cmds) {
                    var lvlm = parseInt(this.getPermLvl(author))
                    var lvlr = parseInt(this.cmds[invoke].perm)
                    if (lvlm < lvlr) {
                        this.emit('commandFailed', this.errors.NOT_PERMITTED, msg, 'To low permissions.')
                    } 
                    else {
                        
                        if (this.options.cmdlog)
                            console.log(`[COMMAND] ${this.getTime()} (${author.user.username} @ ${guild.name}) '${cont}'`)
                        
                        var promise = this.cmds[invoke].cmdfunc(msg, args, author, chan, guild)
                        if (!promise)
                            console.log(
                                '-------------------------------------------------------------------------\n' +
                                '[WARNING] Attention: CMD functions not returning a promise is deprecated!' + 
                                '\n------------------------------------------------------------------------'
                            )
                        else {
                            promise
                            .then(() => {
                                if (this.options.logfilepath && this.options.logfilepath != '') {
                                    var fs = require('fs')
                                    var pathsplit = this.options.logfilepath.split('/')
                                    var path
                                    if (pathsplit[pathsplit.length - 1].indexOf('.') > -1)
                                        path = pathsplit.join('/')
                                    else
                                        path = pathsplit.join('/') + '/cmdlog.txt'
                                    var onlypath = (pathsplit[pathsplit.length - 1].indexOf('.') > -1 ? pathsplit.slice(0, pathsplit.length - 1) : pathsplit).join('/')
                                    if (!fs.existsSync(onlypath))
                                        fs.mkdirSync(onlypath)
                                    fs.appendFile(path, `${this.getTime()} [${author.user.username} (${author.user.id}) @ ${guild.name} (${guild.id})] '${cont}'\n`, (err) => {
                                        if (err)
                                            this.emit('logError', msg, err)
                                    })
                                }
                                this.emit('commandExecuted', msg)
                            })
                            .catch(err => {
                                this.emit('commandFailed', this.errors.EXECUTION_ERROR, msg, err)
                            })
                        }
                    }
                }
            }
          
            return this
        }
      
        /**
         * Send help message in channel.
         * Send help list of all commands if no invoke is given.
         * Else send command details.
         * @param {Discord.Channel} chan   Channel to send message
         * @param {string}          invoke Command invoke
         * @returns {Discord.Message} Sent Message
         */
        this.sendHelpMsg = function(chan, invoke) {
            var msg
            var emb = new Discord.RichEmbed().setColor(this.options.msgcolor)
            if (invoke) {
                var cmd = this.cmds[invoke]
                emb
                    .addField("Description", cmd.description)
                    .addField("Aliases", (() => {
                        if (this.helplist[invoke])
                            return this.helplist[invoke].aliases.length > 0 ? this.helplist[invoke].aliases.join(", ") : "*No aliases*"
                        return "*You provided help for a command via an alias, so here will no aliases be shown. Request help for root command to get list of aliases:*\n" +
                               `**Root Invoke:** \`${cmd.root}\``
                    })())
                    .addField("Usage", cmd.help)
                    .addField("Type", cmd.type, true)
                    .addField("Permission Lvl", cmd.perm, true)
            }
            else {
                var catlist = {}
                for (var cat in this.type) {
                    catlist[cat] = {}
                    for (var inv in this.helplist) {
                        var cmd = this.helplist[inv]
                        if (cmd.type == cat) {
                            catlist[cat][inv] = cmd
                        }
                    }
                }
                for (var cat in catlist) {
                    var localcmdlist = ""
                    for (var inv in catlist[cat]) {
                        var cmd = catlist[cat][inv]
                        localcmdlist += `**${cmd.invoke}**  -  ${cmd.description}  -  *[Lvl. ${cmd.perm}]*\n`
                    }
                    if (localcmdlist != "")
                        emb.addField(cat, localcmdlist + '-----\n')
                }
            }
            chan.send("", emb).then(m => msg = m)
            return msg
        }


        bot.on('message', (msg) => {
            if (msg.channel.type == "text") {
                this.parse(msg)
            }
            // else if (msg.author.id != this.bot.client.id)
            //     this.event.emit('commandFailed', this.errors.WRONG_CHANNEL, msg, 'Defaulty messages will be only parsed in public text channels.')
        })

        bot.on('messageUpdate', (msgOld, msgNew) => {
            if (!this.options.msgedit) return
            if (msgNew.channel.type == "text") {
                this.parse(msgNew)
            }
            // else if (msg.author.id != this.bot.client.id)
            //     this.event.emit('commandFailed', this.errors.WRONG_CHANNEL, msg, 'Defaulty messages will be only parsed in public text channels.')
        })

        bot.on('ready', () => {
            if (this.options.cmdlog)
                console.log(`[CMDPARSER] Registered ${Object.keys(this.helplist).length} commands`)
            if (this.options.multlogfiles && this.options.multlogfiles != '') {
                var fs = require('fs'),
                    date = new Date(),
                    yyyy = date.getFullYear(),
                    mm = date.getMonth() + 1,
                    dd = date.getDate(),
                    datearr = [yyyy, mm, dd],
                    end = false,
                    pathsplit = this.options.multlogfiles.split('/'),
                    onlypath = (pathsplit[pathsplit.length - 1].indexOf('.') > -1 ? pathsplit.slice(0, pathsplit.length - 1) : pathsplit).join('/')
                for (var i = 0; end != true; i++) {
                    datearr.push(i)
                    var datearrstr = 'log_' + datearr.join('_') + '.txt',
                        logpath = onlypath + '/' + datearrstr
                    if (!fs.existsSync(logpath)) {
                        this.setOptions({logfilepath: logpath})
                        if (!fs.existsSync(onlypath))
                            fs.mkdirSync(onlypath)
                        fs.appendFile(logpath, `${this.getTime()} [BOT] Logged in\n`, (err) => {
                            if (err)
                                this.emit('logInError', err)
                        })
                        fs.appendFile(logpath, `${this.getTime()} [CMDPARSER] Registered ${Object.keys(this.helplist).length} commands\n`, (err) => {
                            if (err)
                                this.emit('logInError', err)
                        })
                        end = true
                    } else {
                        datearr.pop()
                    }
                }
            }
        })

        this.getTime = function() {
            function btf(inp) {
                if (inp < 10)
                return "0" + inp;
                return inp;
            }
            var date = new Date(),
                y = date.getFullYear(),
                m = btf(date.getMonth() + 1),
                d = btf(date.getDate()),
                h = btf(date.getHours()),
                min = btf(date.getMinutes()),
                s = btf(date.getSeconds());
            return !this.options.timeformat 
                   ? `[${d}.${m}.${y} - ${h}:${min}:${s}]`
                   : this.options.timeformat
                        .replace('D', d)
                        .replace('M', m)
                        .replace('Y', y)
                        .replace('h', h)
                        .replace('m', min)
                        .replace('s', s);
        }
    }
}

exports.CmdParser = CmdParser
