let distanceTimeData = {
    totalDistance: 0,
    totalTime: 0,
    startTime: null,
    lastUpdateTime: null,
    currentSpeed: 0,
    isTracking: false,
    updateInterval: null
};


const STORAGE_KEYS = {
    TOTAL_DISTANCE: 'car_total_distance',
    TOTAL_TIME: 'car_total_time',
    START_TIME: 'car_start_time',
    IS_TRACKING: 'car_is_tracking'
};


function initDistanceTimeTracker() {
    console.log('🚗 Initializing Distance & Time Tracker...');

    loadSavedData();

    updateDisplay();

    if (distanceTimeData.isTracking || sessionStorage.getItem(STORAGE_KEYS.IS_TRACKING) === null) {
        startTracking();
    }

    console.log('✅ Distance & Time Tracker initialized');
}


function loadSavedData() {
    try {
        const savedDistance = sessionStorage.getItem(STORAGE_KEYS.TOTAL_DISTANCE);
        if (savedDistance !== null) {
            distanceTimeData.totalDistance = parseFloat(savedDistance) || 0;
        }

        const savedTime = sessionStorage.getItem(STORAGE_KEYS.TOTAL_TIME);
        if (savedTime !== null) {
            distanceTimeData.totalTime = parseInt(savedTime) || 0;
        }

        const savedStartTime = sessionStorage.getItem(STORAGE_KEYS.START_TIME);
        if (savedStartTime !== null) {
            distanceTimeData.startTime = parseInt(savedStartTime);
        }

        const savedTracking = sessionStorage.getItem(STORAGE_KEYS.IS_TRACKING);
        if (savedTracking !== null) {
            distanceTimeData.isTracking = savedTracking === 'true';
        }

        console.log('📂 Loaded saved data:', {
            distance: distanceTimeData.totalDistance,
            time: distanceTimeData.totalTime,
            tracking: distanceTimeData.isTracking
        });

    } catch (error) {
        console.warn('⚠️ Error loading saved data:', error);
        resetData();
    }
}


function saveData() {
    try {
        sessionStorage.setItem(STORAGE_KEYS.TOTAL_DISTANCE, distanceTimeData.totalDistance.toString());
        sessionStorage.setItem(STORAGE_KEYS.TOTAL_TIME, distanceTimeData.totalTime.toString());
        sessionStorage.setItem(STORAGE_KEYS.START_TIME, distanceTimeData.startTime?.toString() || '');
        sessionStorage.setItem(STORAGE_KEYS.IS_TRACKING, distanceTimeData.isTracking.toString());
    } catch (error) {
        console.warn('⚠️ Error saving data:', error);
    }
}


function startTracking() {
    if (distanceTimeData.isTracking) {
        console.log('⚠️ Tracking already started');
        return;
    }

    distanceTimeData.isTracking = true;
    distanceTimeData.startTime = distanceTimeData.startTime || Date.now();
    distanceTimeData.lastUpdateTime = Date.now();

    distanceTimeData.updateInterval = setInterval(updateDistanceAndTime, 1000);

    saveData();

    console.log('▶️ Distance & Time tracking started');
}


function stopTracking() {
    if (!distanceTimeData.isTracking) {
        console.log('⚠️ Tracking already stopped');
        return;
    }

    distanceTimeData.isTracking = false;

    if (distanceTimeData.updateInterval) {
        clearInterval(distanceTimeData.updateInterval);
        distanceTimeData.updateInterval = null;
    }

    saveData();

    console.log('⏹️ Distance & Time tracking stopped');
}


function updateDistanceAndTime() {
    if (!distanceTimeData.isTracking || !document.hidden) {
        const currentTime = Date.now();

        const timeDelta = (currentTime - distanceTimeData.lastUpdateTime) / 1000;

        distanceTimeData.totalTime += timeDelta;


        if (distanceTimeData.currentSpeed > 0) {
            const distanceDelta = (distanceTimeData.currentSpeed * timeDelta) / 3600; 
            distanceTimeData.totalDistance += distanceDelta;
        }

        distanceTimeData.lastUpdateTime = currentTime;

        updateDisplay();

        saveData();
    }
}


function updateCurrentSpeed(speed) {
    distanceTimeData.currentSpeed = Math.max(0, speed); 
}

function updateDisplay() {
    const distanceElement = document.getElementById('distance-value');
    if (distanceElement) {
        const formattedDistance = distanceTimeData.totalDistance.toFixed(1);
        distanceElement.textContent = formattedDistance;
        console.log(`📊 Distance display updated: ${formattedDistance} km`);
    } else {
        console.warn('⚠️ Distance element not found!');
    }

    const timeElement = document.getElementById('time-value');
    if (timeElement) {
        const formattedTime = formatTime(distanceTimeData.totalTime);
        timeElement.textContent = formattedTime;
        console.log(`⏰ Time display updated: ${formattedTime}`);
    } else {
        console.warn('⚠️ Time element not found!');
    }
}


function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    } else {
        return `0:${minutes.toString().padStart(2, '0')}`;
    }
}


function resetData() {
    distanceTimeData.totalDistance = 0;
    distanceTimeData.totalTime = 0;
    distanceTimeData.startTime = Date.now();
    distanceTimeData.lastUpdateTime = Date.now();
    distanceTimeData.currentSpeed = 0;
    distanceTimeData.isTracking = false;

    localStorage.removeItem(STORAGE_KEYS.TOTAL_DISTANCE);
    localStorage.removeItem(STORAGE_KEYS.TOTAL_TIME);
    localStorage.removeItem(STORAGE_KEYS.START_TIME);
    localStorage.removeItem(STORAGE_KEYS.IS_TRACKING);

    saveData();

    updateDisplay();

    console.log('🔄 Distance & Time data reset');
}


function getStats() {
    return {
        totalDistance: distanceTimeData.totalDistance,
        totalTime: distanceTimeData.totalTime,
        averageSpeed: distanceTimeData.totalTime > 0 ?
            (distanceTimeData.totalDistance / (distanceTimeData.totalTime / 3600)) : 0,
        currentSpeed: distanceTimeData.currentSpeed,
        isTracking: distanceTimeData.isTracking,
        formattedTime: formatTime(distanceTimeData.totalTime)
    };
}


function onSpeedChange(speed) {
    if (speed !== undefined && typeof speed === 'number') {
        console.log(`⚡️ Speed changed (external): ${speed} km/h`);
        updateCurrentSpeed(speed);
    }
}


window.DistanceTimeTracker = {

    start: startTracking,
    stop: stopTracking,
    reset: resetData,


    updateSpeed: updateCurrentSpeed,
    onSpeedChange: onSpeedChange,


    getStats: getStats,
    getTotalDistance: () => distanceTimeData.totalDistance,
    getTotalTime: () => distanceTimeData.totalTime,
    getCurrentSpeed: () => distanceTimeData.currentSpeed,
    isTracking: () => distanceTimeData.isTracking,

    save: saveData,
    load: loadSavedData,

    updateDisplay: updateDisplay
};

window.updateSpeed = onSpeedChange;

document.addEventListener('DOMContentLoaded', initDistanceTimeTracker);

window.addEventListener('beforeunload', () => {
    if (distanceTimeData.isTracking) {
        saveData();
    }
});
console.log('📊 Distance & Time Tracker module loaded');

