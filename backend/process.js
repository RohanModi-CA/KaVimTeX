// process.js

const net = require('net');
const fs = require('fs');
const render = require('./render.js');
const newcommands_file = "resources/aliases.txt";
const delimiter = "KVTNEWCOMMAND";
const newCommands = []; // you can still push to a const array.
const oldCommands = [];

// Read the file asynchronously
fs.readFile(filename, 'utf8', (err, data) => {
	if (err) {
		console.error("Failed to read the file:", err);
    	return;
  	}
	
  	// Split the file content into lines
  	const lines = data.split('\n');
	
  	// Process each line
  	lines.forEach(line => {
    	// Split the line based on the delimiter
    	const [oldAlias, newAlias] = line.split(delimiter);
		
    	// Check if both parts exist after splitting
    	if (oldAlias.trim() && newAlias.trim()) {
      		// Remove leading/trailing whitespace and push to arrays
      		newCommands.push(newAlias.trim());
      		oldCommands.push(oldAlias.trim());
    	} else {
      	// Log a warning if the line doesn't match the expected format
      	console.warn(`Skipping line with unexpected format: ${line}`);
    	}
  	});
	
});



const server = net.createServer((socket) => {
	//  console.log('Neovim connected.');

  socket.on('data', (data) => {

	const line = data.toString();
	const aw1 = ['\\w', '\\B'];
	const aw2 = ['\\sad2','\\sadas']
	processed_line = line
	processed_line = render.addText(processed_line);
	processed_line = render.expandAliases(processed_line,newCommands, oldCommands);
	processed_line = render.stripMathMode(processed_line);
	 
	render.createHTML(processed_line);
  });



  socket.on('end', () => {
    // console.log('Neovim disconnected.');
  });
});



server.listen(63002, () => { 
  // console.log('Server listening on port 63002'); 
});
