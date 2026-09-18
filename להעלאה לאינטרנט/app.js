/* 🐢 צאבי הצב — ליבת האפליקציה
   © כל הזכויות שמורות | דניאל אברהם חדאד / Daniel Avraham Haddad | CBY-T7R4L2E9 */
(function () {
  'use strict';

  var brain = null;
  var stars = 0;
  var STAR_KEY = 'chubby_stars_v1';
  var RANK_KEY = 'chubby_rank_v1';
  var ASKED_KEY = 'chubby_asked_v1';
  var currentGame = null;
  var askedIds = {};

  /* דרגות הצלה — כמו באקדמיה של באזי, אבל של שומרי צבים */
  var RANKS = [
    { min: 0, name: 'חבר צבים', icon: '🐣' },
    { min: 25, name: 'סייר חוף', icon: '🏖️' },
    { min: 60, name: 'מגן קינים', icon: '🥚' },
    { min: 120, name: 'מלווה אבקועים', icon: '🐢' },
    { min: 200, name: 'מתנדב צבים', icon: '🎽' },
    { min: 320, name: 'שומר צבי הים', icon: '🛡️' },
    { min: 500, name: 'אלוף הים של צאבי', icon: '👑' }
  ];

  function $(id) { return document.getElementById(id); }

  /* ——— כוכבים ודרגות ——— */

  function loadStars() {
    try { stars = parseInt(localStorage.getItem(STAR_KEY) || '0', 10) || 0; }
    catch (e) { stars = 0; }
    try { askedIds = JSON.parse(localStorage.getItem(ASKED_KEY) || '{}') || {}; }
    catch (e) { askedIds = {}; }
    renderStars();
  }

  function rankFor(n) {
    var r = RANKS[0];
    for (var i = 0; i < RANKS.length; i++) if (n >= RANKS[i].min) r = RANKS[i];
    return r;
  }

  function nextRank(n) {
    for (var i = 0; i < RANKS.length; i++) if (n < RANKS[i].min) return RANKS[i];
    return null;
  }

  function renderStars() {
    var badge = $('star-badge');
    if (badge) badge.textContent = '⭐ ' + stars;

    var r = rankFor(stars);
    var rankEl = $('rank-badge');
    if (rankEl) {
      rankEl.textContent = r.icon + ' ' + r.name;
      rankEl.title = 'דרגת ההצלה שלכם';
    }

    var next = nextRank(stars);
    var bar = $('rank-bar');
    var hint = $('rank-hint');
    if (bar) {
      var from = r.min;
      var to = next ? next.min : r.min + 1;
      var pct = next ? Math.round(((stars - from) / (to - from)) * 100) : 100;
      bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
    }
    if (hint) {
      hint.textContent = next
        ? 'עוד ' + (next.min - stars) + ' כוכבים לדרגת «' + next.name + '» ' + next.icon
        : 'הגעתם לדרגה הגבוהה ביותר! 👑';
    }
  }

  function addStars(n) {
    var before = rankFor(stars).name;
    stars += Math.max(0, n | 0);
    try { localStorage.setItem(STAR_KEY, String(stars)); } catch (e) {}
    renderStars();
    var after = rankFor(stars);
    if (after.name !== before) {
      try { localStorage.setItem(RANK_KEY, after.name); } catch (e) {}
      celebrate('עלית דרגה! ' + after.icon + ' עכשיו אתם «' + after.name + '» 🎉');
    }
  }

  function celebrate(msg) {
    setBubble(msg);
    appendMsg('bot', msg);
    speak(msg);
    react('hop');
  }

  /* ——— תגובות של הדמות ———
     ⚠️ דמות שלא מגיבה למה שקורה היא תמונה, לא חבר. כל אירוע
     משמעותי מקבל תנועה קטנה: הנהון על תשובה, קפיצה על הצלחה,
     הפתעה כששואלים משהו שאינו בתחום. */
  function react(what) {
    if (!window.CBY_3D) return;
    try {
      if (what === 'hop' && CBY_3D.hop) CBY_3D.hop();
      else if (what === 'nod' && CBY_3D.nod) CBY_3D.nod();
      else if (what === 'wave' && CBY_3D.wave) CBY_3D.wave();
      else if (what === 'blink' && CBY_3D.blinkNow) CBY_3D.blinkNow();
    } catch (e) {}
  }

  function setMood(m) {
    if (window.CBY_3D && CBY_3D.setMood) {
      try { CBY_3D.setMood(m); } catch (e) {}
    }
  }

  /* ——— ניווט בין מסכים ——— */

  function go(name) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove('active');
    var screen = $('screen-' + name);
    if (screen) screen.classList.add('active');
    var btns = document.querySelectorAll('.dock-btn');
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.toggle('active', btns[j].getAttribute('data-screen') === name);
    }
    if (window.CBY_SND) CBY_SND.play('nav');
    if (name === 'games') refreshGameCards();
    if (name === 'learn' && window.CBY_ACADEMY) CBY_ACADEMY.renderList();
    if (name === 'care' && window.CBY_CARE) CBY_CARE.render();
    window.scrollTo(0, 0);
  }

  /* ——— צ'אט ——— */

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function appendMsg(role, text) {
    var log = $('chat-log');
    if (!log) return;
    var div = document.createElement('div');
    div.className = 'msg ' + role;
    var who = role === 'user' ? 'אתם' : 'צאבי';
    div.innerHTML = '<span class="who">' + who + '</span>' + escapeHtml(text);
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  var lastSaid = '';

  function setBubble(text) {
    var b = $('chubby-bubble');
    if (b) b.textContent = text;
    if (text) lastSaid = text;
  }

  /* ⚠️ הכפתור מסמן מתי צאבי מדבר — אחרת ילד לוחץ שוב ושוב ולא
     יודע אם קרה משהו, במיוחד כשאין קול עברי במכשיר והפה זז
     בלי צליל. */
  function markSaying(on) {
    var btn = $('say-btn');
    if (btn) btn.classList.toggle('on', !!on);
  }

  function sayAgain() {
    var b = $('chubby-bubble');
    var txt = (b && b.textContent && b.textContent.trim()) || lastSaid;
    if (!txt) return;
    if (window.CBY_VOICE) {
      CBY_VOICE.stop();
      CBY_VOICE.speak(txt);
    }
  }

  function setTyping(on) {
    var b = $('chubby-bubble');
    if (!b) return;
    b.classList.toggle('typing', !!on);
    if (on) b.textContent = 'צאבי חושב…';
  }

  function talkAnim(on) {
    var a = $('chubby-avatar');
    if (a) a.classList.toggle('talking', !!on);
    if (window.CBY_3D && CBY_3D.setTalking) CBY_3D.setTalking(!!on);
    markSaying(on);
  }

  /* ⚠️⚠️ **הדיבור עבר ל-voice.js, והפה נע לפי המילים עצמן.**

     הגרסה הקודמת הפעילה את אנימציית הפה ב-onstart וכיבתה ב-onend,
     ובאמצע הפה רפרף באקראי. עכשיו `CBY_VOICE` מדווח על **כל מילה**
     שנהגית (אירוע onboundary), וצאבי פותח את הפה לפי אורכה —
     כך שהפה נעצר בדיוק כשהקול נעצר. ראו ההסבר המלא ב-voice.js. */
  function speak(text) {
    if (!window.CBY_VOICE) return;
    CBY_VOICE.speak(text);
  }

  function bindVoice() {
    if (!window.CBY_VOICE) return;
    CBY_VOICE.bind(
      function (on) { talkAnim(on); },
      function (amount) {
        if (window.CBY_3D && CBY_3D.speakWord) CBY_3D.speakWord(amount);
      }
    );
  }

  function askChubby(q) {
    q = String(q || '').trim();
    if (!q) return;
    appendMsg('user', q);
    if (window.CBY_SND) CBY_SND.play('sent');
    setTyping(true);

    window.setTimeout(function () {
      var res = window.CBY_KB.answer(brain, q);
      setTyping(false);
      if (window.CBY_SND) CBY_SND.play('reply');
      appendMsg('bot', res.text);
      setBubble(res.text);
      speak(res.text);
      renderFollowUps(res);

      if (res.kind === 'offtopic') {
        setMood('surprised');
        react('blink');
        window.setTimeout(function () { setMood('happy'); }, 1800);
      } else {
        setMood('happy');
        react('nod');
      }

      /* כוכב על שאלה חדשה שנענתה מהמאגר — מעודד לחקור עוד */
      if (res.kind === 'qa' && res.id && !askedIds[res.id]) {
        askedIds[res.id] = 1;
        try { localStorage.setItem(ASKED_KEY, JSON.stringify(askedIds)); } catch (e) {}
        addStars(2);
      }
    }, 260);
  }

  /* צ'יפים: שאלות המשך לפי התשובה האחרונה, או שאלות פתיחה */
  function renderFollowUps(res) {
    var row = $('suggest-row');
    if (!row) return;
    var chips = (res && res.follow && res.follow.length)
      ? res.follow.slice(0, 4)
      : window.CBY_KB.starterQuestions(brain, 6);
    buildChips(chips);
  }

  function buildChips(list) {
    var row = $('suggest-row');
    if (!row) return;
    row.innerHTML = '';
    list.forEach(function (c) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.textContent = c;
      btn.onclick = function () {
        var input = $('chat-input');
        if (input) input.value = '';
        askChubby(c);
      };
      row.appendChild(btn);
    });
    var more = document.createElement('button');
    more.type = 'button';
    more.className = 'chip chip-more';
    more.textContent = '🔀 עוד שאלות';
    more.onclick = function () { buildChips(window.CBY_KB.starterQuestions(brain, 6)); };
    row.appendChild(more);
  }

  function speakFact() {
    if (!brain) return;
    var f = CBY_KB.randomFact(brain);
    setBubble(f);
    appendMsg('bot', '💡 ' + f);
    speak(f);
    addStars(1);
  }

  /* ——— משחקים, טיפול, סיור ——— */

  /* ⚠️ ניתוב: חמשת משחקי ההצלה עברו לתלת-ממד עם שלבים
     (`games3d.js`). החידון נשאר בשכבת הדו-ממד, ובכוונה — הוא
     טקסט ולא מרחב, ותלת-ממד לא היה מוסיף לו דבר מלבד זמן טעינה. */
  function openGame(id) {
    currentGame = id;
    if (window.CBY_SND) CBY_SND.play('press');
    /* ⚠️ החידון עבר גם הוא ל-G3D: הוא מקבל מסך מלא, פרצוף של
       צאבי שמדבר, קריינות בעברית ורצף. הגרסה הישנה ב-games.js
       נשארת רק כגיבוי למכשיר בלי WebGL. */
    if (window.CBY_G3D) {
      if (id === 'quiz') { CBY_G3D.quiz(); return; }
      if (CBY_G3D.GAMES[id]) { CBY_G3D.open(id); return; }
    }
    if (window.CBY_GAMES) CBY_GAMES.open(id);
  }

  /* התקדמות על כרטיסי המשחקים — ⚠️ הסיבה לחזור מחר.
     כרטיס שכתוב עליו "3/8 · ⭐7" הוא הזמנה; כרטיס בלי כלום הוא
     רק כפתור. */
  function refreshGameCards() {
    if (!window.CBY_G3D) return;
    var p = CBY_G3D.progress();
    Array.prototype.forEach.call(
      document.querySelectorAll('.gc-prog[data-game]'), function (n) {
        var g = p[n.getAttribute('data-game')];
        if (!g) return;
        n.textContent = g.done + '/' + g.total + ' · ⭐' + g.stars;
        n.className = 'gc-prog' + (g.done ? ' has' : '');
      });
  }

  function closeGame() {
    if (window.CBY_GAMES) CBY_GAMES.close();
    currentGame = null;
  }

  function restartGame() {
    if (window.CBY_GAMES) CBY_GAMES.restart();
  }

  function care(type) {
    if (!window.CBY_CARE) return;
    var msg = CBY_CARE.act(type);
    setBubble(msg);
    react('hop');
    var st = CBY_CARE.getState ? CBY_CARE.getState() : null;
    if (st) setMood(st.health < 40 || st.joy < 30 ? 'sad' : 'happy');
  }

  /* ⚠️ הסריקה עברה לתלת-ממד ולמתנדב אנושי.
     דווח: "בסריקה זה יפה העקבות אבל תשפר שיהיה מהים אל החוף,
     שיהיה מקצועי, וגם שאדם ילך על החוף וימצא".

     כל שלושת הדברים הם בדיוק משחק «סריקת חופים» שנכתב מחדש —
     ולכן אין טעם בשתי מימושים של אותו דבר. המסך הזה הוא ההסבר
     והכניסה, והמשחק עצמו הוא הסריקה. */
  function startPatrol() {
    if (window.CBY_G3D) { CBY_G3D.open('eggs'); return; }
    if (window.CBY_GAMES) CBY_GAMES.startPatrol();
  }

  function onLessonDone(n, total) {
    if (n === total) {
      celebrate('סיימתם את כל השיעורים בבית הספר לים! אתם רשמית בוגרי צאבי 🎓🐢');
    }
  }

  /* ——— ליטוף: נגיעה בצאבי ——— */

  var PET_LINES = [
    'חחח זה מדגדג לי בשריון! 🐢',
    'אווו… תודה. אף אחד לא מלטף צב ים בטבע — שם דווקא לא נוגעים 💙',
    'הידד! עכשיו אני מוכן להציל עוד ביצים 🥚',
    'אתם יודעים? כשאני שמח, כוכב הים שעל הגב שלי מתנדנד חזק יותר ⭐',
    'בוקה-בוקה! 🫧 זה הצליל שאני עושה כשכיף לי.',
    'תגידו… רוצים לשמוע סוד על צבי ים? לחצו על 💡 למעלה.'
  ];
  var petIndex = 0;

  function setupPetting() {
    var stage = $('chubby-stage');
    if (!stage) return;
    stage.style.cursor = 'pointer';

    /* המבט עוקב אחרי האצבע על הבמה */
    stage.addEventListener('pointermove', function (e) {
      if (!window.CBY_3D || !CBY_3D.lookAt) return;
      var r = stage.getBoundingClientRect();
      CBY_3D.lookAt(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        1 - ((e.clientY - r.top) / r.height) * 2
      );
    });

    stage.addEventListener('pointerdown', function () {
      react('hop');
      react('blink');
      var line = PET_LINES[petIndex % PET_LINES.length];
      petIndex++;
      setBubble(line);
      speak(line);
    });
  }

  /* ——— דיבור ——— */

  /* ══════════════════════════════════════════════════════════
     האזנה — ⚠️ "תשפר את ההאזנה"
     ══════════════════════════════════════════════════════════

     מה היה: לוחצים על המיקרופון, האייקון משתנה ל-👂, ואז — שקט.
     אין חיווי שהוא באמת מקשיב, אין טקסט בזמן אמת, ואם לא זוהה
     כלום לא קורה שום דבר. ילד לוחץ שלוש פעמים ומוותר.

     מה יש עכשיו: הכפתור פועם באדום כל עוד מקשיבים, המילים
     נכתבות בשדה **תוך כדי הדיבור** (תוצאות ביניים), כל שגיאה
     מקבלת הסבר בעברית שאומר מה לעשות, ולחיצה שנייה עוצרת. */
  function setupMic() {
    var btn = $('mic-btn');
    if (!btn) return;

    if (!window.CBY_VOICE || !CBY_VOICE.canListen()) {
      btn.style.opacity = '0.4';
      btn.title = 'זיהוי דיבור לא נתמך בדפדפן הזה';
      btn.onclick = function () {
        setBubble('בדפדפן הזה אין זיהוי דיבור 🐢 אפשר להקליד לי את השאלה.');
      };
      return;
    }

    var input = $('chat-input');
    btn.onclick = function () {
      if (window.CBY_SND) CBY_SND.play('tap');
      if (CBY_VOICE.isListening()) { CBY_VOICE.stopListen(); return; }
      CBY_VOICE.stop();   // לא מקשיבים ומדברים בו-זמנית

      CBY_VOICE.listen(function (ev) {
        if (ev.state === 'start') {
          btn.classList.add('listening');
          btn.textContent = '⏹';
          setBubble('אני מקשיב… דברו אליי 🎤');
          return;
        }
        if (ev.state === 'end') {
          btn.classList.remove('listening');
          btn.textContent = '🎤';
          return;
        }
        if (ev.interim != null) {
          if (input) input.value = ev.interim;
          return;
        }
        if (ev.final) {
          if (input) input.value = '';
          btn.classList.remove('listening');
          btn.textContent = '🎤';
          askChubby(ev.final);
          return;
        }
        if (ev.error) {
          btn.classList.remove('listening');
          btn.textContent = '🎤';
          if (ev.error) setBubble(ev.error);
        }
      });
    };
  }


  /* ══════════════════════════════════════════════════════════
     הגדרות קול וצליל
     ══════════════════════════════════════════════════════════
     ⚠️ הכל ניתן לכיבוי. אפליקציה שמדברת היא נהדרת בסלון ובלתי
     אפשרית בכיתה או באוטובוס, ומשתמש שאין לו כפתור פשוט סוגר
     את האפליקציה. הרשימה נבנית מהקולות שבאמת מותקנים במכשיר,
     ולא מרשימה קבועה שלא קיימת אצל אף אחד. */
  function toggleBtn(el, on, onText, offText) {
    if (!el) return;
    el.classList.toggle('on', !!on);
    el.textContent = on ? (onText || 'פועל') : (offText || 'כבוי');
  }

  function buildSettings() {
    var sfx = $('set-sfx'), voi = $('set-voice'), amb = $('set-amb');
    var sel = $('set-voice-name'), rate = $('set-rate');

    var sndOn = !(window.CBY_SND && CBY_SND.isMuted());
    toggleBtn(sfx, sndOn);
    if (sfx) sfx.onclick = function () {
      var m = window.CBY_SND ? CBY_SND.toggle() : true;
      toggleBtn(sfx, !m);
      if (!m) CBY_SND.play('good');
    };

    var vOn = !window.CBY_VOICE || CBY_VOICE.isEnabled();
    toggleBtn(voi, vOn);
    if (voi) voi.onclick = function () {
      var on = window.CBY_VOICE ? CBY_VOICE.toggle() : false;
      toggleBtn(voi, on);
      if (on) CBY_VOICE.speak('שלום, אני צאבי');
    };

    /* התקנה — תמיד זמין מכאן */
    var ins = $('set-install'), insRow = $('set-install-row');
    if (ins && insRow) {
      if (isStandalone()) {
        insRow.style.display = 'none';
      } else {
        insRow.style.display = '';
        ins.textContent = isIOS() ? 'איך?' : 'התקנה';
        ins.onclick = function () { settings(false); setTimeout(install, 260); };
      }
    }

    var aOn = window.CBY_SND && CBY_SND.ambient();
    toggleBtn(amb, aOn);
    if (amb) amb.onclick = function () {
      var on = window.CBY_SND ? CBY_SND.ambient(!CBY_SND.ambient()) : false;
      toggleBtn(amb, on);
    };

    if (sel && window.CBY_VOICE) {
      var list = CBY_VOICE.voiceList();
      sel.innerHTML = '';
      if (!list.length) {
        var o = document.createElement('option');
        o.textContent = 'אין קול עברי מותקן במכשיר';
        sel.appendChild(o);
        sel.disabled = true;
        /* ⚠️⚠️ **לומר את האמת במקום להשאיר את הילד מנחש.**
           אם אין במכשיר קול עברי, שום דבר בקוד לא יגרום לצאבי
           לדבר עברית — זו הגדרה של מערכת ההפעלה. שורה אחת שמסבירה
           מה לעשות שווה יותר מעשרה ניסיונות לעקוף את זה.
           הפה ממשיך לזוז בכל מקרה, ולכן האפליקציה לא "שבורה". */
        var note = sel.parentNode && sel.parentNode.querySelector('.no-voice');
        if (!note && sel.parentNode) {
          note = document.createElement('p');
          note.className = 'no-voice';
          note.innerHTML = 'במכשיר הזה לא מותקן קול עברי, ולכן צאבי זז בשפתיים אבל לא נשמע.<br>' +
            '<b>אנדרואיד:</b> הגדרות ➜ נגישות ➜ טקסט לדיבור ➜ התקנת נתוני קול ➜ עברית.<br>' +
            '<b>אייפון:</b> הגדרות ➜ נגישות ➜ תוכן מדובר ➜ קולות ➜ עברית.<br>' +
            '<b>מחשב:</b> בכרום מחוברים לאינטרנט יש קול עברי מובנה.';
          sel.parentNode.appendChild(note);
        }
      } else {
        var old2 = sel.parentNode && sel.parentNode.querySelector('.no-voice');
        if (old2) old2.parentNode.removeChild(old2);
        sel.disabled = false;
        var cur = CBY_VOICE.getVoiceName();
        list.forEach(function (v) {
          var op = document.createElement('option');
          op.value = v.name;
          op.textContent = v.name + (v.local ? ' ★' : '');
          if (v.name === cur) op.selected = true;
          sel.appendChild(op);
        });
        sel.onchange = function () {
          CBY_VOICE.setVoiceName(sel.value);
          CBY_VOICE.speak('שלום, אני צאבי הצב');
        };
      }
    }

    if (rate && window.CBY_VOICE) {
      rate.value = String(CBY_VOICE.getRate());
      rate.onchange = function () {
        CBY_VOICE.setRate(parseFloat(rate.value));
        CBY_VOICE.speak('ככה אני נשמע');
      };
    }
  }

  function settings(open) {
    var sh = $('settings-sheet');
    if (!sh) return;
    if (open === false) {
      sh.classList.remove('on');
      if (window.CBY_SND) CBY_SND.play('sheetClose');
      return;
    }
    buildSettings();
    sh.classList.add('on');
    if (window.CBY_SND) CBY_SND.play('sheet');
    sh.onclick = function (e) { if (e.target === sh) settings(false); };
  }

  function testVoice() {
    if (window.CBY_VOICE) {
      CBY_VOICE.speak('שלום! אני צאבי הצב, ואני מדבר רק על צבי ים.');
    }
  }

  /* ══════════════════════════════════════════════════════════
     התקנה לטלפון
     ══════════════════════════════════════════════════════════
     ⚠️⚠️ **שתי מערכות הפעלה, שתי דרכים שונות לגמרי.**

     באנדרואיד ובכרום הדפדפן יורה `beforeinstallprompt`, ואפשר
     לפתוח דיאלוג התקנה אמיתי בלחיצה אחת. חובה לשמור את האירוע:
     אי אפשר לקרוא ל-prompt() מאוחר יותר בלי לתפוס אותו קודם.

     ב-iOS **אין** API כזה בכלל, בשום גרסה. הדרך היחידה היא
     «שתף ➜ הוסף למסך הבית», והמשתמש חייב לעשות זאת בעצמו.
     לכן שם מוצגות הוראות מדויקות במקום כפתור שלא יעשה כלום —
     כפתור שלא עובד גרוע יותר מאשר לא להציע התקנה בכלל. */
  var deferredPrompt = null;

  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function isStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true;
  }

  function setupInstall() {
    var bar = $('install-bar');
    if (!bar) return;
    var dismissed = false;
    try { dismissed = localStorage.getItem('cby-install-x') === '1'; } catch (e) {}
    if (isStandalone() || dismissed) return;

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredPrompt = e;
      bar.classList.add('on');
    });

    /* iOS לא יורה את האירוע לעולם — מציגים את הבאנר בכל מקרה,
       והוא יפתח הוראות במקום דיאלוג. */
    if (isIOS()) setTimeout(function () { bar.classList.add('on'); }, 2500);

    window.addEventListener('appinstalled', function () {
      bar.classList.remove('on');
      celebrate('צאבי הותקן במכשיר שלכם! 🎉 עכשיו אפשר לפתוח אותו כמו כל אפליקציה, גם בלי אינטרנט.');
    });
  }

  function install() {
    if (window.CBY_SND) CBY_SND.play('tap');
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () { deferredPrompt = null; });
      return;
    }
    if (isIOS()) {
      setBubble('להתקנה באייפון: לחצו על כפתור השיתוף ⬆️ שבתחתית הדפדפן, ' +
        'גללו ובחרו «הוסף למסך הבית» ➕ — ואז צאבי יופיע כאפליקציה עם האייקון שלו.');
      appendMsg('bot', 'להתקנה באייפון: כפתור השיתוף ⬆️ בתחתית ספארי ➜ «הוסף למסך הבית» ➕');
      speak('להתקנה באייפון, לחצו על כפתור השיתוף בתחתית המסך, ואז על הוסף למסך הבית');
      return;
    }
    setBubble('להתקנה: פתחו את תפריט הדפדפן (⋮) ובחרו «התקן אפליקציה» או «הוסף למסך הבית» 📲');
    appendMsg('bot', 'להתקנה: תפריט הדפדפן ⋮ ➜ «התקן אפליקציה» / «הוסף למסך הבית»');
  }

  function dismissInstall() {
    var bar = $('install-bar');
    if (bar) bar.classList.remove('on');
    try { localStorage.setItem('cby-install-x', '1'); } catch (e) {}
  }

  /* ——— ניתוב ——— */

  function routeFromQuery() {
    var params = new URLSearchParams(location.search);
    var goTo = params.get('go');
    if (goTo === 'game' || goTo === 'games') go('games');
    else if (goTo === 'care') go('care');
    else if (goTo === 'learn') go('learn');
    else if (goTo === 'patrol') go('patrol');
    else go('chat');
  }

  /* ——— אתחול ——— */

  /* לשוניות מסך הלימוד — שיעורים / מאמרים */
  function setupLearnTabs() {
    var tl = $('ltab-lessons'), ta = $('ltab-articles');
    var pl = $('learn-lessons'), pa = $('learn-articles');
    if (!tl || !ta || !pl || !pa) return;
    function show(which) {
      var les = which === 'lessons';
      tl.classList.toggle('on', les);
      ta.classList.toggle('on', !les);
      pl.classList.toggle('hidden', !les);
      pa.classList.toggle('hidden', les);
      if (!les && window.CBY_ARTICLES) CBY_ARTICLES.renderList();
      window.scrollTo(0, 0);
    }
    tl.onclick = function () { show('lessons'); };
    ta.onclick = function () { show('articles'); };
  }

  function initUI() {
    window.setTimeout(function () { react('wave'); }, 700);
    var form = $('chat-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = $('chat-input');
        var q = input.value;
        input.value = '';
        askChubby(q);
      });
    }
    setupMic();
    setupPetting();
    buildChips(window.CBY_KB.starterQuestions(brain, 6));
    if (window.CBY_CARE) CBY_CARE.init();
    if (window.CBY_ACADEMY) CBY_ACADEMY.init();
    if (window.CBY_ARTICLES) CBY_ARTICLES.init();
    setupLearnTabs();
    init3D();
    renderStars();
    routeFromQuery();
  }

  function init3D() {
    try {
      if (!window.CBY_3D || typeof THREE === 'undefined') return;
      var mainCv = $('chubby-canvas');
      var stage = $('chubby-stage');
      if (mainCv && CBY_3D.initMain(mainCv)) {
        if (stage) stage.classList.add('has-3d');
        setTimeout(function () { if (CBY_3D.wave) CBY_3D.wave(); }, 600);
      }
      var careCv = $('care-canvas');
      var careStage = document.querySelector('.care-stage');
      if (careCv && CBY_3D.initCare(careCv, 'scarf')) {
        if (careStage) careStage.classList.add('has-3d');
      }
    } catch (e) {
      console.warn('Chubby 3D failed', e);
    }
  }

  window.CBY = {
    go: go,
    askChubby: askChubby,
    speakFact: speakFact,
    openGame: openGame,
    closeGame: closeGame,
    restartGame: restartGame,
    care: care,
    startPatrol: startPatrol,
    addStars: addStars,
    onLessonDone: onLessonDone,
    getStars: function () { return stars; },
    getRank: function () { return rankFor(stars); },
    settings: settings,
    sayAgain: sayAgain,
    testVoice: testVoice,
    install: install,
    dismissInstall: dismissInstall,
    RANKS: RANKS
  };

  loadStars();

  /* ⚠️⚠️ **טעינת המאגר — מהסקריפט, לא מהרשת.**
     דווח מהשטח: "לא הצלחתי לטעון את מאגר הידע". הסיבה היא
     fetch("brain.json"), שנכשל בשלושה מצבים נפוצים לגמרי: פתיחת
     index.html ישירות מהדיסק (file://), Service Worker ישן ששולט
     בדף, ודפדפן ללא רשת לפני שהמטמון נבנה.

     brain.js נטען בתגית <script> רגילה ולכן עובד תמיד. fetch נשאר
     רק כגיבוי, למקרה שמישהו עדכן את brain.json בלי לבנות מחדש. */
  /* ══════════════════════════════════════════════════════════
     ⚠️⚠️ ברכת פתיחה — צאבי אומר שלום ברגע שפותחים אותו
     ══════════════════════════════════════════════════════════

     דווח: "שפותחים אותו שיגיד שלום כמו באזי".

     מה היה קודם: המאגר הגריל אחד מחמישה משפטי פתיחה, הטקסט הופיע
     בבועה מיידית — והדמות לא עשתה כלום. ילד שפותח אפליקציה ורואה
     טקסט סטטי לא מרגיש שמישהו בירך אותו לשלום.

     ברכה אמיתית היא רצף: הדמות מנופפת, הטקסט נכתב מילה-מילה
     כאילו מישהו מדבר עכשיו, הפה זז — ורק בסוף מופיעות ההצעות.

     ⚠️ **והברכה מודעת לשעה.** "בוקר טוב" בשמונה בערב הורס את
     כל האפקט, וזו בדיוק הסוג של פרט שילד קולט מיד. */
  function timeHello() {
    var h = new Date().getHours();
    if (h >= 5 && h < 11) return 'בוקר טוב';
    if (h >= 11 && h < 15) return 'צהריים טובים';
    if (h >= 15 && h < 18) return 'אחר צהריים טובים';
    if (h >= 18 && h < 22) return 'ערב טוב';
    return 'לילה טוב';
  }

  /* ⚠️ הברכה חייבת לפתוח ב"שלום, אני צאבי, שומר האבקועים" — זה
     השם שהילד יזכור, וזו הדרך היחידה שבה דמות מציגה את עצמה.
     כל פתיח כאן מתחיל באותן שלוש מילים ומשתנה רק אחריהן. */
  var OPENERS = [
    'שלום! אני צאבי, שומר האבקועים 🐢 שאלו אותי כל דבר על צבי ים — ואם לא אדע, אגיד לכם ישר.',
    'שלום! אני צאבי, שומר האבקועים 🐢 יש לי המון מה לספר: איך הם חיים, למה הם נעלמים ואיך מצילים אותם.',
    'שלום! אני צאבי, שומר האבקועים 🐢 בואו נדבר על צבי ים — או שנציל כמה אבקועים במשחק.',
    'שלום! אני צאבי, שומר האבקועים 🐢 בקעתי בחוף בישראל וצעדתי לים. מה בא לכם לדעת?'
  ];

  /* הקלדה מילה-מילה. ⚠️ מילים ולא תווים: הקלדה תו-תו בעברית
     נראית משובשת בגלל כיוון הכתיבה, ומילה שלמה קוראת כדיבור. */
  function typeInto(text, done) {
    var b = $('chubby-bubble');
    if (!b) { if (done) done(); return; }
    var parts = String(text).split(' ');
    var i = 0;
    b.textContent = '';
    talkAnim(true);
    (function step() {
      if (i >= parts.length) {
        talkAnim(false);
        if (done) done();
        return;
      }
      b.textContent += (i ? ' ' : '') + parts[i++];
      if (window.CBY_SND) CBY_SND.play('blip');
      setTimeout(step, 55 + Math.random() * 45);
    })();
  }

  function greetOnOpen() {
    var hello = timeHello() + '! ' + OPENERS[(Math.random() * OPENERS.length) | 0];

    setBubble('');
    setTimeout(function () {
      if (window.CBY_3D && CBY_3D.wave) CBY_3D.wave();
      if (window.CBY_3D && CBY_3D.setMood) CBY_3D.setMood('happy');
    }, 350);

    /* ⚠️ ההודעה נכנסת ליומן **מיד**, והאנימציה רצה רק בבועה.
       נמדד: כשההוספה ליומן חיכתה לסוף ההקלדה, ילד שהספיק לשאול
       שאלה בשתי השניות האלה ראה את הברכה נדחפת **אחרי** התשובה
       שלו — כאילו צאבי אמר שלום באמצע השיחה. */
    /* ⚠️⚠️ **הברכה כבר לא נכנסת ליומן.**
       היא הופיעה פעמיים בזה אחר זה — פעם בבועה שמעל היומן ופעם
       כשורה ראשונה ביומן — ובטלפון שתי הפסקאות הזהות תופסות
       חצי מסך ונקראות כתקלה.
       הבועה היא מה שצאבי **אומר עכשיו**; היומן הוא היסטוריית
       השיחה. לברכה אין מקום בהיסטוריה לפני שהתחילה שיחה. */
    buildChips(['למה צבי ים נעלמים?', 'מה זה אבקוע?', 'איך אפשר לעזור?', 'בוא נשחק']);
    lastSaid = hello;
    setTimeout(function () { typeInto(hello); }, 550);

    /* ⚠️⚠️ **צאבי אומר את הברכה בקול.**
       דווח: "שנכנסים שיגיד שלום... לא היה". הקוד הקודם לא ניסה
       בכלל — הברכה הוקלדה לבועה ותו לא.
       speakSoon ולא speak: אם הדפדפן חוסם הקראה לפני מגע ראשון
       (וזה המצב ברוב הפתיחות), הברכה ממתינה לנגיעה הראשונה
       במקום להיבלע בשקט. */
    setTimeout(function () {
      if (window.CBY_VOICE && CBY_VOICE.speakSoon) CBY_VOICE.speakSoon(hello);
    }, 900);
  }

  function hideSplash() {
    var sp = document.getElementById('boot-splash');
    if (!sp) return;
    sp.classList.add('gone');
    setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 600);
  }

  /* ══════════════════════════════════════════════════════════
     ⚠️⚠️ שכבת הצליל של הממשק
     ═══════════════════════════════════════════════════════════

     דווח: "אני רוצה סאונד פתיחה, סאונד לחיצות, ממש כמו אפליקציה".

     מנוע הצלילים (sound.js) היה קיים ומלא — עשרים אפקטים — אבל
     **אף אחד מהם לא היה מחובר לממשק**. בכל app.js היו שתי
     קריאות בלבד. בפועל: אפליקציה שקטה עם ספריית צלילים בארון.

     ⚠️ **התיקון אינו להוסיף onclick לכל כפתור.** יש כאן עשרות
     כפתורים, וחלקם נוצרים דינמית (כרטיסי שיעור, צ'יפים, כפתורי
     משחק), כך שכל חיווט ידני היה מתפספס בדיוק במקומות שנוספים
     אחר כך.

     כאן: **מאזין יחיד בשלב ה-capture על document**. הוא רץ לפני
     כל מטפל אחר, מוצא את האלמנט האינטראקטיבי הקרוב ביותר, ובוחר
     צליל לפי מה שהוא. כפתור שייווצר מחר יקבל צליל בלי שורת קוד
     נוספת.

     ⚠️ pointerdown ולא click — במגע, ההפרש ביניהם הוא כ-80ms,
     וזה בדיוק ההבדל בין צליל שמרגיש כמו תגובה לאצבע לבין צליל
     שמרגיש כמו הד. */
  var SND_MAP = [
    ['.dock-btn', 'nav'],
    ['.overlay-close', 'back'],
    ['.back-btn', 'back'],
    ['.icon-btn', 'tap'],
    ['.game-card', 'press'],
    ['.action-card', 'press'],
    ['.primary', 'press'],
    ['.chip', 'tap'],
    ['.lesson-item', 'nav'],
    ['.tab', 'nav']
  ];

  function soundFor(el) {
    var explicit = el.getAttribute && el.getAttribute('data-snd');
    if (explicit) return explicit;
    for (var i = 0; i < SND_MAP.length; i++) {
      if (el.matches && el.matches(SND_MAP[i][0])) return SND_MAP[i][1];
    }
    if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
      return el.checked ? 'offSw' : 'onSw';
    }
    if (el.tagName === 'BUTTON' || el.tagName === 'A') return 'tap';
    return null;
  }

  function wireSounds() {
    if (!window.CBY_SND) return;
    document.addEventListener('pointerdown', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var el = t.closest('button, a, input, label, [role="button"], .chip, .lesson-item, .game-card, .action-card');
      if (!el) return;
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') {
        CBY_SND.play('nope');
        return;
      }
      var name = soundFor(el);
      if (name) CBY_SND.play(name);
    }, true);
  }

  function boot(data) {
    brain = data;
    hideSplash();
    wireSounds();
    bindVoice();
    setupInstall();
    if (window.CBY_SND && CBY_SND.ambient()) CBY_SND.ambient(true);
    initUI();
    refreshGameCards();

    /* ⚠️ צליל הפתיחה מנוגן דרך playSoon ולא play: אם הדפדפן עדיין
       חוסם אודיו (וזה המצב ברוב הפתיחות), הוא ממתין לנגיעה
       הראשונה במקום פשוט לא להישמע. */
    if (window.CBY_SND && CBY_SND.playSoon) CBY_SND.playSoon('boot');

    greetOnOpen();
  }

  if (window.CBY_BRAIN && window.CBY_BRAIN.data) {
    boot(window.CBY_BRAIN);
  } else {
    fetch('brain.json')
      .then(function (r) { return r.json(); })
      .then(boot)
      .catch(function () {
        boot({
          data: [],
          fallback: ['לא הצלחתי לטעון את מאגר הידע 🐢 נסו לרענן את הדף'],
          offtopic: ['אני מדבר רק על צבי ים 🐢'],
          greetings: ['שלום! אני צאבי הצב 🐢'],
          facts: ['צבי ים חיים על כדור הארץ יותר מ-100 מיליון שנה.']
        });
      });
  }
})();
