socket.on('telemetry_update', (data) => {
    const tempNum = parseFloat(data.temperature);
    const tankCard = document.querySelectorAll('.instrument-card')[0];
    const tempCard = document.querySelectorAll('.instrument-card')[1];

    //Display Values;

    if (tempValue) tempValue.textContent = data.temperature;
    if (levelVal) levelVal.textContent = data.level;
    if (pressureVal) pressureVal.textContent = data.pressure;
    if (flowVal) flowVal.textContent = data.flowRate;

    //Tank Visual Height;

    if (tankLiquid && tankLevelText) {
        tankLiquid.style.height = `${data.level}%`;
        tankLevelText.textContent = `${data.level}%`;
    }

    //Tank High-Level Red Alarm Border;

    if (tankCard) {
        if (data.highLevelAlarm) {
            tankCard.classList.add('alarm-high');
        } else {
            tankCard.classList.remove('alarm-high');
        }
    }

    //Temperature Chart & Alarm;

    tempChart.data.labels.push(new Date().toLocaleTimeString());
    tempChart.data.datasets[0].data.push(tempNum);

    if (tempChart.data.labels.length > 20) {
        tempChart.data.labels.shift();
        tempChart.data.datasets[0].data.shift();
    }
    tempChart.update();

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