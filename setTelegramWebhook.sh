#!/bin/bash

ENDPOINT=$1
TELEGRAM_BOT_TOKEN=$2
OPTION="$3"

if [ "$OPTION" == "delete" ]
then
curl --request POST \
  --url "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/deleteWebhook" \
  --header "content-type: application/json"
exit 0
fi

if [ "$OPTION" == "local" ]
then
  PORT=`echo $ENDPOINT | grep -oP '([0-9]+)'`
  ROUTE=`echo http://localhost:4000/dev/warzone-tracker | grep -oP '\:[0-9]+.*' | grep -oP '\/.*'`
  nohup ngrok http $PORT &
  while ! nc -z localhost 4040; do
    sleep 1
  done
  ENDPOINT=`curl http://localhost:4040/api/tunnels | grep -oP '(https://[a-z0-9\-\.]+ngrok\.io)'`
  ENDPOINT="${ENDPOINT}${ROUTE}"
fi

curl --request POST \
  --url "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  --header "content-type: application/json" \
  --data "{\"url\": \"$ENDPOINT\"}"
