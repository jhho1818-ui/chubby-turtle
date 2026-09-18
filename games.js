/* ==================================================================
   © כל הזכויות שמורות | ALL RIGHTS RESERVED
   צאבי הצב — שומר צבי הים
   יוצר ובעלים בלעדי: דניאל אברהם חדאד | Creator & sole owner: Daniel Avraham Haddad
   🔒 [CBY-PROOF] טביעת אצבע: CBY-T7R4L2E9 · מזהה יוצר: DAH-CBY-2026
   Unauthorized copying, distribution or attribution is prohibited.
   ================================================================== */
/* ==================================================================
   🎮 צאבי הצב — משחקי הצלה
   © כל הזכויות שמורות | דניאל אברהם חדאד / Daniel Avraham Haddad
   טביעת אצבע: CBY-T7R4L2E9
   ------------------------------------------------------------------
   ⚠️⚠️ **למה נכתב מחדש — ומה היה חסר.**

   הגרסה הקודמת עבדה: היו בה חמישה משחקים והם רצו. אבל היא צוירה
   באמוג'י על מלבנים שטוחים, ולכן היא **נראתה כמו הדגמה** ולא
   כמו משחק. אמוג'י נראה שונה בכל מכשיר, לא מסתובב, לא משנה
   הבעה, ואי אפשר להנפיש אותו — כלומר אי אפשר לבנות ממנו דמות.

   מה שנוסף כאן:
     • ערכת ציור אחת — שמיים, ים עם גלים נעים, חול עם גרגרים,
       וצאבי מצויר בקוד באותן פרופורציות של הדמות התלת-ממדית
     • חלקיקים: התזות חול, בועות, ניצוצות, לב
     • מספרים מרחפים על כל הצלחה — הדבר שהופך לחיצה ל"פידבק"
     • רעידת מסך קלה בפגיעה
     • ספירה לאחור לפני התחלה, כדי שאף ילד לא יפסיד בשנייה הראשונה
     • מסך סיום עם **עובדה אמיתית** — המשחק מלמד גם כשמפסידים

   ⚠️ כל משחק מבוסס על משהו שקורה באמת בהצלת צבי ים, ולא על
   מכניקה שהודבקה לנושא. זה מה שמצדיק את קיומו.
   ================================================================== */
(function (global) {
  'use strict';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var W = 360, H = 480;          // מידות לוגיות — הציור תמיד בהן
  var canvas, ctx, statusEl, quizBox;
  var active = null, raf = 0, loop = null;
  var shake = 0;
  var parts = [];                // חלקיקים
  var pops = [];                 // מספרים מרחפים

  function $(id) { return document.getElementById(id); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function setStatus(t) { if (statusEl) statusEl.textContent = t || ''; }
  function award(n) { if (global.CBY && CBY.addStars) CBY.addStars(Math.max(0, n | 0)); }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* עובדות שמוצגות במסך הסיום — כל משחק והעובדה שלו */
  var END_FACTS = {
    eggs:    'בבוקר סורקים מתנדבים את החוף ומחפשים עקבות — כך נמצאים מאות קינים בעונה.',
    fox:     'שועלים מוצאים קן לפי ריח. אשפה בחוף מגדילה את מספרם — ואיתו את הנזק.',
    hatch:   'אבקוע רץ לאור הבהיר באופק. אור מלאכותי מושך אותו לכביש במקום לים.',
    clean:   'שקית ניילון במים נראית בדיוק כמו מדוזה — ולכן צבים בולעים אותה.',
    release: 'צב משוקם משתחרר בחוף וזוחל לים בעצמו. לפעמים מצמידים לו משדר לוויין.',
    patrol:  'עקבות של נקבה נראות כמו סימן גלגלי טרקטור, ברוחב של כמטר.'
  };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     קנבס ברזולוציה מלאה
     ═══════════════════════════════════════════════════════════ */
  function fitCanvas(el) {
    var c = el || $('game-canvas');
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    var cssW = c.clientWidth || W;
    var cssH = Math.round(cssW * (H / W));
    c.style.height = cssH + 'px';
    c.width = Math.round(cssW * dpr);
    c.height = Math.round(cssH * dpr);
    var g = c.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.scale(c.width / W, c.height / H);
    return g;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function prepGame() {
    canvas = $('game-canvas');
    statusEl = $('game-status');
    quizBox = $('quiz-box');
    quizBox.classList.add('hidden');
    canvas.classList.remove('hidden');
    ctx = fitCanvas(canvas);
    parts = [];
    pops = [];
    shake = 0;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* המרת אירוע מצביע לקואורדינטות לוגיות */
  function pt(e, c) {
    var r = (c || canvas).getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (W / r.width),
      y: (e.clientY - r.top) * (H / r.height)
    };
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     חלקיקים, מספרים מרחפים, רעידה
     ═══════════════════════════════════════════════════════════ */
  function burst(x, y, color, n, opts) {
    opts = opts || {};
    for (var i = 0; i < (n || 10); i++) {
      parts.push({
        x: x, y: y,
        vx: rnd(-1, 1) * (opts.spread || 2.2),
        vy: rnd(-1, 0.4) * (opts.up || 3),
        g: opts.g != null ? opts.g : 0.12,
        life: rnd(0.5, 1.0),
        age: 0,
        size: rnd(1.6, 3.8),
        color: color
      });
    }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function popup(x, y, text, color) {
    pops.push({ x: x, y: y, text: text, color: color || '#fff', age: 0, life: 1.0 });
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function stepFx(dt) {
    var i;
    for (i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.age += dt;
      if (p.age > p.life) { parts.splice(i, 1); continue; }
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
    }
    for (i = pops.length - 1; i >= 0; i--) {
      var q = pops[i];
      q.age += dt;
      if (q.age > q.life) { pops.splice(i, 1); continue; }
      q.y -= 32 * dt;
    }
    if (shake > 0) shake = Math.max(0, shake - dt * 3.5);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function drawFx() {
    parts.forEach(function (p) {
      ctx.globalAlpha = clamp(1 - p.age / p.life, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    pops.forEach(function (q) {
      var u = q.age / q.life;
      ctx.globalAlpha = clamp(1 - u, 0, 1);
      ctx.font = 'bold 19px Rubik, sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(6,40,60,0.55)';
      ctx.strokeText(q.text, q.x, q.y);
      ctx.fillStyle = q.color;
      ctx.fillText(q.text, q.x, q.y);
      ctx.textAlign = 'start';
    });
    ctx.globalAlpha = 1;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function applyShake() {
    if (shake <= 0) return;
    ctx.translate(rnd(-1, 1) * shake * 5, rnd(-1, 1) * shake * 5);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     ערכת ציור — רקעים
     ═══════════════════════════════════════════════════════════ */
  function skySea(t, horizon) {
    horizon = horizon == null ? 150 : horizon;
    var g = ctx.createLinearGradient(0, 0, 0, horizon - 52);
    g.addColorStop(0, '#79cfe6');
    g.addColorStop(1, '#c6ecf4');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, horizon - 52);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var s = ctx.createLinearGradient(0, horizon - 52, 0, horizon);
    s.addColorStop(0, '#0d6d86');
    s.addColorStop(1, '#4cbccb');
    ctx.fillStyle = s;
    ctx.fillRect(0, horizon - 52, W, 52);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️ הקצף נמשך **אחרי** החול, ולא לפניו. בגרסה הראשונה הגלים
     צוירו ראשונים והחול כיסה אותם — התוצאה הייתה פס תכלת שטוח
     בלי שום תחושת ים. הקצף על קו המים הוא מה שהופך שני מלבנים
     לחוף. */
  function foam(t, horizon) {
    for (var L = 0; L < 3; L++) {
      ctx.fillStyle = ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.38)',
                       'rgba(255,255,255,0.22)'][L];
      ctx.beginPath();
      var base = horizon - 6 + L * 7;
      ctx.moveTo(0, base - 14);
      for (var x = 0; x <= W; x += 6) {
        ctx.lineTo(x, base + Math.sin((x / 30) + t * (1.3 + L * 0.5) + L * 1.7) * (4 - L * 0.8));
      }
      ctx.lineTo(W, base - 14);
      ctx.closePath();
      ctx.fill();
    }
  }

  function beach(t, horizon) {
    horizon = horizon == null ? 150 : horizon;
    skySea(t, horizon);
    sand(horizon);
    foam(t, horizon);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var sandDots = null;
  function sand(fromY) {
    var g = ctx.createLinearGradient(0, fromY, 0, H);
    g.addColorStop(0, '#f0dcae');
    g.addColorStop(1, '#d9bf86');
    ctx.fillStyle = g;
    ctx.fillRect(0, fromY, W, H - fromY);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    if (!sandDots) {
      sandDots = [];
      for (var i = 0; i < 150; i++) {
        sandDots.push([Math.random() * W, Math.random(), Math.random() * 1.3 + 0.4]);
      }
    }
    ctx.fillStyle = 'rgba(150,115,60,0.20)';
    sandDots.forEach(function (d) {
      var y = fromY + d[1] * (H - fromY);
      ctx.beginPath();
      ctx.arc(d[0], y, d[2], 0, Math.PI * 2);
      ctx.fill();
    });
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function underwater(t) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#2a9ab4');
    g.addColorStop(0.55, '#127a92');
    g.addColorStop(1, '#0a4d68');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // קרני אור
    ctx.save();
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = '#eaffff';
    for (var i = 0; i < 4; i++) {
      var x = ((i * 110) + Math.sin(t * 0.4 + i) * 22) % (W + 120) - 60;
      ctx.beginPath();
      ctx.moveTo(x, -10);
      ctx.lineTo(x + 46, -10);
      ctx.lineTo(x + 116, H + 10);
      ctx.lineTo(x + 34, H + 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     ערכת ציור — דמויות
     ═══════════════════════════════════════════════════════════ */

  /* צאבי, באותן פרופורציות של הדמות התלת-ממדית:
     ראש גדול מלפנים, שריון קרמל מאחור, עיניים ענקיות. */
  function drawChubby(x, y, s, opt) {
    opt = opt || {};
    var dir = opt.dir || 1;          // 1 = פונה ימינה
    var t = opt.t || 0;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * dir, s);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var pad = Math.sin(t * 4) * 0.12;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // סנפירים אחוריים
    ctx.fillStyle = '#6aad74';
    ctx.beginPath();
    ctx.ellipse(-16, 6 + pad * 3, 9, 5, -0.5, 0, Math.PI * 2);
    ctx.fill();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // שריון
    ctx.fillStyle = '#b9762f';
    ctx.beginPath();
    ctx.ellipse(-3, -2, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cf9247';
    ctx.beginPath();
    ctx.ellipse(-3, -5, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // לוחיות
    ctx.fillStyle = 'rgba(139,82,32,0.45)';
    [[-10, -6], [-3, -9], [4, -6]].forEach(function (p) {
      ctx.beginPath();
      ctx.ellipse(p[0], p[1], 4.2, 3.0, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // הלב — סימן הזיהוי
    ctx.fillStyle = 'rgba(255,244,226,0.95)';
    ctx.beginPath();
    ctx.moveTo(-3, -12.5);
    ctx.bezierCurveTo(1.5, -16, 3.5, -12, -3, -8.5);
    ctx.bezierCurveTo(-9.5, -12, -7.5, -16, -3, -12.5);
    ctx.fill();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // בטן
    ctx.fillStyle = '#f7e6c0';
    ctx.beginPath();
    ctx.ellipse(-3, 8, 17, 6, 0, 0, Math.PI * 2);
    ctx.fill();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // סנפירים קדמיים
    ctx.fillStyle = '#6aad74';
    ctx.beginPath();
    ctx.ellipse(8, 8 - pad * 3, 10, 5, 0.5 + pad, 0, Math.PI * 2);
    ctx.fill();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // ראש
    ctx.fillStyle = '#86ca8b';
    ctx.beginPath();
    ctx.arc(16, -2, 12.5, 0, Math.PI * 2);
    ctx.fill();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // לחיים
    ctx.fillStyle = 'rgba(255,159,176,0.5)';
    ctx.beginPath();
    ctx.ellipse(11, 3, 3.6, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // עיניים
    var blink = opt.blink ? 0.12 : 1;
    [[14, -5], [21, -5]].forEach(function (p) {
      ctx.fillStyle = '#fffdf7';
      ctx.beginPath();
      ctx.ellipse(p[0], p[1], 4.4, 4.6 * blink, 0, 0, Math.PI * 2);
      ctx.fill();
      if (blink > 0.5) {
        ctx.fillStyle = '#8a5326';
        ctx.beginPath();
        ctx.arc(p[0] + 1, p[1], 2.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#140d07';
        ctx.beginPath();
        ctx.arc(p[0] + 1.2, p[1], 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p[0] + 0.2, p[1] - 1.4, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // חיוך
    ctx.strokeStyle = '#8a3a2e';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(19, 2, 3.2, 0.15, Math.PI - 0.15);
    ctx.stroke();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    ctx.restore();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* אבקוע — צב זעיר, אותו קו עיצוב */
  function drawHatchling(x, y, s, t, dir) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * (dir || 1), s);
    var w = Math.sin(t * 9) * 0.8;
    ctx.fillStyle = '#5f9c68';
    ctx.beginPath(); ctx.ellipse(-4, 2 + w, 3.4, 2, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, 2 - w, 3.4, 2, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a5427';
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 5.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9c6d33';
    ctx.beginPath(); ctx.ellipse(0, -0.8, 5, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#86ca8b';
    ctx.beginPath(); ctx.arc(0, -6.6, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#140d07';
    ctx.beginPath(); ctx.arc(-1.3, -7.2, 0.85, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(1.3, -7.2, 0.85, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function drawFoxSprite(x, y, s, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    var bob = Math.sin(t * 8) * 1.2;
    // זנב
    ctx.fillStyle = '#e07a3c';
    ctx.beginPath();
    ctx.ellipse(-14, -2 + bob * 0.4, 8, 4.5, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff2e0';
    ctx.beginPath();
    ctx.ellipse(-19, -4 + bob * 0.4, 3, 2.4, 0.5, 0, Math.PI * 2);
    ctx.fill();
    // גוף
    ctx.fillStyle = '#e8853f';
    ctx.beginPath();
    ctx.ellipse(-2, 0 + bob * 0.3, 11, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // רגליים
    ctx.fillStyle = '#7a4420';
    ctx.fillRect(-7, 5, 2.4, 5 + bob);
    ctx.fillRect(3, 5, 2.4, 5 - bob);
    // ראש
    ctx.fillStyle = '#ef9450';
    ctx.beginPath();
    ctx.arc(9, -4 + bob * 0.3, 6.5, 0, Math.PI * 2);
    ctx.fill();
    // אוזניים
    ctx.fillStyle = '#c9662c';
    [[5.5, -10], [12, -10]].forEach(function (p) {
      ctx.beginPath();
      ctx.moveTo(p[0] - 2.4, p[1] + 2 + bob * 0.3);
      ctx.lineTo(p[0], p[1] - 3.4 + bob * 0.3);
      ctx.lineTo(p[0] + 2.4, p[1] + 2 + bob * 0.3);
      ctx.closePath();
      ctx.fill();
    });
    // חוטם ועיניים
    ctx.fillStyle = '#fff2e0';
    ctx.beginPath(); ctx.ellipse(13, -2.5 + bob * 0.3, 3.6, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a1608';
    ctx.beginPath(); ctx.arc(16, -2.6 + bob * 0.3, 1.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -5.6 + bob * 0.3, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(11.6, -6 + bob * 0.3, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function drawEgg(x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 6.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,175,130,0.55)';
    ctx.beginPath();
    ctx.ellipse(1.6, 1.6, 2.4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function drawNest(x, y, open) {
    ctx.fillStyle = 'rgba(120,88,40,0.30)';
    ctx.beginPath();
    ctx.ellipse(x, y, 24, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    if (open) {
      ctx.fillStyle = '#b8904f';
      ctx.beginPath();
      ctx.ellipse(x, y, 19, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6f5326';
      ctx.beginPath();
      ctx.ellipse(x, y + 0.5, 15, 6.2, 0, 0, Math.PI * 2);
      ctx.fill();
      drawEgg(x - 6, y - 1, 0.85);
      drawEgg(x + 5, y - 2, 0.85);
      drawEgg(x, y + 2, 0.9);
    }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var TRASH = [
    function (x, y) {   // שקית ניילון — הצורה שצב מבלבל עם מדוזה
      ctx.fillStyle = 'rgba(244,250,252,0.92)';
      ctx.beginPath();
      ctx.moveTo(x - 9, y - 5);
      ctx.lineTo(x + 9, y - 5);
      ctx.quadraticCurveTo(x + 11, y + 9, x, y + 10);
      ctx.quadraticCurveTo(x - 11, y + 9, x - 9, y - 5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(150,185,200,0.85)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x - 7, y - 5); ctx.quadraticCurveTo(x - 4, y - 12, x - 1, y - 5);
      ctx.moveTo(x + 7, y - 5); ctx.quadraticCurveTo(x + 4, y - 12, x + 1, y - 5);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(180,210,220,0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 3, y - 2); ctx.lineTo(x - 2, y + 7);
      ctx.moveTo(x + 3, y - 2); ctx.lineTo(x + 2, y + 7);
      ctx.stroke();
    },
    function (x, y) {   // בקבוק
      ctx.fillStyle = 'rgba(140,210,190,0.9)';
      ctx.fillRect(x - 4, y - 5, 8, 12);
      ctx.fillRect(x - 2, y - 10, 4, 5);
      ctx.fillStyle = '#e06a4a';
      ctx.fillRect(x - 2.5, y - 12, 5, 2.5);
    },
    function (x, y) {   // קש
      ctx.strokeStyle = '#ff6f61';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 6, y + 7);
      ctx.lineTo(x + 4, y - 8);
      ctx.stroke();
    },
    function (x, y) {   // מכסה
      ctx.fillStyle = '#4aa3e0';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.arc(x - 2, y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  ];
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function drawJelly(x, y, t) {
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#e7a9d8';
    ctx.beginPath();
    ctx.arc(x, y, 9, Math.PI, 0);
    ctx.quadraticCurveTo(x, y + 5, x - 9, y);
    ctx.fill();
    ctx.strokeStyle = 'rgba(231,169,216,0.8)';
    ctx.lineWidth = 1.6;
    for (var i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 3.2, y + 2);
      ctx.quadraticCurveTo(x + i * 3.2 + Math.sin(t * 3 + i) * 3, y + 10,
                           x + i * 3.2 + Math.sin(t * 3 + i) * 5, y + 17);
      ctx.stroke();
    }
    ctx.restore();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     HUD ומסכי מצב
     ═══════════════════════════════════════════════════════════ */
  function hud(left, right, progress) {
    ctx.fillStyle = 'rgba(6,50,74,0.55)';
    ctx.fillRect(0, 0, W, 30);
    ctx.font = 'bold 14px Rubik, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(left, W - 10, 20);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffe08a';
    ctx.fillText(right, 10, 20);
    ctx.textAlign = 'start';
    if (progress != null) {
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fillRect(0, 30, W, 4);
      ctx.fillStyle = progress > 0.3 ? '#7fe0a8' : '#ff8a6a';
      ctx.fillRect(0, 30, W * clamp(progress, 0, 1), 4);
    }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function banner(text) {
    ctx.fillStyle = 'rgba(6,50,74,0.78)';
    ctx.fillRect(0, H - 40, W, 40);
    ctx.font = '13px Rubik, sans-serif';
    ctx.fillStyle = '#dff3ff';
    ctx.textAlign = 'center';
    wrapText(text, W / 2, H - 24, W - 24, 15);
    ctx.textAlign = 'start';
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function wrapText(text, x, y, maxW, lh) {
    var words = String(text).split(' ');
    var line = '', lines = [];
    words.forEach(function (w) {
      var test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    });
    if (line) lines.push(line);
    lines.forEach(function (l, i) { ctx.fillText(l, x, y + i * lh); });
    return lines.length;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function endPanel(win, title, sub, factKey) {
    ctx.fillStyle = 'rgba(6,40,60,0.90)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    ctx.font = 'bold 30px Rubik, sans-serif';
    ctx.fillStyle = win ? '#ffe08a' : '#ffd0c0';
    ctx.fillText(win ? 'כל הכבוד!' : 'כמעט!', W / 2, H / 2 - 74);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    ctx.font = 'bold 18px Rubik, sans-serif';
    ctx.fillStyle = '#ffffff';
    wrapText(title, W / 2, H / 2 - 40, W - 50, 22);

    if (sub) {
      ctx.font = '14px Rubik, sans-serif';
      ctx.fillStyle = '#cfe9f2';
      wrapText(sub, W / 2, H / 2 - 6, W - 60, 18);
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var fact = END_FACTS[factKey];
    if (fact) {
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      roundRect(24, H / 2 + 22, W - 48, 86, 14);
      ctx.fill();
      ctx.font = 'bold 13px Rubik, sans-serif';
      ctx.fillStyle = '#ffe08a';
      ctx.fillText('💡 ידעתם?', W / 2, H / 2 + 44);
      ctx.font = '13px Rubik, sans-serif';
      ctx.fillStyle = '#eaf7fb';
      wrapText(fact, W / 2, H / 2 + 64, W - 70, 16);
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    ctx.font = '13px Rubik, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText('«עוד פעם» למטה — או «חזרה»', W / 2, H - 26);
    ctx.textAlign = 'start';
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function countdown(n, t) {
    ctx.fillStyle = 'rgba(6,40,60,0.45)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    var u = 1 - (t % 1);
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(0.8 + u * 0.5, 0.8 + u * 0.5);
    ctx.globalAlpha = clamp(u * 1.4, 0, 1);
    ctx.font = 'bold 84px Rubik, sans-serif';
    ctx.fillStyle = '#ffe08a';
    ctx.fillText(n > 0 ? String(n) : 'קדימה!', 0, 28);
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     לולאת המשחק — משותפת לכולם
     ═══════════════════════════════════════════════════════════ */
  function run(state) {
    // state: { update(dt,t), render(t), key, intro }
    var last = performance.now();
    var t0 = last;
    var lead = 3.0;                      // ספירה לאחור
    loop = state;
    state.over = false;
    state.win = false;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function frame(now) {
      if (loop !== state) return;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var t = (now - t0) / 1000;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      ctx.save();
      applyShake();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      if (lead > 0 && !state.over) {
        lead -= dt;
        state.render(t, true);
        stepFx(dt);
        drawFx();
        countdown(Math.ceil(lead), lead);
      } else {
        if (!state.over) state.update(dt, t);
        state.render(t, false);
        stepFx(dt);
        drawFx();
        if (state.over) endPanel(state.win, state.endTitle, state.endSub, state.key);
      }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      ctx.restore();
      raf = requestAnimationFrame(frame);
    }
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function finish(state, win, title, sub, stars) {
    if (state.over) return;
    state.over = true;
    state.win = win;
    state.endTitle = title;
    state.endSub = sub || '';
    setStatus(win ? '⭐ +' + (stars || 0) + ' כוכבי הצלה' : 'נסו שוב — אתם קרובים!');
    if (stars) award(stars);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function clearLoop() {
    loop = null;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (canvas) {
      canvas.onpointerdown = null;
      canvas.onpointermove = null;
      canvas.onpointerup = null;
    }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     1. מצאו את הביצים
     ═══════════════════════════════════════════════════════════ */
  function startEggs() {
    prepGame();
    $('game-title').textContent = '🥚 מצאו את הביצים';
    setStatus('חפשו קינים בחול — השועל מסתובב בסביבה');
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var nests = [], found = 0, time = 40;
    for (var i = 0; i < 5; i++) {
      nests.push({
        x: rnd(45, W - 45),
        y: rnd(190, H - 70),
        found: false,
        hint: rnd(0, 6.28)
      });
    }
    var fox = { x: 30, y: 210, vx: 52, vy: 26 };

    var st = {
      key: 'eggs',
      update: function (dt, t) {
        time -= dt;
        if (time <= 0) {
          finish(st, false, 'נגמר הזמן',
                 'מצאתם ' + found + ' מתוך 5 קינים.', found * 3);
          return;
        }
        fox.x += fox.vx * dt;
        fox.y += fox.vy * dt;
        if (fox.x < 25 || fox.x > W - 25) fox.vx *= -1;
        if (fox.y < 170 || fox.y > H - 55) fox.vy *= -1;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        for (var k = 0; k < nests.length; k++) {
          var n = nests[k];
          if (!n.found && Math.hypot(fox.x - n.x, fox.y - n.y) < 24) {
            shake = 1;
            burst(n.x, n.y, '#c98a3a', 18);
            finish(st, false, 'השועל הגיע לקן',
                   'מצאתם ' + found + ' מתוך 5. בשטח זה בדיוק המרוץ של המתנדבים.',
                   found * 3);
            return;
          }
        }
      },
      render: function (t) {
        beach(t, 150);
        // רמזי עקבות סביב קן שלא נמצא
        nests.forEach(function (n) {
          if (!n.found) {
            ctx.globalAlpha = 0.22 + Math.sin(t * 2 + n.hint) * 0.08;
            ctx.strokeStyle = '#8a6a34';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(n.x, n.y, 21, 9, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
          drawNest(n.x, n.y, n.found);
        });
        drawFoxSprite(fox.x, fox.y, 1.0, t);
        drawChubby(38, 172, 0.85, { t: t, dir: 1 });
        hud('נמצאו ' + found + '/5', '⏱ ' + Math.ceil(Math.max(0, time)), time / 40);
        banner('לחצו על סימן עגלגל בחול — שם הנקבה חפרה בלילה.');
      }
    };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    canvas.onpointerdown = function (e) {
      if (st.over) return;
      var p = pt(e);
      for (var k = 0; k < nests.length; k++) {
        var n = nests[k];
        if (!n.found && Math.hypot(p.x - n.x, p.y - n.y) < 30) {
          n.found = true;
          found++;
          burst(n.x, n.y - 4, '#f5e6c8', 16, { up: 2.4 });
          popup(n.x, n.y - 16, '+1 קן', '#ffe08a');
          if (found >= 5) {
            finish(st, true, 'כל חמשת הקינים אותרו!',
                   'הביצים מועברות לחוות הדגרה מוגנת 🥚', 20);
          }
          return;
        }
      }
      burst(p.x, p.y, 'rgba(200,175,120,0.8)', 6, { up: 1.4 });
    };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    run(st);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     2. שמרו על הקן
     ═══════════════════════════════════════════════════════════ */
  function startFox() {
    prepGame();
    $('game-title').textContent = '🦊 שמרו על הקן';
    setStatus('לחצו על שועלים לפני שהם מגיעים לקן');
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var nest = { x: W / 2, y: H - 90 };
    var foxes = [], score = 0, lives = 3, time = 45, spawnT = 0, wave = 1;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function spawn() {
      var side = Math.floor(Math.random() * 3);
      var f = { x: 0, y: 0, sp: rnd(26, 34) + wave * 3.5, t: rnd(0, 6) };
      if (side === 0) { f.x = rnd(20, W - 20); f.y = 45; }
      else if (side === 1) { f.x = -18; f.y = rnd(60, 260); }
      else { f.x = W + 18; f.y = rnd(60, 260); }
      foxes.push(f);
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var st = {
      key: 'fox',
      update: function (dt) {
        time -= dt;
        wave = 1 + Math.floor((45 - time) / 15);
        if (time <= 0) {
          finish(st, true, 'הקן שרד את הלילה! 🌙',
                 'הברחתם ' + score + ' שועלים.', 12 + score * 2);
          return;
        }
        spawnT -= dt;
        if (spawnT <= 0) { spawn(); spawnT = Math.max(0.55, 1.5 - wave * 0.18); }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        for (var i = foxes.length - 1; i >= 0; i--) {
          var f = foxes[i];
          var dx = nest.x - f.x, dy = nest.y - f.y;
          var len = Math.hypot(dx, dy) || 1;
          f.x += (dx / len) * f.sp * dt;
          f.y += (dy / len) * f.sp * dt;
          if (len < 26) {
            foxes.splice(i, 1);
            lives--;
            shake = 1;
            burst(nest.x, nest.y, '#c0392b', 20);
            popup(nest.x, nest.y - 24, '−1 ❤️', '#ff9a8a');
            if (lives <= 0) {
              finish(st, false, 'הקן נפגע',
                     'הברחתם ' + score + ' שועלים לפני כן.', score * 2);
              return;
            }
          }
        }
      },
      render: function (t) {
        beach(t, 120);
        // גדר מגן סביב הקן
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.ellipse(nest.x, nest.y, 46, 26, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        drawNest(nest.x, nest.y, true);
        drawChubby(nest.x - 58, nest.y - 8, 0.9, { t: t, dir: 1 });
        foxes.forEach(function (f) { drawFoxSprite(f.x, f.y, 0.95, t + f.t); });
        var hearts = '';
        for (var i = 0; i < lives; i++) hearts += '❤️';
        hud(hearts + '  גל ' + wave, '🦊 ' + score + '   ⏱ ' + Math.ceil(Math.max(0, time)), time / 45);
        banner('בחוף אמיתי הגדר והסריקות הן מה שעוצר את השועלים.');
      }
    };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    canvas.onpointerdown = function (e) {
      if (st.over) return;
      var p = pt(e);
      var hit = false;
      foxes = foxes.filter(function (f) {
        if (!hit && Math.hypot(p.x - f.x, p.y - f.y) < 26) {
          hit = true;
          score++;
          burst(f.x, f.y, '#e8853f', 14);
          popup(f.x, f.y - 18, 'הוברח!', '#ffe08a');
          return false;
        }
        return true;
      });
    };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    run(st);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     3. מסע אל הים
     ═══════════════════════════════════════════════════════════ */
  function startHatch() {
    prepGame();
    $('game-title').textContent = '🌊 מסע אל הים';
    setStatus('כבו את האורות ופנו את הפסולת — האבקועים זוחלים לים');
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var seaY = 108;
    var babies = [];
    for (var i = 0; i < 7; i++) {
      babies.push({ x: 50 + i * 42, y: H - 70, saved: false, lost: false, w: rnd(0, 6) });
    }
    var lights = [{ x: 70, y: 200, on: true }, { x: 290, y: 300, on: true }];
    var junk = [
      { x: 140, y: 250, t: 0 }, { x: 235, y: 190, t: 1 }, { x: 95, y: 330, t: 3 }
    ];
    var time = 45;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function done() {
      var saved = babies.filter(function (b) { return b.saved; }).length;
      var lost = babies.filter(function (b) { return b.lost; }).length;
      return saved + lost >= babies.length;
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var st = {
      key: 'hatch',
      update: function (dt) {
        time -= dt;
        var anyLight = lights.some(function (l) { return l.on; });

        babies.forEach(function (b) {
          if (b.saved || b.lost) return;
          if (anyLight) {
            var near = lights.filter(function (l) { return l.on; })
              .sort(function (a, c) { return Math.abs(a.x - b.x) - Math.abs(c.x - b.x); })[0];
            b.x += (near.x - b.x) * 0.45 * dt;
            b.y += (near.y - b.y) * 0.30 * dt;
            if (Math.hypot(b.x - near.x, b.y - near.y) < 16) {
              b.lost = true;
              burst(b.x, b.y, '#ffd27a', 10);
              popup(b.x, b.y - 14, 'הלך לאור…', '#ffb3a0');
            }
          } else {
            b.y -= 36 * dt;
            b.x += Math.sin(b.w + b.y / 26) * 8 * dt;
          }
          junk.forEach(function (j) {
            if (!j.gone && Math.hypot(b.x - j.x, b.y - j.y) < 18) {
              b.lost = true;
              burst(b.x, b.y, '#dfe9ee', 10);
              popup(b.x, b.y - 14, 'נתקע', '#ffb3a0');
            }
          });
          if (b.y <= seaY + 6 && !b.lost) {
            b.saved = true;
            burst(b.x, seaY + 6, '#9fe8ff', 14, { up: 2 });
            popup(b.x, seaY - 4, 'הגיע לים! 🌊', '#9fe8ff');
          }
        });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        if (done() || time <= 0) {
          var saved = babies.filter(function (b) { return b.saved; }).length;
          finish(st, saved >= 5,
                 saved + ' מתוך ' + babies.length + ' הגיעו לים',
                 saved >= 5 ? 'ליל בקיעה מוצלח 🐣' : 'כל אור שכבוי מציל עוד אבקוע.',
                 saved * 4);
        }
      },
      render: function (t) {
        // ים למעלה, חול למטה — לילה
        var g = ctx.createLinearGradient(0, 0, 0, seaY + 40);
        g.addColorStop(0, '#0c5f78');
        g.addColorStop(1, '#1d86a0');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, seaY + 40);
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.beginPath();
        ctx.moveTo(0, seaY + 18);
        for (var x = 0; x <= W; x += 8) ctx.lineTo(x, seaY + Math.sin(x / 30 + t * 1.6) * 4);
        ctx.lineTo(W, seaY + 18);
        ctx.closePath();
        ctx.fill();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        var s = ctx.createLinearGradient(0, seaY, 0, H);
        s.addColorStop(0, '#9c8c62');
        s.addColorStop(1, '#6b5f40');
        ctx.fillStyle = s;
        ctx.fillRect(0, seaY, W, H - seaY);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        // ירח
        ctx.fillStyle = 'rgba(255,250,220,0.9)';
        ctx.beginPath();
        ctx.arc(300, 46, 14, 0, Math.PI * 2);
        ctx.fill();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        lights.forEach(function (l) {
          if (l.on) {
            var rg = ctx.createRadialGradient(l.x, l.y, 2, l.x, l.y, 78);
            rg.addColorStop(0, 'rgba(255,220,120,0.75)');
            rg.addColorStop(1, 'rgba(255,220,120,0)');
            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(l.x, l.y, 78, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = l.on ? '#ffdf7a' : '#4a4a46';
          ctx.beginPath();
          ctx.arc(l.x, l.y, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.35)';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.font = 'bold 11px Rubik, sans-serif';
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText(l.on ? 'כבו' : 'כבוי', l.x, l.y + 27);
          ctx.textAlign = 'start';
        });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        junk.forEach(function (j) { if (!j.gone) TRASH[j.t](j.x, j.y); });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        babies.forEach(function (b) {
          if (b.lost) return;
          if (b.saved) { drawHatchling(b.x, seaY - 8, 1.0, t, 1); return; }
          drawHatchling(b.x, b.y, 1.35, t + b.w, 1);
        });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        var saved = babies.filter(function (b) { return b.saved; }).length;
        hud('הגיעו לים ' + saved + '/' + babies.length,
            '⏱ ' + Math.ceil(Math.max(0, time)), time / 45);
        banner('אבקוע רץ לאור הבהיר ביותר. בטבע זה הים — עד שמדליקים אור בחוף.');
      }
    };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    canvas.onpointerdown = function (e) {
      if (st.over) return;
      var p = pt(e);
      for (var i = 0; i < lights.length; i++) {
        if (Math.hypot(p.x - lights[i].x, p.y - lights[i].y) < 30) {
          lights[i].on = !lights[i].on;
          popup(lights[i].x, lights[i].y - 24, lights[i].on ? 'דלוק' : 'כבוי!',
                lights[i].on ? '#ffb3a0' : '#9fe8ff');
          return;
        }
      }
      for (var k = 0; k < junk.length; k++) {
        var j = junk[k];
        if (!j.gone && Math.hypot(p.x - j.x, p.y - j.y) < 26) {
          j.gone = true;
          burst(j.x, j.y, '#cfe3ea', 12);
          popup(j.x, j.y - 14, 'פונה!', '#9fe8ff');
          return;
        }
      }
    };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    run(st);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     4. נקו את החוף
     ═══════════════════════════════════════════════════════════ */
  function startClean() {
    prepGame();
    $('game-title').textContent = '🛍️ נקו את החוף';
    setStatus('אספו את הפסולת לפני שצאבי יחשוב שזו מדוזה');
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var items = [], score = 0, time = 40, combo = 0, comboT = 0;
    // ⚠️ אף פריט לא נולד ליד נקודת ההתחלה של צאבי. בגרסה הראשונה
    // פריט הופיע בדיוק עליו, והמשחק נגמר בשנייה שאחרי הספירה —
    // לפני שהילד הספיק בכלל להבין מה מבקשים ממנו.
    for (var i = 0; i < 14; i++) {
      var ix, iy, guard = 0;
      do {
        ix = rnd(28, W - 28);
        iy = rnd(70, H - 60);
        guard++;
      } while (guard < 40 && Math.hypot(ix - W / 2, iy - H / 2) < 95);
      items.push({ x: ix, y: iy, t: i % TRASH.length, gone: false, b: rnd(0, 6) });
    }
    var jellies = [{ x: 90, y: 180, b: 0 }, { x: 270, y: 330, b: 3 }];
    var turtle = { x: W / 2, y: H / 2, dir: 1, tx: W / 2, ty: H / 2, sp: 0 };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var st = {
      key: 'clean',
      update: function (dt, t) {
        time -= dt;
        comboT -= dt;
        if (comboT <= 0) combo = 0;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        // צאבי שוחה אל הפריט הקרוב ביותר — זו כל המתח במשחק
        var left = items.filter(function (it) { return !it.gone; });
        if (left.length) {
          var near = left.reduce(function (a, b) {
            return Math.hypot(turtle.x - a.x, turtle.y - a.y) <
                   Math.hypot(turtle.x - b.x, turtle.y - b.y) ? a : b;
          });
          turtle.tx = near.x; turtle.ty = near.y;
        }
        var dx = turtle.tx - turtle.x, dy = turtle.ty - turtle.y;
        var len = Math.hypot(dx, dy) || 1;
        turtle.dir = dx >= 0 ? 1 : -1;
        // מאיץ בהדרגה — מתחיל לאט ומסיים לוחץ
        turtle.sp = Math.min(46, turtle.sp + dt * 7);
        turtle.x += (dx / len) * turtle.sp * dt;
        turtle.y += (dy / len) * turtle.sp * dt;

        for (var k = 0; k < items.length; k++) {
          var it = items[k];
          if (!it.gone && Math.hypot(turtle.x - it.x, turtle.y - it.y) < 17) {
            shake = 1;
            burst(it.x, it.y, '#ffffff', 16);
            finish(st, false, 'צאבי בלע פלסטיק',
                   'אספתם ' + score + ' פריטים. בים זה קורה כל יום.', score * 2);
            return;
          }
        }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        if (time <= 0 || !left.length) {
          finish(st, !left.length,
                 !left.length ? 'החוף נקי לגמרי! ✨' : 'נגמר הזמן',
                 'אספתם ' + score + ' פריטי פסולת.', score * 3 + (!left.length ? 15 : 0));
        }
      },
      render: function (t) {
        underwater(t);
        // קרקעית
        ctx.fillStyle = '#b79a63';
        ctx.beginPath();
        ctx.moveTo(0, H);
        ctx.lineTo(0, H - 36);
        for (var x = 0; x <= W; x += 20) ctx.lineTo(x, H - 36 + Math.sin(x / 40) * 7);
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
        // עשבי ים
        ctx.strokeStyle = 'rgba(80,170,120,0.75)';
        ctx.lineWidth = 3;
        for (var i = 0; i < 9; i++) {
          var bx = 20 + i * 40;
          ctx.beginPath();
          ctx.moveTo(bx, H - 30);
          ctx.quadraticCurveTo(bx + Math.sin(t * 1.4 + i) * 9, H - 56, bx + Math.sin(t * 1.4 + i) * 14, H - 78);
          ctx.stroke();
        }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        jellies.forEach(function (j) { drawJelly(j.x, j.y + Math.sin(t + j.b) * 7, t); });
        items.forEach(function (it) {
          if (!it.gone) TRASH[it.t](it.x, it.y + Math.sin(t * 1.3 + it.b) * 3);
        });
        drawChubby(turtle.x, turtle.y, 1.15, { t: t, dir: turtle.dir });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        hud('נאסף ' + score + (combo > 1 ? '   🔥×' + combo : ''),
            '⏱ ' + Math.ceil(Math.max(0, time)), time / 40);
        banner('כל פריט שאתם מוציאים מהים הוא "מדוזה מזויפת" שצב לא יבלע.');
      }
    };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    canvas.onpointerdown = function (e) {
      if (st.over) return;
      var p = pt(e);
      for (var k = 0; k < items.length; k++) {
        var it = items[k];
        if (!it.gone && Math.hypot(p.x - it.x, p.y - it.y) < 24) {
          it.gone = true;
          score++;
          combo++;
          comboT = 1.6;
          burst(it.x, it.y, '#cfe3ea', 12, { up: 1.8 });
          popup(it.x, it.y - 14, combo > 1 ? '+1  ×' + combo : '+1', '#9fe8ff');
          return;
        }
      }
    };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    run(st);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     5. שחרור לים
     ═══════════════════════════════════════════════════════════ */
  function startRelease() {
    prepGame();
    $('game-title').textContent = '🏥 שחרור לים';
    setStatus('גררו למעלה ולמטה — העבירו את הצב המשוקם בבטחה');
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var turtle = { x: 46, y: H / 2, vy: 0 };
    var gates = [];
    for (var i = 0; i < 7; i++) {
      gates.push({ x: 250 + i * 122, gapY: rnd(90, H - 190), gapH: 140 - i * 5, passed: false });
    }
    var scroll = 0, speed = 62, passed = 0;
    var drag = false;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var st = {
      key: 'release',
      update: function (dt) {
        scroll += speed * dt;
        speed += dt * 1.6;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        gates.forEach(function (g) {
          var gx = g.x - scroll;
          if (!g.passed && gx + 16 < turtle.x) {
            g.passed = true;
            passed++;
            popup(turtle.x + 24, turtle.y - 24, '+1', '#ffe08a');
            burst(turtle.x + 16, turtle.y, '#9fe8ff', 8, { up: 1.2, g: 0 });
          }
          if (gx < turtle.x + 13 && gx + 22 > turtle.x - 13) {
            if (turtle.y - 11 < g.gapY || turtle.y + 11 > g.gapY + g.gapH) {
              shake = 1;
              burst(turtle.x, turtle.y, '#e8b06a', 18);
              finish(st, false, 'התנגשות בשונית',
                     'עברתם ' + passed + ' פתחים.', passed * 4);
            }
          }
        });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        var lastG = gates[gates.length - 1];
        if (lastG.x - scroll < -60) {
          finish(st, true, 'צאבי שוחרר לים הפתוח! 🌊',
                 'עברתם את כל ' + gates.length + ' הפתחים.', 30);
        }
        turtle.y = clamp(turtle.y, 26, H - 26);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        if (Math.random() < 0.35) {
          parts.push({ x: turtle.x - 14, y: turtle.y + rnd(-6, 6), vx: -rnd(0.4, 1.2),
                       vy: -rnd(0.1, 0.5), g: 0, life: rnd(0.6, 1.1), age: 0,
                       size: rnd(1, 2.6), color: 'rgba(220,250,255,0.75)' });
        }
      },
      render: function (t) {
        underwater(t);
        gates.forEach(function (g) {
          var gx = g.x - scroll;
          if (gx < -40 || gx > W + 40) return;
          // שונית עליונה ותחתונה
          ctx.fillStyle = '#c98f57';
          roundRect(gx, -10, 22, g.gapY + 10, 8); ctx.fill();
          roundRect(gx, g.gapY + g.gapH, 22, H - (g.gapY + g.gapH) + 10, 8); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          roundRect(gx + 3, -10, 7, g.gapY + 10, 5); ctx.fill();
          roundRect(gx + 3, g.gapY + g.gapH, 7, H - (g.gapY + g.gapH) + 10, 5); ctx.fill();
          // קצה זוהר בפתח
          ctx.fillStyle = 'rgba(160,240,255,0.35)';
          ctx.fillRect(gx, g.gapY - 3, 22, 3);
          ctx.fillRect(gx, g.gapY + g.gapH, 22, 3);
        });
        drawChubby(turtle.x, turtle.y, 1.25, { t: t, dir: 1 });
        hud('פתחים ' + passed + '/' + gates.length, '🌊 שחרור', null);
        banner('צב משוקם מגיע לים דרך מכשולים אמיתיים — ולכן משחררים אותו במקום בטוח.');
      }
    };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function move(e) {
      if (st.over) return;
      turtle.y = pt(e).y;
    }
    canvas.onpointerdown = function (e) { drag = true; move(e); };
    canvas.onpointermove = function (e) { if (drag) move(e); };
    canvas.onpointerup = function () { drag = false; };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    run(st);
  }

  /* ══════════════════════════════════════════════════════════
     6. חידון צאבי
     ═══════════════════════════════════════════════════════════ */
  var QUIZ = [
    { q: 'מה מספר החירום לדיווח על צב ים בישראל?', opts: ['100', '3639*', '106'], ok: 1,
      why: 'זה מוקד רשות הטבע והגנים — אפשר גם בוואטסאפ.' },
    { q: 'איזה מין מקנן יותר בישראל?', opts: ['צב גלדי', 'צב ים ירוק', 'צב ים חום'], ok: 2,
      why: 'ב-2023 נמצאו 367 קינים של צב חום מול 30 של צב ירוק.' },
    { q: 'מה עושים כשרואים אבקועים זוחלים לים?', opts: ['שמים אותם ישר במים', 'נותנים להם לזחול לבד', 'מאירים בפנס'], ok: 1,
      why: 'הזחילה מחזקת אותם ו"מחתימה" בזיכרון את החוף.' },
    { q: 'למה מעתיקים ביצים לחוות הדגרה?', opts: ['כדי לצלם', 'להגן משועלים, רכבים והצפה', 'כי אין מספיק חול'], ok: 1,
      why: 'הנקבה לא שומרת על הקן — ההגנה היא כולה עלינו.' },
    { q: 'מה צב ים ירוק בוגר אוכל?', opts: ['מדוזות בלבד', 'אצות ועשבי ים', 'דגים גדולים'], ok: 1,
      why: 'הוא צמחוני — ומכאן גם השם: השומן שלו ירקרק.' },
    { q: 'מתי עונת ההטלה בישראל?', opts: ['ינואר–מרץ', 'מאי–אוגוסט', 'נובמבר בלבד'], ok: 1,
      why: 'והבקיעה מגיעה כחודשיים אחר כך — יולי עד ספטמבר.' },
    { q: 'איך צבי ים נושמים?', opts: ['בזימים', 'בריאות — אוויר', 'דרך השריון'], ok: 1,
      why: 'ולכן צב שנתפס ברשת מתחת למים עלול לטבוע.' },
    { q: 'למה תאורה בחוף מסוכנת לאבקועים?', opts: ['מחממת את החול', 'מבלבלת אותם ומרחיקה מהים', 'מפחידה דגים'], ok: 1,
      why: 'הם רצים לאור הבהיר — ובטבע זה הים.' },
    { q: 'כמה מיני צבי ים יש בעולם?', opts: ['שבעה', 'עשרים', 'מאה'], ok: 0,
      why: 'וכולם נמצאים בסכנה כזו או אחרת.' },
    { q: 'כמה ביצים יש בערך בקן אחד?', opts: ['כ-10', 'כ-100', 'כ-1,000'], ok: 1,
      why: 'קן שנמצא בשרון הכיל 104 ביצים בדיוק.' },
    { q: 'כמה זמן הביצים דוגרות בחול?', opts: ['שבוע', 'כ-45–60 יום', 'שנה'], ok: 1,
      why: 'החול הוא האינקובטור — הוא שומר על חום ולחות.' },
    { q: 'מה קובע אם יבקע זכר או נקבה?', opts: ['טמפרטורת החול', 'גודל הביצה', 'עומק הקן'], ok: 0,
      why: 'חול חם ➜ נקבות. ולכן ההתחממות מסכנת את הרבייה.' },
    { q: 'כמה אבקועים מגיעים לבגרות?', opts: ['רובם', 'כמחצית', 'בערך אחד מתוך 1,000'], ok: 2,
      why: 'ולכן כל קן שנשמר משנה באמת את התמונה.' },
    { q: 'למה שקית ניילון מסוכנת לצב?', opts: ['היא נראית כמו מדוזה', 'היא חמה מדי', 'היא מבריקה'], ok: 0,
      why: 'צב שבולע פלסטיק מרגיש שבע ומפסיק לאכול.' },
    { q: 'מה זה "שלל לוואי"?', opts: ['דג נדיר', 'לכידה לא מכוונת ברשת', 'סוג של אצה'], ok: 1,
      why: 'זו הסכנה הגדולה ביותר לצב בוגר בים.' },
    { q: 'מה עושה מתקן TED ברשת דיג?', opts: ['מאיר את הרשת', 'מאפשר לצב לברוח החוצה', 'לוכד יותר דגים'], ok: 1,
      why: 'סורג משופע שמחליק את הצב החוצה — והוריד תמותה בעשרות אחוזים.' },
    { q: 'מה זה "החתמה" אצל צבי ים?', opts: ['סימון בצבע', 'זיכרון החוף שבו בקעו', 'שם של מחלה'], ok: 1,
      why: 'הנקבה חוזרת לאותו חוף גם אחרי 25 שנה.' },
    { q: 'איפה המרכז הארצי להצלת צבי ים?', opts: ['באילת', 'במכמורת', 'בתל אביב'], ok: 1,
      why: 'פועל מאז 1999, טיפל ביותר מ-700 צבים.' },
    { q: 'מי הצב הגדול בעולם?', opts: ['צב גלדי', 'צב ירוק', 'צב ניצי'], ok: 0,
      why: 'השיא שנמדד: 916 קילו ו-2.5 מטר.' },
    { q: 'בגיל כמה נקבה מטילה בפעם הראשונה?', opts: ['בגיל שנה', 'בגיל 5', 'בגיל 20–30'], ok: 2,
      why: 'ולכן אוכלוסייה שנפגעה מתאוששת לאט מאוד.' },
    { q: 'מה עושים אם מוצאים צב פצוע?', opts: ['מחזירים לים מיד', 'מתקשרים ל-3639* ולא נוגעים', 'מאכילים אותו'], ok: 1,
      why: 'צב חלש שמוחזר לים פשוט יטבע.' },
    { q: 'למה אסור לנסוע עם רכב על החול?', opts: ['מלכלך את הגלגלים', 'מועך קינים ומהדק את החול', 'מפריע לדייגים'], ok: 1,
      why: 'הקן נמצא כחצי מטר מתחת לפני השטח.' },
    { q: 'מה עושה נקבת צב אחרי ההטלה?', opts: ['דוגרת על הביצים', 'חוזרת לים', 'נשארת עד הבקיעה'], ok: 1,
      why: 'היא לעולם לא תפגוש את הצאצאים שלה.' },
    { q: 'כמה שנים צבי ים קיימים על כדור הארץ?', opts: ['יותר מ-100 מיליון', 'כ-10,000', 'כ-500'], ok: 0,
      why: 'הם שרדו את ההכחדה שחיסלה את הדינוזאורים.' },
    { q: 'מה אוכל הצב הגלדי בעיקר?', opts: ['מדוזות', 'אצות', 'סרטנים'], ok: 0,
      why: 'ולכן שקית צפה מסוכנת לו במיוחד.' },
    { q: 'מי חופר קינים ואוכל ביצים בחוף?', opts: ['שועל', 'יונה', 'דולפין'], ok: 0,
      why: 'ואשפה בחוף מגדילה את מספר השועלים.' },
    { q: 'מה עושים עם בור שחפרנו בחול?', opts: ['משאירים', 'סותמים לפני שהולכים', 'מעמיקים אותו'], ok: 1,
      why: 'בור הוא מלכודת שאבקוע לא מצליח לצאת ממנה.' },
    { q: 'מותר לגעת בצב ים או באבקוע?', opts: ['כן, בעדינות', 'לא — זה אסור ומזיק', 'רק בשריון'], ok: 1,
      why: 'הם ערך טבע מוגן. מגע מלחיץ אותם ומעביר חיידקים.' },
    { q: 'איך ההתחממות פוגעת בצבים?', opts: ['בוקעות כמעט רק נקבות', 'הם שוחים לאט', 'הם מפסיקים לנשום'], ok: 0,
      why: 'בלי זכרים אין דור הבא.' },
    { q: 'מה עושים מתנדבי הצבים בבוקר?', opts: ['מאכילים צבים', 'סורקים את החוף ומאתרים עקבות', 'שוחים בים'], ok: 1,
      why: 'עקבות של נקבה נראות כמו סימן גלגלי טרקטור.' },
    { q: 'איך הצב הירוק עוזר לים?', opts: ['רועה עשבי ים ושומר עליהם', 'אוכל פלסטיק', 'חופר מנהרות'], ok: 0,
      why: 'שדות עשבי ים קולטים פחמן ומגדלים דגים צעירים.' },
    { q: 'מי זה "נצנוץ"?', opts: ['מין של צב', 'כוכב הים של צאבי', 'שם של חוף'], ok: 1,
      why: 'כוכב ים קטן שיושב לצאבי על השריון מאז שהיה אבקוע ⭐' }
  ];
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function startQuiz() {
    prepGame();
    canvas.classList.add('hidden');
    quizBox.classList.remove('hidden');
    $('game-title').textContent = '🧠 חידון צאבי';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var order = QUIZ.slice().sort(function () { return Math.random() - 0.5; }).slice(0, 8);
    var i = 0, score = 0;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function show() {
      if (i >= order.length) {
        var msg = score >= 7 ? 'שומרי צבי ים אמיתיים! 🐢'
                : score >= 5 ? 'יפה מאוד! עוד קצת ואתם מומחים'
                : 'התחלה טובה — כל סבב מלמד עוד';
        quizBox.innerHTML =
          '<div class="q">סיימתם! ' + score + ' מתוך ' + order.length + ' 🐢</div>' +
          '<div class="quiz-final">' + msg + '</div>';
        setStatus('⭐ +' + (score * 5) + ' כוכבי הצלה');
        award(score * 5);
        return;
      }
      var item = order[i];
      setStatus('שאלה ' + (i + 1) + ' מתוך ' + order.length + '  ·  נכונות: ' + score);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      var html = '<div class="quiz-progress"><i style="width:' +
                 Math.round((i / order.length) * 100) + '%"></i></div>' +
                 '<div class="q">' + item.q + '</div>';
      item.opts.forEach(function (opt, idx) {
        html += '<button type="button" data-i="' + idx + '">' + opt + '</button>';
      });
      html += '<div class="quiz-why" id="quiz-why"></div>';
      quizBox.innerHTML = html;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      var answered = false;
      var btns = quizBox.querySelectorAll('button');
      Array.prototype.forEach.call(btns, function (btn) {
        btn.onclick = function () {
          if (answered) return;
          answered = true;
          var pick = +btn.getAttribute('data-i');
          Array.prototype.forEach.call(btns, function (b, j) {
            b.disabled = true;
            if (j === item.ok) b.classList.add('correct');
            if (j === pick && pick !== item.ok) b.classList.add('wrong');
          });
          if (pick === item.ok) score++;
          var why = $('quiz-why');
          if (why) {
            why.textContent = (pick === item.ok ? '✓ ' : '💡 ') + item.why;
            why.className = 'quiz-why show ' + (pick === item.ok ? 'good' : 'info');
          }
          setTimeout(function () { i++; show(); }, 1900);
        };
      });
    }
    show();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     ניהול
     ═══════════════════════════════════════════════════════════ */
  function open(id) {
    clearLoop();
    active = id;
    $('game-overlay').classList.remove('hidden');
    var map = {
      eggs: startEggs, fox: startFox, hatch: startHatch,
      clean: startClean, release: startRelease, quiz: startQuiz
    };
    if (map[id]) map[id]();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function close() {
    clearLoop();
    active = null;
    var ov = $('game-overlay');
    if (ov) ov.classList.add('hidden');
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function restart() { if (active) open(active); }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     סיור חופים — המסך הנפרד
     ═══════════════════════════════════════════════════════════ */
  var P = { running: false, tracks: 0, nests: 0, time: 60, marks: [], raf: 0, ctx: null, t: 0 };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function patrolCtx() {
    var c = $('patrol-canvas');
    if (!c) return null;
    P.ctx = fitCanvas(c);
    return P.ctx;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function drawPatrolScene(g, t) {
    var o = ctx; ctx = g;                       // כלי הציור עובדים על ctx

    // זריחה — הסריקה נעשית עם שחר
    var sky = ctx.createLinearGradient(0, 0, 0, 118);
    sky.addColorStop(0, '#ffb877');
    sky.addColorStop(0.45, '#ffdcaa');
    sky.addColorStop(1, '#d9ecf2');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, 118);
    ctx.fillStyle = 'rgba(255,238,185,0.95)';
    ctx.beginPath();
    ctx.arc(288, 60, 21, 0, Math.PI * 2);
    ctx.fill();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var sea = ctx.createLinearGradient(0, 118, 0, 172);
    sea.addColorStop(0, '#0f6a84');
    sea.addColorStop(1, '#4fbccb');
    ctx.fillStyle = sea;
    ctx.fillRect(0, 118, W, 54);
    // השתקפות השמש על המים
    ctx.fillStyle = 'rgba(255,230,170,0.22)';
    for (var q = 0; q < 6; q++) {
      var rw = (30 - q * 2.5) + Math.sin(t * 1.2 + q) * 5;
      var ry = 126 + q * 7;
      ctx.beginPath();
      ctx.ellipse(288 + Math.sin(t * 1.6 + q * 1.3) * 6, ry, rw, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    sand(172);
    foam(t, 172);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    P.marks.forEach(function (m) {
      if (m.type === 'track') {
        // ⚠️ עקבות של נקבה הן **שני פסים מקבילים** ברוחב כמטר, עם
        // שריטות סנפיר באמצע. הגרסה הראשונה ציירה קווים אנכיים
        // צפופים והתוצאה נראתה כמו סולם שהושלך על החול.
        ctx.save();
        ctx.translate(m.x, m.y);
        ctx.rotate(m.rot || 0);
        var a = m.found ? 0.30 : 0.42 + Math.sin(t * 2.4 + m.x) * 0.10;
        ctx.globalAlpha = a;
        ctx.strokeStyle = '#8a6a34';
        ctx.lineCap = 'round';

        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(-31, -10);
        ctx.quadraticCurveTo(0, -12.5, 31, -9);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-31, 10);
        ctx.quadraticCurveTo(0, 12.5, 31, 9);
        ctx.stroke();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        // שריטות סנפיר — קצרות, לא אחידות, ולא נוגעות בשני הפסים
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = a * 0.7;
        for (var i = -2; i <= 2; i++) {
          var jx = i * 12 + ((i * 37) % 5) - 2;
          var h = 3.2 + ((i * 53) % 3);
          ctx.beginPath();
          ctx.moveTo(jx - 3, -h);
          ctx.lineTo(jx + 3, h);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.lineCap = 'butt';
        ctx.restore();
      } else {
        drawNest(m.x, m.y, true);
        if (m.marked) {
          ctx.strokeStyle = '#ff7a59';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.ellipse(m.x, m.y, 30, 16, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = 'bold 11px Rubik, sans-serif';
          ctx.fillStyle = '#ff7a59';
          ctx.textAlign = 'center';
          ctx.fillText('קן מסומן', m.x, m.y - 22);
          ctx.textAlign = 'start';
        }
      }
    });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    drawChubby(46, 205, 0.95, { t: t, dir: 1 });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    if (P.running) {
      hud('🐾 ' + P.tracks + '   🥚 ' + P.nests,
          '⏱ ' + Math.ceil(Math.max(0, P.time)), P.time / 60);
    } else {
      ctx.fillStyle = 'rgba(6,50,74,0.55)';
      ctx.fillRect(0, 0, W, 30);
      ctx.font = 'bold 13px Rubik, sans-serif';
      ctx.fillStyle = '#dff3ff';
      ctx.textAlign = 'center';
      ctx.fillText('סריקת בוקר — לחצו «התחלת סריקה»', W / 2, 20);
      ctx.textAlign = 'start';
    }
    ctx = o;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function drawPatrol() {
    var g = patrolCtx();
    if (!g) return;
    var o = ctx; ctx = g;
    ctx = o;
    drawPatrolScene(g, P.t);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function patrolLoop(now) {
    if (!P.running) return;
    P.raf = requestAnimationFrame(patrolLoop);
    var dt = Math.min(0.05, (now - (P.last || now)) / 1000);
    P.last = now;
    P.t += dt;
    P.time -= dt;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // ⚠️ סימן חדש נולד רק במקום פנוי. בלי התנאי הזה כל העקבות
    // הצטופפו באותו אזור ונראו כערימה אחת בלתי מובנת.
    if (Math.random() < dt * 0.95 && P.marks.length < 8) {
      for (var a = 0; a < 14; a++) {
        var nx = rnd(60, W - 60), ny = rnd(215, H - 50);
        var clear = true;
        for (var b = 0; b < P.marks.length; b++) {
          if (Math.hypot(nx - P.marks[b].x, ny - P.marks[b].y) < 78) { clear = false; break; }
        }
        if (clear) {
          P.marks.push({ type: 'track', x: nx, y: ny, rot: rnd(-0.35, 0.35), found: false });
          break;
        }
      }
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var g = P.ctx || patrolCtx();
    var o = ctx; ctx = g;
    stepFx(dt);
    ctx = o;
    drawPatrolScene(g, P.t);
    var o2 = ctx; ctx = g; drawFx(); ctx = o2;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    if (P.time <= 0) {
      P.running = false;
      var el = $('patrol-hint');
      if (el) el.textContent = 'סיום סריקה — ' + P.tracks + ' עקבות, ' + P.nests + ' קינים הועברו לחווה ⭐';
      award(P.nests * 8 + P.tracks * 2);
      var btn = $('patrol-start');
      if (btn) btn.textContent = 'סריקה נוספת';
    }
    syncPatrolStats();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function syncPatrolStats() {
    var a = $('p-tracks'), b = $('p-nests'), c = $('p-time');
    if (a) a.textContent = P.tracks;
    if (b) b.textContent = P.nests;
    if (c) c.textContent = Math.max(0, Math.ceil(P.time));
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function startPatrol() {
    var c = $('patrol-canvas');
    if (!c) return;
    patrolCtx();
    P.running = true;
    P.tracks = 0; P.nests = 0; P.time = 60; P.marks = []; P.t = 0; P.last = 0;
    parts = []; pops = [];
    var hint = $('patrol-hint');
    if (hint) hint.textContent = 'לחצו על עקבות בחול — ואז על הקן שנחשף';
    var btn = $('patrol-start');
    if (btn) btn.textContent = 'סריקה פעילה…';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    c.onpointerdown = function (e) {
      if (!P.running) return;
      var p = pt(e, c);
      for (var i = 0; i < P.marks.length; i++) {
        var m = P.marks[i];
        if (m.type === 'track' && !m.found && Math.hypot(p.x - m.x, p.y - m.y) < 32) {
          m.found = true;
          P.tracks++;
          var o = ctx; ctx = P.ctx;
          burst(m.x, m.y, 'rgba(200,170,110,0.9)', 12);
          popup(m.x, m.y - 18, 'עקבות! 🐾', '#ffe08a');
          ctx = o;
          P.marks.push({ type: 'nest', x: m.x + rnd(-18, 18), y: m.y + rnd(14, 30), marked: false });
          return;
        }
        if (m.type === 'nest' && !m.marked && Math.hypot(p.x - m.x, p.y - m.y) < 32) {
          m.marked = true;
          P.nests++;
          var o2 = ctx; ctx = P.ctx;
          burst(m.x, m.y - 4, '#f5e6c8', 16, { up: 2.2 });
          popup(m.x, m.y - 24, 'קן הועבר לחווה! 🥚', '#9fe8ff');
          ctx = o2;
          return;
        }
      }
    };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    cancelAnimationFrame(P.raf);
    P.raf = requestAnimationFrame(patrolLoop);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  global.CBY_GAMES = {
    open: open,
    close: close,
    restart: restart,
    startPatrol: startPatrol,
    drawPatrol: drawPatrol,
    QUIZ: QUIZ,
    fingerprint: 'CBY-T7R4L2E9'
  };
})(typeof window !== 'undefined' ? window : globalThis);
