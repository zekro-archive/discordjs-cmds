const EventEmitter = require('events'),
      Discord = require('discord.js')

/**
 * Create instance of command parser
 * @param {string}         prefix Command Prefix
 * @param {Discord.Client} bot    Bot Instance
 */
class CmdParser {
    /**
     * Cretae CmdParser instance.
     * @param {Discord.Client} bot    Bot Client instance
     * @param {string}         prefix Default prefix for commands
     */
    constructor(bot, prefix) {
        this.prefix = prefix
        this.bot    = bot
        this.type   = {
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
        this.cmds   = {}
        this.perms  = {}

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
                aliases:     aliases ? aliases : [],
                description: description ? description : "no description",
                help:        help ? help : "no help",
                type:        type ? type : this.type.MISC,
                perm:        perm ? perm : 0
            }
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
                    if (args.length == 0) {
                        var out = ""
                        for (var inv in this.cmds) {
                            var cmd = this.cmds[inv]
                            out += `\`${this.prefix}${cmd.invoke}\`  -  ${cmd.description} *(${cmd.type})*\n`
                        }
                        chan.send("", new Discord.RichEmbed().setColor(0xd2db2b).setDescription(out))
                    }
                    else {
                        if (invoke in this.cmds)
                            chan.send("", new Discord.RichEmbed().setColor(0xd2db2b).setDescription(`**USAGE:**\n${this.cmds[invoke].help}`))
                        else {
                            chan.send("", new Discord.RichEmbed().setColor(0xdb3a2b).setDescription("There is no command with this invoke registered!"))
                            this.event.emit('commandFailed', this.errors.WRONG_INVOKE, msg)
                        }
                    }
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
