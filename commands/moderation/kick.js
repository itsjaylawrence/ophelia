"use strict";

//-----------------------------------------------------------------------------
// Requires
//-----------------------------------------------------------------------------

const Command = require("../../modules/command");

//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

class Kick extends Command {

    constructor() {

        super();

        this.permissions = ["KICK_MEMBERS"];
        this.setHelp({

            "name": "Kick",
            "arguments": "(mention) The user being kick, (optional string) The reason for the kick",
            "description": "Kicks a mentioned user from the server.",
            "category": "Moderation"
        });
    }

    async run(message, args, client) {

        // Cache the guild ID.
        let guild = null;

        // Cache the guild member.
        let member = null;

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

            // Find member from user ID.
            member = guild.members.resolve(args[0]);

            if (member == null) {

                return new Command.Response(Command.ResponseType.ERROR, "Failed to find member in guild.", message.channel);
            }

            // Remove the user ID from the arguments.
            args.shift();
        } else {

            // Use the guild that the command message was sent from.
            guild = message.guild;

            // Cache the first user mentioned.
            let user = message.mentions.users.first();

            if (user == undefined) {

                return new Command.Response(Command.ResponseType.ERROR, `No user was mentioned.`, message.channel);
            }

            // Get the guild member from the user.
            member = guild.member(user);

            if (member == undefined) {

                return new Command.Response(Command.ResponseType.ERROR, `Failed to find user in this guild.`, message.channel);
            }

            // Remove the mention from the arguments.
            args.shift();
        }

        // Check if the bot has ban permissions.
        if (!guild.me.hasPermission("KICK_MEMBERS")) {

            return new Command.Response(Command.ResponseType.ERROR, `Bot doesn't have permission to kick in this guild.`, message.channel);
        }

        // Check the member is kickable.
        if (!member.kickable) {

            return new Command.Response(Command.ResponseType.ERROR, `Member isn't kickable.`, message.channel);
        }

        // Get the reason for the kick.
        let reason = args.join(" ");

        // Attempt to kick the member.
        return member.kick(reason).then(() => {

            return new Command.Response(Command.ResponseType.REPLY, `Successfully kicked ${member.user.tag}`, message.channel);
        }).catch((error) => {

            return new Command.Response(Command.ResponseType.ERROR, `Failed to kick ${member.user.tag}: ERROR CODE ${error.code}`, message.channel);
        });
    }
}

module.exports = Kick;
