#!/bin/bash

echo "Going to seed openSenseMap boxes with MQTT integrations"
mongoimport --db osem-mqtt --collection boxes --type json --file ./seeds/devices.json --jsonArray
echo "Export was restored"