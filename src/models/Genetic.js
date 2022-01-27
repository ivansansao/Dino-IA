function nextGeneration() {

    evolucao.push(colocacao[0]);

    nGeracao++;
    fpsMax = 0;
    fpsMin = 999;
    hue = 0;

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
        let child = new Dino(false, true, colocacao[0].surname);
        child.redeNeural.model.setWeights(weightCopies);
        if (i % 2 == 0) {
            // console.log(`${child.name} mutado!`);
            child.redeNeural.mutate(0.1);
            child.name = child.name + ".";
        }
        dinos.push(child);
    }
    // dinos.push(new Dino('You', false));

}