#!/bin/bash

#DEVICE_ID_FILE_DIR=/tmp/lucapaga/iot-poc-01/device/pubsub
DEVICE_ID_FILE_DIR=/var/local/lucapaga/iot-poc-01/device/pubsub
DEVICE_ID_FILE_PATH=${DEVICE_ID_FILE_DIR}/device_id.dat
mkdir -p ${DEVICE_ID_FILE_DIR}

#source ${HOME}/env/bin/activate
echo "Setting up security using '${GCP_APP_CRED_JSON_PATH}' ..."
export GOOGLE_APPLICATION_CREDENTIALS=${GCP_APP_CRED_JSON_PATH}

if [ -z ${PI_DEVICE_ID} ]
then
  echo ""
  echo " -- PI_DEVICE_ID environment variable not set, loading from file ..."

  PI_DEVICE_ID=$(cat ${DEVICE_ID_FILE_PATH})

  echo ""
  echo " *** YOUR DEVICE ID IS: '${PI_DEVICE_ID}' *** "
  echo ""
else
  echo ${PI_DEVICE_ID} > ${DEVICE_ID_FILE_PATH}
fi

if [ -z ${PI_DEVICE_ID} ]
then
  echo ""
  echo " -- PI_DEVICE_ID environment variable not set, generating new UUID ..."

  PI_DEVICE_ID=$(uuidgen)
  echo ${PI_DEVICE_ID} > ${DEVICE_ID_FILE_PATH}

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
cat ./sample-pubsub-message.txt
echo ""
echo ""

retcode=1
while [ ${retcode} -gt 0 ]
do
  echo "Running job"
  if [ "${PI_EMULATE_GPIO}" == "False" ];
  then
    python main.py \
          --project ${GCP_PROJECT_NAME} \
          --device_id ${PI_DEVICE_ID} \
          --commands_topic_name ${GCP_PUBSUB_TOPIC_COMMANDS} \
          --commands_subscription_name ${GCP_PUBSUB_SUBSCRIPTION_COMMANDS} \
          --status_topic_name ${GCP_PUBSUB_TOPIC_STATUS}
  else
    python main.py \
          --project ${GCP_PROJECT_NAME} \
          --device_id ${PI_DEVICE_ID} \
          --commands_topic_name ${GCP_PUBSUB_TOPIC_COMMANDS} \
          --commands_subscription_name ${GCP_PUBSUB_SUBSCRIPTION_COMMANDS} \
          --status_topic_name ${GCP_PUBSUB_TOPIC_STATUS} \
          --emulate_gpio ${PI_EMULATE_GPIO}
  fi

  retcode=$?

  if [ ${retcode} -gt 0 ]
  then
    echo "Oops, there was an error (${retcode}), restarting ...!"
    retcode=0
  else
    echo "That's it, quitting"
    retcode=0
  fi
done


echo "DONE!"
echo "Exiting ..."
