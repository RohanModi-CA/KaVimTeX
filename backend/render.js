const fs = require('fs')
const katex = require('katex');
const net = require('net');

const serverHost = 'localhost';


function expandAliases(rawTek, newlist, oldlist) {
  let expanded = rawTek;
  newlist.forEach((item, index) => {
    // Escape backslashes in the alias for the regex
    const escapedItem = item.replace(/\\/g, '\\\\');
    const regex = new RegExp(escapedItem.trim() + "(?![a-zA-Z])", 'g');
    expanded = expanded.replace(regex, oldlist[index].trim());
  });
  return expanded;
}


function addText(rawTek) {

	leti fixed = rawTek.trim();
	if( fixed.length > 0 &&  !(fixed.substring(0,2) === "\\[" )  ) {
		fixed = "\\text{" + fixed + "}";
	}
	return fixed;

}

function stripMathMode(rawTek) {
    let cleaned = rawTek.trim();
    
    if (cleaned.length >= 2) {
        if (cleaned.substring(0, 2) === "\\[") {
            cleaned = cleaned.substring(2); 
        }
        if (cleaned.substring(cleaned.length - 2) === "\\]") {
            cleaned = cleaned.substring(0, cleaned.length - 2); 
        }
    }
    
    return cleaned;
}


function createHTML(fixed_latex, WEBKIT_PORT) {
	
	let htmlFile = "Error";
	try{
	
		let math = katex.renderToString(fixed_latex, {displayMode: true});
		
		htmlFile = math;
	}
	catch(error) {
		// console.log(error);
	}

	finally{
		const client = net.createConnection({ host: serverHost, port: WEBKIT_PORT }, () => {
			// console.log(htmlFile);
			client.write(htmlFile);
			client.end();
		});
	}

}

function greetViewer(WEBKIT_PORT) {
	const client i= net.createConnection({ host: serverHost, port: WEBKIT_PORT }, () => {
		client.write("KAVIMTEX CONNECTED");
		client.end();
	});
}


function terminateViewer(WEBKIT_PORT) {
	const client = net.createConnection({ host: serverHost, port: WEBKIT_PORT }, () => {
		client.write("KAVIMTEX TERMINATED");
		client.end();
	});
}


module.exports = {
    expandAliases: expandAliases,
    addText: addText,
    stripMathMode: stripMathMode,
    createHTML: createHTML,
	terminateViewer: terminateViewer,
	greetViewer: greetViewer
};
