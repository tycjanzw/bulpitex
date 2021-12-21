const express = require('express');
const {createServer} = require('https');
const {readFileSync} = require('fs');
const {Server} = require('socket.io');

//const {u4: uuidv4} = require("uuid");

const PORT = process.env.PORT || 2255;
var tablicaKodow = [];

const app = express();
const robot = require('robotjs');
const {mouse} = require("@nut-tree/nut-js");

const httpServer = createServer({
    key: readFileSync('cert/key.pem'),
    cert: readFileSync('cert/cert.pem')
}, app);

var screenSize; 

app.use('/static', express.static('./static/'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const io = new Server(httpServer,{ });

io.on('connection', (socket) => {
    let isMouseDown = false;
    
    // USTAWIENIE ROZMIARU EKRANU
    socket.on('sendScreenSize', scrSize=>{
        screenSize = scrSize;
    }); 
    
    // WYSŁANIE POŁOŻENIE MYSZKI 
    socket.on('sendCoords',data=>{
        // WYSŁANIE POŁOŻENIA MYSZKI
        io.emit('setCoordsToDiv',data);
    }); 

     // USTAWIENIE X-Y Z INPUTÓW
    socket.on('sendCoordsFromInputs', data=>{
        //robot.moveMouse(data.x,data.y);
        try {
            mouse.move(straightTo(new Point(data.x,data.y)));
        } catch (error) {
            console.log(error);
        }
    }); 

     // USTAWIENIE POŁOŻENIE Z PRZESUNIĘCIA MYSZKI
    socket.on('sendCoordFromMouseMove', data=>{
        try {
            //robot.moveMouse(Math.round(screenSize.wi/data.w*data.x),Math.round(screenSize.he/data.h*data.y)); 
            mouse.move(straightTo(new Point(Math.floor(screenSize.wi/data.w*data.x),Math.floor(screenSize.he/data.h*data.y))));
        } catch (error) {
            console.log('nie ma stream`a, lub błąd');
            socket.emit('streamError', {m:'nie ma stream`a, lub błąd'});
        }
    }); 

    // KLIKNIĘCIE LEWYM PRZYCISKIEM MYSZKI
    socket.on('sendLeftClick',()=>{
        //robot.mouseClick();
        mouse.leftClick();
    }); 

    // KLIKNIĘCIE PRAWYM PRZYCISKIEM MYSZKI
    socket.on('sendRightClick',()=>{
        //robot.mouseClick('right');
        mouse.rightClick();
    }); 
    
     // KLIKNIĘCIE LEWYM PRZYCISKIEM MYSZKI x2
    socket.on('sendDoubleClick',()=>{
        robot.mouseClick('left',true);
        /*for(let i=0; i<2; i++){
            mouse.leftClick();
        }*/
    });

    // KLIKNIĘCIE KLAWISZEM
    socket.on('sendPressKey', keyData=>{
        setKeyToogle(keyData.k, "down");
    });

    // ZWOLNIENIE KLAWISZA
    socket.on('sendUpKey', keyData=>{
        //upKey(keyData.k);
        setKeyToogle(keyData.k, "up");
    });

    // WYSŁANIE KODU
    socket.on('sendCode',code => {
        console.log(tablicaKodow.length);
        tablicaKodow.push([code.p,1]);
        //console.log(code.p);
        //io.emit('setPeerCode',{pCode:code.p});
        //tablicaKodow.forEach(test);
        for(let i=0; i<tablicaKodow.length; i++){
            console.log(tablicaKodow[i][0]+" "+tablicaKodow[i][1]);
        }
    });
    
    // WYSLANIE KODU DO GOSPODARZA
    socket.on('getCodeToCreatred', kod=>{
        io.emit('sendCodeToCreatred', {c: kod.c});
    });

    // SPRAWEDZANIE KODU
    socket.on('checkCode', code => {
        var countOfCodes = 0;
        var index;
        if(tablicaKodow.length == 0){
            io.emit('codeResult',{r: false});
        }
        else{
            for(let i=0; i < tablicaKodow.length; i++){
                if(code.c == tablicaKodow[i][0]){
                    countOfCodes += 1;
                    index = i;
                    i=tablicaKodow.length;
                }
            }
            if(countOfCodes==1){
                if(tablicaKodow[index][1] < 2){
                    tablicaKodow[index][1]+=1;
                    for(let i=0; i<tablicaKodow.length; i++){
                        console.log(tablicaKodow[i][0]+" "+tablicaKodow[i][1]);
                    }
                    io.emit('codeResult',{r: true});
                }
                else{
                    io.emit('twoConnectedUsers');
                }
            }
            else{
                io.emit('codeResult',{r: false});
            }
        }
    });

    // USUNIECIE KODU
    socket.on('removeCode', code=>{
        for (let i = 0; i < tablicaKodow.length; i++) {
            if(tablicaKodow[i][0] == code.c){
                tablicaKodow.splice(i, 1);
            }
        }

        io.emit('refresh');
    });

    // ZAKOŃCZENIE STREAMOWANIA OBRAZU
    socket.on('sendEndStream',()=>{
        io.emit('endStream',{r:true});
    });

    // USTAWIENIE SCROLL MYSZKI - NIEDZIAŁAJĄCE
    socket.on('sendScrool',scrollData=>{
        //console.log(Math.round(scrollData.s));
        //var y = scrollData.s > 0 ? 10 : -10; 
        var valY = scrollData.s;
        robot.scrollMouse(0, valY);
        //robot.scrollMouse(0, -Math.round(scrollData.s));
    });

    // SCROLL MYSZKI - DZIAŁAJĄCE
    socket.on('scroll', delta => {
        //robot.scrollMouse(delta.x, delta.y);
        mouse.scrollDown(delta.y);
    })

    // PRZYTRZYMANIE MYSZKI
    socket.on('mouseDown', mouseData=>{
        isMouseDown = mouseData.m;
        //robot.mouseToggle("down");
        mouse.pressButton(Button.LEFT);
    });

    // ZWOLNIENIE PRZYTRZYMANIA MYSZKI
    socket.on('mouseUp', mouseData=>{
        isMouseDown = mouseData.m;
        //mouse.releaseButton(Button.LEFT);
    });
    
});

httpServer.listen(PORT);

function setKeyToogle(key, val){
    switch(key){
        case 'Enter':
            robot.keyToggle("enter", val); break;
        case 'Backspace':
            robot.keyToggle("backspace", val); break;
        case 'Delete': 
            robot.keyToggle("delete", val); break;
        case 'Escape':
            robot.keyToggle("escape", val); break;
        case 'Tab':
            robot.keyToggle("tab", val); break;
        case 'ArrowUp':
            robot.keyToggle("up", val); break;
        case 'ArrowDown':
            robot.keyToggle("down", val); break;
        case 'ArrowLeft':
            robot.keyToggle("left", val); break;
        case 'ArrowRight':
            robot.keyToggle("right", val); break;
        case 'Control':
            robot.keyToggle("control", val); break;
        case 'Alt':
            robot.keyToggle("alt", val); break;
        case 'AltGraph':
            robot.keyToggle("alt", val); break;
        case 'Shift':
            robot.keyToggle("shift", val); break;
        case 'F1':
            robot.keyToggle("f1", val); break;
        case 'F2':
            robot.keyToggle("f2", val); break;
        case 'F3':
            robot.keyToggle("f3", val); break;
        case 'F4':
            robot.keyToggle("f4", val); break;
        case 'F5':
            robot.keyToggle("f5", val); break;
        case 'F6':
            robot.keyToggle("f6", val); break;
        case 'F7':
            robot.keyToggle("f7", val); break;
        case 'F8':
            robot.keyToggle("f8", val); break;
        case 'F9':
            robot.keyToggle("f9", val); break;
        case 'F10':
            robot.keyToggle("f10", val); break;
        case 'F11':
            robot.keyToggle("f11", val); break;
        case 'F12':
            robot.keyToggle("f12", val); break;
        case 'PageUp':
            robot.keyToggle("pageup", val); break;
        case 'PageDown':
            robot.keyToggle("pagedown", val); break;
        case 'Home':
            robot.keyToggle("home", val); break;
        case 'End':
            robot.keyToggle("end", val); break;
        case 'Insert':
            robot.keyToggle("insert", val); break;
        case 'PrintScreen':
            robot.keyToggle("printscreen", val); break;
        case 'Meta':
            robot.keyToggle("command", val); break;
        default:{
            try {
                robot.keyToggle(key, val); 
            } catch (error) {
                console.log('Nie obsłużono klawisza: '+key);
                var msg = 'Nie obsłużono klawisza: '+key;
                io.emit('streamError', {m: msg});
                //socket.emit('streamError', {m:'Nie obsłużono klawisza: '+key});
            }
            break;
        }
    }
}