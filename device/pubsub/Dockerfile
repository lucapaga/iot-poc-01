FROM lucapaga/resin-raspberrypi3-python-2.7-slim:1.0.0

MAINTAINER luca.paga@gmail.com

COPY ./01_pubsub_gpiozero.py /opt/pi-pocs/
COPY ./sa/pi-pocs-pubsub-sa01-00afc7e81369.json /opt/pi-pocs/
COPY ./run-daemon.sh  /opt/pi-pocs/
COPY ./sample-pubsub-message.txt /opt/pi-pocs/

ENV EMULATE_GPIO_INTERFACE=False                                               \
    GCP_APP_CRED_JSON_PATH=/opt/pi-pocs/pi-pocs-pubsub-sa01-00afc7e81369.json  \
    GCP_PROJECT_NAME=luca-paganelli-formazione                                 \
    GCP_PUBSUB_TOPIC_COMMANDS=gpio_commands_topic                              \
    GCP_PUBSUB_SUBSCRIPTION_COMMANDS=gpio_commands_subscription                \
    GCP_PUBSUB_TOPIC_STATUS=gpio_status_topic                                  \
    PI_EMULATE_GPIO=False

#EXPOSE 5000
CMD ["./run-daemon.sh"]
