var socket = io();
        
var role='';
var run = false;
var isOnRemoteDiv = false;
var isfullScreen = false;

var input = document.getElementById('x');
var input2 = document.getElementById('y');
var roleVal = document.getElementById('roleData');
//var screen = document.getElementById('screenShare');
var screen = document.getElementById('remoteScreen');    

document.getElementById('form').addEventListener('click',function(e){
    if(input.value && input2.value){
        socket.emit('sendCoordsFromInputs', {x:input.value, y:input2.value});
        input.value = '';
        input2.value = '';
    }
});

screen.addEventListener('click',function(e){
    //e.preventDefault();
    if(roleVal.value){
        role=roleVal.value;
        $('#role').html(role);
        console.log(role);
        run=true;
    }
});


screen.addEventListener('mousemove',function(e){
    var posX = $(this).offset().left;
    var posY = $(this).offset().top;
    
    var x = e.pageX - posX;
    var y = e.pageY - posY;
    var str = x+" "+y;
    //$('#cords').html(str);
    if(screen.disabled){
        socket.emit('sendCoords',{x:x, y:y});
    }
    if(run && role=='client'){
        socket.emit('sendCoordFromMouseMove',{x:x, y:y,r:role});
    }
});


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

$("#screenShare").single_double_click(function(event){
    if(!screen.disabled){
        var posX = $(this).offset().left;
        var posY = $(this).offset().top;
        
        var x = event.pageX - posX;
        var y = event.pageY - posY;
        //alert("1 kliknięcie "+x+" "+y);
        socket.emit('sendClick',{x:x,y:y});
    }
},function(event){
    if(!screen.disabled){
        var posX = $(this).offset().left;
        var posY = $(this).offset().top;
        
        var x = event.pageX - posX;
        var y = event.pageY - posY;
        //alert("2 kliknięcia "+x+" "+y);
        socket.emit('sendDoubleClick',{x:x,y:y});
    }
});

$('#sendPeerCode').click(()=>{
    var kod = peer.id;
    alert("Twój kod: " + kod)
});

socket.on('setPeerCode', function(c){
    document.getElementById('r').innerHTML = c.pCode;
});

/*$(window).bind('keyup', function(e){
    socket.emit('sendKey',{k:e.key});
});*/


/////////////
/////////////
/////////////
/////////////

var peerCode = '';
var peer = new Peer(generateCode());
var myStream;
var currentPeer;
var peerList = [];

peer.on('open', function(id){
    $('#showPeer').html(id);
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

$('#callPeer').click((e)=>{
    let remotePeerId = document.getElementById('peerID').value;
    $('#showPeer').html('connecting '+remotePeerId);

    document.getElementById('shareScreenBtn').disabled = false;
    document.getElementById('shareScreenBtn').addEventListener('click',(id)=>{
        callPeer(remotePeerId);
    });

    var w = document.getElementById('widthScreen').innerHTML;
    var h = document.getElementById('heigthScreen').innerHTML;
    socket.emit('sendScreenSize', {wi:w,he:h});
    document.getElementById('reconnectBtn').disabled = false;
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
    //mouseDown
    $('#videoTest').mousedown(() => {
        isMouseDown = true;
        socket.emit('mouseDown', {m: true});
    });

    //mouseUp
    $('#videoTest').mouseup(() => {
        isMouseDown = false;
        socket.emit('mouseUp', {m: false});
    });

    //scroll nieudany
    video.addEventListener('wheel', function(e){
        const delta = Math.sign(e.deltaY);
        socket.emit('sendScrool', {s: delta});
        e.preventDefault();
        /*setTimeout(function(){
            socket.emit('sendScrool', {s: Math.round(e.deltaY)});
        },1000);*/
    });

        
        video.addEventListener('mousemove',function(e){

            var width = $('#videoTest').width();
            var height = $('#videoTest').height();

            $('#controlScreenSize').html(width + " "+height);

            var posX = $('#videoTest').offset().left;
            var posY = $('#videoTest').offset().top;

            var x = e.pageX - posX;
            var y = e.pageY - posY;

            if(screen.disabled){
                socket.emit('sendCoords',{x:x, y:y});
            }
            if(run && role=='client'){
                //socket.emit('sendCoordFromMouseMove',{x:x, y:y,r:role});
                socket.emit('sendCoordFromMouseMove',{x:x, y:y,r:role, w:width, h:height});
            }

        });


    $(window).bind('keydown', (e)=>{
        e.preventDefault();
        if(isOnRemoteDiv && role=='client'){
            socket.emit('sendPressKey',{k:e.key});
        }
    });

    $(window).bind('keyup', (e)=>{
        //e.preventDefault();
        if(isOnRemoteDiv && role=='client'){
            socket.emit('sendUpKey',{k:e.key});
        }
    });

}
function generateCode(){
    var code = '';
    for(let i=0; i<10; i++){
        code += Math.floor(Math.random()*10);
    }
    return code;
}
