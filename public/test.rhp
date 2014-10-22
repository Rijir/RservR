res.writeHead(200, {'Content-Type': 'text/html'});
res.write('Header:');
res.write(JSON.stringify(req.headers));
res.write('<br/>Contents:<br/><!--This is where contents go if there are any-->');
req.on('data', function(readable){
	res.write(readable.read());
});
res.write('<br/>URL:');
res.write('<br/>'+req.url);
res.write('<br/>IP:');
res.write('<br/>' + req.connection.remoteAddress);
res.end();