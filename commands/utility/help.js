"use strict";

//-----------------------------------------------------------------------------
// Requires
//-----------------------------------------------------------------------------

const Command = require("../../modules/command");

//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

class Help extends Command {

    constructor() {

        super();

        this.setHelp({

            "name": "Help",
            "arguments": "(optional string) Command name",
            "description": "Prints either the command list or help on a specific command.",
            "category": "Utility"
        });
    }

    async run(message, args, client) {

        // Check if a command was supplied.
        if (args.length > 0) {

            // Cache the name of the command.
            let commandName = args.join(" ");

            // Check the command exists.
            if (client.commands[commandName] == undefined) {

                return new Command.Response(Command.ResponseType.ERROR, `Command: "${commandName}" not found!`, message.channel);
            }

            // Check if help was called by a user.
            if (message.channel != "CLI") {

                // Check if the command is hidden.
                if (client.commands[commandName].help.category == "Hidden") {

                    // Claim the command cannot be found.
                    return new Command.Response(Command.ResponseType.ERROR, `Command: "${commandName}" not found!`, message.channel);
                }

                // Check if the command is CLI only.
                if (client.commands[commandName].cli) {

                    return new Command.Response(Command.ResponseType.ERROR, `Command: "${commandName}" is CLI only, run this command from CLI to get information.`, message.channel);
                }
            }

            // Get the help information for that command.
            let helpListString = `**(${commandName}) ${client.commands[commandName].help.name}**\n\nArguments: ${client.commands[commandName].help.arguments}\nDescription: ${client.commands[commandName].help.description}`;

            // Check if any extra information has been supplied.
            if (client.commands[commandName].help.info !== undefined) {

                helpListString += `\n\n ${client.commands[commandName].help.info}`;
            }

            return new Command.Response(Command.ResponseType.MESSAGE, helpListString, message.channel);
        } else {

            // Start with an empty list.
            let helpList = {};

            // Iterate through every command.
            for (let commandName in client.commands) {

                // Check if help was called by a user.
                if (message.channel != "CLI") {

                    // Check if the command is hidden or CLI only.
                    if (client.commands[commandName].help.category == "Hidden" || client.commands[commandName].cli) {

                        // Skip the command.
                        continue;
                    }
                }

                // Check if the command has a category.
                if (client.commands[commandName].help.category !== undefined) {

                    // Check if the category is empty in the help list.
                    if (helpList[client.commands[commandName].help.category] !== undefined) {

                        // Add to existing array.
                        helpList[client.commands[commandName].help.category].push(`(${commandName}) ${client.commands[commandName].help.name} - ${client.commands[commandName].help.description}`);
                    } else {

                        // Create array.
                        helpList[client.commands[commandName].help.category] = [`(${commandName}) ${client.commands[commandName].help.name} - ${client.commands[commandName].help.description}`];
                    }
                } else {

                    // Check if the category is empty in the help list.
                    if (helpList["Uncategorized"] !== undefined) {

                        // Add to existing array.
                        helpList["Uncategorized"].push(`(${commandName}) ${client.commands[commandName].help.name} - ${client.commands[commandName].help.description}`);
                    } else {

                        // Create array.
                        helpList["Uncategorized"] = [`(${commandName}) ${client.commands[commandName].help.name} - ${client.commands[commandName].help.description}`];
                    }
                }
            }

            let helpListString = "";

            // Assemble string out of all the categorized commands.
            for (let category in helpList) {

                helpListString += `**${category}**:\n`;

                for (let i = 0; i < helpList[category].length; i++) {

                    helpListString += `${helpList[category][i]}\n`;
                }

                helpListString += "\n";
            }

            return new Command.Response(Command.ResponseType.MESSAGE, `Use !help (command) for information on that command\n\n Available commands:\n\n${helpListString}`, message.channel);
        }
    }
}

module.exports = Help;
