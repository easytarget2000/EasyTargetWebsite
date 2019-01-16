var strokeStyle = "rgba(255, 255, 255, 0.2)"
var autoMoverPos = [0, 0];
var autoMoverVelocity = [0, 0];
var autoMoverInterval = 32;
var maxAutoMoverVelocity = 32;
var autoMoveChangeVelocityProbability = 0.1;
var autoMoveChangePosProbability = 0.1;

window.onload = function() {
    var canvas = document.getElementById("background");
    setupCanvas(canvas);
    
};

function setupCanvas(canvas) {
    let width = window.innerWidth;
    let height = window.innerHeight;

    let context = canvas.getContext("2d");            
    context.canvas.width = width;
    context.canvas.height = height;
    context.strokeStyle = strokeStyle;

    canvas.addEventListener(
        "mousemove",
        function onMouseover(e) {
            let mouseX = e.clientX - 8;
            let mouseY = e.clientY - 8;                             
            drawShape(context, mouseX, mouseY);
        }
    );

    let useAutoMover = true
    if (useAutoMover) {
        initAutoMoverPos();
        initAutoMoverVelocity(width, height);
        setInterval(
            function autoMoveIntervalTriggered(handler) {
                autoMove(context)
            },
            autoMoverInterval
        )
    }
}

function drawShape(context, X, Y) {
    context.beginPath();
    context.moveTo(0, Y);
    let width = context.canvas.width
    context.lineTo(width, Y);
    context.stroke() 
}

function autoMove(context) {
    drawShape(context, autoMoverPos[0], autoMoverPos[1]);

    autoMoverPos[0] += autoMoverVelocity[0];
    autoMoverPos[1] += autoMoverVelocity[1];

    if (autoMoverPos[0] < 0 || autoMoverPos[0] > context.canvas.width) {
        autoMoverVelocity[0] *= -1;
    }
    if (autoMoverPos[1] < 0 || autoMoverPos[1] > context.canvas.height) {
        autoMoverVelocity[1] *= -1;
    }
    
    if (Math.random() > (1.0 - autoMoveChangePosProbability)) {
        initAutoMoverPos(context.canvas.width, context.canvas.height);
    }

    if (Math.random() > (1.0 - autoMoveChangeVelocityProbability)) {
        initAutoMoverVelocity()
    }
}

function initAutoMoverPos(width, height) {
    autoMoverPos = [Math.random() * width, Math.random() * height];
}

function initAutoMoverVelocity() {
    autoMoverVelocity[0] = (maxAutoMoverVelocity / 2) - (Math.random(1) * maxAutoMoverVelocity);
    autoMoverVelocity[1] = (maxAutoMoverVelocity / 2) - (Math.random(1) * maxAutoMoverVelocity);
}