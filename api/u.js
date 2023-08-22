const http = require('http');
const server = http.createServer((req,res)=>{
    res.writeHead(200 ,{"Content-Type":"text/html"});
    res.write("<h2>Hello </h2>");
}).listen(()=>{
    console.log("Server Started");
    console.log(server.address().port);
});