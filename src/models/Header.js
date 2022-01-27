function drawHeader() {

    fill(100);
    textSize(18);
    textAlign(CENTER);
    text('IA jogando Dino!', width * 0.7, 20);
    textSize(14);
    text('(@ivansansao)', width * 0.7, 40);

    textAlign(CENTER);
    text(`Velocidade: ${gameVelocity}`, width / 3, 20);

    let medFps = (Number(fpsMin) + Number(fpsMax)) / 2;
    textSize(10);
    text(`Fps (${fpsMin}-${fpsMax} M${medFps.toFixed(0)}): ${fpsAtu}`, width / 3, 40);

    if (frameCount % 60 == 0) {
        fpsMin = 99;
        fpsMax = 0;
        fpsAtu = Math.floor(getFrameRate());
    }


    if (getFrameRate() > fpsMax)
        fpsMax = getFrameRate().toFixed(0);
    if (getFrameRate() < fpsMin && getFrameRate() > 0)
        fpsMin = getFrameRate().toFixed(0);
}