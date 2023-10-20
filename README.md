# openSenseMap MQTT Integration

MQTT client service for [openSenseMap API]. Connects to remote MQTT brokers and stores incoming messages in the database of openSenseMap. Communication with the main [openSenseMap API] is done through gRPC calls. You can find the .proto file in the [osem-protos] repository.

## Configuration

Configuration is handled by [node-config].

See [config/default.json](config/default.json). You should at least configure the connection to the database and the certificates for GRPC. Certificates can either configured directly as strings or can take a path to a file in pem format.

    {
      "grpc": {
        "certificates": {
          // example for path
          "ca_cert": "/etc/ssl/certs/My_CA.pem",
          // example for stringified certificate (sed -z 's/\n/\\n/g' < certificate.crt)
          "server_cert": "-----BEGIN CERTIFICATE-----\nMIIE9DCCAtygAwIBA ... ",
          "server_key": "-----BEGIN RSA PRIVATE KEY-----\nMIIJKQIBAAKCAg ..."
        }
      },
      "openSenseMap-API-models": {
        "db": {
          // See example config json of @sensebox/opensensemap-api-models
          "mongo_uri"
        }
      }
    }

### Development

To get up and running for development run the following steps:

- Run `npm install`
- Run `./scripts/setup_certs.sh` for generating development certificates.
- Set the MQTT URL in row 23 in `./seeds/devices.json`
- Run `docker-compose up -d`

## Environment variables

Its possible to supply your configuration json through the `NODE_CONFIG` environment variable. It is also possible to configure through custom environment variables:

| Config key | Environment Variable | Description |
|------------|----------------------|-------------|
| `mqtt_client.num_retries` | `OSEM_MQTT_NUM_RETRIES` | Number of retries which the MQTT client takes until backing off |
| `mqtt_client.retry_after_minutes` | `OSEM_MQTT_RETRY_AFTER_MINUTES` | Minutes after the MQTT clients restarts connecting after errors |
| `grpc.port` | `OSEM_MQTT_GRPC_PORT` | Port on which the gRPC server listens |
| `grpc.certificates.ca_cert` | `OSEM_MQTT_GRPC_CA_CERT` | CA certificate for gRPC TLS client authentication. Can be specified either as path to a certificate file or the certificate directly. |
| `grpc.certificates.server_cert` | `OSEM_MQTT_GRPC_SERVER_CERT` | Server certificate for gRPC TLS client authentication. Can be specified either as path to a certificate file or the certificate directly. |
| `grpc.certificates.server_key` | `OSEM_MQTT_GRPC_SERVER_KEY` | Server certificate key for gRPC TLS client authentication. Can be specified either as path to a key file or the key directly. |

## Container images and Versions

Container images for this service are created on each push on [Github Container Registry].

Stable versions should be tagged using `npm version` and `git push --follow-tags origin master`

[openSenseMap API]: https://github.com/sensebox/openSenseMap-API
[node-config]: https://github.com/lorenwest/node-config
[osem-protos]: https://github.com/sensebox/osem-protos/blob/master/mqtt/mqtt.proto
[Github Container Registry]: https://github.com/sensebox/mqtt-osem-integration/pkgs/container/mqtt-osem-integration
