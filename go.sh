#!/bin/sh
docker run \
 --net=iot-net \
 --name iot-device-ra \
 -d iot/device-ra
