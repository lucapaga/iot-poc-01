#!/bin/bash

export GCP_APP_CRED_JSON_PATH=$(pwd)/sa/pi-pocs-pubsub-sa01-00afc7e81369.json
export GCP_PROJECT_NAME=luca-paganelli-formazione
export GCP_PUBSUB_TOPIC_COMMANDS=gpio_commands_topic
export GCP_PUBSUB_SUBSCRIPTION_COMMANDS=gpio_commands_subscription
export GCP_PUBSUB_TOPIC_STATUS=gpio_status_topic
export PI_EMULATE_GPIO=True

./run-daemon.sh
