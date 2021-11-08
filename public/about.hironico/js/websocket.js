function sendFileData(ws, fileToSend) {

   console.log('Sending file data: ' + fileToSend.name);
   
   var reader = new FileReader();
   var rawData = new ArrayBuffer();
   reader.loadend = function() {
   }

   reader.onload = function(e) {
       rawData = e.target.result;
       ws.binaryType = 'arrayBuffer';
       ws.send(rawData, { binary: true } );
       console.log('Finished sending file data.');
   }
   
   reader.readAsArrayBuffer(fileToSend);
}

function sendFile(ws, fileToSend) {
   const fileInfo = {
      msgType: 'upload',
      name: fileToSend.name,
      size: fileToSend.size
   }
   ws.send(JSON.stringify(fileInfo));
}

function initWS() {            
    if ("WebSocket" in window) {       
       // Let us open a web socket
       var ws = new WebSocket("ws://localhost:8999/");
        
       ws.onopen = function() {          
          // Web Socket is connected, send data using send()
          console.log('Connection established.');
       };
        
       ws.onmessage = function (evt) { 
          var received_msg = evt.data;
          console.log(`Server replies: ${received_msg}`);
          if ('READY' === received_msg) {
            const singleFile = fileinput.files[0];
            sendFileData(ws, singleFile);
          } else if ('OK' === received_msg) {             
            alert('Server says OK.');
          } else if (received_msg.startsWith('ERROR')) {
             alert(received_msg);
          } else {
             alert('Unknown message from server. Please see logs.');             
          }
       };
        
       ws.onclose = function() {           
          // websocket is closed.
         console.log('Websocket connection has been closed.');
       };

       return ws;
    } else {      
       // The browser doesn't support WebSocket
       alert("WebSocket NOT supported by your Browser!");
       return null;
    }
 }

const ws = initWS();

const fileinput = document.getElementById('filename');
fileinput.addEventListener('change', function () {
   if (ws === null) {
      console.log('Cannot send file since websocket is null');
      return;
   }

   const singleFile = fileinput.files[0];
   sendFile(ws, singleFile);
});

// activation par konami code
var easter_egg = new Konami(function() { 
   document.getElementById('filename').click();
});