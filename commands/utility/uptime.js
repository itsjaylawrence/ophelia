"use strict";

//-----------------------------------------------------------------------------
// Requires
//-----------------------------------------------------------------------------

const Command = require("../../modules/command");

//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

class Uptime extends Command {

    constructor() {

        super();

        this.setHelp({

            "name": "Uptime",
            "description": "Prints how long the bot has been running.",
            "category": "Utility"
        });
    }

    async run(message, args, client) {

        // Get the amount of seconds the process has been running.
        let uptimeWholeSeconds = Math.floor(process.uptime());

        let seconds = Math.floor(uptimeWholeSeconds % 60);
        let minutes = Math.floor(uptimeWholeSeconds % (60*60) / 60);
        let hours = Math.floor(uptimeWholeSeconds % (60*60*24) / 3600);
        let days =  Math.floor(uptimeWholeSeconds / (60*60*24));

        // Assemble a string out of the different values.
        let time = (days > 0 ? `${days} days, ` : "") + (hours > 0 ? `${hours} hours, ` : "") + (minutes > 0 ? `${minutes} minutes, ` : "") + (seconds > 0 ? `${seconds} seconds` : "");

        return new Command.Response(Command.ResponseType.MESSAGE, `Bot has been up for: ${time}`, message.channel);
    }
}

module.exports = Uptime;
