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


function addText(line_number, rawTek, WEBKIT_PORT) {
	let isTextAndDone = false;
	let fixed = rawTek.trim();
	
	if( fixed.length > 0 &&  !( fixed.substring(0,16) === "\\begin{equation}"   ||  fixed.substring(0,2) === "\\[" || fixed.substring(0,2) === "$$" )  ) {
		// fixed = "\\text{" + fixed + "}";
		// we already expanded aliases in process.js, so we just directly create the html
		

		const regex = /\$(.*?)\$/g;
		fixed = "<!-- katex-kvt-text --> " + fixed.replace(regex, (match, p1) => {
			// Call the createTextHTML function with the content inside dollar signs
			return renderDollarSign(p1);
		});
		
		fixed = line_number + "KVTCURRENTLINE" + fixed;
		sendHTML(fixed, WEBKIT_PORT);
		// createTextHTML(fixed, WEBKIT_PORT);
		isTextAndDone = true;
	}


	return [fixed, isTextAndDone];
}

function stripMathMode(rawTek) {
    let cleaned = rawTek.trim();
    

    if (cleaned.length >= 2) {
        if ((cleaned.substring(0, 2) === "\\[") || (cleaned.substring(0, 2) === "$$")) {
            cleaned = cleaned.substring(2); 
        }
        if ((cleaned.substring(cleaned.length - 2) === "\\]") || (cleaned.substring(0, 2) === "$$") )   {
            cleaned = cleaned.substring(0, cleaned.length - 2); 
        }
    }

	if (cleaned.length >= "\\begin{equation}".length) {
		if (cleaned.substring(0,16) === "\\begin{equation}"){
			cleaned = cleaned.substring(16);
		}
		if (cleaned.substring(cleaned.length - 14) === "\\end{equation}") {
			cleaned = cleaned.substring(0, cleaned.length - 14);
		}

	}
    
    return cleaned;
}

function grabLineNumber(text) {

	let line_and_text = [];
	try {
		let separator_index = text.search("KVTCURRENTLINE");
		line_and_text.push(text.substring(0, separator_index));
		line_and_text.push(text.substring(separator_index + "KVTCURRENTLINE".length));
		return line_and_text;
	}
	catch (error) {
		line_and_text.push("0");
		line_and_text.push("hello" + error);
		return line_and_text;
	}

}

function createDisplayHTML(line_number, fixed_latex, WEBKIT_PORT) {	
	let htmlFile = "Error";
	try{
		let math = katex.renderToString(fixed_latex, {displayMode: true});
		
		htmlFile = line_number + "KVTCURRENTLINE" + math;

	}
	catch(error) {
		// console.log(error); // this constantly errors because of user typing. 
	}
	finally{
		sendHTML(htmlFile, WEBKIT_PORT);
	};
}


function sendHTML(final_send, WEBKIT_PORT) {
	const client = net.createConnection({ host: serverHost, port: WEBKIT_PORT }, () => {
				// console.log(htmlFile);
				
				client.write(final_send);
				client.end();
			});
}

function renderDollarSign(fixed_latex) {
	let rendered_dollar_sign = "Error";
	try{
		let math = katex.renderToString(fixed_latex, {displayMode: false});
		rendered_dollar_sign = math;
	}
	catch(error) {
		// console.log(error)
	}
	finally {
		return rendered_dollar_sign
	}
}


function greetViewer(WEBKIT_PORT) {
	const client = net.createConnection({ host: serverHost, port: WEBKIT_PORT }, () => {
		client.write("KAVIMTEX CONNECTED");
		client.end();
	});
	return "Greeted"
}


function terminateViewer(WEBKIT_PORT) {
	const client = net.createConnection({ host: serverHost, port: WEBKIT_PORT }, () => {
		client.write("KAVIMTEX TERMINATED");
		client.end();
	});
	return "Terminated"
}


module.exports = {
    expandAliases: expandAliases,
    addText: addText,
    stripMathMode: stripMathMode,
    createDisplayHTML: createDisplayHTML,
	terminateViewer: terminateViewer,
	greetViewer: greetViewer,
	grabLineNumber: grabLineNumber
};
