/*
 * Static Finals
 */

private static final boolean VERBOSE = true;

/*
 * Attributes
 */

private Foliage foliage;

private color color_;

private ScreenClearer screenClearer;

private boolean drawFrameRate = false;

/**
 Lifecycle
 */

void setup() {
  //fullScreen(2);
  fullScreen(P3D, 2);
  //size(1920, 1080, P3D);
  //size(1920, 1080);

  smooth();
  //blendMode(DARKEST);

  println("Screen: " + width + "x" + height + "px");

  initFoliage();

  screenClearer = new ScreenClearer(
    ScreenClearerMode.FULL, 
    0, 
    4
    );
  screenClearer.performFullClear();

  setColor();
}

void draw() {

  screenClearer.applyMode();

  if (random(1f) > 0.9f) {
    setColor();
  }

  rotate_();
  drawAndUpdateBeings();

  if (drawFrameRate) {
    drawFrameRate();
  }
}

void keyPressed() {
}

/*
Implementations
 */

private void initFoliage() {
  foliage = new Foliage().initCircle();
}

private void rotate_() {
  translate(width / 2f, 0f);
  rotateY(frameCount / 128f);
  translate(-width / 2f, 0f);
}

private void drawAndUpdateBeings() {
  //stroke(frameCount / 1000, 1, 1, 1);

  final boolean foliageIsAlive = foliage.drawIfAlive(color_);
  if (!foliageIsAlive) {
    initFoliage();
  }
}

private void drawFrameRate() {
  fill(0);
  noStroke();
  rect(8, 8, 64, 24);

  stroke(0xFFFFFFFF);
  fill(0xFFFFFFFF);
  text(floor(frameRate) + "fps", 10, 20);
}

private void setColor() {
  color_ = new Palette().getRandomColorWithAlpha(150);
}

/*
 Foliage.pde
 */

class Foliage {

  /*
   * Static Finals
   */

  private static final int roundsPerDrawCall = 8;

  private static final int NUM_OF_INITIAL_NODES = 128;

  private static final int MAX_AGE = 128;

  private static final int ADD_NODE_ROUND_LIMIT = 4;

  private static final int MAX_NUM_OF_NODES = 512;

  /*
   * Attributes
   */

  private FoliageNode firstNode;

  private PVector center;

  private int numOfNodes = 0;

  private int nodeAddCounter = 0;

  private float displaySize = max(width, height);

  private float jitter = displaySize * 0.001f;

  private float nodeDensity = (int) (NUM_OF_INITIAL_NODES / 16f);

  private boolean stopped = false;

  private int age = 0;

  private float startX = width / 2f; // + random(width * 0.33f);

  private float startY = height / 2f;

  /*
   * Initialization
   */

  public Foliage() {
    center = new PVector(width / 2f, height / 2f, 0f);
  }

  public Foliage initCircle() {

    final int numberOfCircles = (int) random(5) + 1;

    FoliageNode lastNode = null;
    for (int c = 0; c < numberOfCircles; c++) {

      final float circleCenterX =startX + (getJitter() * 10f);
      final float circleCenterY = startY + (getJitter() * 10f);
      final float radius = random(displaySize * 0.01f) + displaySize * 0.001f;
      final float squeezeFactor = random(0.66f) + 0.66f;

      for (int i = 0; i < NUM_OF_INITIAL_NODES; i++) {

        final float angleOfNode = TWO_PI * ((i + 1f) / NUM_OF_INITIAL_NODES);
        final PVector vector = new PVector();

        vector.x = circleCenterX
          + ((cos(angleOfNode) * radius) * squeezeFactor)
          + getJitter();
        vector.y = circleCenterY
          + (sin(angleOfNode) * radius)
          + getJitter();
        //vector.z = 0f;

        final FoliageNode node = new FoliageNode(vector);

        if (firstNode == null) {
          firstNode = node;
          lastNode = node;
        } else if (i == NUM_OF_INITIAL_NODES - 1) {
          //mPreferredNeighbourDistance = node.distanceToNode(lastNode);
          lastNode.next = node;
          node.next = firstNode;
        } else {
          lastNode.next = node;
          lastNode = node;
        }

        ++numOfNodes;
      }
    }

    return this;
  }

  Foliage initLine() {
    //mDrawBezier = true;

    FoliageNode lastNode = null;

    for (int i = 0; i < NUM_OF_INITIAL_NODES; i++) {

      final PVector vector = new PVector();
      vector.x = ((float) i / (float) NUM_OF_INITIAL_NODES * width) + getJitter();
      vector.y = startY + getJitter();
      //vector.z = 0f;

      final FoliageNode node = new FoliageNode(vector);

      if (firstNode == null) {
        firstNode = node;
        lastNode = node;
      } else if (i == NUM_OF_INITIAL_NODES - 1) {
        //mPreferredNeighbourDistance = node.distanceToNode(lastNode);
        lastNode.next = node;
      } else {
        lastNode.next = node;
        lastNode = node;
      }

      ++numOfNodes;
    }

    return this;
  }

  /*
   * Lifecycle
   */

  public boolean drawIfAlive(final color c) {

    if (numOfNodes >= MAX_NUM_OF_NODES && ++age >= MAX_AGE) {
      return false;
    }

    stopped = false;

    noFill();
    stroke(c);
    strokeWeight(4f);
    nodeAddCounter = 0;

    for (int i = 0; i < roundsPerDrawCall; i++) {
      drawAndUpdateNodes();
    }
    return true;
  }

  private void drawAndUpdateNodes() {
    int nodeCounter = 0;
    FoliageNode currentNode = firstNode.next;
    FoliageNode nextNode;

    PVector summedVector = new PVector();
    int summedVectorsCount = 0; 

    final boolean drawOutline = true;
    final boolean drawCenterLines = false;

    if (drawOutline) {
      beginShape();
    }
    do {
      nextNode = currentNode.next;
      if (nextNode == null) {
        break;
      }

      currentNode.update();

      if (drawOutline) {
        vertex(
          currentNode.vector.x, 
          currentNode.vector.y, 
          currentNode.vector.z
          );
      }

      if (drawCenterLines) {
        line(
          currentNode.vector.x, 
          currentNode.vector.y, 
          currentNode.vector.z, 
          center.x, 
          center.y, 
          center.z
          );
      }

      if (nodeCounter % 16 == 0) {
        summedVector = PVector.add(summedVector, currentNode.vector);
        ++summedVectorsCount;
      }

      if (
        nodeAddCounter < ADD_NODE_ROUND_LIMIT
        && numOfNodes < MAX_NUM_OF_NODES
        && (nodeCounter % nodeDensity == 0)
        ) {
        addNodeNextTo(currentNode);
        ++nodeAddCounter;
      }

      currentNode = nextNode;
      ++nodeCounter;
    } while (!stopped && currentNode != firstNode);

    if (drawOutline) {
      endShape();
    }

    center = new PVector(
      summedVector.x / summedVectorsCount, 
      summedVector.y / summedVectorsCount, 
      summedVector.z / summedVectorsCount
      );

    drawSecondShape(drawOutline, drawCenterLines);
  }

  private void drawSecondShape(final boolean drawOutline, final boolean drawCenterLines) {
    FoliageNode currentNode = firstNode;
    FoliageNode nextNode;

    if (drawOutline) {
      beginShape();
    }
    do {
      nextNode = currentNode.next;
      if (nextNode == null) {
        break;
      }

      if (drawOutline) {
        vertex(
          currentNode.vector.x - width / 5f, 
          currentNode.vector.y, 
          currentNode.vector.z
          );
      }

      if (drawCenterLines) {
        line(
          currentNode.vector.x - width / 5f, 
          currentNode.vector.y, 
          currentNode.vector.z, 
          center.x, 
          center.y, 
          center.z
          );
      }

      currentNode = nextNode;
    } while (!stopped && currentNode != firstNode);
    if (drawOutline) {
      endShape();
    }
  }

  private void addNodeNextTo(final FoliageNode node) {
    final FoliageNode oldNeighbour = node.next;
    if (oldNeighbour == null) {
      return;
    }

    final FoliageNode newNeighbour = new FoliageNode();

    newNeighbour.vector = PVector.add(node.vector, oldNeighbour.vector).mult(0.5f);

    node.next = newNeighbour;
    newNeighbour.next = oldNeighbour;

    ++numOfNodes;
  }

  public void stopPerforming() {
    stopped = true;
  }

  private float getJitter() {
    return jitter * 0.5f - random(jitter);
  }
}

/*
FoliageNode.pde
*/

public class FoliageNode {

  private FoliageNode next;

  private PVector vector;

  private float displaySize = max(width, height);

  private float pushForce = displaySize * 0.0047f;

  private float jitter = displaySize * 0.0005f;

  private float radius = displaySize / 256f;

  private float neighbourGravity = -radius * 0.5f;

  private float preferredNeighbourDistance = displaySize * 0.001f;

  private float maxPushDistance = displaySize * 0.1f;

  private FoliageNode() {
  }

  private FoliageNode(final PVector vector_) {
    vector = vector_;
  }

  @Override
    public String toString() {
    return "[Line " + super.toString() + " at " + vector.x + ", " + vector.y + "]";
  }

  private float distanceToNode(final FoliageNode otherNode) {
    return PVector.dist(vector, otherNode.vector);
  }

  private PVector vectorToOtherNode(final FoliageNode otherNode) {
    return PVector.sub(otherNode.vector, vector);
  }

  private float angle(final FoliageNode otherNode) {
    return angle(vector.x, vector.y, otherNode.vector.x, otherNode.vector.y);
  }

  private float angle(
    final float x1, 
    final float y1, 
    final float x2, 
    final float y2
    ) {
    final float calcAngle = atan2(
      -(y1 - y2), 
      x2 - x1
      );

    if (calcAngle < 0) {
      return calcAngle + TWO_PI;
    } else {
      return calcAngle;
    }
  }

  public void update() {

    vector.x += getJitter();
    vector.y += getJitter();
    vector.z += getJitter();

    updateAcceleration();
  }

  private void updateAcceleration() {
    FoliageNode otherNode = next;

    float force = 0f;
    float angle = 0f;

    addAccelerationToAttractor();

    do {

      final float distance = distanceToNode(otherNode);

      if (distance > maxPushDistance) {
        otherNode = otherNode.next;
        continue;
      }

      final PVector vectorToOtherNode = vectorToOtherNode(otherNode);
      //println("From: " + components(vector) + " to: " + components(otherNode.vector) + " --> : " + components(vectorToOtherNode));
      angle = angle(otherNode) + (angle * 0.05);

      force *= 0.05;

      if (otherNode == next) {

        if (distance > preferredNeighbourDistance) {
          //                        force = mPreferredNeighbourDistanceHalf;
          force += (distance / pushForce);
        } else {
          force -= neighbourGravity;
        }
      } else {

        if (distance < radius) {
          force -= radius;
        } else {
          force -= (pushForce / distance);
        }
      }

      vector.add(vectorToOtherNode.setMag(force));

      otherNode = otherNode.next;
    } while (otherNode != null && otherNode != this);
  }

  private void addAccelerationToAttractor() {
    final PVector attractorPosition = new PVector(width / 2f, height / 2f);
    final PVector vectorToAttractor = PVector.sub(vector, attractorPosition);
    final float forceToAttractor = -2f;
    vector.add(vectorToAttractor.setMag(forceToAttractor));
  }

  private float getJitter() {
    return jitter * 0.5f - random(jitter);
  }
}

/*
Palette.pde
*/

public class Palette {
  
  public Palette() {
  }
  
  public color getRandomColorWithAlpha(int alpha) {
    return (getRandomColor() & 0xFFFFFF) | (alpha << 24);
  }

  public color getRandomColor() {
    switch ((int) random(6f)) {
    case 0:
      return 0xFFFF00FF;
    case 1:
      return 0xFFFFFF00;
    case 2:
      return 0xFFFF0000;
    case 3:
      return 0xFF0000FF;
    case 4:
      return 0xFF00FF00;
    default:
      return 0xFF00FFFF;
    }
  }
}

/*
ScreenClearer.pde
*/

public class ScreenClearer {

  private final ScreenClearerMode mode;

  private final color color_;

  private final int fadeAlpha;

  public ScreenClearer(final ScreenClearerMode mode_, final color color__) {
    this(mode_, color__, 100);
  }

  public ScreenClearer(final ScreenClearerMode mode_, final color color__, final int fadeAlpha_) {
    mode = mode_;
    color_ = color__;
    fadeAlpha = fadeAlpha_;
  }

  public void applyMode() {
    switch (mode) {
    case FULL:
      performFullClear();
      return;
    case FADE:
      noStroke();
      fill(getFadeColor());
      rect(0f, 0f, width, height);
      return;
    default:
      return;
    }
  }

  public void performFullClear() {
    background(color_);
  }

  public color getFadeColor() {
    return (color_ & 0xffffff) | (fadeAlpha << 24);
  }
}

public enum ScreenClearerMode {
  FULL, FADE, NONE
}