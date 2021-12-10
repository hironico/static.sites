import * as https from 'https';
import { IncomingMessage, ClientRequest } from 'http';
import * as querystring from 'querystring';

const performRequest = (host: string, endpoint: string, method: string, data: any): Promise<string> => {
  const dataString = JSON.stringify(data);
  let headers = {};

  if (method === 'GET') {
    if (data !== null) {
      endpoint += '?' + querystring.stringify(data);
    }
  } else {
    headers = {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length
    };
  }
  const options: https.RequestOptions = {
    host: host,
    path: endpoint,
    method: method,
    headers: headers
  };

  // console.log('Requesting options:\n' + JSON.stringify(options));

  const p: Promise<string> = new Promise((resolve, reject) => {
    const req: ClientRequest = https.request(options, (res: IncomingMessage) => {
        res.setEncoding('utf-8');
        var responseString = '';

        res.on('data', function (data) {
          responseString += data;
        });

        res.on('end', () => {
          resolve(responseString);
        });
    });

    req.write(dataString);
    req.end();
  });

  return p;
}

export default performRequest;