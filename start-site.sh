#!/bin/bash

SSL_HOME=/data/sites/ssl

if [ $# -ne 2 ]
then 
    echo "Usage: start-site.sh /path/to/static/content PORT_NUMBER"
    exit -1
fi

if [ ! -d $1 ]
then
    echo "ERROR: Must provide a DIRECTORY to serve as static http content."
    exit -2
fi

LOGFILE="/var/log/sites/static.sites/static_$2.log"

echo "Starting http-server for $1 on port $2..."
echo "Log file is: $LOGFILE"

nohup http-server -p $2 --ssl --cors --cert ${SSL_HOME}/cert.pem --key ${SSL_HOME}/privkey.pem $1 > $LOGFILE 2>&1 &
echo $! > $1.pid
echo "Server started !"
