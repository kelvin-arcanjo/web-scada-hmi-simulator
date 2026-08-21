// Connects to the server hosting the page;

const ctx = document.getElementById('tempChart').getContext('2d')
const tempChart = new Chart(ctx , {
    type: 'line',
    data: {
        labels: [], //Time stamps;
        datasets: [{
            label: ' Temperature (°C)',
            data: [], //Live sensor values;
            borderColor: '#ff4500',
            borderWidth: 2,
            fill: false
        }]
    },

    options: {
        scales: {
            x: { display: true },
            y: { suggestedMin: 10 , suggestedMax: 40 }
        }
    }
})

const socket = io()
const tempValue = document.getElementById('temp-value')
const card = document.querySelector('.instrument-card')

socket.on('telemetry_update' , (data) => {
    const tempNum = parseFloat(data.value)
    
    if (tempValue) {
        tempValue.textContent = data.value
    }

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

    //threshold check,

    if (card) {
        if (tempNum > 28.0) {
            card.classList.add('alarm-high')

        } else {
            card.classList.remove('alarm-high')
        }
    }
})

