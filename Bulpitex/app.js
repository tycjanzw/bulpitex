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
        mouse.move(straightTo(new Point(Math.floor(screenSize.wi/data.w*data.x),Math.floor(screenSize.he/data.h*data.y))));
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
        //robot.mouseClick('left',true);
        for(let i=0; i<2; i++){
            mouse.leftClick();
        }
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
                tablicaKodow[index][1]+=1;
                // for(let i=0; i<tablicaKodow.length; i++){
                //     console.log(tablicaKodow[i][0]+" "+tablicaKodow[i][1]);
                // }
                io.emit('codeResult',{r: true});
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
    if(key === 'Enter'){ 
        try {
            robot.keyToggle("enter", val);
        } catch (error) {
            console.log(error);
        }
    }
    else if(key === 'Backspace'){
        robot.keyToggle("backspace", val);
    }
    else if(key === 'Delete'){
        robot.keyToggle("delete", val);
    }
    else if(key === 'Escape'){
        robot.keyToggle("escape", val);
    }
    else if(key === 'Tab'){
        robot.keyToggle("tab", val);
    }
    else if(key === 'ArrowUp'){
        robot.keyToggle("up", val);
    }
    else if(key === 'ArrowDown'){
        robot.keyToggle("down", val);
    }
    else if(key === 'ArrowLeft'){
        robot.keyToggle("left", val);
    }
    else if(key === 'ArrowRight'){
        robot.keyToggle("right", val);
    }
    else if(key === 'Control'){
        robot.keyToggle("control", val);
    }
    else if(key === 'Alt'){
        robot.keyToggle("alt", val);
    }
    else if(key === 'AltGraph'){
        robot.keyToggle("alt", val);
    }
    else if(key === 'Shift'){
        robot.keyToggle("shift", val);
    }
    else if(key === 'F1'){
        robot.keyToggle("f1", val);
    }
    else if(key === 'F2'){
        robot.keyToggle("f2", val);
    }
    else if(key === 'F3'){
        robot.keyToggle("f3", val);
    }
    else if(key === 'F4'){
        robot.keyToggle("f4", val);
    }
    else if(key === 'F5'){
        robot.keyToggle("f5", val);
    }
    else if(key === 'F6'){
        robot.keyToggle("f6", val);
    }
    else if(key === 'F7'){
        robot.keyToggle("f7", val);
    }
    else if(key === 'F8'){
        robot.keyToggle("f8", val);
    }
    else if(key === 'F9'){
        robot.keyToggle("f9", val);
    }
    else if(key === 'F10'){
        robot.keyToggle("f10", val);
    }
    else if(key === 'F11'){
        robot.keyToggle("f11", val);
    }
    else if(key === 'F12'){
        robot.keyToggle("f12", val);
    }
    else if(key == 'PageUp'){
        robot.keyToggle("pageup", val);
    }
    else if(key == 'PageDown'){
        robot.keyToggle("pagedown", val);
    }
    else if(key == 'Home'){
        robot.keyToggle("home", val);
    }
    else if(key == 'End'){
        robot.keyToggle("end", val);
    }
    else{ 
        try {
            robot.keyToggle(key, val); 
        } catch (error) {
            console.log('Nie obsłużono klawisza: '+key);
        }
    }
}