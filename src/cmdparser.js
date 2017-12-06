const EventEmitter = require('events')
const Discord = require('discord.js')

/**
* Create instance of command parser
* @param {string}         prefix Command Prefix
* @param {Discord.Client} bot    Bot Instance
*/
class CmdParser {
    constructor(bot, prefix) {
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
        this.options = {
            msgcolor: 0xd2db2b,
            cmdlog: true
        }
      
        class Emitter extends EventEmitter {}
        this.event = new Emitter()
      
        /**
         * Register a command.
         * @param {function}       cmdfunc     Command Function
         * @param {string}         invoke      Command Invoke
         * @param {string[]}       aliases     Command Aliases
         * @param {string}         description Command Description
         * @param {string}         help        Command Help and Usage
         * @param {CmdParser.type} type        Command Type
         * @param {number}         perm        Required permission level
         * @returns {CmdParser}
         */
        this.register = function(cmdfunc, invoke, aliases, description, help, type, perm) {
            this.cmds[invoke] = {
                cmdfunc:     cmdfunc,
                invoke:      invoke,
                root:        invoke,
                description: description ? description : "no description",
                help:        help ? help : "no help",
                type:        type ? type : this.type.MISC,
                perm:        perm ? perm : 0 
            }
            if (aliases !== null)
                if (aliases.length > 0) {
                    aliases.forEach(a => {
                        this.cmds[a] = {
                            cmdfunc:     cmdfunc,
                            invoke:      a,
                            root:        a,
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
         * @param {number}  options.msgcolor Color for some messages like help message
         * @param {boolean} options.cmdlog   Log commands defaulty after executing in console
         */
        this.setOptions = function(options) {
            if (typeof options.msgcolor == "number")
                this.options.msgcolor = options.msgcolor
            else if (options.msgcolor)
                console.log("[CMDPARSER] Invalid option set for 'msgcolor'")
            if (typeof options.cmdlog == "boolean")
                this.options.cmdlog = options.cmdlog
            else if (options.cmdlog)
                console.log("[CMDPARSER] Invalid option set for 'options'")
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
                this.perms[r] = permlvl
            })
            return this
        }
      
        /**
         * Get max permission level of member.
         * @param {Discord.Member} memb Member
         * @returns {number} Max perm lvl
         */
        this.getPermLvl = function(memb) {
            var max = memb.roles.map(r => this.perms[r.id] ? this.perms[r.id] : 0).sort((a, b) => b - a)
            return max ? max[0] : 0
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
        
            if (author == null) return
        
            if (author.id != this.bot.user.id && cont.startsWith(this.prefix)) {
            
                // Splitting args with " " but not in quotes
                // -> https://stackoverflow.com/questions/16261635/javascript-split-string-by-space-but-ignore-space-in-quotes-notice-not-to-spli#16261693
                const invoke = cont.split(' ')[0].substr(this.prefix.length),
                      args   = cont.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g).slice(1)
            
                if (invoke == "help") {
                    this.sendHelpMsg(chan, args[0])
                }
                else if (invoke in this.cmds) {
                    var lvlm = parseInt(this.getPermLvl(author))
                    var lvlr = parseInt(this.cmds[invoke].perm)
                    if (lvlm < lvlr) {
                        this.event.emit('commandFailed', this.errors.NOT_PERMITTED, msg)
                    } 
                    else {
                        try {
                            this.cmds[invoke].cmdfunc(msg, args)
                            if (this.options.cmdlog)
                                console.log(`[COMMAND] (${author.user.username} @ ${guild.name}) '${cont}'`)
                            this.event.emit('commandExecuted', msg)
                        }
                        catch (err) {
                            this.event.emit('commandFailed', this.errors.EXECUTION_ERROR, err, msg)
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
                    .addField("Aliases", this.helplist[invoke].aliases.length > 0 ? this.helplist[invoke].aliases.join(", ") : "*No aliases*")
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
                        localcmdlist += `**${cmd.invoke}**  -  ${cmd.description}  -  *[${cmd.type} | Lvl. ${cmd.perm}]*\n`
                    }
                    if (localcmdlist != "")
                        emb.addField(cat, localcmdlist)
                }
            }
            chan.send("", emb).then(m => msg = m)
            return msg
        }


        bot.on('message', (msg) => {
            if (msg.channel.type == "text") {
                this.parse(msg)
            }
            else
                this.event.emit('commandFailed', this.errors.WRONG_CHANNEL, msg)
        })
    }
}

exports.CmdParser = CmdParser
