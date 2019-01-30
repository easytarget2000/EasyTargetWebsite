var foliage = {};
var color_ = {};
var backgroundColor = {};
var numOfInitialNodes = 64;
var numOfRoundsPerFrame = 1;

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

    if (random(1.0) > 0.9) {
        setColor();
    }

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
    color_ = color(255, 255, 255, 60);
}

function getDisplaySize() {
    return min(width, height);
}

/*
 * Foliage
 */

class Foliage {

    constructor(numOfInitialNodes, jitter, startX, startY, minRadius, maxRadius, numberOfCircles = 4) {
        this.numOfInitialNodes = numOfInitialNodes;
        this.jitter = jitter;
        this.startX = startX;
        this.startY = startY;

        this.firstNode;

        this.age = 0;
        this.maxAge = 1024 * 64;

        this.totalNodeCounter = 0;
        this.maxNumOfNodesAddedPerRound = 4;
        this.maxNumOfTotalNodes = 256;
        this.nodeDensity = numOfInitialNodes / 16;
        this.stopped = false;

        this.addNodes = false;

        this.initCircle(minRadius, maxRadius);
    }

    initCircle(minRadius, maxRadius) {
        var lastNode;
        let circleCenterX = startX + (this.getJitter() * 10.0);
        let circleCenterY = startY + (this.getJitter() * 10.0);

        let radius = maxRadius;
        let squeezeFactor = random(0.66) + 0.66;

        for (var nodeIndex = 0; nodeIndex < this.numOfInitialNodes; nodeIndex++) {
            let angleOfNode = TWO_PI * ((nodeIndex + 1) / this.numOfInitialNodes);
            let x = circleCenterX
                + ((cos(angleOfNode) * radius) * squeezeFactor)
                + this.getJitter();
            let y = circleCenterY
                + (sin(angleOfNode) * radius)
                + this.getJitter();

            let node = new FoliageNode(createVector(x, y), this.jitter);
            if (this.firstNode == undefined) {
                this.firstNode = node;
                lastNode = node;
            } else if (nodeIndex == this.numOfInitialNodes - 1) {
                //mPreferredNeighbourDistance = node.distanceToNode(lastNode);
                lastNode.next = node;
                node.next = this.firstNode;
            } else {
                lastNode.next = node;
                lastNode = node;
            }
        }

        ++this.totalNodeCounter;
    }

    drawIfAlive(color_, numOfRounds = 1, drawOutline = true) {
        if (++this.age > this.maxAge) {
            return false;
        }

        noFill();
        stroke(color_);
        strokeWeight(1.0);

        this.nodeAddCounter = 0;

        for (var i = 0; i < numOfRounds; i++) {
            this.drawAndUpdateNodes(drawOutline);
        }

        return true;
    }

    stop() {
        this.stopped = true;
    }

    drawAndUpdateNodes(drawOutline) {
        var currentNode = this.firstNode;
        var nextNode;
        var nodeCounter = 0;

        if (drawOutline) {
            beginShape();
        }

        do {
            nextNode = currentNode.next;
            if (nextNode == undefined) {
                break;
            }

            currentNode.update();

            if (drawOutline) {
                curveVertex(
                    currentNode.positionVector.x,
                    currentNode.positionVector.y
                    // currentNode.positionVector.z
                );
            } else {
            }

            if (
                this.nodeAddCounter < this.maxNumOfNodesAddedPerRound
                && this.totalNodeCounter < this.maxNumOfTotalNodes
                && (nodeCounter % this.nodeDensity == 0)
                && this.addNodes
            ) {
                this.addNodeNextTo(currentNode);
            }

            currentNode = nextNode;
            ++nodeCounter;
        } while (!this.stopped && currentNode !== this.firstNode);

        // DEBUG: Draw last node bigger.
        strokeWeight(1.0);
        point(
            currentNode.positionVector.x,
            currentNode.positionVector.y,
            currentNode.positionVector.z
        );

        if (drawOutline) {
            endShape(CLOSE);
        }
    }

    addNodeNextTo(node) {
        let oldNeighbour = node.next;
        if (oldNeighbour == undefined) {
            return;
        }

        let newNeighbourPos = p5.Vector
            .add(node.positionVector, oldNeighbour.positionVector)
            .mult(0.5);

        let newNeighbour = new FoliageNode(
            newNeighbourPos,
            this.jitter
        );

        node.next = newNeighbour;
        newNeighbour.next = oldNeighbour;

        ++this.nodeAddCounter;
        ++this.totalNodeCounter;
    }

    getJitter() {
        return this.jitter * 0.5 - random(this.jitter);
    }

}

/*
 * FoliageNode
 */

class FoliageNode {

    constructor(positionVector, jitter) {
        this.positionVector = positionVector;
        this.jitter = jitter;
        this.next;

        let displaySize = getDisplaySize();
        this.pushForce = displaySize * 0.0047;
        this.radius = displaySize / 256.0;
        this.neighbourGravity = -this.radius / 1.5;
        this.preferredNeighbourDistance = 2.0;
        this.maxPushDistance = displaySize
    }

    update() {
        this.positionVector.x += this.getJitter();
        this.positionVector.y += this.getJitter();
        this.positionVector.z += this.getJitter();

        this.updateAcceleration();
    }

    updateAcceleration() {
        var otherNode = this.next;

        var force = 0.0;
        var angle = 0.0;

        // this.addAccelerationToAttractor();
        var accelerationVector = createVector(0.0, 0.0, 0.0);

        do {
            let distance = this.distanceToNode(otherNode);

            if (distance > this.maxPushDistance) {
                otherNode = otherNode.next;
                continue;
            }

            let vectorToOtherNode = this.vectorToOtherNode(otherNode);
            angle = this.angle(otherNode) + (angle * 0.05);

            force *= 0.05;

            if (otherNode == this.next) {

                if (distance > this.preferredNeighbourDistance) {
                    // force = mPreferredNeighbourDistanceHalf;
                    force += (distance / this.pushForce);
                } else {
                    force -= this.neighbourGravity;
                }
            } else {

                if (distance < this.radius) {
                    force -= this.radius;
                } else {
                    force -= (this.pushForce / distance);
                }
            }

            accelerationVector.add(vectorToOtherNode.setMag(force));

            otherNode = otherNode.next;
        } while (otherNode !== undefined && otherNode !== this);

        this.positionVector.add(accelerationVector);
    }

    distanceToNode(otherNode) {
        return p5.Vector.dist(this.positionVector, otherNode.positionVector);
    }

    vectorToOtherNode(otherNode) {
        return p5.Vector.sub(otherNode.positionVector, this.positionVector);
    }

    angle(otherNode) {
        return angle(
            this.positionVector.x,
            this.positionVector.y,
            otherNode.positionVector.x,
            otherNode.positionVector.y
        );
    }

    angle(x1, y1, x2, y2) {
        let calcAngle = atan2(
            -(y1 - y2),
            x2 - x1
        );

        if (calcAngle < 0) {
            return calcAngle + TWO_PI;
        } else {
            return calcAngle;
        }
    }

    getJitter() {
        return (this.jitter * 0.5) - random(this.jitter);
    }
}