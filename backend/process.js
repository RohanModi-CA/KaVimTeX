const net = require('net');
const fs = require('fs');
const { promisify } = require('util');
const render = require('./render.js');
const { exec } = require('child_process');

const KVTRoot = process.argv[2];
const filepath = process.argv[5];
const KVTpdf_dir = process.argv[6];

const newcommands_file = KVTRoot + "/backend/resources/aliases.txt";
const kill_script_path = KVTRoot + "/backend/kill_processes.sh";
const delimiter = "KVTNEWCOMMAND";
const newCommands = []; 
const oldCommands = [];

const WEBKIT_PORT = (process.argv[3]);
const PROCESS_PORT = (process.argv[4]);

// Promisify exec for easier use with async/await
const execAsync = promisify(exec);

function notify(message) {
	return new Promise((resolve, reject) => {
		exec(`notify-send "${message}"`, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error sending notification: ${error.message}`);
				reject(error);
			} else {
				console.log(`Notification sent: ${message}`);
				resolve();
			}
		});
	});
}

const server = net.createServer(async (socket) => { 
	console.log('Neovim connected.');
	render.greetViewer(WEBKIT_PORT);

	try {
		const data = await fs.promises.readFile(newcommands_file, 'utf8');
		const lines = data.split('\n');
		lines.forEach(line => {
			const [newAlias, oldAlias] = line.split(delimiter);
			if ((oldAlias && newAlias) && (oldAlias.trim() && oldAlias.trim())) {
				newCommands.push(newAlias.trim());
				oldCommands.push(oldAlias.trim());
			} else {
				console.warn(`Skipping line with unexpected format: ${line}`);
			}
		});

		socket.on('data', async (data) => {
			let processed_line = data.toString();
			processed_line = render.expandAliases(processed_line, newCommands, oldCommands);
			addTextArray = render.addText(processed_line, WEBKIT_PORT);
			processed_line = addTextArray[0];
			
			if (!(addTextArray[1])) {
				processed_line = render.stripMathMode(processed_line);
				render.createDisplayHTML(processed_line, WEBKIT_PORT);
			}
		});

		socket.on('end', async () => { 
			try {
				console.log('Neovim disconnected.'); 

				let { stdout: KVTCommOut } = await execAsync(`bash -c "comm -12 <(xdotool search --name  '${WEBKIT_PORT}'  | sort) <(xdotool search --classname 'webkit_viewer.py'  | sort)"`); 
				// await notify(KVTCommOut + " is the one to kill."); // Use stored KVTCommOut 
				let KVTCommOutArray = KVTCommOut.split("\n");
				for (pid of KVTCommOutArray) {
					if (pid && pid.trim()) {
						await execAsync(`bash -c "xdotool windowkill ${pid}"`);
					}
				}

				let pdf_path = filepath;
				await notify(KVTpdf_dir.lastIndexOf("/"));
				if (KVTpdf_dir) {
					// Find the last slash in the filepath
					let lastSlash = filepath.lastIndexOf("/");
					await notify(lastSlash);	
					// Ensure KVTpdf_dir ends with a slash
					if (KVTpdf_dir.slice(-1) !== "/") {
						KVTpdf_dir += "/";
						await notify("11");
					}
					// Construct the new pdf_path based on whether KVTpdf_dir is absolute or relative
					if (KVTpdf_dir.slice(0, 1) == "/") {
						// Absolute path
						await notify("bus");
						pdf_path = KVTpdf_dir + filepath.slice(lastSlash + 1);
					} else {
						// Relative path
						await notify("sip");
						pdf_path = filepath.slice(0, lastSlash + 1) + KVTpdf_dir + filepath.slice(lastSlash + 1);
						await notify("hello");
					}
				}
				// Change file extension to .pdf
				pdf_path = pdf_path.slice(0, -3) + "pdf";
				await notify(pdf_path);

				let { stdout: ZathuraCommOut } = await execAsync(`bash -c "comm -12 <(xdotool search --name  '${pdf_path}'  | sort) <(xdotool search --classname 'zathura'  | sort)"`); 
				// await notify(ZathuraCommOut + " is the one to kill."); // Use stored ZathuraCommOut 
				let ZathuraCommOutArray = ZathuraCommOut.split("\n");
				for (pid of ZathuraCommOutArray) {
					if (pid && pid.trim()) {
						await execAsync(`bash -c "xdotool windowkill ${pid}"`);
					}
				}

			} catch (error) {
				// await notify(`Error in socket.on('end'): ${error.message}`); 
				console.error(`Error in socket.on('end'): ${error.message}`); 
			}
		}); 

	} catch (err) {
		console.error("Error reading aliases file:", err);
	}
});

server.listen(PROCESS_PORT, () => {
	console.log(`Server listening on port ${PROCESS_PORT}`);
});
