#!/bin/sh
docker run \
 --net=iot-net \
 --name iot-device-reg \
 -d iot/device-reg
