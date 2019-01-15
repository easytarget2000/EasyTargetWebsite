var strokeStyle = "rgba(255, 255, 255, 0.2)"
var autoMoverPos;
var autoMoverVelocity;
var autoMoverInterval = 16;
var autoMoverVelocityJitter = 32;
var randomAutoMovePosProbability = 0.1;

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

    let useAutoMover = false
    if (useAutoMover) {
        initRandomAutoMovePos(width, height);
        autoMoverVelocity = [autoMoverVelocityJitter, autoMoverVelocityJitter];
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

    autoMoverVelocity[0] += (autoMoverVelocityJitter / 2) - Math.random(autoMoverVelocityJitter);
    autoMoverVelocity[1] += (autoMoverVelocityJitter / 2) - Math.random(autoMoverVelocityJitter);
}

function initRandomAutoMovePos(width, height) {
    autoMoverPos = [Math.random(1) * width, Math.random(1) * height];
}