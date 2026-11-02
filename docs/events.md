| Event | Direction | Emitter | Listener | Payload | Target | Trigger |
|---|---|---|---|---|---|---|
| toggle_heater | down (command) | client.js | server.js | { state: true/false } | 1 client → server | click on HEATER button |
| toggle_pump | down (command) | client.js |server.js | { state: true/false } | 1 client → server |click on INLET PUMP button |
| toggle_valve | up (data)| client.js | server.js |{ state: true/false } | 1 client → server |click on OUTLET VALVE button|
| process_status | up (data) | server.js | client.js | { temperature, level, pressure, heaterOn, pumpOn, valveOpen, autoDraining } | 1 client (socket.emit) ; all client (io.emit) | on client connect; after each toggle_*; when an interlock changes state |
| telemetry_update | go up | server.js | client.js | { temperature, level, pressure, flowRate,  highLevelAlarm } | all clients (io.emit) | every 1 sec |



## Server event counts (server.js)
- io.on: 1
- io.emit: 7
- socket.emit: 1
- socket.on: 3

## Key Concepts
- process_status feeds the buttons; 
- telemetry_update feeds the tank and the chart; 
- socket it just appears in connection;
- the alarmAcknowledged should be decided on server.

## Know Gaps
- The 28°C alarm is decided on the client (it should be on the server, like the highLevelAlarm).
- The alarmAcknowledged only exists in the browser (it gets lost in the F5 press and doesn't reach other operators).
- The logEvent is only called once, during the connection (the README promises alarm and interlock logs).
- When an interlock shuts down the heater, the operator doesn't see the cause.
- The toggle_valve has no protection (track C). 
