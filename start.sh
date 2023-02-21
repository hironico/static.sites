#!/bin/bash

LOGDATE=`date +%Y%m%d%H%M%S`
LOGDIR="/var/log/sites/static_sites"
LOGFILE="about.hironico.net.${LOGDATE}.log"

mkdir -p $LOGDIR
forever start -o $LOGDIR/$LOGFILE -e $LOGDIR/$LOGFILE ./dist/server.js

echo "Started Nico's Drive, log file is $LOGDIR/$LOGFILE"
exit 0

