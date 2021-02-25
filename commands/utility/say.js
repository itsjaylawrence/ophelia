"use strict";

//-----------------------------------------------------------------------------
// Requires
//-----------------------------------------------------------------------------

const Command = require("../../modules/command");

//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

class Say extends Command {

    constructor() {

        super();

        this.permissions = ["ADMINISTRATOR"];

        this.setHelp({

            "name": "Say",
            "arguments": "(optional string) Channel ID, (string) Message",
            "description": "Makes the bot say the specified message.",
            "category": "Utility"
        });
    }

    async run(message, args, client) {

        // Try and resolve channel ID.
        let fetchedChannel = client.channels.resolve(args[0]);

        // Check if a channel was found with the supplied ID.
        if (fetchedChannel !== null) {

            // Remove the channel ID from the arguments.
            args.shift();

            // Set reponse channel to the fetched channel.
            message.channel = fetchedChannel;
        }

        // Join all the arguments together with whitespace.
        let sayMessage = args.join(" ");

        // Check the message isn't empty.
        if (args == null && sayMessage == "") {

            return new Command.Response(Command.ResponseType.ERROR, "Please enter a message for the bot to say.", message.channel);
        }

        return new Command.Response(Command.ResponseType.MESSAGE, sayMessage, message.channel);
    }
}

module.exports = Say;
