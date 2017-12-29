FROM resin/raspberrypi3-python:2.7-slim

MAINTAINER luca.paga@gmail.com

RUN apt-get update && \
    apt-get install build-essential && \
    pip install --upgrade gpiozero && \
    pip install --upgrade google-cloud && \
    pip install --upgrade google-cloud-pubsub && \
    mkdir -p /opt/pi-pocs

WORKDIR /opt/pi-pocs
