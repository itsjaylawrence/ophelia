"use strict";

//-----------------------------------------------------------------------------
// Requires
//-----------------------------------------------------------------------------

const Command = require("../../modules/command");

//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

class About extends Command {

    constructor() {

        super();

        this.setHelp({

            "name": "About",
            "description": "Prints information about the bot.",
            "category": "Utility"
        });
    }

    async run(message, args, client) {

        return new Command.Response(Command.ResponseType.MESSAGE, {

            embed: {

                "description": process.env.npm_package_description,
                "color": 16711836,
                "footer": {

                    "text": `© Copyright ${new Date().getFullYear()} - ${process.env.npm_package_author_name}`
                },
                "author": {

                    "name": `${process.env.npm_package_name} - (v${process.env.npm_package_version})`,
                    "icon_url": client.user.avatarURL()
                }
            }
        }, message.channel);
    }
}

module.exports = About;
