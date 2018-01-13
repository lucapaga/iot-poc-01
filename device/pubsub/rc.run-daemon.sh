#!/bin/bash

#source ${HOME}/env/bin/activate
echo "Setting up security using '${GCP_APP_CRED_JSON_PATH}' ..."
export GOOGLE_APPLICATION_CREDENTIALS=${GCP_APP_CRED_JSON_PATH}

if [ -z ${PI_DEVICE_ID} ];
then
  echo ""
  echo " -- PI_DEVICE_ID environment variable not set, generating new UUID ..."

  PI_DEVICE_ID=$(uuidgen)

  echo ""
  echo " *** YOUR DEVICE ID IS: '${PI_DEVICE_ID}' *** "
  echo ""
fi

echo ""
echo "Running daemon ... "
echo " - EMULATION MODE:  ${PI_EMULATE_GPIO}"
echo " - DEVICE ID:       ${PI_DEVICE_ID}"
echo " - GCP Project:     ${GCP_PROJECT_NAME}"
echo " - COMMANDS:"
echo "     - TOPIC:       ${GCP_PUBSUB_TOPIC_COMMANDS}"
echo "     - SUBCRIPTION: ${GCP_PUBSUB_SUBSCRIPTION_COMMANDS}"
echo " - STATUS:"
echo "     - TOPIC:       ${GCP_PUBSUB_TOPIC_STATUS}"
echo ""
echo ""

echo "You can now publish messages to ${GCP_PUBSUB_TOPIC_COMMANDS} topic, e.g.: "
cat /home/pi/iot-poc-01/device/pubsub/sample-pubsub-message.txt
echo ""
echo ""


if [ "${PI_EMULATE_GPIO}" == "False" ];
then
  python /home/pi/iot-poc-01/device/pubsub/main.py \
        --project ${GCP_PROJECT_NAME} \
        --device_id ${PI_DEVICE_ID} \
        --commands_topic_name ${GCP_PUBSUB_TOPIC_COMMANDS} \
        --commands_subscription_name ${GCP_PUBSUB_SUBSCRIPTION_COMMANDS} \
        --status_topic_name ${GCP_PUBSUB_TOPIC_STATUS}
else
  python /home/pi/iot-poc-01/device/pubsub/main.py \
        --project ${GCP_PROJECT_NAME} \
        --device_id ${PI_DEVICE_ID} \
        --commands_topic_name ${GCP_PUBSUB_TOPIC_COMMANDS} \
        --commands_subscription_name ${GCP_PUBSUB_SUBSCRIPTION_COMMANDS} \
        --status_topic_name ${GCP_PUBSUB_TOPIC_STATUS} \
        --emulate_gpio ${PI_EMULATE_GPIO}
fi

echo "DONE!"
echo "Exiting ..."