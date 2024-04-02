#!/bin/bash
export PATH=$PATH:/home/ubuntu/.nvm/versions/node/v21.7.1/bin

cd multiplayer-backend
 git pull origin master
 pm2 kill
 pm2 start --interpreter=ts-node index.ts