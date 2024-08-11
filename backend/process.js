const net = require('net');
const fs = require('fs');
const { promisify } = require('util');
const render = require('./render.js');
const { exec } = require('child_process');

const KVTRoot = process.argv[2];
const filepath = process.argv[5];

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

    socket.on('data', (data) => {
      let processed_line = data.toString();
      processed_line = render.addText(processed_line);
      processed_line = render.expandAliases(processed_line, newCommands, oldCommands);
      processed_line = render.stripMathMode(processed_line);
      render.createHTML(processed_line, WEBKIT_PORT);
    });

    socket.on('end', async () => { 
      try {
        console.log('Neovim disconnected.'); 


        let { stdout: echoOutput } = await execAsync(`echo "comm -12 <(xdotool search --name  '${filepath.slice(0,-3)}pdf'  | sort) <(xdotool search --classname 'zathura'  | sort)"`); 
		await notify(`echo ${echoOut}`);

        // *** Retrieve stdout and store for later use ***
        let { stdout: commOutput } = await execAsync(`bash -c "comm -12 <(xdotool search --name  '${filepath.slice(0,-3)}pdf'  | sort) <(xdotool search --classname 'zathura'  | sort)"`); 

        // ... (your other notify calls) ...
        await notify(commOutput + " is it."); // Use stored commOutput 

        // ... (continue with your window closing logic) ...

		// const classOutput = await execAsync('xdotool search --classname \'zathura\'');
        // const viewerClassPIDs = classOutput.stdout.split("\n").filter(pid => pid.trim() !== '');
// 
//         const nameOutput = await execAsync(`xdotool search --name '${filepath.slice(0,-3)}.pdf'`);
//         const viewerNamePIDs = nameOutput.stdout.split("\n").filter(pid => pid.trim() !== '');
// 
//         for (const classPID of viewerClassPIDs) {
//           for (const namePID of viewerNamePIDs) {
//             if (namePID.trim() === classPID.trim()) {
//               try {
//                 await execAsync(`xdotool windowkill ${namePID.trim()}`); 
//               } catch (error) {
//                 await notify(`Error executing the kill: ${error.message}`);
//                 render.createHTML(error.message, WEBKIT_PORT);
//               }
//             }
//           }
//         } 
// 
      } catch (error) {
        await notify(`Error in socket.on('end'): ${error.message}`); 
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
