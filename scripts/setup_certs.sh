#!/bin/bash

echo "Initialize Certificate Authority called openSenseMapCA"
certstrap init --common-name "openSenseMapCA"

echo "Request a certificate called mqtt-integration_server"
certstrap request-cert --common-name "mqtt-integration server"

echo "Sign the requested certificated with the openSenseMapCA"
certstrap sign --CA "openSenseMapCA" mqtt-integration_server