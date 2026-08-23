// --- STATE VARIABLES ---
let alarmAcknowledged = false;
let heaterState = false;
let pumpState = false;
let valveState = false;

// --- DOM REFERENCES ---
const socket = io();

// Instrumentation & Telemetry Elements
const tempValue = document.getElementById('temp-value');
const levelVal = document.getElementById('level-val');
const pressureVal = document.getElementById('pressure-val');
const flowVal = document.getElementById('flow-val');

// Tank Visuals & Alarm Badges
const tankLiquid = document.getElementById('tank-liquid');
const tankLevelText = document.getElementById('tank-level-text');
const statusBadge = document.getElementById('status-badge');
const card = document.querySelector('.instrument-card');

// Control Buttons
const ackBtn = document.getElementById('ack-btn');
const heaterBtn = document.getElementById('heater-btn');
const pumpBtn = document.getElementById('pump-btn');
const valveBtn = document.getElementById('valve-btn');

// --- CHART.JS SETUP ---
const ctx = document.getElementById('tempChart').getContext('2d');
const tempChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperature (°C)',
            data: [],
            borderColor: '#ff4500',
            borderWidth: 2,
            pointRadius: 3,
            spanGaps: true,
            fill: false
        }]
    },
    options: {
        animation: false,
        scales: {
            x: { display: true },
            y: { suggestedMin: 10, suggestedMax: 60 }
        }
    }
});

// --- REAL-TIME TELEMETRY LISTENER ---
socket.on('telemetry_update', (data) => {
    const tempNum = parseFloat(data.temperature);

    // 1. Update Display Values
    if (tempValue) tempValue.textContent = data.temperature;
    if (levelVal) levelVal.textContent = data.level;
    if (pressureVal) pressureVal.textContent = data.pressure;
    if (flowVal) flowVal.textContent = data.flowRate;

    // 2. Update Tank Visual Height
    if (tankLiquid && tankLevelText) {
        tankLiquid.style.height = `${data.level}%`;
        tankLevelText.textContent = `${data.level}%`;
    }

    // 3. Update Chart
    tempChart.data.labels.push(new Date().toLocaleTimeString());
    tempChart.data.datasets[0].data.push(tempNum);

    if (tempChart.data.labels.length > 20) {
        tempChart.data.labels.shift();
        tempChart.data.datasets[0].data.shift();
    }
    tempChart.update();

    // 4. Alarm State Machine
    if (statusBadge) {
        if (tempNum > 28.0) {
            statusBadge.textContent = 'HIGH ALARM';
            statusBadge.className = 'badge alarm';

            if (!alarmAcknowledged && card) {
                card.classList.add('alarm-high');
            }
        } else {
            alarmAcknowledged = false;
            statusBadge.textContent = 'NORMAL';
            statusBadge.className = 'badge normal';

            if (card) card.classList.remove('alarm-high');
        }
    }
});

// --- ACTUATOR CONTROL EVENTS ---
if (ackBtn) {
    ackBtn.addEventListener('click', () => {
        alarmAcknowledged = true;
        if (card) card.classList.remove('alarm-high');
    });
}

if (heaterBtn) {
    heaterBtn.addEventListener('click', () => {
        heaterState = !heaterState;
        socket.emit('toggle_heater', { state: heaterState });
    });
}

if (pumpBtn) {
    pumpBtn.addEventListener('click', () => {
        pumpState = !pumpState;
        socket.emit('toggle_pump', { state: pumpState });
    });
}

if (valveBtn) {
    valveBtn.addEventListener('click', () => {
        valveState = !valveState;
        socket.emit('toggle_valve', { state: valveState });
    });
}

// --- SYNC PROCESS STATES ACROSS CLIENTS ---
socket.on('process_status', (state) => {
    heaterState = state.heaterOn;
    pumpState = state.pumpOn;
    valveState = state.valveOpen;

    if (heaterBtn) {
        heaterBtn.textContent = `HEATER: ${heaterState ? 'ON' : 'OFF'}`;
        heaterBtn.classList.toggle('active', heaterState);
    }
    if (pumpBtn) {
        pumpBtn.textContent = `INLET PUMP: ${pumpState ? 'ON' : 'OFF'}`;
        pumpBtn.classList.toggle('active', pumpState);
    }
    if (valveBtn) {
        valveBtn.textContent = `OUTLET VALVE: ${valveState ? 'OPEN' : 'CLOSED'}`;
        valveBtn.classList.toggle('active', valveState);
    }
});