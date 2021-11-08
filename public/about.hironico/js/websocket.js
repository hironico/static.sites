function sendFile(ws) {
   var file = document.getElementById('filename').files[0];
   var reader = new FileReader();
   var rawData = new ArrayBuffer();
   reader.loadend = function() {
   }

   reader.onload = function(e) {
       rawData = e.target.result;
       ws.send(rawData);
       alert("the file has been transferred.");
   }
   
   reader.readAsArrayBuffer(file);
}

function WebSocketTest() {
            
    if ("WebSocket" in window) {       
       // Let us open a web socket
       var ws = new WebSocket("ws://localhost:8999/");
        
       ws.onopen = function() {          
          // Web Socket is connected, send data using send()
          console.log('Connection established.');

          ws.send('HEllo from web page.');
       };
        
       ws.onmessage = function (evt) { 
          var received_msg = evt.data;
          console.log(`Server replies: ${received_msg}`);
       };
        
       ws.onclose = function() { 
          
          // websocket is closed.
          console.log('Websocket connection has been closed.');
       };
    } else {
      
       // The browser doesn't support WebSocket
       alert("WebSocket NOT supported by your Browser!");
    }
 }