"use strict";

//-----------------------------------------------------------------------------
// Requires
//-----------------------------------------------------------------------------

const Command = require("../../modules/command");

//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

class Unban extends Command {

    constructor() {

        super();

        this.permissions = ["BAN_MEMBERS"];
        this.setHelp({

            "name": "Unban",
            "arguments": "(string) The ID of the user being unbanned",
            "description": "Unbans a user from the server.",
            "category": "Moderation"
        });
    }

    async run(message, args, client) {

        // Cache the guild ID.
        let guild = null;

        // Check if the command is being called through the CLI.
        if (message.channel == "CLI") {

            // Check arguments have been supplied.
            if (args.length <= 0) {

                return new Command.Response(Command.ResponseType.ERROR, "Please specify a guild ID and user ID.", message.channel);
            }

            // Find guild from ID.
            guild = client.guilds.resolve(args[0]);

            if (guild == null) {

                return new Command.Response(Command.ResponseType.ERROR, "Failed to find guild.", message.channel);
            }

            // Remove the guild ID from the arguments.
            args.shift();
        } else {

            // Use the guild that the command message was sent from.
            guild = message.guild;
        }

        // Attempt to fetch the ban.
        return guild.fetchBan(args[0]).then((ban) => {

            // Attempt to unban the user.
            return guild.members.unban(ban.user.id).then(() => {

                return new Command.Response(Command.ResponseType.REPLY, `Successfully unbanned ${ban.user.tag}`, message.channel);
            }).catch((error) => {

                return new Command.Response(Command.ResponseType.ERROR, `Failed to unban ${ban.user.tag}: ERROR CODE ${error.code}`, message.channel);
            });
        }).catch((error) => {

            return new Command.Response(Command.ResponseType.ERROR, "Failed to find banned user in guild.", message.channel);
        })
    }
}

module.exports = Unban;
