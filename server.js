const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// --- PROCESS SYSTEM STATE ---
let processState = {
    temperature: 25.0,   // TT-101 (°C)
    level: 45.0,         // LT-101 (%)
    pressure: 1.0,       // PT-101 (bar)
    flowRate: 0.0,       // FT-101 (L/min)
    heaterOn: false,     // HE-101 Actuator
    pumpOn: false,       // P-101 Actuator
    valveOpen: false,     // V-101 Actuator
    autoDraining: false  // Interlock latch state
};

io.on('connection', (socket) => {
    // Sync newly connected client;
    socket.emit('process_status', processState);

    socket.on('toggle_heater', (data) => {
        processState.heaterOn = data.state;
        io.emit('process_status', processState);
    });

    socket.on('toggle_pump', (data) => {
        // Prevent turning on pump while auto-draining;
        if (processState.autoDraining && data.state) return
        processState.pumpOn = data.state;
        io.emit('process_status', processState);
    });

    socket.on('toggle_valve', (data) => {
        processState.valveOpen = data.state;
        io.emit('process_status', processState);
    });
});

// --- SIMULATION PHYSICS ENGINE (1 Hz) ---
setInterval(() => {
    //Temperature Dynamics;

    if (processState.heaterOn) {
        processState.temperature += 0.4 + (Math.random() * 0.1);
    } else if (processState.temperature > 25.0) {
        processState.temperature -= 0.15;
    }

    //High-level Interlock Safety (Hysteresis: 80% -> 45%)

    if (processState.level >= 80.0 && !processState.autoDraining) {
        processState.autoDraining = true
        processState.pumpOn = false
        processState.valveOpen = true
        io.emit('process_status' , processState)

    } else if (processState.level <= 45.0 && processState.autoDraining) {
        processState.autoDraining = false
        processState.valveOpen = false // Reset Drain Valve CLOSED;
        io.emit('process_status', processState)
    }

    //Tank Level Dynamics (Pump vs Valve);

    let fillRate = processState.pumpOn ? 1.5 : 0;
    let drainRate = processState.valveOpen ? 1.2 : 0;
    
    processState.level += fillRate - drainRate + (Math.random() * 0.1 - 0.05);
    processState.level = Math.max(0, Math.min(100, processState.level));

    //Flow Rate Dynamics;

    if (processState.valveOpen && processState.level > 0) {
        processState.flowRate = 45.0 + (Math.random() * 2.0 - 1.0);
    } else {
        processState.flowRate = 0.0;
    }

    //Pressure Dynamics (Hydrostatic calculation);

    processState.pressure = 1.0 + (processState.level / 100) * 1.5 + (Math.random() * 0.02);

    //Broadcast telemetry payload;

    io.emit('telemetry_update', {
        temperature: processState.temperature.toFixed(2),
        level: processState.level.toFixed(1),
        pressure: processState.pressure.toFixed(2),
        flowRate: processState.flowRate.toFixed(1),
        highLevelAlarm: processState.level >= 80.0
    });
}, 1000);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`SCADA Server running on http://localhost:${PORT}`);
});