const net = require('net');
const fs = require('fs');
const { promisify } = require('util');
const render = require('./render.js');
const { exec } = require('child_process');

const KVTRoot = process.argv[2];
const filepath = process.argv[5];
var KVTpdf_dir = process.argv[6];

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
			
			line_number = 5; 
			
			g_l_b_array = render.grabLineNumber(processed_line);
			
			
			line_number = g_l_b_array[0];
			processed_line = g_l_b_array[1];

			processed_line = render.expandAliases(processed_line, newCommands, oldCommands);
			addTextArray = render.addText(line_number, processed_line, WEBKIT_PORT);
			processed_line = addTextArray[0];
			
			if (!(addTextArray[1])) {
				processed_line = render.stripMathMode(processed_line);
				render.createDisplayHTML(line_number, processed_line, WEBKIT_PORT);
			}
		});

		socket.on('end', async () => { 
			try {
				console.log('Neovim disconnected.'); 

				let { stdout: KVTCommOut } = await execAsync(`bash -c "comm -12 <(xdotool search --name  '${WEBKIT_PORT}'  | sort) <(xdotool search --classname 'webkit_viewer.py'  | sort)"`); 
				let KVTCommOutArray = KVTCommOut.split("\n");
				for (pid of KVTCommOutArray) {
					if (pid && pid.trim()) {
						await execAsync(`bash -c "xdotool windowkill ${pid}"`);
					}
				}

				let pdf_path = filepath;
				if (KVTpdf_dir) {
					// Find the last slash in the filepath
					let lastSlash = filepath.lastIndexOf("/");
					// Ensure KVTpdf_dir ends with a slash
					if (!(KVTpdf_dir.endsWith("/"))) {
						KVTpdf_dir = KVTpdf_dir + "/";
					}
					// Construct the new pdf_path based on whether KVTpdf_dir is absolute or relative
					if (KVTpdf_dir.slice(0, 1) == "/") {
						// Absolute path
						pdf_path = KVTpdf_dir + filepath.slice(lastSlash + 1);
					} else {
						// Relative path
						pdf_path = filepath.slice(0, lastSlash + 1) + KVTpdf_dir + filepath.slice(lastSlash + 1);
					}
				}
				// Change file extension to .pdf
				pdf_path = pdf_path.slice(0, -3) + "pdf";

				let { stdout: i3_zathuraCommOut } = await execAsync(`bash -c "comm -12 <(xdotool search --name  'org.pwmt.zathura'  | sort) <(xdotool search --name 'org.pwmt.zathura'  | sort)"`); 
				let i3_ZathuraCommOutArray = i3_ZathuraCommOut.split("\n");
				for (pid of i3_ZathuraCommOutArray) {
					if (pid && pid.trim()) {
						try {
							await execAsync(`bash -c "xdotool windowkill ${pid}"`);}
						catch (error) {}
					}
				}
				



				let { stdout: ZathuraCommOut } = await execAsync(`bash -c "comm -12 <(xdotool search --name  '${pdf_path}'  | sort) <(xdotool search --classname 'zathura'  | sort)"`); 
				let ZathuraCommOutArray = ZathuraCommOut.split("\n");
				for (pid of ZathuraCommOutArray) {
					if (pid && pid.trim()) {
						await execAsync(`bash -c "xdotool windowkill ${pid}"`);
					}
				}

			} catch (error) {
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
