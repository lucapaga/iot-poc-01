#!/bin/bash
docker run -d --restart always --device /dev/gpiomem:/dev/gpiomem:rw --device /dev/mem:/dev/mem:rw lucapaga/iot-poc-01-device-pubsub:0.0.3
