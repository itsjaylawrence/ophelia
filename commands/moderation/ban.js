"use strict";

//-----------------------------------------------------------------------------
// Requires
//-----------------------------------------------------------------------------

const Command = require("../../modules/command");

//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

class Ban extends Command {

    constructor() {

        super();

        this.permissions = ["BAN_MEMBERS"];
        this.setHelp({

            "name": "Ban",
            "arguments": "(mention) The user being banned, (optional string) The reason for the ban",
            "description": "Bans a mentioned user from the server.",
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

            // Find guild member from user ID.
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
        if (!guild.me.hasPermission("BAN_MEMBERS")) {

            return new Command.Response(Command.ResponseType.ERROR, `Bot doesn't have permission to ban in this guild.`, message.channel);
        }

        // Check the guild member is bannable.
        if (!member.bannable) {

            return new Command.Response(Command.ResponseType.ERROR, `Member isn't bannable.`, message.channel);
        }

        // Get the reason for the ban.
        let reason = args.join(" ");

        // Attempt to ban the member.
        return member.ban({reason: reason}).then(() => {

            return new Command.Response(Command.ResponseType.REPLY, `Successfully banned ${member.user.tag} ${reason !== "" ? `for reason: **"${reason}"**` : ""}`, message.channel);
        }).catch((error) => {

            return new Command.Response(Command.ResponseType.ERROR, `Failed to ban ${member.user.tag}: ERROR CODE ${error.code}`, message.channel);
        });
    }
}

module.exports = Ban;
