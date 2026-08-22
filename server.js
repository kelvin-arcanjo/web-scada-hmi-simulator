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

//Serve the Frontend HMI;

app.use(express.static('public'))


io.on('connection' , (socket) => {
    // Send current header status to newly connected clients;
    socket.emit('heater_status' , heaterState)

    // Receive control commands from the HMI;
    socket.on('toggle_heater' , (data) => {
    heaterState = data.state
    io.emit('heater_status' , heaterState) // Broadcast status update;
   })
})


// Starting value for our Temperature Transmitter;

let tankTemperature = 25.0

// Update the interval loop to affect temperature based on heater state,

setInterval(() => {
    const fluctuation = Math.random() - 0.48

    if (heaterState) {
        tankTemperature += Math.random() * 0.8 + 0.1

    } else {
        tankTemperature += fluctuation
    }
    

    // Broadcast the new reading to all connected HMIs;

    io.emit('telemetry_update' , {
        sensor: 'TT-101',
        value: tankTemperature.toFixed(2)
    })

} , 500)

//Start listening for incoming connections;

const PORT = 3000

//initialize the server on the PORT;

server.listen(PORT , () => {
    console.log(`SCADA Server running on port ${PORT}`)
})
