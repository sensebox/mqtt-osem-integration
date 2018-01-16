# openSenseMap MQTT Integration

MQTT client service for [openSenseMap API]. Connects to remote MQTT brokers and stores incoming messages in the database of openSenseMap. Communication with the main [openSenseMap API] is done through gRPC calls. You can find the .proto file in the [osem-protos] repository.

## Configuration

#### Database connection
The database connection can be configured throgh the environment variable `OSEM_dbconnectionstring`. Should be a valid [mongoDB Connection String].

#### Everything else
The remainder of the integration can be configured either through overriding the values in [config/default.json](config/default.json)

Configuration is handled by [node-config].

| Config key | Environment Variable | Description |
|------------|----------------------|-------------|
| `mqtt_client.num_retries` | `OSEM_MQTT_NUM_RETRIES` | Number of retries which the MQTT client takes until backing off |
| `mqtt_client.retry_after_minutes` | `OSEM_MQTT_RETRY_AFTER_MINUTES` | Minutes after the MQTT clients restarts connecting after errors |
| `grpc.port` | `OSEM_MQTT_GRPC_PORT` | Port on which the gRPC server listens |
| `grpc.certificates.ca_cert` | `OSEM_MQTT_GRPC_CA_CERT` | CA certificate for gRPC TLS client authentication. Can be specified either as path to a certificate file or the certificate directly. |
| `grpc.certificates.server_cert` | `OSEM_MQTT_GRPC_SERVER_CERT` | Server certificate for gRPC TLS client authentication. Can be specified either as path to a certificate file or the certificate directly. |
| `grpc.certificates.server_key` | `OSEM_MQTT_GRPC_SERVER_KEY` | Server certificate key for gRPC TLS client authentication. Can be specified either as path to a key file or the key directly. |

[openSenseMap API]: https://github.com/sensebox/openSenseMap-API
[node-config]: https://github.com/lorenwest/node-config
[mongoDB Connection String]: https://docs.mongodb.com/v3.2/reference/connection-string/
[osem-protos]: https://github.com/sensebox/osem-protos/blob/master/mqtt/mqtt.proto
