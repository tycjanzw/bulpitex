var socket = io();
        
var role='';
var isOnRemoteDiv = false;
var isfullScreen = false;
var code='';
var isJoiner = false;

var input = document.getElementById('x');
var input2 = document.getElementById('y');
var roleVal = document.getElementById('roleData');
//var screen = document.getElementById('screenShare');
var screen = document.getElementById('remoteScreen');   

// OK
document.getElementById('form').addEventListener('click',function(e){
    if(input.value && input2.value){
        socket.emit('sendCoordsFromInputs', {x:input.value, y:input2.value});
        input.value = '';
        input2.value = '';
    }
});

// OK
document.getElementById('setRole').addEventListener('click',function(e){
    var select = document.getElementById('roleSelected');
    var val = select.options[select.selectedIndex].value;
    role =val;
});

// OK
socket.on('setCoordsToDiv', function(data){
    $('#cords').html(data.x+" "+data.y);
});

jQuery.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
    return this.each(function(){
        var clicks = 0, self = this;
        jQuery(this).click(function(event){
            clicks++;
            if (clicks == 1) {
                setTimeout(function(){
                if(clicks == 1) {
                    single_click_callback.call(self, event);
                } else {
                    double_click_callback.call(self, event);
                }
            clicks = 0;
            }, timeout || 300);
        }
    });
    });
}

document.getElementById('remoteScreen').addEventListener('mouseup', function(event){
    if(!screen.disabled){
        if (event.button == 2){
            socket.emit('sendRightClick');
        }
    }
});

$("#remoteScreen").single_double_click(function(event){
    if(!screen.disabled){
        var posX = $(this).offset().left;
        var posY = $(this).offset().top;
        
        var x = event.pageX - posX;
        var y = event.pageY - posY;
        if (event.button == 0){
            socket.emit('sendLeftClick');
        }
    }
},function(event){
    if(!screen.disabled){
        var posX = $(this).offset().left;
        var posY = $(this).offset().top;
        
        var x = event.pageX - posX;
        var y = event.pageY - posY;
        socket.emit('sendDoubleClick');
    }
});

socket.on('endStream',daneRozloczenia=>{
    if(role == "client"){
        if(daneRozloczenia.r){
            console.log('end');
            var v = document.getElementById('videoTest');
            document.getElementById('remoteScreen').removeChild(v);
        }
    }
});

var peerCode = '';
var peer = new Peer(generateCode());

var myStream;
var currentPeer;
var peerList = [];


/*document.getElementById('getGenerateCode').addEventListener('click', function(){
    //document.getElementById('randomCode').innerHTML = peer.id;
    //alert(generateCode());
    code = generateCode();
});*/

/*socket.on('sendGenerateCode', code=>{
    peerCode = code.c;
});*/

$('#sendPeerCode').click(()=>{
    //var kod = document.getElementById('showPeer').innerHTML;
    var kod = peer.id;
    alert('Twój kod: '+ kod);

    document.getElementById('generatedCode').innerHTML = kod;
    
    document.getElementById('shareScreenBtn').disabled = false;
    document.getElementById('shareScreenBtn').addEventListener('click',()=>{
        //callPeer(kod);
    });

    document.getElementById('reconnectBtn').disabled = false;
    document.getElementById('reconnectBtn').addEventListener('click', () => {
        //window.location.reload(true);
        //peer.close();
        //alert('disconnect');
        //peer.disconnect();

        

        document.getElementById('callPeer').disabled = false;
        document.getElementById('reconnectBtn').disabled = true;
        document.getElementById('shareScreenBtn').disabled = true;
    });


    socket.emit('sendCode',{p:kod});
    document.getElementById('sendPeerCode').disabled = true;
});

peer.on('close', ()=>{
    alert('close');
});

peer.on('disconnected',()=>{
    alert('reconnect');
});

socket.on('setPeerCode', c=>{
    //document.getElementById('generatedCode').innerHTML = c.pCode;
    //peer = new Peer(c.pCode);
    //alert(c.pCode);
    //code = c.pCode;
});

/*socket.on('sendCode', d=>{
    document.getElementById('generatedCode').innerHTML = d.sessionId;
    socket.emit('sendCode',{p:d.sessionId});
});*/



peer.on('open', function(){
    //alert(id);
    //$('#showPeer').html();
    console.log('peer connect');
});

peer.on('call', function(call){
    call.answer(myStream);
    call.on('stream', function(remoteStream){
        addRemoteVideo(remoteStream);
    });
});

function callPeer(id){
    navigator.mediaDevices.getDisplayMedia({
        video:{
            cursor: "always"
        }
    }).then((stream)=>{
        myStream = stream;
        let call = peer.call(id, stream);
        call.on('stream', function(remoteStream){
            if(!peerList.includes(call.peer)){
                //addRemoteVideo(remoteStream);
                currentPeer = call.peerConnection;
                peerList.push(call.peer);
            }
        })
        stream.getVideoTracks()[0].addEventListener('ended', () => {
            reconnectStream();
        });
    }).catch((err)=>{
        console.log(err+" nie ma streamu");
    });
}

/*$('#callPeer').click(()=>{
    // /isJoiner = true;
    //var kod = document.getElementById('peerID').value;
    //alert(kod);
    //socket.emit('checkCode', {c: kod});

    let remotePeerId = document.getElementById('peerID').value;
    $('#showPeer').html('connecting '+remotePeerId);
    
    document.getElementById('shareScreenBtn').disabled = false;
    document.getElementById('shareScreenBtn').addEventListener('click',()=>{
        callPeer(remotePeerId);
    });
    
    var w = document.getElementById('widthScreen').innerHTML;
    var h = document.getElementById('heigthScreen').innerHTML;
    socket.emit('sendScreenSize', {wi:w,he:h});
    document.getElementById('reconnectBtn').disabled = false;

    socket.on('codeResult', result => {
        if(isJoiner){
            var codeResult = result.r;
            if(codeResult){
                //alert('Połączono się');
                
            }
            else{
                //alert('Nie można się połączyć z kodem: '+document.getElementById('generatedCode').innerHTML);
            }
        }
    });

});*/

// dla Rafała BULPITEX-33
$('#callPeer').click(()=>{
    isJoiner = true;
    var kod = document.getElementById('peerID').value;
    code = kod;
    //alert(kod);
    socket.emit('checkCode', {c: kod});
});

socket.on('codeResult', result => {
    if(isJoiner){
        var codeResult = result.r;
        if(codeResult){
            alert('Połączono się');
            let remotePeerId = document.getElementById('peerID').value;
            $('#showPeer').html('connecting '+remotePeerId);
            
            document.getElementById('shareScreenBtn').disabled = false;
            document.getElementById('shareScreenBtn').addEventListener('click',()=>{
                callPeer(remotePeerId);
            });
            
            var w = document.getElementById('widthScreen').innerHTML;
            var h = document.getElementById('heigthScreen').innerHTML;
            socket.emit('sendScreenSize', {wi:w,he:h});
            document.getElementById('reconnectBtn').disabled = false;
            document.getElementById('callPeer').disabled = true;

            document.getElementById('reconnectBtn').disabled = false;
            document.getElementById('reconnectBtn').addEventListener('click', () => {
                //peer.disconnect();
                document.getElementById('callPeer').disabled = false;
                document.getElementById('reconnectBtn').disabled = true;
                document.getElementById('shareScreenBtn').disabled = true;
            });
        }
        else{
            alert('Nie można się połączyć z kodem: '+document.getElementById('generatedCode').innerHTML);
        }
    }
});

socket.on('getGode', () => {
    socket.emit('sendCodeToClose', {c: code});
});

function addRemoteVideo(stream){
    var isMouseDown = false;

    let video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    video.setAttribute('id','videoTest')
    document.getElementById('remoteScreen').append(video);

    document.getElementById('fullScreen').addEventListener('click',()=>{
        pelnyEkran();
    });

    $('#videoTest').mouseenter(() => {isOnRemoteDiv = true});
    $('#videoTest').mouseleave(() => {isOnRemoteDiv = false});

    function pelnyEkran(){
        if(getFullscreenElement()){
            document.exitFullscreen();
            isfullScreen = false;
        }
        else{
            document.getElementById('videoTest').requestFullscreen().catch(console.log);
            isfullScreen = true;
        }
    }

    function getFullscreenElement(){
        if(document.fullscreenElement
            || document.webkitFullscreenElement
            || document.mozFullscreenElement
            || document.msFullscreenElement){
                return true;
            }
        else{
            return false;
        }
    }

    // przytrzymanie myszki
    $('#videoTest').mousedown(() => {
        isMouseDown = true;
        socket.emit('mouseDown', {m: true});
    });
    
    // zwolnienie przycisku myszki
    $('#videoTest').mouseup(() => {
        isMouseDown = false;
        socket.emit('mouseUp', {m: false});
    });

    // scrool nieudany
    video.addEventListener('wheel', function(e){
        if(/*isOnRemoteDiv && */role=='client'){
            //const delta = Math.sign(e.deltaY);
            //socket.emit('sendScrool', {s: delta});
            e.preventDefault();
            socket.emit('scroll', {x: e.deltaX, y: e.deltaY});
        }
    });

    /*video.addEventListener('wheel', function(e){
        const delta = Math.sign(e.deltaY);
        socket.emit('sendScrool', {s: delta});
        e.preventDefault();
        //socket.emit('sendScrool', {s: Math.round(e.deltaY)});
        //setTimeout(function(){
        //    socket.emit('sendScrool', {s: Math.round(e.deltaY)});
        //},1000);
    });*/

    /*$('#videoTest').addEventListener('wheel ', function(e){
        e.preventDefault();
        const delta = Math.sign(event.deltaY);
        socket.emit('sendScrool', {s: delta});
    });*/  

    video.addEventListener('mousemove',function(e){

        if(isfullScreen){
            var width = $('#videoTest').width();
            var height = $('#videoTest').height();
            $('#controlScreenSize').html(width + " "+height);
            
            var posX = $('#videoTest').offset().left;
            var posY = $('#videoTest').offset().top;
            
            var x = e.pageX - posX;
            var y = e.pageY - posY;
            
            var str = x+" "+y;
            if(screen.disabled){
                socket.emit('sendCoords',{x:x, y:y});
            }
            if(role=='client'){
                socket.emit('sendCoordFromMouseMove',{x:x, y:y, w:width, h:height});
            }
        }
        else{
            var width = $('#videoTest').width();
            var height = $('#videoTest').height();
            
            $('#controlScreenSize').html(width + " "+height);
            
            var posX = $('#videoTest').offset().left;
            var posY = $('#videoTest').offset().top;
            
            var x = e.pageX - posX;
            var y = e.pageY - posY;
            
            var str = x+" "+y;
            if(screen.disabled){
                socket.emit('sendCoords',{x:x, y:y});
            }
            if(role=='client'){
                socket.emit('sendCoordFromMouseMove',{x:x, y:y, w:width, h:height});
            }
        }
        
    });

    $(window).bind('keydown', (e)=>{
        e.preventDefault();
        if(isOnRemoteDiv && role=='client'){
            socket.emit('sendPressKey',{k:e.key});
        }
    });
    
    $(window).bind('keyup', (e)=>{
        if(isOnRemoteDiv && role=='client'){
            socket.emit('sendUpKey',{k:e.key});
        }
    });

}

function reconnectStream(){
    console.log('The user has ended sharing the screen');
    var v = document.getElementById('videoTest');
    document.getElementById('reconnectBtn').disabled = true;
    //document.getElementById('remoteScreen').removeChild(v);
    socket.emit('sendEndStream');
}

function scrool(e){
    //console.log(e.deltaX+" "+e.deltaY);
    socket.emit('sendScrool', {s: e.deltaY});
}

function scrool(e){
    //console.log(e.deltaX+" "+e.deltaY);
    socket.emit('sendScrool', {s: video.scrollY});
}

// GENEROWANIE KODU
function generateCode(){
    var code = '';
    for(let i=0; i<10; i++){
        code += Math.floor(Math.random()*10);
    }
    return code;
}

//ZAMYKANIE STRONY
window.addEventListener('beforeunload',(e)=>{
    e.preventDefault();
    var code = document.getElementById('generatedCode').innerHTML;
    socket.emit('removeCode',{c: code});
});

