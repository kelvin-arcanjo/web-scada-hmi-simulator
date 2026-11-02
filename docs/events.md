| Event | Direction | Emitter | Listener | Payload | Target | Trigger |
|---|---|---|---|---|---|---|
| toggle_heater | down (command) | client.js | server.js | { state: true/false } | 1 client → server | click on HEATER button |
| toggle_pump | down (command) | client.js |server.js | { state: true/false } | 1 client → server |click on INLET PUMP button |
| toggle_valve | down (command)| client.js | server.js |{ state: true/false } | 1 client → server |click on OUTLET VALVE button|
| process_status | up (data) | server.js | client.js | { temperature, level, pressure, heaterOn, pumpOn, valveOpen, autoDraining } | 1 client (socket.emit) ; all clients (io.emit) | on client connect; after each toggle_*; when an interlock changes state |
| telemetry_update | up (data) | server.js | client.js | { temperature, level, pressure, flowRate,  highLevelAlarm } | all clients (io.emit) | every 1 sec |



## Server event counts (server.js)
- io.on: 1
- io.emit: 7
- socket.emit: 1
- socket.on: 3

## Key Concepts
- process_status feeds the buttons 
- telemetry_update feeds the tank and the chart;
- The socket object only exists after a client connects, so the toggle_* listeners are registered inside io.on('connection')
- The 28 °C alarm decision should be made on the server, like highLevelAlarm.
- The ACK state (alarmAcknowledged) only exists in the browser: it is lost on F5 and does not reach other operators.

## Known Gaps
- The logEvent is only called once, during the connection (the README promises alarm and interlock logs).
- When an interlock shuts down the heater, the operator doesn't see the cause.
- The toggle_valve has no protection (track C). 
