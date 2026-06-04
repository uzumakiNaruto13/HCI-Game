// ====================================================================
// state.js — 全局游戏状态
// ====================================================================

const STATE = {
  // 游戏模式 & 统计
  gameMode: 0,
  gameStats: { score: 0, time: 60, cal: 0, actions: 0, hp: 100, combo: 0, maxCombo: 0 },
  actionStats: { jump: 0, squat: 0, punch: 0, shoot: 0, run: 0 },
  gameRunning: false,
  gameTimer: null
};
