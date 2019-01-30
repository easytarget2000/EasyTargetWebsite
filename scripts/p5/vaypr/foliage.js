class Foliage {

    constructor(
        numOfInitialNodes,
        jitter,
        startX,
        startY,
        minRadius,
        maxRadius,
        numberOfCircles = 4
    ) {
        this.numOfInitialNodes = numOfInitialNodes;
        this.jitter = jitter;
        this.startX = startX;
        this.startY = startY;

        this.firstNode;

        this.age = 0;
        this.maxAge = 1024 * 32;

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
        let circleCenterX = startX;
        let circleCenterY = startY;

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
        return this.jitter * (0.5 - random(this.jitter));
    }

}