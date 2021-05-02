#!/bin/sh

if [ "$1" ]
then
    NODE_ENV="production" PORT=$1 node ./bin/www
else
    NODE_ENV="production" node ./bin/www
fi
