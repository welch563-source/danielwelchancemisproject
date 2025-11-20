// TicTacToe game logic extracted and wrapped to run after DOM loads
document.addEventListener('DOMContentLoaded', () => {
 class TicTacToe {
 constructor() {
 this.board = Array(9).fill('');
 this.currentPlayer = 'X';
 this.gameActive = true;
 this.scores = { X: 0, O: 0, draw: 0 };

 this.winningCombinations = [
 [0,1,2],[3,4,5],[6,7,8],
 [0,3,6],[1,4,7],[2,5,8],
 [0,4,8],[2,4,6]
 ];

 this.loadScores();
 this.initializeGame();
 }

 loadScores(){
 try{
 const raw = localStorage.getItem('tic_scores');
 if (raw){
 const parsed = JSON.parse(raw);
 if (parsed && typeof parsed === 'object'){
 this.scores.X = parsed.X || 0;
 this.scores.O = parsed.O || 0;
 this.scores.draw = parsed.draw || 0;
 }
 }
 } catch(e){ console.warn('Could not load scores', e); }
 }

 saveScores(){
 try{
 localStorage.setItem('tic_scores', JSON.stringify(this.scores));
 } catch(e){ console.warn('Could not save scores', e); }
 }

 initializeGame(){
 this.board.fill('');
 this.currentPlayer = 'X';
 this.gameActive = true;
 this.updateDisplay();
 this.clearMessage();
 this.clearBoard();
 this.attachEventListeners();
 }

 attachEventListeners(){
 const cells = document.querySelectorAll('.cell');
 cells.forEach(cell => cell.addEventListener('click', (e)=> this.handleCellClick(e)));
 const resetBtn = document.getElementById('resetBtn');
 const resetScoreBtn = document.getElementById('resetScoreBtn');
 if (resetBtn) {
 resetBtn.addEventListener('click', ()=> { if (typeof audioManager !== 'undefined') audioManager.playClick(); this.resetGame(); });
 }
 if (resetScoreBtn) {
 resetScoreBtn.addEventListener('click', ()=> { if (typeof audioManager !== 'undefined') audioManager.playClick(); this.resetScore(); });
 }
 }

 handleCellClick(e){
 const cell = e.target.closest('.cell');
 if (!cell) return;
 const index = parseInt(cell.dataset.index, 10);
 if (this.board[index] !== '' || !this.gameActive) return;

 if (typeof window.startBackgroundMusic === 'function') {
 window.startBackgroundMusic();
 }

 this.makeMove(index);
 }

 makeMove(index){
 this.board[index] = this.currentPlayer;
 this.updateCell(index);

 if (this.checkWin()){
 this.handleWin();
 } else if (this.checkDraw()){
 this.handleDraw();
 } else {
 this.switchPlayer();
 }
 }

 getIconHtml(player){
 const isBulldog = player === 'X';
 const src = isBulldog ? 'UMDBulldog.png' : 'SuperiorSilhouette.png';
 const fallback = isBulldog ? '🐾' : '🌊';
 return `<img class="icon-image" alt="${isBulldog ? 'UMD Bulldog' : 'Lake Superior'}" src="${src}" onerror="this.replaceWith(document.createTextNode('${fallback}'))">`;
 }

 updateCell(index){
 const cell = document.querySelector(`[data-index="${index}"]`);
 if (!cell) return;
 cell.innerHTML = this.getIconHtml(this.currentPlayer);
 cell.classList.add(this.currentPlayer.toLowerCase());

 // Play synthesized move sound (fallback to audio element if present)
 try {
 if (typeof audioManager !== 'undefined') audioManager.playMove();
 else {
 const moveSound = document.getElementById('moveSound');
 if (moveSound){ moveSound.currentTime = 0; moveSound.play().catch(()=>{}); }
 }
 } catch(e){ console.warn('Move sound error', e); }

 cell.style.transform = 'scale(0)';
 setTimeout(()=> { cell.style.transform = 'scale(1)'; }, 100);
 // update aria label for screen readers
 try {
 const label = `Cell ${index + 1}, ${this.currentPlayer === 'X' ? 'Player 1' : 'Player 2'}`;
 cell.setAttribute('aria-label', label);
 const aria = document.getElementById('ariaLive');
 if (aria) aria.textContent = `${this.currentPlayer === 'X' ? 'Player 1' : 'Player 2'} placed on cell ${index + 1}`;
 } catch (e) {}
 }

 checkWin(){
 return this.winningCombinations.some(combination=>{
 const [a,b,c] = combination;
 return this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c];
 });
 }

 checkDraw(){
 return this.board.every(cell => cell !== '');
 }

 handleWin(){
 this.gameActive = false;
 this.scores[this.currentPlayer]++;
 this.updateScores();
 this.highlightWinningCells();
 this.showMessage(`${this.currentPlayer === 'X' ? 'Player 1' : 'Player 2'} Wins! 🎉`);
 try { if (typeof audioManager !== 'undefined') audioManager.playWin(); } catch(e){}
 }

 handleDraw(){
 this.gameActive = false;
 this.scores.draw++;
 this.updateScores();
 this.showMessage("It's a Draw! 🤝");
 }

 highlightWinningCells(){
 const winningCombination = this.winningCombinations.find(combination => {
 const [a,b,c] = combination;
 return this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c];
 });
 if (winningCombination){
 winningCombination.forEach(index=>{
 const cell = document.querySelector(`[data-index="${index}"]`);
 if (cell) cell.classList.add('winning');
 });
 }
 }

 switchPlayer(){
 this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
 this.updateDisplay();
 }

 updateDisplay(){
 const currentPlayerElement = document.getElementById('currentPlayer');
 const name = this.currentPlayer === 'X' ? 'Player 1' : 'Player 2';
 if (currentPlayerElement){
 currentPlayerElement.textContent = `${name}'s Turn`;
 currentPlayerElement.style.color = this.currentPlayer === 'X' ? 'var(--danger-color)' : 'var(--success-color)';
 }
 }

 updateScores(){
 const sX = document.getElementById('scoreX');
 const sO = document.getElementById('scoreO');
 const sD = document.getElementById('scoreDraw');
 if (sX) sX.textContent = this.scores.X;
 if (sO) sO.textContent = this.scores.O;
 if (sD) sD.textContent = this.scores.draw;
 try { this.saveScores(); } catch(e){}
 }

 showMessage(message){
 const messageElement = document.getElementById('gameMessage');
 if (!messageElement) return;
 messageElement.textContent = message;
 messageElement.classList.add('show');
 if (message.includes('Wins')) messageElement.classList.add('win');
 else if (message.includes('Draw')) messageElement.classList.add('draw');
 try { const aria = document.getElementById('ariaLive'); if (aria) aria.textContent = message; } catch(e){}
 }

 clearMessage(){
 const messageElement = document.getElementById('gameMessage');
 if (!messageElement) return;
 messageElement.classList.remove('show','win','draw');
 }

 clearBoard(){
 const cells = document.querySelectorAll('.cell');
 cells.forEach((cell, i)=>{
 cell.innerHTML='';
 cell.className='cell';
 try { cell.setAttribute('aria-label', `Cell ${i+1}, empty`); } catch(e){}
 });
 }

 resetGame(){ this.initializeGame(); }
 resetScore(){ this.scores = {X:0,O:0,draw:0}; this.updateScores(); this.resetGame(); }
 }

 // Theme toggle
 const themeToggle = document.getElementById('themeToggle');
 const body = document.body;
 if (themeToggle){
 themeToggle.addEventListener('click', ()=>{
 body.classList.toggle('dark-mode');
 localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
 });
 }
 if (localStorage.getItem('darkMode') === 'true') body.classList.add('dark-mode');

 // AudioManager: synth background music + SFX (no external files required)
 class AudioManager {
 constructor() {
 this.ctx = null;
 this.musicGain = null;
 this.sfxGain = null;
 this.padOsc1 = null;
 this.padOsc2 = null;
 this.isPlaying = false;
 this.progressInterval = null;
 this.musicVolume = 0.25;
 this.sfxVolume = 0.9;
 }

 async init() {
 if (this.ctx) return;
 try {
 this.ctx = new (window.AudioContext || window.webkitAudioContext)();
 } catch (e) {
 console.warn('WebAudio not supported', e);
 return;
 }

 this.musicGain = this.ctx.createGain();
 this.musicGain.gain.value = this.musicVolume;
 this.musicGain.connect(this.ctx.destination);

 this.sfxGain = this.ctx.createGain();
 this.sfxGain.gain.value = this.sfxVolume;
 this.sfxGain.connect(this.ctx.destination);
 }

 async startMusic() {
 if (!this.ctx) await this.init();
 if (!this.ctx) return;
 if (this.isPlaying) return;

 // Create two detuned oscillators for a warm pad
 this.padOsc1 = this.ctx.createOscillator();
 this.padOsc2 = this.ctx.createOscillator();
 const padGain = this.ctx.createGain();
 padGain.gain.value = 0.0001; // start very low

 this.padOsc1.type = 'sine';
 this.padOsc2.type = 'sine';
 this.padOsc1.frequency.value = 110; // A2
 this.padOsc2.frequency.value = 110 * 1.01; // slight detune

 // gentle lowpass for warmth
 const lp = this.ctx.createBiquadFilter();
 lp.type = 'lowpass';
 lp.frequency.value = 1200;

 this.padOsc1.connect(padGain);
 this.padOsc2.connect(padGain);
 padGain.connect(lp);
 lp.connect(this.musicGain);

 const now = this.ctx.currentTime;
 padGain.gain.cancelScheduledValues(now);
 padGain.gain.setValueAtTime(0.0001, now);
 padGain.gain.linearRampToValueAtTime(0.25, now + 2.5);

 this.padOsc1.start(now);
 this.padOsc2.start(now);
 this.isPlaying = true;

 // progress chord sequence every 4s (simple subtle movement)
 const notes = [110, 130.81, 146.83, 164.81]; // A2, C3, D3, E3-ish
 let idx = 0;
 this.progressInterval = setInterval(() => {
 const t = this.ctx.currentTime;
 const base = notes[idx % notes.length];
 // gently glide to new frequency
 this.padOsc1.frequency.cancelScheduledValues(t);
 this.padOsc2.frequency.cancelScheduledValues(t);
 this.padOsc1.frequency.linearRampToValueAtTime(base, t + 2);
 this.padOsc2.frequency.linearRampToValueAtTime(base * 1.01, t + 2);
 idx++;
 }, 4000);
 }

 stopMusic() {
 if (!this.isPlaying) return;
 try {
 const now = this.ctx.currentTime;
 // fade out
 if (this.musicGain) {
 this.musicGain.gain.cancelScheduledValues(now);
 this.musicGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
 }
 if (this.padOsc1) this.padOsc1.stop(now + 1.3);
 if (this.padOsc2) this.padOsc2.stop(now + 1.3);
 } catch (e) { /* ignore */ }
 clearInterval(this.progressInterval);
 this.isPlaying = false;
 }

 setMusicVolume(v) { this.musicVolume = v; if (this.musicGain) this.musicGain.gain.value = v; }
 setSfxVolume(v) { this.sfxVolume = v; if (this.sfxGain) this.sfxGain.gain.value = v; }

 // short click sound
 playClick() {
 if (!this.ctx) return;
 const o = this.ctx.createOscillator();
 const g = this.ctx.createGain();
 o.type = 'triangle';
 o.frequency.value = 800;
 g.gain.value = 0.0001;
 o.connect(g);
 g.connect(this.sfxGain);
 const now = this.ctx.currentTime;
 g.gain.setValueAtTime(0.0001, now);
 g.gain.linearRampToValueAtTime(0.12, now + 0.01);
 g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
 o.start(now);
 o.stop(now + 0.3);
 }

 // move sound — small ascending sweep
 playMove() {
 if (!this.ctx) return;
 const o = this.ctx.createOscillator();
 const g = this.ctx.createGain();
 o.type = 'sine';
 const now = this.ctx.currentTime;
 o.frequency.setValueAtTime(220, now);
 o.frequency.exponentialRampToValueAtTime(660, now + 0.18);
 g.gain.setValueAtTime(0.0001, now);
 g.gain.linearRampToValueAtTime(0.16, now + 0.02);
 g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
 o.connect(g);
 g.connect(this.sfxGain);
 o.start(now);
 o.stop(now + 0.3);
 }

 // celebratory chord
 playWin() {
 if (!this.ctx) return;
 const now = this.ctx.currentTime;
 const freqs = [440, 550, 660];
 const gains = freqs.map(() => this.ctx.createGain());
 const oscs = freqs.map((f, i) => {
 const o = this.ctx.createOscillator();
 o.type = 'sine';
 o.frequency.value = f;
 o.connect(gains[i]);
 gains[i].connect(this.sfxGain);
 gains[i].gain.setValueAtTime(0.0001, now);
 gains[i].gain.linearRampToValueAtTime(0.12, now + 0.02);
 gains[i].gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
 o.start(now);
 o.stop(now + 1.3);
 return o;
 });
 }
 }

 const audioManager = new AudioManager();

 // DOM audio elements (optional - user-supplied files)
 const bgAudioEl = document.getElementById('bgAudio');
 const moveAudioEl = document.getElementById('moveSound');
 const clickAudioEl = document.getElementById('clickSound');
 const winAudioEl = document.getElementById('winSound');
 const aiThinkingEl = document.getElementById('aiThinking');

 let musicStarted = false;
 window.startBackgroundMusic = async () => {
 if (musicStarted) return;
 // prefer HTMLAudioElement if provided, otherwise start synth
 if (bgAudioEl && typeof bgAudioEl.play === 'function') {
 try {
 await bgAudioEl.play();
 musicStarted = true;
 return true;
 } catch (e) {
 // fall back to synth if autoplay blocked
 }
 }
 await audioManager.init();
 await audioManager.startMusic();
 musicStarted = true;
 return true;
 };

 const ensureMusicPlays = async ()=>{ if (!musicStarted) await window.startBackgroundMusic(); };
 document.addEventListener('click', ensureMusicPlays, { once: true });
 document.addEventListener('touchstart', ensureMusicPlays, { once: true });
 document.addEventListener('keydown', ensureMusicPlays, { once: true });
 document.addEventListener('mousedown', ensureMusicPlays, { once: true });

 // Initialize game
 const game = new TicTacToe();

 // AI mode settings (persisted)
 const modeSelect = document.getElementById('modeSelect');
 const aiDifficultySelect = document.getElementById('aiDifficulty');
 let mode = 'two-player';
 let aiDifficulty = 'easy';
 try{
 const m = localStorage.getItem('tic_mode'); if (m) { mode = m; if (modeSelect) modeSelect.value = mode; }
 const d = localStorage.getItem('tic_ai_difficulty'); if (d) { aiDifficulty = d; if (aiDifficultySelect) aiDifficultySelect.value = aiDifficulty; }
 }catch(e){}

 if (modeSelect){
 modeSelect.addEventListener('change', (e)=>{ mode = e.target.value; try{ localStorage.setItem('tic_mode', mode);}catch(e){} });
 }
 if (aiDifficultySelect){
 aiDifficultySelect.addEventListener('change', (e)=>{ aiDifficulty = e.target.value; try{ localStorage.setItem('tic_ai_difficulty', aiDifficulty);}catch(e){} });
 }

 // Additional listeners to ensure music starts
 document.querySelectorAll('.cell').forEach(cell=> cell.addEventListener('click', ensureMusicPlays, { once: true }));
 const rBtn = document.getElementById('resetBtn');
 const rScoreBtn = document.getElementById('resetScoreBtn');
 if (rBtn) rBtn.addEventListener('click', ensureMusicPlays, { once: true });
 if (rScoreBtn) rScoreBtn.addEventListener('click', ensureMusicPlays, { once: true });

 // Wire UI audio controls (music toggle, sfx toggle, volume)
 const musicToggleBtn = document.getElementById('musicToggle');
 const sfxToggleBtn = document.getElementById('sfxToggle');
 const musicVolumeInput = document.getElementById('musicVolume');
 let musicOn = false;
 let sfxOn = true;

 // Load saved audio preferences (if any)
 try {
 const storedMusic = localStorage.getItem('tic_music_on');
 const storedSfx = localStorage.getItem('tic_sfx_on');
 const storedVol = localStorage.getItem('tic_music_volume');
 if (storedVol !== null && musicVolumeInput) {
 const v = parseFloat(storedVol);
 musicVolumeInput.value = v;
 audioManager.setMusicVolume(v);
 try { if (bgAudioEl) bgAudioEl.volume = v; } catch(e){}
 }
 if (storedSfx !== null) {
 sfxOn = storedSfx === 'true';
 if (sfxToggleBtn) sfxToggleBtn.textContent = sfxOn ? '🔊' : '🔈';
 audioManager.setSfxVolume(sfxOn ? 0.9 : 0);
 // ensure HTML audio elements respect the sfxOn setting
 try { if (moveAudioEl) moveAudioEl.volume = sfxOn ? 1.0 : 0; if (clickAudioEl) clickAudioEl.volume = sfxOn ? 1.0 : 0; if (winAudioEl) winAudioEl.volume = sfxOn ? 1.0 : 0; } catch(e){}
 }
 if (storedMusic !== null) {
 musicOn = storedMusic === 'true';
 if (musicToggleBtn) musicToggleBtn.textContent = musicOn ? '🔇' : '🎵';
 if (musicOn) {
 // try to play HTML audio if present, otherwise start synth (gesture rules may block immediately)
 if (bgAudioEl && typeof bgAudioEl.play === 'function') {
 try { bgAudioEl.play().catch(()=>{}); } catch(e){}
 } else {
 audioManager.init().then(()=> audioManager.startMusic().catch(()=>{})).catch(()=>{});
 }
 }
 }
 } catch (e) { console.warn('Could not read audio prefs', e); }

 if (musicToggleBtn) {
 musicToggleBtn.addEventListener('click', async () => {
 try {
 if (!musicOn) {
 // prefer bgAudio element
 if (bgAudioEl && typeof bgAudioEl.play === 'function') {
 try { await bgAudioEl.play(); } catch(e){ /* fallback below */ }
 }
 // ensure synth available as fallback
 await audioManager.init();
 await audioManager.startMusic().catch(()=>{});
 musicOn = true;
 musicToggleBtn.textContent = '🔇';
 try { localStorage.setItem('tic_music_on', 'true'); } catch(e){}
 } else {
 // stop both
 try { if (bgAudioEl) { bgAudioEl.pause(); bgAudioEl.currentTime = 0; } } catch(e){}
 audioManager.stopMusic();
 musicOn = false;
 musicToggleBtn.textContent = '🎵';
 try { localStorage.setItem('tic_music_on', 'false'); } catch(e){}
 }
 } catch (e) { console.warn(e); }
 });
 }

 if (sfxToggleBtn) {
 sfxToggleBtn.addEventListener('click', () => {
 sfxOn = !sfxOn;
 if (sfxOn) {
 audioManager.setSfxVolume(0.9);
 // ensure HTML audio elements are audible
 try { if (moveAudioEl) moveAudioEl.volume = 1.0; if (clickAudioEl) clickAudioEl.volume = 1.0; if (winAudioEl) winAudioEl.volume = 1.0; } catch(e){}
 sfxToggleBtn.textContent = '🔊';
 try { localStorage.setItem('tic_sfx_on', 'true'); } catch(e){}
 } else {
 audioManager.setSfxVolume(0);
 try { if (moveAudioEl) moveAudioEl.volume = 0; if (clickAudioEl) clickAudioEl.volume = 0; if (winAudioEl) winAudioEl.volume = 0; } catch(e){}
 sfxToggleBtn.textContent = '🔈';
 try { localStorage.setItem('tic_sfx_on', 'false'); } catch(e){}
 }
 });
 }

 if (musicVolumeInput) {
 musicVolumeInput.addEventListener('input', (e) => {
 const v = parseFloat(e.target.value);
 audioManager.setMusicVolume(v);
 try { if (bgAudioEl) bgAudioEl.volume = v; } catch(e){}
 try { localStorage.setItem('tic_music_volume', String(v)); } catch(e){}
 });
 }

 // Helper wrappers: prefer HTMLAudio elements if provided, otherwise fall back to synth
 // SFX playback helpers: try HTMLAudio first, on failure fallback to quick synth so SFX always heard after a user gesture
 function synthFallback(type){
 try{
 const Ctx = window.AudioContext || window.webkitAudioContext;
 const ctx = (audioManager && audioManager.ctx) ? audioManager.ctx : new Ctx();
 const now = ctx.currentTime;
 if (type === 'click'){
 const o = ctx.createOscillator(); const g = ctx.createGain();
 o.type = 'triangle'; o.frequency.value = 880;
 g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(0.12, now + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
 o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 0.25);
 } else if (type === 'move'){
 const o = ctx.createOscillator(); const g = ctx.createGain();
 o.type = 'sine'; o.frequency.setValueAtTime(220, now); o.frequency.exponentialRampToValueAtTime(660, now + 0.18);
 g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(0.16, now + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
 o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 0.3);
 } else if (type === 'win'){
 const freqs = [440, 550, 660];
 freqs.forEach((f,i)=>{
 const o = ctx.createOscillator(); const g = ctx.createGain();
 o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, now + i*0.02); g.gain.linearRampToValueAtTime(0.12, now + 0.02 + i*0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
 o.connect(g); g.connect(ctx.destination); o.start(now + i*0.02); o.stop(now + 1.3);
 });
 }
 }catch(e){ /* best-effort fallback */ }
 }

 function playClickSfx(){
 if (!sfxOn) return;
 try{
 if (clickAudioEl && typeof clickAudioEl.play === 'function'){
 clickAudioEl.currentTime = 0;
 const p = clickAudioEl.play();
 if (p && typeof p.catch === 'function') p.catch(()=>{ synthFallback('click'); });
 return;
 }
 }catch(e){}
 synthFallback('click');
 }
 function playMoveSfx(){
 if (!sfxOn) return;
 try{
 if (moveAudioEl && typeof moveAudioEl.play === 'function'){
 moveAudioEl.currentTime = 0;
 const p = moveAudioEl.play();
 if (p && typeof p.catch === 'function') p.catch(()=>{ synthFallback('move'); });
 return;
 }
 }catch(e){}
 synthFallback('move');
 }
 function playWinSfx(){
 if (!sfxOn) return;
 try{
 if (winAudioEl && typeof winAudioEl.play === 'function'){
 winAudioEl.currentTime = 0;
 const p = winAudioEl.play();
 if (p && typeof p.catch === 'function') p.catch(()=>{ synthFallback('win'); });
 return;
 }
 }catch(e){}
 synthFallback('win');
 }

 // Monkey-patch audioManager sfx methods so existing calls go through our wrappers
 try{ audioManager.playClick = playClickSfx; audioManager.playMove = playMoveSfx; audioManager.playWin = playWinSfx; } catch(e){}

 // AI logic: pick move based on difficulty
 function getAvailableMoves(board){
 const moves = [];
 board.forEach((v,i)=>{ if (!v) moves.push(i); });
 return moves;
 }

 function checkWinnerFor(board){
 const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
 for (const [a,b,c] of wins){
 if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
 }
 if (board.every(Boolean)) return 'draw';
 return null;
 }

 function minimax(board, player, depth){
 const winner = checkWinnerFor(board);
 if (winner === 'O') return {score: 10 - depth};
 if (winner === 'X') return {score: depth - 10};
 if (winner === 'draw') return {score: 0};

 const moves = getAvailableMoves(board);
 const outcomes = [];
 for (const m of moves){
 const newBoard = board.slice();
 newBoard[m] = player;
 const nextPlayer = player === 'O' ? 'X' : 'O';
 const result = minimax(newBoard, nextPlayer, depth + 1);
 outcomes.push({move: m, score: result.score});
 }

 if (player === 'O'){
 // maximize for AI
 let best = outcomes[0];
 for (const o of outcomes) if (o.score > best.score) best = o;
 return best;
 } else {
 // minimize for human
 let best = outcomes[0];
 for (const o of outcomes) if (o.score < best.score) best = o;
 return best;
 }
 }

 function aiChooseMove(){
 const boardState = game.board.slice();
 const moves = getAvailableMoves(boardState);
 if (moves.length === 0) return null;
 if (aiDifficulty === 'easy'){
 return moves[Math.floor(Math.random() * moves.length)];
 }
 if (aiDifficulty === 'medium'){
 // Medium strategy: win if possible, block opponent win, take center, take corner, else random
 // 1) win
 for (const m of moves){
 const nb = boardState.slice(); nb[m] = 'O'; if (checkWinnerFor(nb) === 'O') return m;
 }
 // 2) block
 for (const m of moves){
 const nb = boardState.slice(); nb[m] = 'X'; if (checkWinnerFor(nb) === 'X') return m;
 }
 // 3) center
 if (moves.includes(4)) return 4;
 // 4) corner
 const corners = moves.filter(i => [0,2,6,8].includes(i));
 if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
 // 5) fallback random
 return moves[Math.floor(Math.random() * moves.length)];
 }
 // hard = minimax
 const best = minimax(boardState, 'O', 0);
 return (best && typeof best.move === 'number') ? best.move : moves[0];
 }

 // When in single-player mode and it's O's turn, have AI play
 const originalMakeMove = game.makeMove.bind(game);
 game.makeMove = function(index){
 originalMakeMove(index);
 // after human move, if single-player and game still active and currentPlayer is O, let AI move
 try{
 if (mode === 'single-player' && this.gameActive && this.currentPlayer === 'O'){
 // delay based on difficulty to create a natural feel
 let minDelay = 250, maxDelay = 500;
 if (aiDifficulty === 'easy') { minDelay = 200; maxDelay = 450; }
 else if (aiDifficulty === 'medium') { minDelay = 500; maxDelay = 900; }
 else if (aiDifficulty === 'hard') { minDelay = 120; maxDelay = 320; }
 const delay = minDelay + Math.floor(Math.random() * (maxDelay - minDelay));

 // show local AI thinking indicator
 try{ if (aiThinkingEl) { aiThinkingEl.setAttribute('aria-hidden','false'); aiThinkingEl.classList.add('visible'); } } catch(e){}

 setTimeout(() => {
 // choose move
 const moveIndex = aiChooseMove();
 // hide thinking indicator
 try{ if (aiThinkingEl) { aiThinkingEl.setAttribute('aria-hidden','true'); aiThinkingEl.classList.remove('visible'); } } catch(e){}

 if (moveIndex !== null && this.gameActive){
 // if cell empty
 if (this.board[moveIndex] === ''){
 // play move SFX (wrapper will prefer audio element)
 try { if (typeof audioManager !== 'undefined') audioManager.playMove(); } catch(e){}
 // perform AI move
 originalMakeMove(moveIndex);
 }
 }
 }, delay);
 }
 }catch(e){ console.warn('AI move error', e); }
 };

 // Keyboard navigation: arrow keys + enter/space to play
 let focusedIndex = 4;
 const focusCell = (index) => {
 index = ((index % 9) + 9) % 9;
 const cells = Array.from(document.querySelectorAll('.cell'));
 cells.forEach((c, i) => { c.tabIndex = (i === index ? 0 : -1); });
 const el = document.querySelector(`[data-index="${index}"]`);
 if (el) el.focus();
 focusedIndex = index;
 };

 // initialize focus to center cell
 focusCell(focusedIndex);

 document.addEventListener('focusin', (e) => {
 const c = e.target.closest && e.target.closest('.cell');
 if (c) {
 const idx = parseInt(c.dataset.index, 10);
 if (!Number.isNaN(idx)) focusedIndex = idx;
 }
 });

 document.addEventListener('keydown', (e) => {
 const key = e.key;
 const row = Math.floor(focusedIndex / 3);
 const col = focusedIndex % 3;
 let newIndex = focusedIndex;
 if (key === 'ArrowLeft') {
 newIndex = row * 3 + ((col + 2) % 3);
 focusCell(newIndex);
 e.preventDefault();
 return;
 }
 if (key === 'ArrowRight') {
 newIndex = row * 3 + ((col + 1) % 3);
 focusCell(newIndex);
 e.preventDefault();
 return;
 }
 if (key === 'ArrowUp') {
 newIndex = ((row + 2) % 3) * 3 + col;
 focusCell(newIndex);
 e.preventDefault();
 return;
 }
 if (key === 'ArrowDown') {
 newIndex = ((row + 1) % 3) * 3 + col;
 focusCell(newIndex);
 e.preventDefault();
 return;
 }
 if (key === 'Enter' || key === ' ') {
 e.preventDefault();
 // attempt move on focused index
 if (game && game.gameActive && game.board && game.board[focusedIndex] === '') {
 // play click sfx
 try { if (typeof audioManager !== 'undefined') audioManager.playClick(); } catch(e){}
 game.makeMove(focusedIndex);
 }
 }
 });

 // Keyboard shortcuts: 'r' = new game, 'R' (shift+r) = reset scores
 document.addEventListener('keydown', (e) => {
 const target = e.target || {};
 if (target.tagName === 'INPUT' || target.isContentEditable) return;
 if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
 try { if (typeof audioManager !== 'undefined') audioManager.playClick(); } catch(e){}
 if (game) game.resetGame();
 }
 if (e.key === 'R' || (e.key === 'r' && e.shiftKey)) {
 try { if (typeof audioManager !== 'undefined') audioManager.playClick(); } catch(e){}
 if (game) game.resetScore();
 }
 });

 // Hide preloader once initialized
 try {
 const preloader = document.getElementById('preloader');
 if (preloader) setTimeout(() => preloader.setAttribute('aria-hidden','true'), 600);
 } catch (e) {}
});
