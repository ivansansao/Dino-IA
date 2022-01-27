class Dino {

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

        this.y = random(-200, 0);
        this.gravity = 1;
        this.lift = -20; // Içar
        this.velocity = 0;
        this.vivo = true;

        this.sprite = 1;
        this.acelerando = false;
        this.freando = false;
        this.padx = this.x * 0.25;
        this.actions = ['Pulando', 'Acelerando', 'Freiando', 'Esperando'];
        this.dna = [];

        this.redeNeural = new RedeNeural();

        this.setViewDna();

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
            for (let i = 0; i < 4; i++) {
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
            } else if (maiorI == 3) {
                // Não toma nenhuma ação!
            }

            this.redeNeural.selectedOutput = maiorI;

            if (showSensors || showNets) {

                // Primeira camada.

                noStroke();
                textSize(10);
                textAlign(RIGHT);

                for (let i = 0; i < this.redeNeural.savedInputs.length; i++) {


                    fill(80, 200, 140);
                    text(inputNames[i], this.x - 80, height - 330 + (i * 12.5));

                    fill(55, 80, 180);
                    text(this.redeNeural.savedInputs[i].toFixed(2), this.x - 30, height - 330 + (i * 12.5));

                }

                // Camada escondida.

                textAlign(LEFT);
                noStroke();
                textSize(10);
                fill(255, 80, 80);

                for (let i = 0; i < this.redeNeural.firstLayer.length; i++) {
                    text(this.redeNeural.firstLayer[i].toFixed(3), this.x - 22, height - 345 + (i * 12.5));

                }

                // Última camada!
                stroke(200);
                line(this.x + 40, height - 275, this.x + 40, this.y);
                noStroke();
                textSize(10);
                fill(80);
                text(`Pula\nAcelera\nFreia\nEspera`, this.x + 40, height - 320);
                fill(255, 80, 80);
                text('\u2295', this.x + 22, height - 320 + (maiorI * 12.5));
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

    setViewDna() {

        const pesos1 = this.redeNeural.model.getWeights()[0].flatten().arraySync();
        const pesos2 = this.redeNeural.model.getWeights()[2].flatten().arraySync();

        for (let i = 0; i < pesos1.length; i++) {
            this.dna.push(pesos1[i].toFixed(2));
        }

        for (let i = 0; i < pesos2.length; i++) {
            this.dna.push(pesos2[i].toFixed(2));
        }

    }

    showRedeNeural() {

        const pesos1 = this.redeNeural.model.getWeights()[0].flatten().arraySync();
        const pesos2 = this.redeNeural.model.getWeights()[2].flatten().arraySync();

        const corDesligado = [242, 242, 242];
        const corLigado = [255, 80, 80];

        const offsetX = (width * 0.5) - (150);
        const offsetY = 30;
        const padLinha = 44;

        const col1 = offsetX;
        const col2 = offsetX + 150;
        const col3 = offsetX + 300;

        const row1 = offsetY + 54;
        const row2 = offsetY + 0;
        const row3 = offsetY + 84;
        const offsetT = 3;


        // LINHAS

        textAlign(LEFT);
        strokeWeight(1);
        stroke(200);

        // LINHAS CAMADA 1->2

        for (let f = 0; f < this.redeNeural.savedInputs.length; f++) {
            for (let h = 0; h < this.redeNeural.firstLayer.length; h++) {
                if (this.redeNeural.firstLayer[h] == this.redeNeural.maiorValueHidden) {
                    stroke(255, 0, 0);
                    line(col1, row1 + (f * padLinha), col2, row2 + (h * padLinha))
                } else {
                    stroke(200);
                    line(col1, row1 + (f * padLinha), col2, row2 + (h * padLinha))
                }
            }
        }

        // LINHAS CAMADA 2->3

        for (let h = 0; h < this.redeNeural.firstLayer.length; h++) {

            for (let o = 0; o < this.redeNeural.savedOutputs.length; o++) {

                if (this.redeNeural.firstLayer[h] == this.redeNeural.maiorValueHidden
                    && o == this.redeNeural.selectedOutput) {
                    stroke(255, 0, 0);
                    line(col2, row2 + (h * padLinha), col3, row3 + (o * padLinha))
                } else {
                    stroke(200);
                    line(col2, row2 + (h * padLinha), col3, row3 + (o * padLinha))
                }
            }

        }

        // NEURÓNIOS.

        fill(corDesligado);
        stroke(150);

        for (let f = 0; f < this.redeNeural.savedInputs.length; f++) {
            for (let h = 0; h < this.redeNeural.firstLayer.length; h++) {
                circle(col1, row1 + (f * padLinha), 40);
            }
        }
        for (let f = 0; f < this.redeNeural.savedInputs.length; f++) {
            for (let h = 0; h < this.redeNeural.firstLayer.length; h++) {
                if (this.redeNeural.firstLayer[h] == this.redeNeural.maiorValueHidden) {
                    fill(corLigado);
                    circle(col2, row2 + (h * padLinha), 40);

                } else {
                    fill(corDesligado);
                    circle(col2, row2 + (h * padLinha), 40);
                }
            }
        }
        for (let h = 0; h < this.redeNeural.firstLayer.length; h++) {
            for (let o = 0; o < this.redeNeural.savedOutputs.length; o++) {

                if (o == this.redeNeural.selectedOutput) {
                    fill(corLigado);
                } else {
                    fill(corDesligado);
                }
                circle(col3, row3 + (o * padLinha), 40);
            }

        }

        // VALORES DOS NEURÓNIOS

        // Primeira camada.

        noStroke();
        textSize(10);
        fill(0);
        textAlign(CENTER);

        for (let i = 0; i < this.redeNeural.savedInputs.length; i++) {

            fill(0);
            textAlign(RIGHT);
            text(inputNames[i], col1 - 30, offsetT + row1 + (i * padLinha));

            if (showSensors) {

                fill(0);
                textAlign(CENTER);
                text(this.redeNeural.savedInputs[i].toFixed(2), col1, offsetT + row1 + (i * padLinha));
            }

        }



        // Camada escondida.
        if (showSensors) {
            for (let i = 0; i < this.redeNeural.firstLayer.length; i++) {
                text(this.redeNeural.firstLayer[i].toFixed(3), col2, offsetT + row2 + (i * padLinha));
            }
        }

        // Última camada!

        for (let i = 0; i < this.redeNeural.savedOutputs.length; i++) {

            fill(0);
            textAlign(LEFT);
            text(outputNames[i], col3 + 30, offsetT + row3 + (i * padLinha));

            if (showSensors) {
                fill(0);
                textAlign(CENTER);
                text(this.redeNeural.savedOutputs[i].toFixed(3), col3, offsetT + row3 + (i * padLinha));
            }
        }

        // textSize(8);
        // textAlign(RIGHT);

        // PESOS
        // for (let i = 0; i < pesos1.length; i++) {
        //     text(pesos1[i].toFixed(2), col1 + 60, y + (i * 8));
        // }

        // for (let i = 0; i < pesos2.length; i++) {
        //     text(pesos2[i].toFixed(2), col1 + 160, y + (i * 8));
        // }

        textAlign(LEFT);

    }

}

function drawDinos() {

    dinosVivos = 0;

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

}

function calcColocacao() {
    colocacao = [];
    for (let dino of dinos) {
        colocacao.push(dino);
    }
    colocacao.sort(function (a, b) { return b.x - a.x });

}