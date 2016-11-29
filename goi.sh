#!/bin/sh
docker run --rm \
 --net=iot-net \
 --name iot-device-ra \
 -it iot/device-ra
