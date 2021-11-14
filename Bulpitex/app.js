const socket = require('socket.io');
const express = require('express');
const https = require('https');
const http = require('http');
const logger = require('winston');
const fs = require('fs');

//logger.remove(logger.transports.Console);
//logger.add(logger.transports.Console,{colorize:true, timestamp:true});
//logger.info('Socket IO > listem on port ');



var app = express();
var httpServer = http.createServer(app).listen(9967);


var httpsServer = https.createServer({
    key: fs.readFileSync('cert/key.pem'),
    cert: fs.readFileSync('cert/cert.pem')
},app).listen(9966);

function emitNewOrder(httpSvr){
    var io = socket.listen(httpSvr);
    io.socket.on('connection',function(socket){
        socket.on('sendData',function(data){
            io.emit('sendDataToDiv',data);
        });
    });
}

emitNewOrder(httpsServer);