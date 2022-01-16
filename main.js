/*
Referências:
https://editor.p5js.org/ebenjmuse/sketches/B1ojQcOxG

Observações:

O de TINT() deixa lento!

*/

let imprimirRNMelhor = false;
let evolucao = [];
let nGeracao = 1;
let showSensors = false;
let qtdDinos = 3;
let gameVelocity = 6;
let step = 0;
let bar = 0;
let obstaculos = [];
let dinos = [];
let counter = 0;
let endgame = false;
let dinosVivos = 0;
let po = null;
let terreno;
let nuvens = [];

let spritesheet;
let dinoChao1;
let dinoChao2;
let dinoBaixado1;
let dinoBaixado2;
let dinoMorto;
let dinoPuloS;
let dinoPuloB;
let spriteChao;
let cacto1;
let animation = [];
let spritesDino = [];
let primeiroColocado = null;
let segundoColocado = null;
let terceiroColocado = null;
let colocacao = [];
let fpsMin = 999;
let fpsMax = 0;
let fpsAtu = 0;
// let speedBut;

// class geracaoData {
//     constructor(x, score, vencedor) {
//         this.vencedor = vencedor;
//     }
// }

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
class Terreno {
    constructor() {
        this.largura = 2380;
        this.x1 = 0;
        this.x2 = this.largura;
        this.x3 = this.largura + this.largura;
        this.y = height - 26;
        this.sprite = spritesheet.get(0, 104, 2400, 26);
    }
    show() {
        // Chão 1.
        image(this.sprite, this.x1, this.y);
        // Chão 2.
        image(this.sprite, this.x2, this.y);
        // Chão 3.
        image(this.sprite, this.x3, this.y);
    }
    atualiza() {
        if (endgame)
            return

        this.x1 -= gameVelocity;
        this.x2 -= gameVelocity;
        this.x3 -= gameVelocity;

        if (this.x1 + this.largura < 0)
            this.x1 = this.largura * 2;
        if (this.x2 + this.largura < 0)
            this.x2 = this.largura * 2;
        if (this.x3 + this.largura < 0)
            this.x3 = this.largura * 2;
    }
}

class RedeNeural {
    constructor() {

        this.input_nodes = 5;
        this.hidden_nodes = 8;
        this.output_nodes = 3;

        this.model = tf.sequential();
        this.model.add(tf.layers.dense({ units: this.hidden_nodes, inputShape: [this.input_nodes], activation: 'sigmoid' }));
        this.model.add(tf.layers.dense({ units: this.output_nodes, activation: 'softmax' }));

    }
    pensar(inputs = [1, 2, 3, 4, 5]) {

        return tf.tidy(() => {

            const xs = tf.tensor2d([inputs]);
            const ys = this.model.predict(xs);
            const outputs = ys.dataSync();

            return outputs
        });
    }
    imprimirRede() {
        const weights = this.model.getWeights();
        let linhas = '';
        let colunas = '';

        for (let i = 0; i < weights.length; i++) {
            let tensor = weights[i];
            let values = tensor.dataSync().slice();
            colunas = '';
            for (let j = 0; j < values.length; j++) {
                let w = values[j];
                colunas = `${colunas} ${w}`;
            }

            text(`${colunas}`, width / 4, 70 + (i * 20));
        }
    }
    imprimir() {
        console.log('------ SEPARACAO ANTES -------');
        for (let i = 0; i < this.model.getWeights().length; i++) {
            console.log(this.model.getWeights()[i].print());

        }
        console.log('------ SEPARACAO depois -------');




    }
    mutate(rate) {
        tf.tidy(() => {
            const weights = this.model.getWeights();
            const mutatedWeights = [];
            for (let i = 0; i < weights.length; i++) {
                let tensor = weights[i];
                let shape = weights[i].shape;
                let values = tensor.dataSync().slice();
                for (let j = 0; j < values.length; j++) {
                    if (random(1) < rate) {
                        let w = values[j];
                        values[j] = w + randomGaussian();
                    }
                }
                let newTensor = tf.tensor(values, shape);
                mutatedWeights[i] = newTensor;
            }
            this.model.setWeights(mutatedWeights);
        });
    }
}

class dino {
    constructor(name, inteligente, surname) {

        this.inteligente = inteligente;
        this.name = name || this.createName();
        this.surname = surname || this.createName();
        this.x = 100 + Math.random() * 600;
        this.corFundo = [Math.random() * 254, Math.random() * 254, Math.random() * 254];
        this.altura = 40;
        this.largura = 88;
        this.score = 0;
        this.r = this.altura / 2;
        this.d = this.r * 2;

        this.y = random(100, height);
        this.gravity = 1;
        this.lift = -20; // Içar
        this.velocity = 0;
        this.vivo = true;

        this.sprite = 1;
        this.acelerando = false;
        this.freando = false;
        this.padx = this.x * 0.25;

        this.redeNeural = new RedeNeural();

    }

    fullName() {
        return `${this.name} ${this.surname}`;
    }

    mutate() {
        this.redeNeural.mutate(0.1);
    }
    createName() {
        const consoantes = 'BCDFGJKLMNPRSTVXZ';
        const vogais = 'AEIOU';
        let nome = '';
        let rand;

        for (let i = 0; i < 2; i++) {
            rand = (Math.random() * (consoantes.length - 1)).toFixed(0);
            nome = nome + consoantes[rand];
            rand = (Math.random() * (vogais.length - 1)).toFixed(0);
            nome = nome + vogais[rand];
        }
        return nome;
    }
    show() {
        textSize(14);
        const spriteX = this.x - 20;
        const spriteY = this.y - 50;
        // tint(this.corFundo);

        if (this.vivo) {


            fill(this.corFundo);
            if (frameCount * 10 / gameVelocity % 2 == 0) {
                this.sprite++;
            }

            if (this.onFloor()) {

                if (step % 2 == 0) {
                    if (this.acelerando) {
                        image(dinoBaixado1, spriteX, spriteY);
                    } else {
                        image(dinoChao1, spriteX, spriteY);
                    }
                } else {
                    if (this.acelerando) {
                        image(dinoBaixado2, spriteX, spriteY);
                    } else {
                        image(dinoChao2, spriteX, spriteY);
                    }
                }

            } else {
                image(dinoPuloB, spriteX, spriteY);
            }
        } else {
            image(dinoMorto, spriteX, spriteY);
        }

        if (showSensors) {
            noFill();
            stroke(125)

            // Área de impacto.
            circle(this.x + this.r, this.y + this.r, this.d);
        }
        noStroke();
        fill(255);
        textSize(10);
        text(this.name, this.x, this.y + 17);

        if (this.freando) {
            fill(255, 100, 100);
            // circle(this.x-10, this.y+4, 8);

            rect(this.x - 19, this.y - 12, 4, 20)
        }

        this.acelerando = false;
        this.freando = false;
    }
    show_Original() {
        fill(this.corFundo);
        rectMode(CORNER);
        rect(this.x, this.y, this.largura, this.altura);

        if (this.vivo) {
            fill(255);
            text("Dino", this.x + 10, this.y + 20);
            text(this.name, this.x + 14, this.y + 40);
        }

    }
    up() {
        if (this.onFloor())
            this.velocity += this.lift;
    }

    acelerar() {
        if (this.onFloor()) {
            if (this.x + this.largura < width - (width / 4)) {
                this.x++;
                this.acelerando = true;
            }
        }
    }
    freiar() {
        if (this.onFloor()) {
            if (this.x > this.padx) {
                this.x--;
                this.freando = true;
            }
        }
    }
    onFloor() {
        return this.y + this.altura == height;
    }
    raciocinar(inputs) {

        if (this.inteligente) {
            let resposta = this.redeNeural.pensar(inputs);
            let maiorI = 0;
            let maiorR = 0;
            for (let i = 0; i < 3; i++) {
                if (resposta[i] > maiorR) {
                    maiorR = resposta[i];
                    maiorI = i
                }
            }
            if (maiorI == 0) {
                this.up();
            } else if (maiorI == 1) {
                this.acelerar();
            } else if (maiorI == 2) {
                this.freiar();
            }

            if (showSensors) {
                noStroke()
                fill(255, 80, 80);
                text(`Pula: ${resposta[0]}\nAcelera: ${resposta[1]}\nFreia: ${resposta[2]}\nM:${maiorI}`, this.x, this.y - 100);
            }

        }
    }
    atualiza() {
        if (endgame)
            return

        if (this.vivo) {
            this.velocity += this.gravity;
            this.y += this.velocity;
            if (this.y > height - this.altura) {
                this.y = height - this.altura;
                this.velocity = 0;

            }
            this.score++;
        } else {
            this.x -= gameVelocity;
        }


    }
    morrer() {
        this.vivo = false;
        if (this.redeNeural.model != null) {
            // this.redeNeural.model.dispose();
        }
    }

}

class obstaculo {
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

function nextGeneration() {

    evolucao.push(colocacao[0]);

    nGeracao++;
    fpsMax = 0;
    fpsMin = 999;

    // console.log(`Geração ${nGeracao}! Clonando ${colocacao[0].name} com Score: ${colocacao[0].score.toFixed(0)}!`)

    endgame = false;
    gameVelocity = 6;
    obstaculos = [];
    dinos = [];

    const weights = colocacao[0].redeNeural.model.getWeights();

    const weightCopies = [];
    for (let i = 0; i < weights.length; i++) {
        weightCopies[i] = weights[i].clone();
    }

    for (let i = 0; i < qtdDinos; i++) {
        let child = new dino(false, true, colocacao[0].surname);
        child.redeNeural.model.setWeights(weightCopies);
        if (i % 2 == 0) {
            // console.log(`${child.name} mutado!`);
            child.redeNeural.mutate(0.1);
            child.name = child.name + ".";
        }
        dinos.push(child);
    }
    // dinos.push(new dino('You', false));

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

function keyPressed() {

    if (key == 's') {
        showSensors = !showSensors;
    }

}
function mousePressed() {
    noLoop();
}

function mouseReleased() {

    loop();
}


function preload() {
    // spritesheet = loadImage('https://i.imgur.com/1G0VVKZ.png');
    spritesheet = loadImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAACY4AAADCCAMAAADT9DSoAAAANlBMVEUAAADa2tr/////9/e5ubn39/dTU1P29vbv7+/+/v74+Pjw8PD///9ZWVlfX1/z8/P5+fn///9RgilMAAAAEnRSTlMA///////////////2////9gn80juWAAAR/UlEQVR4AezdAW+jOBPG8QcgVPv9P+xqHQPvu9nrTWWd1enNuY7D/ydpS+gwdqRq44yN0WUBAAAAAAAA06u/sVPPbZZ0/Ie5LNvIEWbRu11msCsK7duYZM4OcaWzf1+rVk13fbTpj1SctXMWZJHluSLYTmxlUBlVxJlkZz/py2a/txeV/o1qls9B3q55/TALAAAAHa16KeU340nT4+gKZq36LesYPMIsWmR2mbGuqGvZxqkrOsct+wNgOAYA2Gy6bysmEo3N/71HKhWzg+W1haTCZqdr06Blu5tSvS/GpLIhAAzHmsxMWyWsqJA980zxKinb+4zWxh4Zs46RIyoVosWqRGNcYRGOrJE2zCTjjzsD+SwysJLTFXdaRCjf+DA7P74yeTvmrdtUKCTWjr2uaZIAoHR7k5a3H+oLANZX+W4zdf4WjFmHP+IyrM616/ucQ+S1nFO3FWTn/r6Gsbi50Sb+3l+aykxk5Q5Mu9xstTshK20UL5MAMBwbzsmyXgCF22yD5OVx/EthAMBw7NSobP1Yh2qV7X4WyjF/shLMIio5Xrw2tsTrY/3XjQXiLPYMxFktLZ7v3O04azRYA/+z9stL3s0Zk/ibHkqvqUwA2Opzl9ock5B2J2Qtn50t5ky38txW6R8AhmM9xt4w/mrVnyMpB3I8MjyOKyyimqO9+r2O16sRswdZtv+HNN01KGRJK/1tmfdhbZ4Xq67AtoS11wDwcLsLAK49HEvhqvrU9O7Po2HudpVAq0Udn0bocfQ4DuRo0NOB7nXsULPrsG7s9MUZ/zouTV3Wj0lZq6Z7juyclFQe1yYh7ZxxXJvKBJvsd+XvTbKTQHxtc+u8WPXyJp3Fh8kkAAAAhmMxzu/G/WHWccF7HesWazVYswOw0l/L++zAvmP1Oy0BoLr5a8WmIsC9lasdBVgeE8sMgOHYFl4nczZ7lqRsPVez3Nle2/qxXrvhN8hh903CqmB7uGYX3x/sDOdzaLj/2BTNB8Ahf1NerNz+DgAAwHCs/Vox9hdr2Yp/tzFqYw1XrZ1C9KmYSdrKab+tOh+42XXldqxJFf8Q95VrN5lUucuzov4+gP5r3TDrwqb/E4BLur39KI57AYCVfccra7v65Lb1Y4HqU7O9wQbdocvqUezcD3PuR3HcCwCsTGEAYDf+v4+TCkn1M/Wz9d8l/7X1vvj7l+wAAMMxoMeu+vErAhW45nVB92O/JpXOxndVtr+78tTkiiu/fFlctnqvHXcBAOtYS/incq/9oNPyALic27xrmeef6goAVqFc21Vfy9Uot+ptXozVf/y76nuvWKox8Tbsmn2op23i3MW+eAAYjn11YuOsTlUAgN9ttoHt8jj+JQBgOAb+GOKrvLr0yiIWixngaZvUxd5lgf3jyQuGYw5n5RwANH1wW3LHOyNT5WUtvpBav6n2/dwcwR0BDMfy06wb8++XewRzG9aPlfWfwBUXqEpNMqczTq3j2t9dGYg7Ncnisuw/wOkuAGBX/n4A4CYAoDrWFQ5lrboiIGvVdM/Vebq6Mn6TNt+F23u8U1JU8aasqzGBftb7M38y7zA7P86y5SBvPG+p2dxNojoGADyzEsD4qI41GtP3Xze2+r8jxHPHOXKuofqY5aAcG9+hHzyzEgBWCQB4ZmVgpvLr85VXAYDhGLIOzZ9G/HbYfWYNWrFVOtdQ26F/0TMBz6x81uei5Opv6x9buVNe8to3jOSIKSXnWqpDDURaZe0YAAAA1bEOY++ee56tzv3Bao5GuQ9X1coTYfnmSt9irVj+rPUCxVnboZ/a2MjKzV0796RDZ+wO0Jb93AQ8S93p6NVqJR4AAACsHUO80neEIoqVYYEcplihVrRyHfv7g6u1qwTAPbNScXTIS94WNVCbI5r/dSXpGKjVSwKA2zz/tJ8f+efp3GFFZn/+pJbqPazP2Mb7WSYHsI783cYh3F52rvEyJlv+JrmPatQh442o1caiOcor5korPSxda2O2O1m3XrHzmP18QQBm5+gjW2yHVg+75noAYHuTljfpJgBogclKnjdpEcH1Z/5W1kArr10bszrYx9rY0nV3MuS//p3u2b+Va8mCt6EfzFefq03tp0TTp/eUe+cRskrkbZ+3vvfY5pyyTs62Z2ef7QqvDq0yHAOA2ywbHD+OfwnAeKiOdRh793C41niZLHO0zN20PmYttG/le+0d60+7ngfO3Y6zXheA1RmTu7Vq8QAAm698IpvKHsbfVHJflVr2s5yvBBg0Yli2m5cjonUr6wB/XFYfu3Kf8PHvebqrK8SrBtnieuUlb7F+bHMuo9yaDVdW/7vo1SrPrASA25setrcf6gkA1qG+2wzA1sDF16a5cjt2LLGIAFcrSXN9z31qUdW9+JcufcK5T/f1URs7/LNs9cjUOD4itbwqBdImXRpAdQwAbvbzdQFg7RhgtTHqY7YXf3muR5+Qle0nhv94yn3ykjf+2LD4vFn8HXdvdVZHAAAAWIf5bjOALHPE9zYL5u4vh3q7fH4ucMVejVia18aWyrn9S704JU36Y9LpijPt4zzOb42bKnFdAQDVMQC46YUBoDoGHFKz2tiuXYvnCosvrrcIRxvOVmL2IqPvnfyPvXvRkRMHogAKYdT//70ImH3WitHGkTXuCpQ4Z59NsD2iETE3hWGEujHXG/2m9zvwNH9HJVfVUaVjAADSsYajaJ1YOEbfjdl9fNinPWf/Rpv+BG6ZxsnGAOqTjgEASMcgaTWwSIiiRXo2tvf/VL85FYynHP/5d//TlfEsZv7TlXlPS86eqqyv9Yx5hX7123j3pPox6RgAgHRsfO5dp27suKx2Tj62T3tfi9hvMBv7yzJeaZZSMQfEFVm/tfpdJ6RjAABqx9pzb+Rj/VlXTz7WNjBGo0Xs+159Kd+sMqqrygz1Y/pVP7ZdOKp0rD4AQDqmfkySl+1Xb27ce1sM2L+R2oX0fOyNT0PO0+d4f5e9q3J+c38AascAAKRjcL98bBlokZnaLZ0VcNlA/dim39x+k+rH1t9WP7Y1JjsfP9nnuHTUS9MxAAA+Kt3btHGcjuRRd48Cqd1ym7xutN4rnsQc70/dGIDaMQAA6RjXO4rv8YAV1GLbafvy5vX258QkaE5LmGYrjvVSP9ZR8aPf/H5H6sfWod/jfnyjkuvoXGfs2lEvTccAAPi4yb2NNcd4bGYW2VjV+rHoR90YcK3ty+RmKzCqdAwAQO0YyMf2+He4dQXZnNDrrGqshfgzlsbnGv3+4+O/7du/KcjxvX6jz5sfh6gfa30e89E4CltqzXLre/1VJnZIxwAApGO9c+8CDnVjpK1ftk/vE8nV3L9fO0vr769dQfbGGq9ZzRhYmatz/f5zivbP5yNv1NAY9XnpGACAdOz1zRX3X+Nvt4JC9sjGUkXqVZOqMSLnCNtPntk/7t9vvPXw5Bh6X2OkL9cfhz5rZv3YBSsfnEfarMoPACAd60yxeubea5H7NKjh86r9CvysQPm8tMN2bnfNqNIxAABPVgJAQr1OjX4/T/0eb8yFtvPnAsdhzVsF/7K6sZF3TkrHAACkY9mzVwCA4zajSscAAKRjr1MqBgDjq0wd7W236neOVdmz0pcCxyFmAmt72+BR+NH+SZPPw17SMQAA6dga8723zr1hmfb6LULiGPkAkI4BAEjH8r0e+75KCdjS+JW/tu+XtAjtFpliDHiarbGtQL95ChyHtXNblaO9SccAAKRjnV4x/33b3HudeJjIgRrJ1f7PP/kt+jO7aDFc4dU/BgBqxwAAeJt5gjK1Y/uFLZZGiz1anPbaT59O+8W48SuxtWsMAJ6SjgEA4MlKiDqp9pOF+S36K8rO2/f/fQr7lxH209beMQB4cjoGAACwLAVaJIwQbQB4djoGAAAAAAAAYN0xAF5eYEKVM9AZq3YMAEA6BkBCMrF+/XBPOAOdsdIxAADpGAAJNTtrM3qA689AZ6x0DABAOgZAfs1OO4CAa85AZ2zJdAwAgDmmqABU0C7R6WzabgwJZ+D62JNuvWM6BgCA2jEAz8M9sY4H1I4BACAdA+DVX+UCSMcAAKRj+dULNb0S7iQd1fzvBN+d65Wj6jsh/7uTjgEAlDRXmre/prVnteACqxknHIPe1mWOSv5Ryr9H7x+x8qhxtON7zP8ZXK9cr1yv8rleqR0DAFA7RlWvafVzXHt/XOn4q+bBdcL1yvXKk5UAAMzJM92EWXx+zUh+bUD+/D7vT9VlKfXvbOURrleuV2RwvZKOAQAUNZ/v3HJmuu3+3ZlTt0agfX6Pn2PuctvHz/WK+3K9cr2SjgEAAAAAAADFzN6R3vZHe3ew27YORGH4DDHLbu77P2Q3WQ40FygCI0xpj0xJjST8H9A2qugTZ3cwZqiFnDoHAACwdwwAAODKXLfW5JoXWoocci4NAACmYwAAALDVjW3RvD7n3LOxTmghp8jZBgAAeF2guotlvoi5FG/mNDaXAwCAu7OXXcjVianG0/rmF0Vz2q2ONbm2C4mcA+djAADA325CbZkpY95/x1iT80u2pjdm9/WHAAAArsTfH0s1LW+VMY/ht40ipypjD6b88vUvCtkNAABAHWvdrXKwVW8a2zhos+J26qIAAAC8no3ND8ia5FXO7GysY8przscAAAD87RLlkqIcbNWlztcO2kyd+w3IUiYAAMAxsA9t7oWH5dj5Hr6ZqdPKvPjPCAAAdaxNvnJ82zfnmFYyXVdSfgAAoI51166Ce9WjmtzrmDrHtJpduj9lMh8DAIA6doCIuthdj+3byEwAAIA6Nr4salSrY2vxcrHtVWvysz9lKk80I2M+BgAA2pEvdp/rdfuPmVKZn/0idaIOBQAA4IPTJ0r1Ute5WI5bW6pn6+N6OZWjHJ54kXM5gyQpD83ZDgAA+GjcFa512vJ6bBYbc2xw0qu96BCWawpUms4CAADA9c+EXCOuUMW0leV+J7IORm2zOT2bzxm98vic7QAAgI9OuQg9xMxYq41K2CPMV+dY96/likck5Yo+ZtqP6cQAAADTMX+0se8Nz3+w8aRtmo+lCrM5tuf7sR/LmQcAAHWsPa5C8r45DVtUjMdaTUNdMYuvWa4Y5di3NmB5umdXmgAAALbxw1MfTS4e3ev9KVnxO4wm5VSHsj56fi+aTedIUvYJNpUz/g1I2zXnwgAAYCu/y0cb+KN4DynZ3qOvNAEAAJy6jnkMplcuhULyvlK9Fl9iunj/8nFoEZKy2btjtttRZnbOTz3tTDkAAKDQdCh3H5Q+7xb4P+wHZ2tQAAAA7Vkzi/j7KUfuLwPGORqK+BbbqrqTuU9JMqVuzexUOQAAoOA/EuqhCXm/z/IYtAEAAK+fR7mNK/bpY3Qf9o0BAMDescO4CwAAgOnYYfzJ8ysBAADQDhhYub4JjQEAAKDpXwgVKGwAAIA6pkV/iXhy+epVS0TUc7Y6JzUjBQAAwHTM9U0MLwEAAOAvb8W65YWQFN5fO8dWAAAArOlX8VgSmtX1uvDYv3elAAAAOOjitZB3Ba8TAgAAoI5paeGDI/VDz4S0qDfOiaJzjXPS9LacX9Aj504AAGA65uM2BgAAAO/HWk/vx7i7LRpZWl3JipxuPJard46lnjOlaqYCOVcAAADTseiDn3Q6to4BAAD4eEhVKdYvbZ+ctPe2NOXW+Y+pRg4AANiTPzvXohQ80BIAAGA71wZL/XHlfM6EVMW0ATkAAOD4OrY0heT1nq8Ytagu57uYaWNpk20MAACAgy5CXnw3AAAA+MpN+F4OtYqcGGZElZPGcAwAANxaG5WsUCGiaFGj214sHEvaGAAAuLU2u69+WbEg9CkihqUuVuQkbQwAANyZj3pUi683Qp2o21iXUy0qpYw2BgAAbsunTnFdVOtzXPHWtrEP/ZKt3kCWekh9CAAA4Dr8WY8KSfJ+UbxsY0Wv876J+Ts5aYzGAADA7RT769suh7YuiienX0SV08/HZHUZYzZ2DwAAUMeKQrZoqMgJySVFP2KrC9modHnIpc+/eh8CAAC4Fi+24v8Rk2WsL3bR/+e8ePwBAAC4PFOpTRSoI3P+0x+/VWpybRNaTpfTpFO9HwAAsI2rtGjCgTm/BQAAcB+mW2vy7bOfk+U0STrZzwUAAOY1ATgnAADTMfrmcracLuEs7wcAADAdAwAAuLD/AQPLUxmjjeldAAAAAElFTkSuQmCC');


}
function setup() {

    createCanvas(windowWidth, windowHeight * 0.90);
    tf.setBackend('cpu');
    slider = createSlider(0, 10, 0);
    // speedBut = createSlider(1, 20, 6);
    terreno = new Terreno();

    dinoChao1 = spritesheet.get(1854, 0, 88, 95);
    dinoChao2 = spritesheet.get(1942, 0, 88, 95);
    dinoPuloB = spritesheet.get(1678, 0, 88, 95);
    dinoBaixado1 = spritesheet.get(2208, 0, 117, 95);
    dinoBaixado2 = spritesheet.get(2326, 0, 117, 95);


    dinoMorto = spritesheet.get(2121, 0, 84, 95);
    dinoPuloS = spritesheet.get(2121, 0, 84, 95);
    cacto1 = spritesheet.get(652, 2, 50, 100);

    for (i = 1; i < qtdDinos; i++) {
        dinos.push(new dino(false, true));
    }

    dinos.push(new dino('You', false));

    for (i = 0; i < 4; i++) {
        nuvens.push(new Nuvem(random(100, width), random(0, height / 2)));
    }

    obstaculos.push(new obstaculo(width + Math.random() * 100, 60 + Math.random() * 40, 60 + Math.random() * 40));
    // document.body.style.zoom = "100%";

}

function draw() {

    background(255 - (slider.value() * 30));
    // scale(1.2);  // Zoom

    if (keyIsDown(RIGHT_ARROW)) {

        for (let dino of dinos) {
            if (!dino.inteligente) {
                dino.acelerar();
            }
        }
    }
    if (keyIsDown(LEFT_ARROW)) {

        for (let dino of dinos) {
            if (!dino.inteligente) {
                dino.freiar();
            }
        }
    }

    if (keyIsDown(65)) { // a http://www.foreui.com/articles/Key_Code_Table.htm
        dinos.push(new dino(false,true));
    }
    if (keyIsDown(77)) { // m
        for (let dino of dinos) {
            dino.morrer();
        }
    }

    terreno.show();
    terreno.atualiza();

    // image(spriteChao,mouseX-600,height-26);
    if (slider.value() == 2)
        image(spritesheet, 0, 0);

    dinosVivos = 0;

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

    if (frameCount % 90 == 0) {
        obstaculos.push(new obstaculo(width + 400 + Math.random() * 300, 60 + Math.random() * 40, 60 + Math.random() * 40));
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

    for (let dino of dinos) {

        if (dino.vivo) {
            po = proximoObstaculo(dino, obstaculos);

            if (po) {

                const posXDino = dino.x;
                const distanciaObs = po.x - dino.x - dino.d;
                const alturaObs = po.altura;
                const larguraObs = po.largura;

                if (showSensors) {
                    stroke(dino.corFundo);
                    line(dino.x + dino.d, dino.y + dino.r, dino.x + dino.d + distanciaObs, po.topY + (po.altura / 2))
                }

                //console.log(`dino.x: ${posXDino} distancia: ${distanciaObs} alturaObs: ${alturaObs} larguraObs: ${larguraObs} velocidadeObs ${velocidadeObs}`);

                dino.raciocinar([posXDino, distanciaObs, alturaObs, larguraObs, gameVelocity]);
            }
            dino.atualiza();
            dino.show();
            dinosVivos++;


        } else {

            if (dino.x + dino.largura > 0) {
                dino.atualiza();
                dino.show();
            }

        }
    }


    colocacao = [];
    for (let dino of dinos) {
        colocacao.push(dino);
    }
    colocacao.sort(function (a, b) { return b.x - a.x });


    fill(100);
    noStroke();
    textSize(22);

    if (dinosVivos == 0) {
        endgame = true;
    }

    textSize(14);
    // text(`Dinos vivos: ${dinosVivos} Velocidade: ${gameVelocity} Obst: ${obstaculos.length} Geração: ${nGeracao}`, 20, 20);
    textAlign(CENTER);
    text(`Velocidade: ${gameVelocity}`, width / 3, 20);
    textSize(10);
    let medFps = (Number(fpsMin) + Number(fpsMax)) / 2;
    text(`Fps (${fpsMin}-${fpsMax} M${medFps.toFixed(0)}): ${fpsAtu}`, width / 3, 40);

    if (frameCount % 60 == 0) {
        fpsMin = 99;
        fpsMax = 0;
        fpsAtu = Math.floor(getFrameRate());
    }

    textSize(18);
    text('IA jogando Dino!', width / 2, 20);
    textSize(14);
    text('(Ivan Sansão)', width / 2, 40);
    textSize(14);
    textAlign(LEFT);

    // PLACAR.

    const placarOff = 80;

    // noFill();
    // stroke(200);
    // rect(10,50,300,200);

    for (let i = 0; i < colocacao.length; i++) {

        if (colocacao[i].x > 0) {

            if (colocacao[i].vivo)
                fill(100);
            else
                fill(255, 0, 0);

            if (i == 0) {
                text(`${pad(i + 1)}.`, 10, placarOff + (i * 15));
                text(`${colocacao[i].name}`, 50, placarOff + (i * 15));
                text(`  ${colocacao[i].x.toFixed(0)}`, 130, placarOff + (i * 15));
                text(`Pontos: ${colocacao[i].score.toFixed(0)}`, 180, placarOff + (i * 15));
            } else {
                text(`${pad(i + 1)}.`, 10, placarOff + (i * 15));
                text(`${colocacao[i].name}`, 50, placarOff + (i * 15));
                text(`+${colocacao[0].x.toFixed(0) - colocacao[i].x.toFixed(0)}`, 130, placarOff + (i * 15));
            }
        }

        if (i > 8) {
            break;
        }
    }

    // GRÁFICO.

    // textSize(20);
    // fill(100);
    // text('Evolução das gerações', (width / 2) - 10, 20);
    tmpEvolucao = [...evolucao];
    tmpEvolucao.push(colocacao[0]);

    if (tmpEvolucao.length > 1) {
        const goX = width - (tmpEvolucao.length * 20) - 40;
        const goY = height * 0.5;
        // const maxX = tmpEvolucao.reduce(function (a, b) {
        //     return Math.max(a.score, b.score);
        // });

        const maxScore = tmpEvolucao.reduce((a, b) => (b.score > a.score ? b : a))
        const minScore = tmpEvolucao.reduce((a, b) => (b.score < a.score ? b : a))
        const maxCols = Math.floor((width / 2) / 20); // Você pode especifial manualmente exemplo 40 mostra os últimos 40 no gráfico.
        let melhorVisivel = -1;
        let divBy = 150 / maxScore.score;
        const offSetY = minScore.score * divBy;
        let xGeracao = 0;

        textSize(14);

        for (let i = Math.max(0, tmpEvolucao.length - maxCols); i < tmpEvolucao.length - 1; i++) {

            const gx1 = goX + (i * 20);
            const gx2 = goX + ((i + 1) * 20);
            const gy1 = goY - (tmpEvolucao[i].score * divBy) + offSetY - 20;
            const gy2 = goY - (tmpEvolucao[i + 1].score * divBy) + offSetY - 20;

            xGeracao = xGeracao > 0 ? xGeracao : gx1;

            stroke(tmpEvolucao[i].corFundo);
            noFill();
            strokeWeight(4);
            line(gx1, gy1, gx2, gy2);
            strokeWeight(10);
            point(gx1, gy1);
            point(gx2, gy2);
            strokeWeight(0);
            fill(50, 50, 255);
            text(i + 1, goX + (i * 20) - 5, goY);
            text(i + 2, goX + ((i + 1) * 20) - 5, goY);

            noStroke();
            fill(80);
            if (tmpEvolucao[i] == maxScore) {
                melhorVisivel = i;
                // fill(tmpEvolucao[i].corFundo);
                text(`${tmpEvolucao[i].name} (${tmpEvolucao[i].score.toFixed(0)})`, gx1 - 45, gy1 - 10);
            }
            if (tmpEvolucao[i + 1] == maxScore) {
                melhorVisivel = i + 1
                // fill(tmpEvolucao[i].corFundo);
                text(`${tmpEvolucao[i + 1].name} (${tmpEvolucao[i + 1].score.toFixed(0)})`, gx2 - 45, gy2 - 10);
            }

        }
        textSize(14);
        noStroke();
        fill(100);
        text('Geração:', xGeracao - 70, goY);
        textSize(12);
        textAlign(RIGHT);
        if (melhorVisivel == -1) {
            text(`Melhor: ${maxScore.name} (${maxScore.score.toFixed(0)})`, width - 10, 20);
        }
        textAlign(LEFT);

        if (false) {
            // Debug.
            text(minScore.score, goX, goY + 100);
            text(maxScore.score, goX, goY + 120);
            text(divBy, goX, goY + 140);
            text(maxScore.score * divBy, goX, goY + 160);
            text(goY, goX, goY + 180);
            text(`offSetY: ${offSetY}`, goX, goY + 200);
            strokeWeight(8);
            point(goX, goY);
        }
    }

    if (keyIsDown(DOWN_ARROW)) {
        console.log(colocacao[0].name);
        colocacao[0].redeNeural.imprimir();
        noLoop();
    }
    if (imprimirRNMelhor) {
        colocacao[0].redeNeural.imprimirRede();
    }

    if (showSensors) {
        fill(0);
        text(`x:${mouseX} y:${mouseY}`, mouseX, mouseY);
    }

    if (frameCount % 500 == 0) {
        gameVelocity++;

    }
    if (bar > 20) {
        bar = 0;
        step++;
    }
    bar += gameVelocity;

    if (endgame) {
        gameVelocity = 0;
        // noLoop();
        // fill(100);
        // textSize(22);
        // textAlign(CENTER, CENTER);
        // text(`Vencedor: Dino ${colocacao[0].name}  Distância: ${colocacao[0].score.toFixed(0)}m`, width / 2, 120);
    } else {
        counter++;
    }

    if (endgame) {
        nextGeneration();
        counter = 0;
        clear();

    }

    if (getFrameRate() > fpsMax)
        fpsMax = getFrameRate().toFixed(0);
    if (getFrameRate() < fpsMin && getFrameRate() > 0)
        fpsMin = getFrameRate().toFixed(0);


}

function pad(i = 0, l = 2) {
    return String(i).padStart(l, '0')
}