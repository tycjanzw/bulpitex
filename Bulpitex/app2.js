const express = require('express');
const {createServer} = require('https');
const {readFileSync} = require('fs');
const {Server} = require('socket.io');

//const {u4: uuidv4} = require("uuid");


const app = express();
const robot = require('robotjs');

const httpServer = createServer({
    key: readFileSync('cert/key.pem'),
    cert: readFileSync('cert/cert.pem')
}, app);


/*const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(httpServer, {
    debug: false,
});
app.use("/peerjs", peerServer);*/



app.use('/static', express.static('./static/'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index2.html');
});

const io = new Server(httpServer,{ });

io.on('connection', (socket) => {
    socket.on('sendCoords',data=>{
        io.emit('setCoordsToDiv',data);
    });

    socket.on('sendCoordsFromInputs', data2=>{
        robot.moveMouse(data2.x,data2.y);
    });

    socket.on('sendCoordFromMouseMove', data3=>{
        if(data3.r == 'client'){
          robot.moveMouse(data3.x,data3.y);
        }
    });

    socket.on('sendClick',dataTest=>{
        robot.mouseClick();
    });
    
    socket.on('sendDoubleClick',dataTest=>{
        robot.mouseClick('left',true);
    });

    socket.on('sendKey', keyData => {
        clickKey(keyData.k);
    });

    socket.on('getCode', () => {
        socket.emit('sendCode', {sessionId: socket.id});
    });

    ///////////////
    /*socket.on('offer', (data) => {
        socket.broadcast.emit('offer', data);
    });

    socket.on('initiate', () => {  
        io.emit('initiate');  
    });*/

});

httpServer.listen(2255);

function clickKey(key){
    if(key === 'Enter'){ 
        try {
            robot.keyTap("enter");
        } catch (error) {
            console.log(error);
        }
    }
    else if(key === 'Backspace'){
        robot.keyTap("backspace");
    }
    else if(key === 'Delete'){
        robot.keyTap("delete");
    }
    else if(key === 'Escape'){
        robot.keyTap("escape");
    }
    else if(key === 'ArrowUp'){
        robot.keyTap("up");
    }
    else if(key === 'ArrowDown'){
        robot.keyTap("down");
    }
    else if(key === 'ArrowLeft'){
        robot.keyTap("left");
    }
    else if(key === 'ArrowRight'){
        robot.keyTap("right");
    }
    else if(key === 'Control'){
        robot.keyTap("control");
    }
    else if(key === 'Alt'){
        robot.keyTap("alt");
    }
    else if(key === 'AltGraph'){
        robot.keyTap("alt");
    }
    else if(key === 'Shift'){
        robot.keyTap("shift");
    }
    else{ 
        robot.keyTap(key); 
    }
}