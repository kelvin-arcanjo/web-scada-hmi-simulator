//Import Tool;

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

//Initialize the apps;

const app = express()
const server = http.createServer(app)
const io = new Server(server) // Attach Socket.io to the HTTP server;

//heaterState;

let heaterState = false;

//process state;

let processState = {
    temperature: 25.0, //TT-101 (°C);
    level: 45.0,  //LT-101 (%);
    pressure: 1.0,  //PT-101 (bar);
    flowRate : 0.0, //  FT-101 (L/min);
    heaterOn: false,  //HE-101 Actuador;
    pumpOn: false,  //P-101 Actuador;
    valveOpen: false  // V-101 Actuator;
}

//Serve the Frontend HMI;

app.use(express.static('public'))


io.on('connection' , (socket) => {
    // Send full process state on connection;
    socket.emit('process_status' , processState)

    // Receive control commands from the HMI;
    socket.on('toggle_heater' , (data) => {
    processState.heaterOn = data.state
        io.emit('process_status' , processState) // Broadcast status update;
   })

   socket.on('toggle_pump' , (data) => {
        processState.pumpOn = data.state
        io.emit('process_status' , processState)
   })

   socket.on('toggle_valve', (data) => {
        processState.valveOpen = data.state;
        io.emit('process_status', processState);
    });
})


// --- Simulation physics Engine (1 Hz) ---;

// Starting value for Temperature Transmitter;

let tankTemperature = 25.0

// Update the interval loop to affect temperature based on heater state,

setInterval(() => {
    //Temperature Dynamics (Heater)
    if (processState.heaterOn) {
        processState.temperature += 0.4 + (Math.random() * 0.1)

    } else if (processState.temperature > 25.0) {
        processState.temperature -= 0.15
    }

    //Tank Level Dynamics (Pump vs Valve),
    let fillRate = processState.pumpOn ? 1.5 : 0
    let drainRate = processState.valveOpen ? 1.2 : 0

    processState.level = Math.max(0 , Math.min(100 , processState.level))

    //Flow Rate Dynamics (Outlet Valve);
    if (processState.valveOpen && processState.level > 0) {
        processState.flowRate = 45.0 + (Math.random() * 2.0 - 1.0)

    } else {
        processState.flowRate = 0.0
    }

    //Pressure Dynamics (Hydrostatic pressure proportional to tank level);

    processState.pressure = 1.0 + (processState.level / 100) * 1.5 + (Math.random() * 0.02);

    // Broadcast the new reading to all connected HMIs;

    io.emit('telemetry_update' , {
        temperature: processState.temperature.toFixed(2),
        level: processState.level.toFixed(1),
        pressure: processState.pressure.toFixed(2),
        flowRate: processState.flowRate.toFixed(1)
    })

} , 1000)

//Start listening for incoming connections;

const PORT = 3000

//initialize the server on the PORT;

server.listen(PORT , () => {
    console.log(`SCADA Server running on port ${PORT}`)
})
