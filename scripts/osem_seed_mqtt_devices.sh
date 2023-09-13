#!/bin/bash

echo "Going to seed openSenseMap boxes with MQTT integrations and users"
mongoimport --db osem-mqtt --collection boxes --type json --file ./seeds/devices.json --jsonArray
mongoimport --db osem-mqtt --collection users --type json --file ./seeds/users.json --jsonArray
echo "Export was restored"