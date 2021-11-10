const ws = require('ws');

const client = new ws('wss://localhost:8999/',  {
  origin: 'https://localhost:8999',
  rejectUnauthorized: false
});

client.on('open', () => {
  // Causes the server to print "Hello"
  client.send('Hello');
});

client.on('message', (msg) => {
  console.log(`Server replied: ${msg}`);
});