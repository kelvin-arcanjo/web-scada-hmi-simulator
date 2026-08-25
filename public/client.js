const socket = io();

// --- INITIALIZE CHART.JS INSTANCE ---
const ctx = document.getElementById('temp-chart').getContext('2d');
const tempChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperature (°C)',
            data: [],
            borderColor: '#00d2ff',
            backgroundColor: 'rgba(0, 210, 255, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 2,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                display: false
            },
            y: {
                min: 20,
                max: 70,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#8a99ad' }
            }
        },
        plugins: {
            legend: { display: false }
        }
    }
});

// --- DOM ELEMENT SELECTORS ---

const tempValue = document.querySelector('#temp-val') || document.querySelector('#temp-value');
const levelVal = document.querySelector('#level-val');
const pressureVal = document.querySelector('#pressure-val');
const flowVal = document.querySelector('#flow-val');

const tankLiquid = document.querySelector('#tank-liquid') || document.querySelector('.tank-liquid');
const tankLevelText = document.querySelector('#tank-level-text');
const statusBadge = document.querySelector('#status-badge') || document.querySelector('.badge');

let alarmAcknowledged = false;

// RECEIVE INITIAL / TRIP STATUS ---

socket.on('process_status', (state) => {
    const heaterBtn = document.querySelector('#btn-heater');
    const pumpBtn = document.querySelector('#btn-pump');
    const valveBtn = document.querySelector('#btn-valve');

    if (heaterBtn) {
        heaterBtn.textContent = state.heaterOn ? 'HEATER: ON' : 'HEATER: OFF';
        heaterBtn.classList.toggle('active', state.heaterOn);
    }

    if (pumpBtn) {
        pumpBtn.textContent = state.pumpOn ? 'INLET PUMP: ON' : 'INLET PUMP: OFF';
        pumpBtn.classList.toggle('active', state.pumpOn);
    }

    if (valveBtn) {
        valveBtn.textContent = state.valveOpen ? 'OUTLET VALVE: OPEN' : 'OUTLET VALVE: CLOSED';
        valveBtn.classList.toggle('active', state.valveOpen);
    }
});

// RECEIVE LIVE TELEMETRY (1 Hz) ---

socket.on('telemetry_update', (data) => {
    const tempNum = parseFloat(data.temperature);
    const instrumentCards = document.querySelectorAll('.instrument-card');
    const tankCard = instrumentCards[0];
    const tempCard = instrumentCards[1];

    //Update Telemetry Display Texts;

    if (tempValue) tempValue.textContent = data.temperature;
    if (levelVal) levelVal.textContent = data.level;
    if (pressureVal) pressureVal.textContent = data.pressure;
    if (flowVal) flowVal.textContent = data.flowRate;

    //Tank Graphic Fill Level;

    if (tankLiquid) tankLiquid.style.height = `${data.level}%`;
    if (tankLevelText) tankLevelText.textContent = `${data.level}%`;

    // Tank High-Level Interlock Alarm Border;

    if (tankCard) {
        if (data.highLevelAlarm) {
            tankCard.classList.add('alarm-high');

        } else {
            tankCard.classList.remove('alarm-high');
        }
    }

    //Chart Update (Guarded against missing Chart instance);

    if (typeof tempChart !== 'undefined' && tempChart.data) {
        tempChart.data.labels.push(new Date().toLocaleTimeString());
        tempChart.data.datasets[0].data.push(tempNum);

        if (tempChart.data.labels.length > 20) {
            tempChart.data.labels.shift();
            tempChart.data.datasets[0].data.shift();
        }
        tempChart.update();
    }

    // Temperature Status Badge & High Alarm Border;

    if (statusBadge) {
        if (tempNum > 28.0) {
            statusBadge.textContent = 'HIGH ALARM';
            statusBadge.className = 'badge alarm';
            if (!alarmAcknowledged && tempCard) tempCard.classList.add('alarm-high');

        } else {
            alarmAcknowledged = false;
            statusBadge.textContent = 'NORMAL';
            statusBadge.className = 'badge normal';
            if (tempCard) tempCard.classList.remove('alarm-high');
        }
    }
});

// ---  BUTTON CLICK LISTENERS (ACTUATOR CONTROLS) ---

document.addEventListener('DOMContentLoaded', () => {
    const heaterBtn = document.querySelector('#btn-heater');
    const pumpBtn = document.querySelector('#btn-pump');
    const valveBtn = document.querySelector('#btn-valve');
    const ackBtn = document.querySelector('#btn-ack') || document.querySelector('.btn-ack');

    if (heaterBtn) {
        heaterBtn.addEventListener('click', () => {
            const isCurrentlyActive = heaterBtn.classList.contains('active');
            socket.emit('toggle_heater', { state: !isCurrentlyActive });
        });
    }

    if (pumpBtn) {
        pumpBtn.addEventListener('click', () => {
            const isCurrentlyActive = pumpBtn.classList.contains('active');
            socket.emit('toggle_pump', { state: !isCurrentlyActive });
        });
    }

    if (valveBtn) {
        valveBtn.addEventListener('click', () => {
            const isCurrentlyActive = valveBtn.classList.contains('active');
            socket.emit('toggle_valve', { state: !isCurrentlyActive });
        });
    }

    if (ackBtn) {
        ackBtn.addEventListener('click', () => {
            alarmAcknowledged = true;
            const tempCard = document.querySelectorAll('.instrument-card')[1];
            if (tempCard) tempCard.classList.remove('alarm-high');
        });
    }
});