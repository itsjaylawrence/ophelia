"use strict";

//-----------------------------------------------------------------------------
// Requires
//-----------------------------------------------------------------------------

const Fs = require("fs");
const Path = require("path");

//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

class Filesystem {

    // Recursively gets every filename in a folder tree.
    getFiles(dir, filelist = []) {

        if (Fs.existsSync(dir)) {

            // Get directory reading.
            let files = Fs.readdirSync(dir);

            // Iterate through each file.
            files.forEach((file) => {

                // Check if the file is a folder.
                if (Fs.statSync(Path.join(dir, file)).isDirectory()) {

                    // Run the function again on this folder.
                    filelist = this.getFiles(Path.join(dir, file), filelist);
                }
                else {

                    // Push the file to the list.
                    filelist.push(Path.join(dir, file));
                }
            });

            return filelist;
        } else {

            console.warn("Directory %s doesn't exist", dir);
            return null;
        }
    }
}

module.exports = Filesystem;
