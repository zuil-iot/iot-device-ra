#!/bin/sh
docker run --rm \
 --net=iot-net \
 --name iot-device-reg \
 -it iot/device-reg
