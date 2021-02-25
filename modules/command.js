"use strict";

//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

class Command {

    //-------------------------------------------------------------
    // Constructor

    constructor() {

        // Whether the command is CLI only.
        this.cli = false;

        // The permissions required to run the command.
        this.permissions = [];

        // The help object, used by the help command to print the relevant command information.
        this.help = {

            "name": "Command",
            "arguments": "none",
            "description": "none",
            "category": "Uncategorized"
        }
    }

    //-------------------------------------------------------------
    // Functions

    // Sets help information for the command.
    setHelp(help) {

        Object.assign(this.help, help);
    }
}

//-------------------------------------------------------------
// Classes

Command.Response = class {

    constructor(type, message = "", channel) {

        this.type = type;
        this.message = message;
        this.channel = channel;
    }

    // Returns the response message as a string.
    toString() {

        // Convert embeds into a usable string.
        if (typeof this.message == "object") {

            let message = "";

            // Add author.
            if (this.message.embed.author.name) {

                message += this.message.embed.author.name + "\n\n";
            }

            // Add description.
            if (this.message.embed.description) {

                message += this.message.embed.description + "\n\n";
            }

            // Add footer.
            if (this.message.embed.footer.text) {

                message += this.message.embed.footer.text + "\n";
            }

            return message;
        } else {

            return this.message;
        }
    }
}

// Response type enumerator.
Command.ResponseType = {

    ERROR: 0,
    MESSAGE: 1,
    REPLY: 2
}

module.exports = Command;
