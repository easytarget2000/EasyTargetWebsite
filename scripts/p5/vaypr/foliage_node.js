class FoliageNode {

    constructor(positionVector, jitter) {
        let pushForceRatio = 0.005;
        let radiusRatio = 1.0 / 256.0;
        let neighbourGravityRatio = 1.0 / 1.1   ;
        let preferredNeighbourDistanceRatio = 0.1;

        this.positionVector = positionVector;
        this.jitter = jitter;
        this.next;

        let displaySize = getDisplaySize();
        this.pushForce = displaySize * pushForceRatio;
        this.radius = displaySize * radiusRatio;
        this.neighbourGravity = -this.radius * neighbourGravityRatio;
        this.preferredNeighbourDistance = displaySize * preferredNeighbourDistanceRatio;
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
