#FROM node:alpine
FROM grpc/node
MAINTAINER luca.paga@gmail.com

RUN 	mkdir -p /webapp/node_modules && \
	mkdir -p /webapp/dist && \
	mkdir -p /webapp/sa

COPY app.js /webapp/
COPY node_modules /webapp/node_modules/
COPY dist /webapp/dist/
COPY sa /webapp/sa/

WORKDIR /webapp

RUN 	npm install npm && \
        npm rebuild

ENV GCP_PUBSUB_TOPIC_COMMANDS=gpio_commands_topic
ENV GOOGLE_APPLICATION_CREDENTIALS=/webapp/sa/pi-pocs-pubsub-sa01-00afc7e81369.json

CMD ["node", "app.js"]


