let spritesheet;
let bug;
let animations = [];

const GameState = {
  start: "Start",
  Playing: "Playing",
  GameOver: "GameOver"
};

let game = {
  score: 0, maxScore: 0, maxTime: 10, elaspedTime: 0,
  totalSprites: 15, state: GameState.start, targetSprite: 2 };

function preload() {
  bug = loadImage("stinkbug.png");
}

function setup() {
  createCanvas(400, 400);
  imageMode(CENTER);
  angleMode(DEGREES);

  reset();
}

function reset() {
  game.elaspedTime = 0;
  game.score = 0;
  game.totalSprites = random(10, 30);

  animations = [];
  for (let i = 0; i < game.totalSprites; i++) { // each frame is 64 x 64
    animations[i] = new WalkingAnimation(bug, 64, 64, random(50, 350),
      random(100, 350), 9, random(0.5, 1), 6, random([0,1]));
  }
}

function draw() {
  switch (game.state) {
    case GameState.Playing:
      background(220);

      for (let i = 0; i < animations.length; i++) {
        animations[i].draw();
      }
      fill(0);
      textSize(40);
      text(game.score,20,40);
      let currentTime = game.maxTime - game.elaspedTime;
      text(ceil(currentTime), 300, 40);
      game.elaspedTime += deltaTime / 1000;

      if (currentTime < 0)
        game.state = GameState.GameOver;
      break;
    case GameState.GameOver:
      game.maxScore = max(game.score, game.maxScore);

      background(0);
      fill(255);
      textSize(40);
      textAlign(CENTER);
      text("Game Over!", 200, 200);
      textSize(35);
      text("Score: " + game.score, 200, 270);
      text("Max Score: " + game.maxScore, 200, 320);
      break;
    case GameState.start:
      background(0);
      fill(255);
      textSize(50);
      textAlign(CENTER);
      text("Bug Squish", 200, 200);
      textSize(30);
      text("Press any key to start", 200, 300);
      break;
  }
}

function keyPressed() {
  switch (game.state) {
    case GameState.start:
      game.state = GameState.Playing;
      break;
    case GameState.GameOver:
      reset();
      game.state = GameState.Playing;
      break;
  }
}

function mousePressed() {
  switch (game.state) {
    case GameState.Playing:
      for (let i = 0; i < animations.length; i++) {
        let contains = animations[i].contains(mouseX, mouseY);
        if (contains) {
          if (animations[i].moving != 0) {
            animations[i].stop();
            game.score += 1;
          }
          else {
            if (animations[i].xDirection === 1)
              animations[i].moveRight();
            else
              animations[i].moveLeft();
          }
        }
      }
      break;
    // case GameState.GameOver:
    //   reset();
    //   game.state = GameState.playing;
    //   break;
  }
}

class WalkingAnimation {
  constructor(spritesheet, sw, sh, dx, dy, animationLength, speed, framerate,
    vertical = false, offsetX = 0, offsetY = 0) {
    this.spritesheet = spritesheet;
    this.sw = sw;
    this.sh = sh;
    this.dx = dx;
    this.dy = dy;
    this.u = 0;
    this.v = 0;
    this.animationLength = animationLength;
    this.currentFrame = 0;
    this.moving = 1;
    this.xDirection = 1;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.speed = speed;
    this.framerate = framerate * speed;
    this.vertical = vertical;
  }

  draw() {
    this.u = (this.moving != 0) ? this.currentFrame % this.animationLength : 0;
    push();
    translate(this.dx, this.dy);
    if (this.vertical) {
      rotate(90);
    }
    scale(this.xDirection, 1);

    // rect(-32, -32, 64, 64);

    image(this.spritesheet, 0, 0, this.sw, this.sh, this.u * this.sw + this.offsetX,
      this.v * this.sh + this.offsetY, this.sw, this.sh);
    pop();

    let proportionalFramerate = round(frameRate() / this.framerate);
    if (frameCount % proportionalFramerate == 0) {
      if (currentFrame === 4) {
        this.resetFrames();
      }
      else {
        this.currentFrame++;
      }
    }

    if (this.vertical) {
      this.dy += this.moving * this.speed;
      this.move(this.dy, this.sw / 4, height - this.sw / 4);
    }
    else {
      this.dx += this.moving * this.speed;
      this.move(this.dx, this.sw / 4, width - this.sw / 4);
    }
  }

  move(position, lowerBounds, upperBounds) {
    if (position > upperBounds) {
      this.moveLeft();
    } else if (position < lowerBounds) {
      this.moveRight();
    }
  }

  walkRight() {
    this.moving = 1;
    this.xDirection = 1;
    this.v = 0;
  }
  walkLeft() {
    this.moving = -1;
    this.xDirection = -1;
    this.v = 0;
  }

  keyPressed() {
    if (keyCode === RIGHT_ARROW) {
      // this.walkRight();
      this.currentFrame = 1;
    } else if (keyCode === LEFT_ARROW) {
      // this.walkLeft();
      this.currentFrame = 1;
    }
  }

  keyReleased() {
    if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
      this.moving = 0;
    }
  }

  contains(x, y) {
    //rect(-32, -32, 64, 64);
    let insideX = x >= this.dx - 32 && x <= this.dx + 32;
    let insideY = y >= this.dy - 32 && y <= this.dy + 32;
    return insideX && insideY;
  }

  stop() {
    this.moving = 0;
    // currentFrame = 6;
    this.u = 7;
    this.v = 8;
  }

  resetFrames() {
    currentFrame = 1;
  }
}