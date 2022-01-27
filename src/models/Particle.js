let particlesArray = [];
let hue = 0;

class Particle {

    constructor(x, y) {

        this.x = x || width - 40;
        this.y = y || height - 40;
        this.size = Math.random() * 7 + 3;
        this.speedY = (Math.random() * 1) - 1.5; // Original é -0.5
        this.color = 'hsla(' + hue + ',100%,50%,0.8)';
        
    }
    update() {

        this.x -= 6;
        this.y += this.speedY;

    }
    show() {

        fill(this.color);
        // circle(this.x, this.y, this.size,0,Math.PI * 2);
        circle(this.x, this.y, this.size, 0, Math.PI * 2);
        if (hue > 400) {
            hue = 0;
        }

    }
}

function drawParticles(x, y) {

    hue++;

    particlesArray.unshift(new Particle(x, y));

    for (i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].show();
    }

    if (particlesArray.length > 200) {

        for (let i = 0; i < 20; i++) {
            particlesArray.pop(particlesArray[i]);
        }

    }

}