// As funções keyPressed e keyIsDown abaixo pertencem ao P5.js!

function keyPressed() {

    if (key == ' ') {
        for (let dino of dinos) {
            if (!dino.inteligente) {
                dino.up();
            }
        }
    }
    if (key == 's') {
        showSensors = !showSensors;
    }
    if (key == 'n') {
        showNets = !showNets;
    }

    if (key == 'm') {
        for (let dino of dinos) {
            dino.morrer();
        }
    }

}

function handleKeyIsDown() {

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

    if (keyIsDown(DOWN_ARROW)) {
        console.log(colocacao[0].name);
        colocacao[0].redeNeural.imprimir();
        console.log('ImprimirRede ->')
        colocacao[0].redeNeural.imprimirRede();
        noLoop();
    }

    if (keyIsDown('65')) { // a http://www.foreui.com/articles/Key_Code_Table.htm
        dinos.push(new Dino(false, true));
    }
}

function mousePressed() {
    noLoop();
}

function mouseReleased() {
    loop();
}
