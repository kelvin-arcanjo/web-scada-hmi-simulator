// Connects to the server hosting the page;

const socket = io()
const tempValue = document.getElementById('temp-value')

socket.on('telemetry_update' , (data) => {
    
    if (tempValue) {
        tempValue.textContent = data.value
    }
})