#!/bin/bash

# change log directory below to a location where user can write to.
LOGDIR="/var/log/sites/static.sites"

LOGDATE=`date +%Y%m%d%H%M%S`
LOGFILE="${LOGDIR}/about.hironico.net.${LOGDATE}.log"

echo "LOGFILE is: ${LOGFILE}"

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

mkdir -p $LOGDIR
node ${SCRIPT_DIR}/dist/server.js 1>${LOGFILE} 2>&1