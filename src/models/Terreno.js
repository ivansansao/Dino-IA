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
            this.x1 = (this.largura - gameVelocity) * 2;
        if (this.x2 + this.largura < 0)
            this.x2 = (this.largura - gameVelocity) * 2;
        if (this.x3 + this.largura < 0)
            this.x3 = (this.largura - gameVelocity) * 2;
    }
}

function drawTerreno() {
    terreno.show();
    terreno.atualiza();
}