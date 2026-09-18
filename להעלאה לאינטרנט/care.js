/* צאבי — טיפול | © דניאל אברהם חדאד | CBY-T7R4L2E9 */
(function (global) {
  'use strict';

  var KEY = 'chubby_care_v1';
  var state = {
    hunger: 70,
    joy: 80,
    clean: 75,
    health: 90,
    last: Date.now()
  };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        state.hunger = clamp(s.hunger);
        state.joy = clamp(s.joy);
        state.clean = clamp(s.clean);
        state.health = clamp(s.health);
        state.last = s.last || Date.now();
      }
    } catch (e) {}
    decaySince();
  }

  function clamp(n) {
    n = Number(n);
    if (isNaN(n)) return 50;
    return Math.max(0, Math.min(100, n));
  }

  function save() {
    state.last = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function decaySince() {
    var hours = Math.min(48, (Date.now() - state.last) / 3600000);
    state.hunger = clamp(state.hunger - hours * 4);
    state.joy = clamp(state.joy - hours * 3);
    state.clean = clamp(state.clean - hours * 2.5);
    if (state.hunger < 25 || state.clean < 25) {
      state.health = clamp(state.health - hours * 2);
    }
  }

  function moodText() {
    if (state.health < 35) return 'צאבי מרגיש חלש… צריך טיפול כמו במרכז ההצלה.';
    if (state.hunger < 30) return 'צאבי רעב! אצות ועשבי ים יעזרו 🥬';
    if (state.clean < 30) return 'השריון מלוכלך מאצות… בואו ננקה.';
    if (state.joy < 35) return 'צאבי רוצה לשחק בגלים!';
    if (state.joy > 85 && state.hunger > 70) return 'צאבי מאושר ומחייך מהמים! 🐢💙';
    return 'צאבי מוכן להציל ביצים איתכם.';
  }

  function petEmoji() {
    if (state.health < 35) return '🤒';
    if (state.hunger < 30) return '😩';
    if (state.joy > 85) return '🥰';
    return '🐢';
  }

  function render() {
    var h = document.getElementById('m-hunger');
    var j = document.getElementById('m-joy');
    var c = document.getElementById('m-clean');
    var he = document.getElementById('m-health');
    if (h) h.value = state.hunger;
    if (j) j.value = state.joy;
    if (c) c.value = state.clean;
    if (he) he.value = state.health;
    var msg = document.getElementById('care-msg');
    if (msg) msg.textContent = moodText();
    var pet = document.getElementById('care-pet');
    if (pet) pet.textContent = petEmoji();
  }

  function act(type) {
    decaySince();
    var gained = 0;
    if (type === 'feed') {
      state.hunger = clamp(state.hunger + 28);
      state.joy = clamp(state.joy + 6);
      gained = 2;
    } else if (type === 'play') {
      state.joy = clamp(state.joy + 30);
      state.hunger = clamp(state.hunger - 8);
      gained = 3;
    } else if (type === 'clean') {
      state.clean = clamp(state.clean + 35);
      state.health = clamp(state.health + 5);
      gained = 2;
    } else if (type === 'heal') {
      state.health = clamp(state.health + 25);
      state.clean = clamp(state.clean + 5);
      gained = 4;
    }
    save();
    render();
    if (global.CBY && CBY.addStars) CBY.addStars(gained);
    return moodText();
  }

  function init() {
    load();
    render();
    setInterval(function () {
      decaySince();
      save();
      render();
    }, 60000);
  }

  global.CBY_CARE = { init: init, act: act, render: render, getState: function () { return state; } };
})(typeof window !== 'undefined' ? window : globalThis);
