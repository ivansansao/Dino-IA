function drawPlacar() {

    const placarOff = 80;

    textAlign(LEFT);

    for (let i = 0; i < colocacao.length; i++) {

        if (colocacao[i].x > 0) {

            if (colocacao[i].vivo)
                fill(100);
            else
                fill(255, 0, 0);

            textSize(14);

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

            if (showSensors) {
                textSize(8);
                text(`DNA: ${colocacao[i].dna}`, 270, placarOff + (i * 15))
            }

            if (i > 8) {
                fill(100);
                text(`mais...`, 50, placarOff +2+ ((i+1) * 15));
            }
        }

        if (i > 8) {
            break;
        }
    }
}