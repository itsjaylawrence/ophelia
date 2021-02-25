"use strict";

//-----------------------------------------------------------------------------
// Requires
//-----------------------------------------------------------------------------

const Command = require("../../modules/command");

//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

class Ping extends Command {

    constructor() {

        super();

        this.setHelp({

            "name": "Ping",
            "description": "Makes the bot reply 'pong', used for testing purposes.",
            "category": "Utility"
        });
    }

    async run(message, args, client) {

        return new Command.Response(Command.ResponseType.REPLY, "Pong!", message.channel);
    }
}

module.exports = Ping;
