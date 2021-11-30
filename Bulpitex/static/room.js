var peerCon = null;
var currentPeerCon = null
var myStream;
var roomID;


var createRoomBtn = document.getElementById('createRoomBtn');

createRoomBtn.addEventListener('click', createRoom);

function createRoom(){
    roomID = generateCode();
    peerCon = new Peer(roomID);
    
    peerCon.on('open', id=>{
        //
    });
    
    peerCon.on('call', call=>{
        //
    });
    
}


function joinRoom(){
    roomID = document.getElementById('peerID');
    peerCon= new Peer();

    peerCon.peerCon('open', id=>{

    });
}