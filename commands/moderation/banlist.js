"use strict";

//-----------------------------------------------------------------------------
// Requires
//-----------------------------------------------------------------------------

const Command = require("../../modules/command");

//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

class Banlist extends Command {

    constructor() {

        super();

        this.permissions = ["BAN_MEMBERS"];
        this.setHelp({

            "name": "Banlist",
            "description": "Prints a list of the banned users in this server.",
            "category": "Moderation"
        });
    }

    async run(message, args, client) {

        // Cache the guild ID.
        let guild = null;

        // Check if the command is being called through the CLI.
        if (message.channel == "CLI") {

            // Check arguments have been supplied.
            if (args.length > 0) {

                // Find guild from ID.
                guild = client.guilds.resolve(args[0]);

                if (guild == null) {

                    return new Command.Response(Command.ResponseType.ERROR, "Unable to find guild.", message.channel);
                }
            } else {

                return new Command.Response(Command.ResponseType.ERROR, "Please specify a guild ID.", message.channel);
            }
        } else {

            // Use the guild that the command message was sent from.
            guild = message.guild;
        }

        // Check if the bot has ban permissions.
        if (guild.me.hasPermission("BAN_MEMBERS")) {

            // Start with an empty list.
            let banList = "";

            // Get the guild bans.
            return guild.fetchBans().then(bans => {

                // Iterate through them.
                bans.forEach(ban => {

                    // Add the ban to the list.
                    banList += `**${ban.user.username}#${ban.user.discriminator}**\nID: ${ban.user.id}${ban.reason !== null ? `\nReason: **"${ban.reason}"**` : ""}\n`;
                });

                // Check the list isn't empty.
                if (banList !== "") {

                    return new Command.Response(Command.ResponseType.REPLY, `Here are all the users banned in this guild:\n\n${banList}`, message.channel);
                } else {

                    return new Command.Response(Command.ResponseType.ERROR, "No users have been banned in this guild.", message.channel);
                }
            }).catch((error) => {console.error(error)})
        } else {

            return new Command.Response(Command.ResponseType.ERROR, `Bot doesn't have permission to run this command.`, message.channel);
        }
    }
}

module.exports = Banlist;
