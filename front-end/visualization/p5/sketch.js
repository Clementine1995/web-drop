let particles;
const n = 120;

function setup() {
  createCanvas(900, 900);
  // pixelDensity(2);
  colorMode(HSB, 360, 100, 100, 100);
  rectMode(CENTER);
  newParticles();
}

function draw() {
  for (let i in particles) {
    let p = particles[i];
    p.run();
    if (p.isDead()) {
      particles.splice(i, 1);
    }
  }
}

function forms() {
  for (let j = 0; j < n; j++) {
    let x = random(width), y = random(height);
    let s = random(20, 100);
    let hs = s / 2;
    let c = getCol();
    noStroke();
    fill(c);
    if (random(1) > 0.5) {
      for (let i = -s / 2; i < s / 2; i++) {
        particles.push(new Particle(x + i, y - hs, c));
        particles.push(new Particle(x + i, y + hs, c));
        particles.push(new Particle(x - hs, y + i, c));
        particles.push(new Particle(x + hs, y + i, c));
      }
      square(x, y, s);
    } else {
      for (let a = 0; a < TAU; a += TAU / 360) {
        particles.push(new Particle(x + hs * cos(a), y + hs * sin(a), c));
      }
      circle(x, y, s);
    }
  }
}

function newParticles() {
  // particles = new ArrayList<Particle>();
  particles = new Array();
  background("#FCFCF0");
  forms();
  noiseSeed(parseInt(random(100000)));
}

// function mousePressed() {
//   newParticles();
// }

function keyPressed() {
  // 还没生效
  if (keyCode === 's') {
    saveFrame("123.png");
  }
}

function getCol() {
  let colors = ["#e4572e", "#29335c", "#f3a712", "#a8c686", "#669bbc", "#efc2f0"];
  //let colors = ["#880D1E", "#DD2D4A", "#F26A8D", "#F49CBB", "#CBEEF3"];
  let idx = parseInt(random(colors.length));
  // console.log(idx + colors[idx]);
  return colors[idx];
}

class Particle {
  constructor(x, y, col) {
    this.pos = createVector(x, y);
    this.step = 1;
    this.angle = random(10);
    this.lifeSpan = 100;
    this.noiseScale = 800;
    this.noiseStrength = 90;
    this.col = col;
  }

  show() {
    noStroke();
    // fill(this.col, this.lifeSpan);
    fill(this.col);
    circle(this.pos.x, this.pos.y, 0.5);
  }

  move() {
    this.angle = noise(this.pos.x / this.noiseScale, this.pos.y / this.noiseScale) * this.noiseStrength;
    this.pos.x += cos(this.angle) * this.step;
    this.pos.y += sin(this.angle) * this.step;
    this.lifeSpan -= 0.1;
  }

  isDead() {
    return (this.lifeSpan < 0.0)
  }

  run() {
    this.show();
    this.move();
  }
}