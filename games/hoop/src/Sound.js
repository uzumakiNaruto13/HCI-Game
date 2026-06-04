export class SoundManager {
    constructor(game) {
        this.game = game;
        game.scoreSound = new Audio('games/hoop/sounds/what can i say.mp3');
        game.gameWinnerSound = new Audio('games/hoop/sounds/buzzer_beater.mp3');
        game.defenderDunkSound = new Audio('games/hoop/sounds/manba out.mp3');
        game.whatSound = new Audio('games/hoop/sounds/what？.mp3');
        game.whatSound.loop = false;
        game.cnmSound = new Audio('games/hoop/sounds/cnm.mp3');
        game.cnmStealCount = 0;
    }

    triggerCnmAudio(game) {
        game.cnmStealCount++;
        let prob = 0.10;
        if (game.cnmStealCount === 1) prob = 0.10;
        else if (game.cnmStealCount === 2) prob = 0.25;
        else if (game.cnmStealCount === 3) prob = 0.75;
        else if (game.cnmStealCount >= 4) prob = 1.00;

        console.log(`[STEAL AUDIO] 累计被抢断次数: ${game.cnmStealCount}, 本次暴躁触发概率: ${prob * 100}%`);

        if (Math.random() < prob) {
            console.log("%c[STEAL AUDIO] 命中概率！AI 彻底破防触发 cnm.mp3，状态已归零重置", "color: #ff3333; font-weight: bold;");
            if (game.cnmSound) {
                try {
                    game.cnmSound.currentTime = 0;
                    game.cnmSound.play();
                } catch (e) {
                    console.warn("暴躁音效播放被拦截:", e);
                }
            }
            game.cnmStealCount = 0;
        } else {
            console.log("[STEAL AUDIO] 未命中概率，AI 强忍怒火保持沉默");
        }
    }

    playScore(game) {
        try { game.scoreSound.currentTime = 0; game.scoreSound.play(); } catch (e) {}
    }

    playGameWinner(game) {
        try { game.scoreSound.pause(); } catch (e) {}
        if (game.gameWinnerSound) {
            try { game.gameWinnerSound.currentTime = 0; game.gameWinnerSound.play(); } catch (e) {}
        }
    }

    playDefenderDunk(game) {
        if (game.defenderDunkSound) {
            try { game.defenderDunkSound.currentTime = 0; game.defenderDunkSound.play(); } catch (e) {}
        }
    }

    playWhat(game) {
        if (game.whatSound) {
            try {
                game.whatSound.currentTime = 0;
                game.whatSound.play();
            } catch (e) {
                console.warn("贴身干扰音效播放被拦截:", e);
            }
        }
    }
}
