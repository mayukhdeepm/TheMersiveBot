var http = require('http')

http.createServer(function (req, res) {
    res.write("Hey TheMersive bot is alive");
    res.end();
}).listen(8080)