var fs = require('fs');
var jsdom = require('jsdom');

res.writeHead(200, {'Content-Type': 'text/html'});

var files = fs.readdirSync('./public/error/');

var doc = jsdom.jsdom('');

var head = doc.createElement("head");
doc.documentElement.appendChild(head);
var title = doc.createElement("title");
title.appendChild(doc.createTextNode("Index"));

var body = doc.createElement("body");
doc.documentElement.appendChild(body);
var list = doc.createElement("ul");
body.appendChild(list);

var upI = doc.createElement('li');
list.appendChild(upI);
var up = doc.createElement('a');
up.setAttribute('href', '/');
up.appendChild(doc.createTextNode('..'));
upI.appendChild(up);

for(var i = 0; i < files.length; i++){
	var item = doc.createElement("li");
	list.appendChild(item);
	var link = doc.createElement("a");
	link.appendChild(doc.createTextNode(files[i]));
	link.setAttribute("href", '/error/' + files[i]);
	item.appendChild(link);
}
res.end(doc.documentElement.innerHTML);
