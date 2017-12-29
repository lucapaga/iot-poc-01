#!/bin/bash
docker run -d --restart always --device /dev/gpiomem:/dev/gpiomem:rw --device /dev/mem:/dev/mem:rw lucapaga/pubsub-leg-mgr-python:0.0.1
