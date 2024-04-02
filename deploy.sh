#!/bin/bash

cd /home/ubuntu/multiplayer-backend
git pull origin master
pm2 kill
pm2 start --interpreter=ts-node index.ts