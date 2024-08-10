// process.js

const net = require('net');
const fs = require('fs');
const render = require('./render.js');
const { exec } = require('child_process');

const KVTRoot = process.argv[2];
const filepath = process.argv[5];

const newcommands_file = KVTRoot + "/backend/resources/aliases.txt";
const kill_script_path = KVTRoot + "/backend/kill_processes.sh"
const delimiter = "KVTNEWCOMMAND";
const newCommands = []; // you can still push to a const array.
const oldCommands = [];


const WEBKIT_PORT = (process.argv[3]);
const PROCESS_PORT = (process.argv[4]);

function notify(message) {
	exec(`notify-send ${message}`, (error, stdout, stderr) => {
	});
}

const server = net.createServer((socket) => {
	console.log('Neovim connected.');
	render.greetViewer(WEBKIT_PORT)

	// Read the file asynchronously
	fs.readFile(newcommands_file, 'utf8', (err, data) => {
		if (err) {
			console.error("Failed to read the file:", err);
			return;
		}
		
		// Split the file content into lines
		const lines = data.split('\n');
		
		// Process each line
		lines.forEach(line => {
			// Split the line based on the delimiter
			const [newAlias, oldAlias] = line.split(delimiter);
			
			// Check if both parts exist after splitting
			if ((oldAlias && newAlias) && (oldAlias.trim() && oldAlias.trim())) {
				// Remove leading/trailing whitespace and push to arrays
				console.log(newAlias.trim());
				console.log(oldAlias.trim());
				newCommands.push(newAlias.trim());
				oldCommands.push(oldAlias.trim());
			} else {
			// Log a warning if the line doesn't match the expected format
			console.warn(`Skipping line with unexpected format: ${line}`);
			}
		});
		
	});



	socket.on('data', (data) => {

		const line = data.toString();
		const aw1 = ['\\w', '\\B'];
		const aw2 = ['\\sad2','\\sadas']
		processed_line = line
		processed_line = render.addText(processed_line);
		processed_line = render.expandAliases(processed_line,newCommands, oldCommands);
		processed_line = render.stripMathMode(processed_line);
		 
		render.createHTML(processed_line, WEBKIT_PORT);
	});



	socket.on('end', async () => {
		//notify("0")
    	console.log('Neovim disconnected.');
		await render.terminateViewer(WEBKIT_PORT);

		let viewer_class_pids = [];
		let viewer_name_pids = [];

		exec('xdotool search --classname \'zathura\'', (error, stdout, stderr) => {
			if (error) {
				notify(`Error executing command: ${error.message}`);
				return;
			}
			viewer_class_pids = stdout.split("\n").filter(pid => pid.trim() !== '');

			exec(`xdotool search --name '${filepath.slice(0,-3)}.pdf'`, (error, stdout, stderr) => {
				if (error) {
					notify(`Error executing command: ${error.message}`);
					return;
				}
				viewer_name_pids = stdout.split("\n").filter(pid => pid.trim() !== '');

				viewer_class_pids.forEach((class_pid) => {
					notify("1");
					viewer_name_pids.forEach((name_pid) => {
						notify("1.5")
						if (name_pid.trim() === class_pid.trim()) {
							notify("2");
							exec(`xdotool windowkill ${name_pid.trim()}`, (error, stdout, stderr) => {								
								notify("3")
								if (error) {
									notify(`Error executing the kill,  '${error.message}'`)
									render.createHTML(error.message, WEBKIT_PORT);
								}
							});
						}
					});
				});

			});
		});
	});
});



server.listen(PROCESS_PORT, () => { 
	console.log(`Server listening on port ${PROCESS_PORT}`); 
});
