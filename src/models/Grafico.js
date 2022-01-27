function drawGrafico() {

    const tmpEvolucao = [...evolucao];
    tmpEvolucao.push(colocacao[0]);

    if (tmpEvolucao.length > 1) {
        const goX = width - (tmpEvolucao.length * 20) - 40;
        const goY = height * 0.5;

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
                text(`${tmpEvolucao[i].name} (${tmpEvolucao[i].score.toFixed(0)})`, gx1 - 45, gy1 - 10);
            }
            if (tmpEvolucao[i + 1] == maxScore) {
                melhorVisivel = i + 1
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
    }
}