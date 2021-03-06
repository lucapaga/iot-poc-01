#!/bin/bash

export GCP_APP_CRED_JSON_PATH=/home/pi/iot-poc-01/device/pubsub/sa/pi-pocs-pubsub-sa01-00afc7e81369.json
export GCP_PROJECT_NAME=luca-paganelli-formazione
export GCP_PUBSUB_TOPIC_COMMANDS=gpio_commands_topic
export GCP_PUBSUB_SUBSCRIPTION_COMMANDS=gpio_commands_subscription
export GCP_PUBSUB_TOPIC_STATUS=gpio_status_topic
export PI_EMULATE_GPIO=False

echo "Sleeping 1 minute ..."
sleep 60

echo "Now running daemon!"

/home/pi/iot-poc-01/device/pubsub/rc.run-daemon.sh
