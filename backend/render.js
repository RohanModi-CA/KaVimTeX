const fs = require('fs')
const katex = require('katex');
const net = require('net');

const serverHost = 'localhost';
const viewerPort = 63001;

// Create TCP Socket Client


function expandAliases(rawTek, newlist, oldlist) {

	expanded = rawTek;
    newlist.forEach((item, index) => {
        expanded = expanded.split(item).join(oldlist[index]);
    });
	return expanded;

}

function addText(rawTek) {

	let fixed = rawTek.trim();
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


function createHTML(fixed_latex) {
	
	let htmlFile = "Error";
	try{
	
		let math = katex.renderToString(fixed_latex);
		
		htmlFile = math;
	}
	catch(error) {
		// console.log(error);
	}

	finally{
		const client = net.createConnection({ host: serverHost, port: viewerPort }, () => {
			// console.log(htmlFile);
			client.write(htmlFile);
			client.end();
		});
	}


}



module.exports = {
    expandAliases: expandAliases,
    addText: addText,
    stripMathMode: stripMathMode,
    createHTML: createHTML
};
