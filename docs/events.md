| Event | Direction | Emitter | Listener | Payload | Target | Trigger |
|---|---|---|---|---|---|---|
| toggle_heater | go down | client.js | server.js | { state: true/false } | 1 client → server | click on HEATER button |
| toggle_pump | go down | client.js |server.js | { state: true/false } | 1 client → server |click on INLET PUMP button |
| toggle_valve | go down | client.js | server.js |{ state: true/false } | 1 client → server |click on OUTLET VALVE button|
| process_status | go up | server.js | client.js | { temperature, level, pressure, heaterOn, pumpOn, valveOpen, autoDraining } | 1 client (socket.emit) ; all client (io.emit) | on client connect; after each toggle_*; when an interlock changes state |
| telemetry_update | go up | server.js | client.js | { temperature, level, pressure, flowRate,  highLevelAlarm } | all clients (io.emit) | each 1 sec |