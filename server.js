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

//Start listening for incoming connections;

const PORT = 6666

//initialize the server on the PORT;

server.listen(PORT , () => {
    console.log(`SCADA Server running on port ${PORT}`)
})