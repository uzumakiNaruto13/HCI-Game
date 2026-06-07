export class UIManager {
    constructor(game) {
        this.game = game;
        game.dunkTimer = null;
    }

    setupDunkVideo(game) {
        const videoElem = document.getElementById('dunk-video');
        if (videoElem) {
            videoElem.addEventListener('ended', () => {
                const badge = document.getElementById('dunk-badge');
                if (badge) badge.classList.remove('show');
                videoElem.currentTime = 0;
            });
        }
    }

    showDunkBadge(game) {
        const badge = document.getElementById('dunk-badge');
        const videoElem = document.getElementById('dunk-video');
        if (!badge || !videoElem) return;
        badge.classList.remove('show');
        videoElem.currentTime = 0;
        videoElem.muted = true;
        videoElem.play().catch(e => console.warn('视频自动播放失败:', e));
        void badge.offsetWidth;
        badge.classList.add('show');
        if (game.dunkTimer) clearTimeout(game.dunkTimer);
        game.dunkTimer = setTimeout(() => {
            if (badge.classList.contains('show')) { badge.classList.remove('show'); videoElem.pause(); videoElem.currentTime = 0; }
        }, 2500);
    }

    playDunkVideo(game) {
        const overlay = document.getElementById('dunk-video-overlay');
        const video = document.getElementById('dunk-video');
        if (overlay && video) {
            overlay.style.display = 'flex';
            video.currentTime = 0;
            video.play().catch(e => console.warn("视频自动播放被浏览器拦截:", e));
            video.onended = () => { overlay.style.display = 'none'; };
            setTimeout(() => { overlay.style.display = 'none'; }, 3000);
        } else {
            this.showDunkBadge(game);
        }
    }

    drawExclamationUI(game, continuousPct, cumulativePct, isTriggeredRed) {
        const ctx = game.exclamationCtx;
        ctx.clearRect(0, 0, 128, 128);
        if (continuousPct === 0 && cumulativePct === 0 && !isTriggeredRed) { game.exclamationSprite.visible = false; return; }
        game.exclamationSprite.visible = true;
        const fillColor = isTriggeredRed ? '#FF0000' : '#FFD700';
        ctx.beginPath(); ctx.roundRect(54, 15, 20, 65, 10); ctx.arc(64, 100, 10, 0, Math.PI * 2);
        if (cumulativePct > 0 || isTriggeredRed) {
            ctx.save(); ctx.strokeStyle = fillColor; ctx.lineWidth = 2 + cumulativePct * 6;
            ctx.shadowColor = fillColor; ctx.shadowBlur = 15 * cumulativePct; ctx.stroke(); ctx.restore();
        }
        ctx.save(); ctx.fillStyle = 'rgba(100, 100, 100, 0.7)'; ctx.fill(); ctx.restore();
        if (continuousPct > 0 || isTriggeredRed) {
            ctx.save(); ctx.clip(); ctx.fillStyle = fillColor;
            const totalHeight = 95, currentHeight = isTriggeredRed ? totalHeight : continuousPct * totalHeight;
            ctx.fillRect(0, 110 - currentHeight, 128, currentHeight);
            ctx.restore();
        }
        game.exclamationTexture.needsUpdate = true;
    }

    updateChargeBar(game, delta) {
        let recommendedPercent = 50;
        const recommendEl = document.getElementById('charge-recommend');
        const fill = document.getElementById('charge-fill');
        const chargeContainer = document.getElementById('charge-bar-container');
        if ((game.ballAttached || game.isCharging) && game.playerModel && game.hoopCenter) {
            const handPos = game.getHandWorldPos();
            const dx = game.hoopCenter.x - handPos.x, dz = game.hoopCenter.z - handPos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const maxCourtDist = Math.abs(game.hoopCenter.z);
            recommendedPercent = Math.min(100, Math.max(0, ((dist - 2) / (maxCourtDist - 2)) * 100));
            if (recommendEl) { recommendEl.style.left = recommendedPercent + '%'; recommendEl.style.transform = 'translateX(-50%)'; }
        }
        if (game.isCharging) {
            const currentPercent = game.displayProgress * 100;
            const inZone = Math.abs(currentPercent - recommendedPercent) <= 9;
            if (inZone) {
                game.slowMotionTimer = 0.15;
                if (chargeContainer) { chargeContainer.style.boxShadow = '0 0 25px 10px rgba(255,255,255,0.9)'; chargeContainer.style.borderColor = '#FFFFFF'; }
            } else {
                if (chargeContainer) { chargeContainer.style.boxShadow = 'none'; chargeContainer.style.borderColor = '#E0E0E0'; }
            }
            const unscaledDelta = (game.slowMotionTimer > 0) ? delta / 0.2 : delta;
            game.displayProgress += unscaledDelta * (inZone ? 0.10 : 0.85);
            if (game.displayProgress >= 1.0) game.displayProgress = 0;
            if (fill) fill.style.width = (game.displayProgress * 100) + '%';
            if (recommendEl) {
                if (inZone) { recommendEl.style.background = '#FF3333'; recommendEl.style.width = '28px'; }
                else { recommendEl.style.background = '#FFD700'; recommendEl.style.width = '4px'; }
            }
        } else {
            if (chargeContainer) { chargeContainer.style.boxShadow = 'none'; chargeContainer.style.borderColor = '#E0E0E0'; }
            if (recommendEl) { recommendEl.style.width = '4px'; recommendEl.style.background = '#FFD700'; }
        }
    }
}
