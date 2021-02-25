<div align="center">
    <a href="https://jaylawrence.co/projects/ophelia"><img src="https://jaylawrence.co/images/ophelia.png" width="150" alt="Ophelia" /></a>
    <br /><br />
</div>

Completely open-source and customisable, **Ophelia** is a [Discord](https://discordapp.com/) bot framework running on top of [Discord.js](https://discord.js.org/), built specifically to simplify the process of running a custom bot.

## Table of contents
- [Features](#features)
- [Setup](#setup)
- [Configuration](#configuration)
- [Logging](#logging)
- [Commands](#commands)
- [Writing commands](#writing-commands)

## Features

-   Hot swappable commands, allowing for commands to be modified or added while the bot is running.
-   Built-in admin, moderator and help commands.
-   Support for running commands through CLI.
-   Easy configuration using the **config.json** file.
-   A customizable logging module.
    
*Sharding is currently not supported.*

## Setup

- Download the latest release or the clone the repo.  
- Run **npm install** from the root folder to install all dependencies.  
- Log in to the [Discord Developer Portal.](https://discordapp.com/developers/applications/)  
- Create a new application and add a bot to that application.  
- Copy the bot token and paste it into **authorization.json**.  
- Start the bot with **npm start**.

## Configuration

A handful of configuration options can be set in the **config.json** file:

-   **"prefix"** -  (string) The prefix used to run a command, set to ! by default.
-   **"statusMessage"**
	  - **"type"** -  (string) The type of status message. Can be set to "PLAYING", "STREAMING", "LISTENING", "WATCHING" or "COMPETING"
	  - **"message"** -  (string) The status message.
    
-   **"deleteCommandMessages"** -  (bool) Whether the bot deletes the command message after running it.

## Logging

A logging module is included with **Ophelia** allowing users to log information in both CLI and to a file.  
  
This module can be configured using the following values in the **logging.json** file:

-   **"enabled"** -  (boolean) Whether the logger module is enabled.
-   **"logMessages"** -  (boolean) Whether user messages get logged or not.
-   **"print"** -  (boolean) Whether logs get printed to the terminal.
-   **"saveToFile"** -  (boolean) Whether logs get saved to file.
-   **"directory"** -  (string) The relative directory the logs will be saved into.
-   **"levels"** -  (object) Contains the different log levels and the colors associated with them.

The difference between levels is purely visual. They give logged messages a different prefix and colour to make them easier to discern.  
  
Adding a custom level to use in the **logger.log** function and the internally used **logger.print** function can be done through the **logging.json** file. Simply add a new name to the **levels** object and a color value for it. The colors can be found in the **logger.js** file.  
  
If a level is used but hasn't been specified in the **logging.json** file or added to **logger.js**, it will default to whatever color has been specified for the **"default"** level.

## Commands

Commands have all the power of a normal Node.js script and can be written in the same way, as long as the class extends from the built-in Command class.
  
Several commands are included with **Ophelia**, including a few hard-coded commands that aren't in external files:

**Admin/Moderator commands:**

-   **!kick** -  Kicks the mentioned member.
-   **!banlist** -  Lists all the banned users in the guild/server the command was run in.
-   **!ban** -  Bans the mentioned user.
-   **!unban** -  Unbans the specified user.

**Utility commands:**

-   **!help** -  Prints a list of the loaded commands or information about a specific command.
-   **!about** -  Prints information about the bot.
-   **!ping** -  Makes the bot reply 'pong', used for testing purposes.
-   **!say** -  Makes the bot say the specified message.
-   **!uptime** -  Prints how long the bot has been running.

**Hard-coded commands:**

-   **!shutdown** -  Terminates the bot and logs it out.
-   **!reload** -  Reloads all the commands from the /commands folder.

## Writing commands

Writing a command is pretty much the same as writing a normal Node.js module, since that's basically all it is.  
  
Let's run through making a variation of the **"ping"** command. This one will be called "marco" and it'll reply "Polo!" when a user calls it.  
  
Start by creating a new javascript file in the commands folder, the file can be called anything as long as it ends with the **.js** file extension, but for simplicity we'll call it **"marco.js"**. The folder structure doesn't matter as **Ophelia** checks the entire folder tree when looking for commands.  
  
The first thing we need to do is open the new file in a code/text editor and require the command module, as this is what our custom command will extend from:

```js
const Command = require("../modules/command");
```

You'll have to modify this line depending on whether you placed the file in a sub-directory, so that the path points to the correct directory.  
  
Next we'll create the class:

```js
class Marco extends Command  {  
  
}
```

The class name is important, it's what's used to call the command (it's also case-insensitive), for simplicity we're calling it **Marco** meaning users can call it using **"!marco"**.  
  
Inside the new class we need to add a constructor:

```js
class Marco extends Command  {  
  
	constructor()  {  
		super();
	}
}
```

The constructor first calls **super()** which is the constructor of the base Command class. This sets all the command properties to their default values:

```js
this.cli = false;  
  
this.permissions = [];  
  
this.help =  {  
  
	"name": "Command",  
	"arguments": "none",  
	"description": "none",  
	"category": "Uncategorized"  
}
```

**this.cli**  is a boolean that sets whether the command can only be called from the CLI. If this is set to true, users will get an error if they try to call the command from Discord and the command wont be listed when using the help command unless it's called via CLI.  
  
**this.permissions**  is an array of permission flags,  [you can find a list of all them here.](https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS)  If the array is empty, anyone can call the command. As an example, if you wanted the command to only work for people who can kick and ban, the permissions could be set like this:

```js
this.permissions = [KICK_MEMBERS, BAN_MEMBERS];
```

**this.help**  is the help object. This is used by the help command to fill out all the relevant information. If  **category**  is set to  **"Hidden"**  the command wont be listed when the help command is used.

Next we need to override these values and set them up for our new command, anything we don't override will remain at its default value:

```js
class Marco extends Command  {  

	constructor()  {  
  
		super();  
  
		this.setHelp({  
		
			"name": "Marco",  
			"description": "Makes the bot reply 'polo'",  
			"category": "Example"  
		});  
	}
}
```

Now that we've set up the constructor it's time to add the guts of the command, the **run** function:

```js
class Marco extends Command  {  

	constructor()  {  
		...
	}
  
	async run(message, args, client)  {  
		...
	}
}
```

This function is what runs when the command gets called, it has a few different arguments that you can use while making your command:  
  
**message**  is the  [Discord.js message object](https://discord.js.org/#/docs/main/stable/class/Message)  for the message that called the command,  **message.channel**  is set to the string  **"CLI"**  if the command was called from CLI.  
  
**args**  is an array of every argument specified when calling the command.  
  
**client**  is the  [Discord.js client object](https://discord.js.org/#/docs/main/stable/class/Client), with a few extra properties added.  
  
**client.logger**  is the logger module, it provides the  **client.logger.log(level, message)**  function, see logger.js in the modules folder for more information.  
  
**client.filesystem**  is the filesystem module, see filesystem.js in the modules folder for more information.  
  
**client.commands**  is the commands object, it holds every currently loaded command.

  
The **run** function must always return a **Command.Response** object. These get parsed by **Ophelia** and sent either to the guild/user or CLI as the correct type of message. Creating one is as easy at this:

```js
new Command.Response(Command.ResponseType.MESSAGE, "This is a message", channel);
```

The response type can be set to either **ERROR**, **MESSAGE**, **REPLY**. Each one has its own styling, and **REPLY** tags the user who called the command in the message.  
  
Finishing the run function is as simple as making a new **Command.Response** object that replies with the message "Polo!" and sends it to the same channel the original command message was in:

```js
class Marco extends Command  {  
  
	constructor()  {  
		...
	}  
  
	async run(message, args, client)  {  

		return new Command.Response(Command.ResponseType.REPLY, "Polo!", message.channel);
	}  
}
```

The final thing we need to do is make sure the command gets exported. To do this we simply add this line at the end of the file:

```js
module.exports = Marco;
```

That's it! We now have a (hopefully) working custom command. Here's the complete file:

```js
class Marco extends Command  {  
  
	constructor()  {  
	  
		super();  
		  
		this.setHelp({  
		  
			"name": "Marco",  
			"description": "Makes the bot reply 'polo'",  
			"category": "Example"  
		});  
	}  
	  
	async run(message, args, client)  {  
	  
		return new Command.Response(Command.ResponseType.REPLY, "Polo!", message.channel);
	}  
}  
  
module.exports = Marco;
```
