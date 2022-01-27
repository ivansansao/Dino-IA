class Obstaculo {
    constructor(x, altura, largura) {
        this.x = x;
        this.altura = altura;
        this.largura = 50;
        this.corFundo = [Math.random() * 254, Math.random() * 254, Math.random() * 254];
        this.topY = height - this.altura;
        this.vivo = true;

    }

    show() {

        const spriteX = this.x;
        const spriteY = this.topY - 30;
        // tint(0,255,0);

        fill(this.corFundo);
        // rectMode(CORNER);
        noFill();
        if (showSensors) {
            stroke(this.corFundo);
            drawingContext.setLineDash([5, 5]);
            rect(this.x, this.topY, this.largura, this.altura);
            drawingContext.setLineDash([]);
        }
        image(cacto1, spriteX, spriteY);

    }

    atualiza() {
        if (!endgame) {

            if (this.x + this.largura < 0) {
                this.vivo = false
            }
            this.x -= gameVelocity;
        }
    }

    bateu(dino) {

        // collideRectCircle(x1, y1, width1, height1, cx, cy, diameter)
        // https://editor.p5js.org/p52dcollide/sketches/QDTBZgqVd

        const x1 = this.x;
        const y1 = this.topY;
        const width1 = this.largura;
        const height1 = this.altura;

        const cx = dino.x + dino.r;
        const cy = dino.y + dino.r;
        const diameter = dino.d;
        strokeWeight(4);
        point(cx, cy);
        strokeWeight(1);

        const hit = collideRectCircle(x1, y1, width1, height1, cx, cy, diameter)
        // console.log(this.x, this.topY, this.largura , this.altura, dino.x, dino.y, dino.r);
        if (hit) {
            dino.morrer();
        }

        return hit;
    }
    bateu_old(dino) {
        if (dino.x + dino.largura > this.x
            && dino.y + dino.altura > this.topY
            && dino.x < this.x + this.largura) {

            dino.morrer();

            return true;
        }
        return false;
    }

    destaca() {
        fill(0);
        textSize(14);
        text("`", this.x, this.topY - 10);
    }

}

function proximoObstaculo(dino, obstaculos) {
    for (let obstaculo of obstaculos) {
        if (obstaculo.vivo) {
            if (obstaculo.x + obstaculo.largura > dino.x) {
                return obstaculo
            }
        }
    }
    return obstaculos[obstaculos.length - 1];
}

function drawObstacles() {
    if (frameCount % 90 == 0) {
        obstaculos.push(new Obstaculo(width + 400 + Math.random() * 300, 60 + Math.random() * 40, 60 + Math.random() * 40));
    }

    for (let obstaculo of obstaculos) {

        if (obstaculo.vivo) {

            for (let dino of dinos) {
                if (dino.vivo) {
                    obstaculo.bateu(dino)
                }
            }

            obstaculo.atualiza();
            obstaculo.show();

        }

    }

    for (let obstaculo of obstaculos) {
        if (obstaculo.x + obstaculo.largura < 0) {
            obstaculos.shift();
        }
    }
}