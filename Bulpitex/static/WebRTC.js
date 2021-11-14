'use strict';

const screenShare = document.getElementById('screenShareBtn');

/*var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

const config = {
  'iceServers': [{
    'urls': ['stun:stun.l.google.com:19302']
  }]
};

const peerConnection = new RTCPeerConnection(config);*/




function handleSuccess(stream){
    screenShare.disabled = true;
    const video = document.querySelector('video');
    video.srcObject = stream;

    stream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('The user has ended sharing the screen');
        screenShare.disabled = false;
    });


    /*if (video instanceof HTMLVideoElement) {
      peerConnection.addStream(video.srcObject);
      console.log('test');
    }

    peer.on('call', (call) => {
      call.answer(stream);
      const video2 = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(video2,userVideoStream);
      });
    });*/
    

}

function handleError(error) {
    console.log('getDisplayMedia error: '+error.name);
}


screenShare.addEventListener('click', () => {
    navigator.mediaDevices.getDisplayMedia({video:true}).then(handleSuccess,handleError);
});

if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
    screenShare.disabled = false;
} 
else {
    //errorMsg('getDisplayMedia is not supported');
    console.log('getDisplayMedia is not supported');
}

var test = document.querySelector('video'), canvas;

test.addEventListener('mousemove',function(event){
    if(screenShare.disabled){
        var posX = $(this).offset().left;
        var posY = $(this).offset().top;
        
        var x = event.pageX - posX;
        var y = event.pageY - posY;
        socket.emit('sendCoords',{x:x, y:y});
    }
});






/////////////////////////////


/*peer.on('call', (call) => {
  call.answer()
});
*/


const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};




















/*startCapture({'video':true,'audio':true});

async function startCapture(displayMediaOptions) {
    let captureStream = null;
  
    try {
      captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch(err) {
      console.error("Error: " + err);
    }
    return captureStream;
  }*/




/*getMedia();

async function getMedia() {
    let stream = null;
  
    try {
      stream = await navigator.mediaDevices;//.getDisplayMedia({'video':true,'audio':true});
      console.log('ok');
    } catch(err) {
      console.log(err);
    }
  }*/