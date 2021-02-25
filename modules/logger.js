"use strict";

//-----------------------------------------------------------------------------
// Requires
//-----------------------------------------------------------------------------

const Util = require("util");
const Fs = require("fs");
const Path = require("path");

//-----------------------------------------------------------------------------
// Properties
//-----------------------------------------------------------------------------

// Contains all the printable colors.
let colors = {

	red: "\x1b[1;31m",
	green: "\x1b[1;32m",
	yellow: "\x1b[1;33m",
	blue: "\x1b[1;34m",
	magenta: "\x1b[1;35m",
	cyan: "\x1b[1;36m",
	white: "\x1b[1;37m",
	reset: "\x1b[0m"
};

// Contains all the default options.
let defaultOptions = {

	enabled: true,
	print: true,
	saveToFile: false,
	directory: "logs",
	levels: {

		"info": "cyan",
		"warn": "yellow",
		"error": "red",
		"default": "white"
	}
}

//-----------------------------------------------------------------------------
// Class
//-----------------------------------------------------------------------------

class Logger {

	constructor(options) {

		// Set options to default.
		let comparedOptions = defaultOptions;

		if (options !== undefined) {

			// Iterate through all the specified options.
			Object.keys(options).forEach(function(key) {

				// Check if any keys are objects.
				if (typeof options[key] === "object" && options[key] !== null) {

					// Iterate through each value within that property.
					Object.getOwnPropertyNames(options[key]).forEach(function(value) {

						comparedOptions[key][value] = options[key][value];
					});
				} else {

					comparedOptions[key] = options[key];
				}
			});
		}

		// Set class options.
		this.options = comparedOptions;
	}

	// Utility function that appends a zero to a number string if it's below ten.
	appendZero(number) {

		return number < 10 ? "0" + number : number;
	}

	// Logging function.
	log(level, ...message) {

		// Check logging is enabled.
		if (this.options.enabled) {

			// Format the message.
			message = Util.format.apply(this, message);

			// Get level color.
			let levelColor = colors[this.options.levels[level]] ? colors[this.options.levels[level]] : colors[this.options.levels.default];

			// Split the message into an array.
			let splitMessage = message.split("");

			// Check a level has been supplied.
			if (arguments.length > 1) {

				// Add level into the message.
				splitMessage.unshift(`${level} - `);
			}

			// Get the current date.
			let date = new Date();

			// Add the time to the message, appending zero when necessary.
			splitMessage.unshift(`${this.appendZero(date.getHours())}:${this.appendZero(date.getMinutes())}:${this.appendZero(date.getSeconds())} - `);

			// Check if logging to file is enabled.
			if (this.options.saveToFile) {

				// Create the filename string.
				let filename = `${this.appendZero(date.getDate())}-${this.appendZero(date.getMonth() + 1)}-${date.getFullYear()}.log`;

				// For caching the current log file contents.
				let currentLogFile = "";

				// Check if the directory exists.
				if (!Fs.existsSync(this.options.directory)) {

					// Create the directory.
					Fs.mkdirSync(this.options.directory);
				}

				// Append the message to the log file.
				// If it doesn't exist, appendFile creates the file.
				Fs.appendFileSync(`${this.options.directory}/${filename}`, `${splitMessage.join("")}\n`);
			}

			// Check if printing is enabled.
			if (this.options.print) {

				// Don't print CLI input.
				if (level !== "cli") {

					// Add level color into the message.
					splitMessage.unshift(levelColor);

					// Add color reset to the end of the array.
					splitMessage.push(colors.reset);

					// Print the message in the console.
					process.stdout.write(`${splitMessage.join("")}\n`);
				}
			}
		}
	}

	// Prints to CLI even if logging is disabled. (Used for important bot information, status, errors, etc.)
	print(level, ...message) {

		// Check logging is enabled.
		if (this.options.enabled) {

			this.log(level, ...message);
		} else {

			// Format the message.
			message = Util.format.apply(this, message);

			// Get level color.
			let levelColor = colors[this.options.levels[level]] ? colors[this.options.levels[level]] : colors[this.options.levels.default];

			// Split the message into an array.
			let splitMessage = message.split("");

			// Check a level has been supplied.
			if (arguments.length > 1) {

				// Add level into the message.
				splitMessage.unshift(`${level} - `);
			}

			// Get the current date.
			let date = new Date();

			// Add the time to the message, appending zero when necessary.
			splitMessage.unshift(`${this.appendZero(date.getHours())}:${this.appendZero(date.getMinutes())}:${this.appendZero(date.getSeconds())} - `);

			// Add level color into the message.
			splitMessage.unshift(levelColor);

			// Add color reset to the end of the array.
			splitMessage.push(colors.reset);

			// Print the message in the console.
			process.stdout.write(`${splitMessage.join("")}\n`);
		}
	}
}

module.exports = Logger;
