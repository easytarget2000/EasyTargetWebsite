var foliage = {};
var color_ = {};
var backgroundColor = {};
var numOfInitialNodes = 64;
var numOfRoundsPerFrame = 1;
var colorAlpha = 60;
var colorMinBrightness = 32.0;

function setup() {
    createCanvas(windowWidth, windowHeight);

    initBackground();

    smooth();
    initFoliage();
    setColor();
}

function draw() {
    // background(0);
    stroke(250);
    noFill();

    setColor();

    // rotate_();
    drawAndUpdateFoliages();
}

function keyPressed() {
}

function initBackground() {
    backgroundColor = color('#0E0E0E');
    background(backgroundColor);
}

function initFoliage() {
    let displaySize = getDisplaySize();
    foliage = new Foliage(
        numOfInitialNodes,
        jitter = displaySize / 128.0,
        startX = width / 2.0,
        startY = height / 2.0,
        minRadius = displaySize / 32.0,
        maxRadius = minRadius + random(displaySize / 16.0)
    );
}

function drawAndUpdateFoliages() {
    //stroke(frameCount / 1000, 1, 1, 1);

    let foliageIsAlive = foliage.drawIfAlive(color_, numOfRoundsPerFrame);
    if (!foliageIsAlive) {
        initFoliage();
    }
}

function setColor() {
    let brightness = colorMinBrightness + ((255.0 - colorMinBrightness) * (mouseX / width));
    color_ = color(brightness, brightness, brightness, colorAlpha);
}

function getDisplaySize() {
    return min(width, height);
}
