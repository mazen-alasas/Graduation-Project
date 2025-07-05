let canvas, ctx, centerX, centerY, radius;
let currentSpeed = 0;
let targetSpeed = 0;
let animationId = null;
let speedUpdateInterval = null;


function initSpeedometer() {
    canvas = document.getElementById('speedometer');
    if (!canvas) return;

    ctx = canvas.getContext('2d');


    resizeSpeedometer();


    setTargetSpeed(0);


    startAnimation();


    window.addEventListener('resize', resizeSpeedometer);
}


function resizeSpeedometer() {
    if (!canvas) return;


    canvas.width = canvas.offsetWidth;
    canvas.height = 200;


    centerX = canvas.width / 2;
    centerY = canvas.height - 30;
    radius = Math.min(canvas.width, canvas.height) / 2;


    drawSpeedometer(currentSpeed);
}


function drawSpeedometer(speed) {
    if (!ctx) return;


    ctx.clearRect(0, 0, canvas.width, canvas.height);


    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 20;
    ctx.stroke();


    const angle = ((speed / 180) * Math.PI) + Math.PI;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, angle);


    let speedColor;
    if (speed < 60) {
        speedColor = '#00ffff';
    } else if (speed < 120) {
        speedColor = '#ffff00';
    } else {
        speedColor = '#ff3300';
    }

    ctx.strokeStyle = speedColor;
    ctx.lineWidth = 20;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round(speed), centerX, centerY - 20);

    ctx.font = '14px Arial';
    ctx.fillText('km/h', centerX, centerY + 10);

    for (let i = 0; i <= 180; i += 20) {
        const angle = ((i / 180) * Math.PI) + Math.PI;
        const startRadius = radius - 15;
        const endRadius = radius + 15;

        const startX = centerX + Math.cos(angle) * startRadius;
        const startY = centerY + Math.sin(angle) * startRadius;
        const endX = centerX + Math.cos(angle) * endRadius;
        const endY = centerY + Math.sin(angle) * endRadius;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // إضافة أرقام السرعة
        if (i % 40 === 0) {
            const textRadius = radius + 30;
            const textX = centerX + Math.cos(angle) * textRadius;
            const textY = centerY + Math.sin(angle) * textRadius;

            ctx.font = '12px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.textAlign = 'center';
            ctx.fillText(i.toString(), textX, textY);
        }
    }
}

let lastSpeedometerUpdate = 0;
const speedometerUpdateInterval = 1000 / 30;

function animateSpeedometer() {

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    const animate = (currentTime) => {
        const deltaTime = currentTime - lastSpeedometerUpdate;
        if (deltaTime < speedometerUpdateInterval) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        lastSpeedometerUpdate = currentTime;

        const diff = targetSpeed - currentSpeed;

        if (Math.abs(diff) < 0.5) {
            currentSpeed = targetSpeed;

            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        } else {
            currentSpeed += diff * 0.1;
            animationId = requestAnimationFrame(animate);
        }


        if (typeof window.updateSpeed === 'function') {
            window.updateSpeed(currentSpeed);
        }
        drawSpeedometer(currentSpeed);
    };


    animationId = requestAnimationFrame(animate);
}


function setTargetSpeed(newSpeed) {

    newSpeed = Math.max(0, Math.min(180, newSpeed));


    targetSpeed = newSpeed;

  
    if (typeof window.updateSpeed === 'function') {
        window.updateSpeed(newSpeed);
    }


    if (!animationId) {
        startAnimation();
    }
}


function getCurrentSpeed() {
    return Math.round(currentSpeed);
}


window.speedometer = {
    setSpeed: setTargetSpeed,
    getSpeed: getCurrentSpeed
};


function startAnimation() {
    animateSpeedometer();
}


function stopSpeedometer() {

    if (speedUpdateInterval) {
        clearInterval(speedUpdateInterval);
    }


    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}


function connectToFirebase() {

    if (typeof window.FirebaseSpeedManager !== 'undefined') {


        window.FirebaseSpeedManager.listenToSpeedChanges((speed) => {
            setTargetSpeed(speed);
            if (typeof window.DistanceTimeTracker !== 'undefined') {
                window.DistanceTimeTracker.onSpeedChange(speed);
            }
        });

        window.FirebaseSpeedManager.getCurrentSpeed()
            .then(speed => {
                setTargetSpeed(speed);
                if (typeof window.DistanceTimeTracker !== 'undefined') {
                    window.DistanceTimeTracker.onSpeedChange(speed);
                }
            })
            .catch(error => {

                setTargetSpeed(0);
                if (typeof window.DistanceTimeTracker !== 'undefined') {
                    window.DistanceTimeTracker.onSpeedChange(0);
                }
            });


    } else {

        setTimeout(connectToFirebase, 1000);
    }
}

// تحديث السرعة في Firebase عند التغيير اليدوي
function updateFirebaseSpeed(speed) {
    if (typeof window.FirebaseSpeedManager !== 'undefined') {
        window.FirebaseSpeedManager.updateSpeed(speed);
    }
}

// تحسين وظيفة تعيين السرعة المستهدفة
function setTargetSpeedWithFirebase(newSpeed) {
    setTargetSpeed(newSpeed);
    updateFirebaseSpeed(newSpeed);
}


window.speedometer = {
    setSpeed: setTargetSpeed,
    setSpeedWithFirebase: setTargetSpeedWithFirebase,
    getSpeed: getCurrentSpeed,
    connectToFirebase: connectToFirebase
};


document.addEventListener('DOMContentLoaded', () => {
    initSpeedometer();

    setTimeout(connectToFirebase, 500);
});


window.addEventListener('beforeunload', stopSpeedometer);
