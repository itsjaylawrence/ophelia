/*

 ██████  ██████  ██   ██ ███████ ██      ██  █████
██    ██ ██   ██ ██   ██ ██      ██      ██ ██   ██
██    ██ ██████  ███████ █████   ██      ██ ███████
██    ██ ██      ██   ██ ██      ██      ██ ██   ██
 ██████  ██      ██   ██ ███████ ███████ ██ ██   ██

*/

"use strict";

//-----------------------------------------------------------------------------
// Requires
//-----------------------------------------------------------------------------

// JSON.
const Authorization = require("./authorization.json");
const Configuration = require("./configuration.json");
const LoggerConfiguration = require("./logging.json");

// Modules.
const Logger = require("./modules/logger");
const Filesystem = require("./modules/filesystem");
const Command = require("./modules/command");

const Discord = require("discord.js");
const Path = require("path");

//-----------------------------------------------------------------------------
// Setup
//-----------------------------------------------------------------------------

// Create a discord client.
const client = new Discord.Client();

// Add logging module.
client.logger = new Logger(LoggerConfiguration);

// Add filesystem module.
client.filesystem = new Filesystem();

// Add empty command object so they can be cached later.
client.commands = {};

// Check the bot token was supplied.
if (Authorization.token !== "") {

    // Attempt to login with the supplied token.
    client.login(Authorization.token).catch((error) => {

        client.logger.print("error", "An invalid token was provided in authorization.json");

        // Destroy the client object.
        client.destroy();

        // End the process, not much we can do without a valid bot token.
        return;
    });
} else {

    client.logger.print("error", "Bot token hasn't been set in authorization.json");

    // Destroy the client object.
    client.destroy();

    // End the process, not much we can do without a valid bot token.
    return;
}

// Get process input.
const stdin = process.openStdin();

//-----------------------------------------------------------------------------
// Functions
//-----------------------------------------------------------------------------

//-------------------------------------------------------------
// UI

// Helper function used to create and style an error message for the bot.
function sendError(content, channel) {

    if (channel == "CLI") {

        // Print the error directly in the CLI.
        client.logger.print("error", content);
    } else {

        // Send a styled error message to the specified channel.
        channel.send({

            embed: {

                description: `:exclamation: ${content}`,
                color: 16711684
            }
        });
    }
}

// Helper function used to create and style a generic message for the bot.
function sendMessage(content, channel) {

    if (channel == "CLI") {

        // Print the message directly in the CLI.
        client.logger.print("bot", content);
    } else {

        // Send a styled generic message to the specified channel.
        channel.send({

            embed: {

                description: content,
                color: 16711836
            }
        });
    }
}

//-------------------------------------------------------------
// Commands

// Loads the commands from the commands folder and caches them.
// Returns true if commands were found and at least one was successfully loaded.
function loadCommands() {

    // Get command file names.
    let files = client.filesystem.getFiles("./commands");

    client.logger.print("info", `Found command files:\n${files.join("\n")}`);

    // Check if any files were found.
    if (files !== null) {

        // Regular expression to test the file extension against.
        // Modify this to allow for other extensions, such as typescript, etc.
        let fileExtension = new RegExp("^.*\.(js|JS)$");

        // Iterate through each file.
        files.forEach(function(file) {

            // Check the file has the correct extension.
            if (fileExtension.test(file)) {

                // Try loading the command.
                try {

                    // Load the command script.
                    let script = require("./" + file);

                    // Check the script has content and is a "function". (Can be called and executed)
                    if (script !== undefined && typeof script == "function") {

                        // Create a new instance of the command class.
                        let command = new script();

                        // Check if the command has a run function.
                        if (typeof command["run"] == "function") {

                            // Wrap the command inside an object with it's lowercase name, so it can be accessed in an easy, case-insensitive way later.
                            let wrapper = {};
                            wrapper[script.name.toLowerCase()] = command;

                            // Add the command to the command list.
                            Object.assign(client.commands, wrapper);
                        } else {

                            client.logger.print("error", `No run function found in: ${file}`);
                        }
                    } else {

                        client.logger.print("error", `No command class found in: ${file}`);
                    }
                }
                catch (err) {

                    client.logger.print("error", `Command file "${file}" could not be loaded:\n\n${err}\n\n`);
                }
            }
        });

        // Check whether any commands were successfully loaded.
        if (Object.keys(client.commands).length > 0) {

            return true;
        }
    } else {

        client.logger.print("error", "Commands could not be loaded: directory not found");
    }

    return false;
}

// Clears the commands from the cache and runs loadCommands()
// Returns true if commands were found and at least one was successfully loaded.
function reloadCommands() {

    // Get command files.
    var files = client.filesystem.getFiles("./commands");

    // Iterate through the require cache.
    Object.keys(require.cache).forEach(function(key) {

        // Iterate through every command file.
        files.forEach(function(file) {

            // Check if the key matches one of the command files.
            if (key === Path.resolve(file)) {

                // Delete the key from the cache.
                delete require.cache[key];
            }
        });
    });

    // Clear commands object.
    client.commands = {};

    // Reload the commands.
    return loadCommands();
}

// Process a response requested from a command.
function processResponse(response, message) {

    // Check if the response content is an embed object.
    if (typeof response.message == "object") {

        // Send the embed object directly.
        if (response.channel != "CLI") {

            response.channel.send(response.message);
        } else {

            // Parse the embed as a string.
            client.logger.print(response.type == Command.ResponseType.ERROR ? "error" : "command", response.toString());
        }
    } else {

        // Handle the other pre-defined types of response.
        switch(response.type) {

        case Command.ResponseType.ERROR:

            // Creates and styles an error message response.
            sendError(response.message, response.channel);
            break;

        case Command.ResponseType.MESSAGE:

            // Creates and styles a generic message response.
            sendMessage(response.message, response.channel);
            break;

        case Command.ResponseType.REPLY:

            // Check if this was called by a user, so they can be tagged.
            if (message.channel != "CLI") {

                sendMessage(`${message.author.toString()}: ${response.message}`, response.channel);
            } else {

                sendMessage(response.message, response.channel);
            }
            break;
        }
    }
}

// Process a command called from user message or CLI.
async function processCommand(command, message, args) {

    // Check if the command is being called from CLI.
    let usingCLI = (message.channel == "CLI");

    // Shift the command to lowercase so it's case-insensitive.
    switch(command.toLowerCase()) {

    // Process the hard-coded shutdown command.
    case "shutdown":

        // Check the user has permission to use this command.
        if (!usingCLI && !message.member.hasPermission("ADMINISTRATOR")) {

            sendError(`${message.author.toString()}, you don't have permission to use this command.`, message.channel);
            return;
        }

        // Run the command.
        shutdown();

        break;

    // Process the hard-coded reload command.
    case "reload":

        // Check the user has permission to use this command.
        if (!usingCLI && !message.member.hasPermission("ADMINISTRATOR")) {

            sendError(`${message.author.toString()}, you don't have permission to use this command.`, message.channel);
            return;
        }

        // Set bot status to show a reload is occuring.
        client.user.setStatus("dnd");

        // Reload the command list.
        if (reloadCommands()) {

            sendMessage("Bot has been reloaded!", message.channel);

            // Reset bot status.
            client.user.setStatus("online");
        } else {

            sendError("Bot failed to reload!\n\nCheck the logs for more information.", message.channel);
        }

        break;

    // Process every other command.
    default:

        // Check if the command exists.
        if (client.commands[command] == undefined) {

            // Check if this was called by a user, so they can be tagged.
            if (!usingCLI) {

                sendError(`${message.author.toString()}, could not find command: **${command}**`, message.channel);
            } else {

                sendError(`Could not find command: **${command}**`, message.channel);
            }

            return;
        }

        // Check for user permissions.
        if (!usingCLI && client.commands[command].permissions.length > 0) {

            // Check the member has the relevant permissions.
            if (!message.member.hasPermission(client.commands[command].permissions)) {

                sendError(`${message.author.toString()}, you don't have permission to use this command.`, message.channel);
                return;
            }
        }

        // Check if the command is CLI only.
        if (!usingCLI && client.commands[command].cli) {

            sendError(`${message.author.toString()}, this command must be run through CLI.`, message.channel);
            return;
        }

        // Start typing to show the command is being executed.
        if (!usingCLI) message.channel.startTyping();

        // Run the command, passing the client object and command arguments to it.
        let response = await client.commands[command].run(message, args, client);

        // Check a response has been returned.
        if (response instanceof Command.Response) {

            processResponse(response, message);
        }

        // Stop typing once the command has been executed.
        if (!usingCLI) message.channel.stopTyping(true);
    }
}

//-------------------------------------------------------------
// Utility

// Cleanly shutsdown the bot.
function shutdown() {

    client.logger.print("bot", "Closing bot...");

    // Destroy the client object.
    client.destroy();

    // Wait 250ms before exiting the process, just so everything has time to process.
    setTimeout(() => {

        process.exit();
    }, 250);
}

//-----------------------------------------------------------------------------
// Events
//-----------------------------------------------------------------------------

//-------------------------------------------------------------
// Client

// Fired once the bot has logged in.
client.on("ready", function(event) {

    client.logger.print("bot", `Logged in as: ${client.user.tag}`);

    // Check if a status message was configured.
    if (Configuration.statusMessage.message != "") {

        client.user.setActivity(Configuration.statusMessage.message, {type: Configuration.statusMessage.type});
    } else {

        // Set activity message to the default message.
        client.user.setActivity(`${Configuration.prefix}help to view commands`, {type: "PLAYING"});
    }

    // Load in all commands.
    loadCommands();
});

// Fired whenever an error occurs.
client.on("error", function(error) {

    client.logger.print("error", error);
});

// Fired every time a user sends a message.
client.on("message", async function(message) {

    // Ignore anything from a bot, including this one.
    if (message.author.bot) {

        return;
    }

    // Check if messages should get logged.
    if (LoggerConfiguration.logMessages) {

        client.logger.log("user", `${message.channel.name} - ${message.author.username}: ${message.cleanContent}`);
    }

    // Ignore anything that doesn't start with the bots prefix.
    if (message.content.indexOf(Configuration.prefix) !== 0) {

        return;
    }

    // Ignore anything that doesn't come from a guild. (Direct messages are not currently supported)
    if (!message.guild) {

        return;
    }

    // Separate out arguments.
    const args = message.content.slice(Configuration.prefix.length).trim().split(/ +/g);

    // Remove the first argument and use it as the command name.
    const command = args.shift();

    // Check if the command message should be deleted.
    if (Configuration.deleteCommandMessages) {

        message.delete();
    }

    // Process the command.
    processCommand(command, message, args);
});

// Fired every time input is received using CLI.
stdin.addListener("data", async function(data) {

    // Check the input isn't blank.
    if (data.toString().trim() !== "") {

        // Log input.
        client.logger.log("cli", data.toString().trim());

        // Separate out arguments.
        const args = data.toString().trim().split(/ +/g);

        // Remove the first argument and use it as the command name.
        const command = args.shift();

        // Process the command.
        processCommand(command, {channel: "CLI"}, args);
    }
});

// Fired when the CLI signal gets interrupted.
process.on("SIGINT", function() {

    shutdown();
});
