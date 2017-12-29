#!/bin/bash

#source ${HOME}/env/bin/activate
echo "Setting up security using '${GCP_APP_CRED_JSON_PATH}' ..."
export GOOGLE_APPLICATION_CREDENTIALS=${GCP_APP_CRED_JSON_PATH}


echo "Running daemon ... "
echo " - EMULATION MODE:  ${PI_EMULATE_GPIO}"
echo " - GCP Project:     ${GCP_PROJECT_NAME}"
echo " - COMMANDS:"
echo "     - TOPIC:       ${GCP_PUBSUB_TOPIC_COMMANDS}"
echo "     - SUBCRIPTION: ${GCP_PUBSUB_SUBSCRIPTION_COMMANDS}"
echo " - STAUS:"
echo "     - TOPIC:       ${GCP_PUBSUB_TOPIC_STATUS}"
echo ""
echo ""

echo "You can now publish messages to ${GCP_PUBSUB_TOPIC_COMMANDS} topic, e.g.: "
cat ./sample-pubsub-message.txt
echo ""
echo ""


if [ "${PI_EMULATE_GPIO}" == "False" ];
then
  python 01_pubsub_gpiozero.py \
        --project ${GCP_PROJECT_NAME} \
        --commands_topic_name ${GCP_PUBSUB_TOPIC_COMMANDS} \
        --commands_subscription_name ${GCP_PUBSUB_SUBSCRIPTION_COMMANDS} \
        --status_topic_name ${GCP_PUBSUB_TOPIC_STATUS}
else
  python 01_pubsub_gpiozero.py \
        --project ${GCP_PROJECT_NAME} \
        --commands_topic_name ${GCP_PUBSUB_TOPIC_COMMANDS} \
        --commands_subscription_name ${GCP_PUBSUB_SUBSCRIPTION_COMMANDS} \
        --status_topic_name ${GCP_PUBSUB_TOPIC_STATUS} \
        --emulate_gpio ${PI_EMULATE_GPIO}
fi

echo "DONE!"
echo "Exiting ..."
