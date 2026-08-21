// Connects to the server hosting the page;

const socket = io();

socket.on('telemetry_update' , (data) => {
    console.log('Dados recebidos do servidor:' , data)
})