class Nuvem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vel = random(1, 2);
        this.sprite = spritesheet.get(165, 0, 94, 50);
        // this.sprite = spritesheet.get(1678, 0, 88, 95);
    }
    show() {
        // tint(0,0,255);
        image(this.sprite, this.x, this.y);
        // text(this.x, this.x, this.y);
    }
    atualiza() {
        this.x -= this.vel;
    }
}

function drawNuvens() {

    if (frameCount % 200 == 0) {
        nuvens.push(new Nuvem(random(width, width * 2), random(0, height / 1.5)));
    }

    for (let nuvem of nuvens) {
        nuvem.show();
        nuvem.atualiza();
    }
    for (let nuvem of nuvens) {
        if (nuvem.x + 100 < 0) {
            nuvens.sort(function (a, b) { return a.x - b.x });
            nuvens.shift();
        }
    }

}