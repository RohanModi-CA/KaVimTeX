// process.js

const net = require('net');
const render = require('./render.js');


const server = net.createServer((socket) => {
  console.log('Neovim connected.');

  socket.on('data', (data) => {

	const line = data.toString();
	const aw1 = ['\\w', '\\B'];
	const aw2 = ['\\sad2','\\sadas']
	processed_line = line
	processed_line = render.addText(processed_line);
	processed_line = render.expandAliases(processed_line,["\\w","\\B"], ["\\omega","\\beta"]);
	processed_line = render.stripMathMode(processed_line);
	 
	render.createHTML(processed_line);
  });



  socket.on('end', () => {
    console.log('Neovim disconnected.');
  });
});



server.listen(63002, () => { 
  console.log('Server listening on port 63002'); 
});
