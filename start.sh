#!/bin/bash

# change log directory below to a location where user can write to.
LOGDIR="/var/log/sites/static.sites"

LOGDATE=`date +%Y%m%d%H%M%S`
LOGFILE="${LOGDIR}/about.hironico.net.${LOGDATE}.log"

echo "LOGFILE is: ${LOGFILE}"

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

mkdir -p $LOGDIR

# ensure we change the current working directory to script dir
# so that node can find the config file
cd ${SCRIPT_DIR}

node ${SCRIPT_DIR}/dist/server.js 1>${LOGFILE} 2>&1