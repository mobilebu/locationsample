#!bin/sh
nohup /root/app/redis-1.2.6/redis-server > /dev/null 2> log/redis.log < /dev/null &
nohup node geotag.js > log/chat.log 2> log/chat_err.log < /dev/null &
npm start > log/server.log  2> log/server_err.log < /dev/null &
