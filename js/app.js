// App logic for Fast Click (moved from script.js)
// Refactored game logic: grouped into a single App object with clear helpers
import { letters as letters, SESSION_LEN as SESSION_LEN } from './config.js';

export const App = (() => {

  const DOM = {};

  const state = {
    target: null,
    startTime: 0,
    sessionStart: 0,
    sessionBest: null,
    count: 0,
    timerId: null
  };

  function showImage(ch){
    DOM.imageArea.innerHTML = `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${ch}">
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0" stop-color="#16a34a" />
            <stop offset="1" stop-color="#059669" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="200" rx="20" fill="url(#g)" />
        <text x="50%" y="55%" font-size="96" text-anchor="middle" fill="#fff" font-family="Arial, Helvetica, sans-serif" dominant-baseline="middle">${ch}</text>
      </svg>`;
  }

  function pickTarget(){
    state.target = letters[Math.floor(Math.random()*letters.length)];
  }

  function newRound(){
    DOM.result.textContent = '';
    pickTarget();
    showImage(state.target);
    state.startTime = performance.now();
    DOM.nextBtn.style.display = 'none';
  }

  function loadBest(){
    const saved = localStorage.getItem('fastclick_best_session');
    state.sessionBest = saved ? Number(saved) : null;
    DOM.bestSpan.textContent = state.sessionBest === null ? '—' : state.sessionBest;
  }

  function saveBest(ms){
    state.sessionBest = ms;
    localStorage.setItem('fastclick_best_session', String(ms));
    DOM.bestSpan.textContent = ms;
  }

  function startTimer(){
    if (state.timerId) clearInterval(state.timerId);
    state.sessionStart = performance.now();
    DOM.sessionTimerSpan.textContent = '0 ms';
    state.timerId = setInterval(() => {
      DOM.sessionTimerSpan.textContent = `${Math.round(performance.now() - state.sessionStart)} ms`;
    }, 50);
  }

  function stopTimer(finalMs){
    if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
    if (typeof finalMs === 'number') DOM.sessionTimerSpan.textContent = `${finalMs} ms`;
  }

  function startSession(){
    state.count = 0;
    DOM.countSpan.textContent = state.count;
    DOM.result.textContent = '';
    loadBest();
    DOM.startBtn.disabled = true;
    startTimer();
    newRound();
  }

  function endSession(){
    const total = Math.round(performance.now() - state.sessionStart);
    DOM.result.textContent = `Session terminée — temps: ${total} ms`;
    stopTimer(total);
    if (state.sessionBest === null || total < state.sessionBest) saveBest(total);
    DOM.startBtn.disabled = false;
    DOM.nextBtn.style.display = 'none';
  }

  function handleKey(e){
    if (!state.startTime) return;
    const key = e.key.toUpperCase();
    if (key.length !== 1 || key < 'A' || key > 'Z') return;

    if (key === state.target){
      DOM.result.textContent = 'Correct';
      state.count++;
      DOM.countSpan.textContent = state.count;
      state.startTime = 0;

      if (state.count >= SESSION_LEN) {
        endSession();
      } else {
        DOM.nextBtn.style.display = 'none';
        setTimeout(newRound, 500);
      }
    } else {
      DOM.result.textContent = `Faux (touche ${key}). Réessayez !`;
    }
  }

  function init(){
    // populate DOM refs now that DOM is ready
    DOM.imageArea = document.getElementById('imageArea');
    DOM.startBtn = document.getElementById('startBtn');
    DOM.nextBtn = document.getElementById('nextBtn');
    DOM.result = document.getElementById('result');
    DOM.bestSpan = document.getElementById('best');
    DOM.countSpan = document.getElementById('count');
    DOM.sessionTimerSpan = document.getElementById('sessionTimer');

    DOM.startBtn.addEventListener('click', startSession);
    DOM.nextBtn.addEventListener('click', newRound);
    window.addEventListener('keydown', handleKey);
    loadBest();
  }

  return { init };
})();
