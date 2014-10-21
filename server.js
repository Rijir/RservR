/*
RservR v0.0.1
Author: Rijir
Last updated: 8/15/14
This file is the backbone of the server and handles all incoming requests, pointing them to the correct
file and handling any errors. It also provides utility functions for pages to use.
*/

var http = require('http');
var vm = require('vm');
var fs = require('fs');
var url = require('url');
var jsdom = require('jsdom');

//an object which is passed to all .rhp files
var rcoder = {
	/*
	tells the client to store the cookie name=val;attribute1;attribute2...
	parameters:
		res: the response object to write the header information to
		name: the name of the cookie
		val: the value to be assigned
		attributes: an optional parameter for setting attributes of the cookie. The first semicolon
		should be omitted but semicolons should be included between separate attributes
	*/
	setCookie: function(res, name, val, attributes){
		res.setHeader('Set-Cookie', name + '=' + val + ';' + attributes);
	},
	
	/*
	Returns the value of the cookie with the given name.
	parameters
		req: the reqest to read the cookie from.
	*/
	getCookie: function(req, name){
		console.log(req.headers);
		var crumbs = req.headers['cookie'].split(';');
		for(var i = 0; i < crumbs.length; i++){
			var parts = crumbs[i].split('=');
			if(parts[0] == name){
				return parts[1];
			}
		}
		return null;
	}
	/*TODO:
		--  a startsession function and other functions for SESSION table functionality.
		--  change .js files to .rhp so that the server can also serve up .js files for the client
			to use. for now treat .rhp files just like a serverside version of .js files and use
			the runFile function. Later implement a preprocessing interpreter like php.
	*/
}

//contains client information to be preserved between pages which is accessable with a unique userID
var SESSION = {};

//For now just reads a javascript file and runs it.
function runFile(req, res, path, problem){
	var initSandbox = {
		req : req,
		res : res,
		require : require,
		problem : problem,
		rcoder : rcoder,
		SESSION : SESSION
	}
	var context = vm.createContext(initSandbox);
	fs.readFile('./public' + path, function(err, data){
		if(err){
			console.log('Error reading ' + path);
			console.log(err);
		}
		try{
			vm.runInContext(data, context);
			console.log('Success');
		}catch(err){
			console.log('Error running ' + path);
			console.log(err);
		}
	});
}

//sends the given file to the client.
function returnFile(req, res, path, mime){
	res.writeHead(200, {'Content-Type': mime});
	var data = fs.readFileSync('./public' + path);
	res.end(data);
	console.log('Success');
}

//starts the server and listens to port 80 on the main adapter.
http.createServer(function (req, res){
	var urlo = url.parse(req.url);
	console.log('Serving ' + urlo.pathname + ' to ' + req.connection.remoteAddress);
	if(/\.\./.test(urlo.pathname)){//they are trying to use .. to go outside the public folder
		runFile(req, res, '/error/forbid.js', true);//gives a 403 response and scolds them for being naughty
	}
	fs.exists('./public' + urlo.pathname, function(exists){//checks that the file is on the server
		if(exists){
			var isDirectory = fs.statSync('./public' + urlo.pathname).isDirectory();
			//console.log('idDirectory: ' + isDirectory);
			if(isDirectory){//If the url given is a directory, use index.js as default.
				runFile(req, res, urlo.pathname + '/index.js');
			}else if(/.*\.js/.test(urlo.pathname)){//if it is a javascript file, run it
				runFile(req, res, urlo.pathname);
			}else if(/.*\.css/.test(urlo.pathname)){//if it is a css file, send it
				returnFile(req, res, urlo.pathname, 'text/css');
			}else if(/.*\.html/.test(urlo.pathname)){//if it is an html file, send it
				returnFile(req, res, urlo.pathname, 'text/html');
			}else if(/.*\.gif/.test(urlo.pathname)){//if it is a gif file, send it
				returnFile(req, res, urlo.pathname, 'image/gif');
			}else if(/.*\.(jpeg|jpg)/.test(urlo.pathname)){//if it is a .jpg file, send it
				returnFile(req, res, urlo.pathname, 'image/jpeg');
			}else if(/.*\.png/.test(urlo.pathname)){//if it is a png file, send it
				returnFile(req, res, urlo.pathname, 'image/png');
			}else if(/.*\.ico/.test(urlo.pathname)){//if it is a .ico file, send it
				returnFile(req, res, urlo.pathname, 'image/x-icon');
			}else{//if it is something else, treat it as plaintext and send it
				returnFile(req, res, urlo.pathname, 'text/plain');
			}
		}else{
			runFile(req, res, '/error/not-found.js', true);//file is not on server. Gives 404 page.
		}
	});
}).listen(80, '192.168.1.169', function(err){
	if(err) return cb(err);
	
	//sets uid to the id of the user who used sudo
	var uid = parseInt(process.env.SUDO_UID);
	//revert permissions back to the normal user's
	if(uid) process.setuid(uid);
	console.log('Server\'s UID is now ' + process.getuid());
});
console.log('Server running on port 80');
