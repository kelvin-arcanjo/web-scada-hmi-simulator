let alarmAcknowledged = false
let heaterState = false

const statusBadge = document.getElementById('status-badge')
const ackBtn = document.getElementById('ack-btn')
const heaterBtn = document.getElementById('heater-btn')

const socket = io()
const tempValue = document.getElementById('temp-value')
const card = document.querySelector('.instrument-card')


// Connects to the server hosting the page;

const ctx = document.getElementById('tempChart').getContext('2d')
const tempChart = new Chart(ctx , {
    type: 'line',
    data: {
        labels: [], //Time stamps;
        datasets: [{
            label: ' Temperature (°C)',
            data: [], //Live sensor values;
            backgroundColor: '#ff4500',
            borderColor: '#ff4500',
            pointRadius: 2, 
            spanGaps: true,
            tension: 0.3,
            borderWidth: 2,
            fill: false
        }]
    },

    options: {
        animation: false,
        scales: {
            x: { display: true },
            y: { suggestedMin: 10 , suggestedMax: 60 }
        }
    }
})

socket.on('telemetry_update' , (data) => {
    const tempNum = parseFloat(data.value)
    
    if (tempValue) tempValue.textContent = data.value;

    //Current Timestamp on X axis (labels);

    tempChart.data.labels.push(new Date().toLocaleTimeString())

    //Add the temperature value received to dataset;

    tempChart.data.datasets[0].data.push(data.value)

    //Limite the points on the graph;

    if (tempChart.data.labels.length > 20) {
        tempChart.data.labels.shift()
        tempChart.data.datasets[0].data.shift()
    }

    //Render the changes in the graph;

    tempChart.update()

    //Alarm & Badge State Machine;

    if (tempNum > 28.0) {
        statusBadge.textContent = 'HIGH ALARM';
        statusBadge.className = 'badge alarm';

        if (!alarmAcknowledged && card) {
            card.classList.add('alarm-high')
        }

    } else {
        alarmAcknowledged = false
        statusBadge.textContent = 'NORMAL'
        statusBadge.className = 'badge normal'
        
        if (card) card.classList.remove('alarm-high')
    }     
})


//Alarm Acknowledged Click Event;

ackBtn.addEventListener('click' , () => {
    alarmAcknowledged = true
    if (card) card.classList.remove('alarm-high')
})

//Heater Control Command Event;

heaterBtn.addEventListener('click' , () => {
    heaterState = !heaterState
    socket.emit('toggle_heater' , { state: heaterState })
})

//Sync Heater State across sessions;

socket.on('heater_status' , (state) => {
    heaterState = state
    heaterBtn.textContent = `HEATER: ${state ? 'ON' : 'OFF'}`
    heaterBtn.classList.toggle('active', state);
})

