# 0.5.1

- added method for registering custom command types  
*The can be used later in command registration like default command types or directly with the category strings.*
- command log in console and file will now show the time of execution
- added option to set time format of the execution time in log  
*For formating information please take a look in the docs.*
- added option if invokes should be parsed case sensitive or not  
*defaultly set to `true`, so invokes are not parsed case sensitive.*
- fixed bug, that option `msgedit` could not be set

# 0.4.0

- added option to parse edited messages as command  
*If an message got edited and the option is set to true (defaulty it is so), then an edited message will parsed like a command as same as a send message.*
- added option to set a path for command logging
*If you add a path your options, you can log all commands send in a file in that path.*
- fixed error if command `help <invoke>` was executed with a command alias

# 0.3.0

- reworked help command  
*Now with more details if you want help for a specific command. Also now commands are categorized in help message.*
- command aliases are now working
- added options method  
*Some configurations like help message color and command log output are changable with this mehtod.*
