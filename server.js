//Import Tool;

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

//Initialize the apps;

const app = express()
const server = http.createServer(app)
const io = new Server(server) // Attach Socket.io to the HTTP server;

//Serve the Frontend HMI;

app.use(express.static('public'))


io.on('connection' , (socket) => {
    // This code runs every time a new browser tab opens the HMI;
    console.log('New HMI connected with ID:' , socket.id)

    //Sensor data streaming logic...
})


// Starting value for our Temperature Transmitter;

let tankTemperature = 25.0

// Simulate the PLC scan cycle every 500 milliseconds;

setInterval(() => {
    const fluctuation = Math.random() - 0.5
    tankTemperature += fluctuation

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
