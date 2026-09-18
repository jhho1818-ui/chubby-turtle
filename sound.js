// ==================================================================
// © כל הזכויות שמורות | ALL RIGHTS RESERVED
// יוצר ובעלים בלעדי: דניאל אברהם חדאד | Creator & sole owner: Daniel Avraham Haddad
// אפליקציית "צאבי הצב — שומר צבי הים" וכל רכיביה הם קניינו הבלעדי.
// Unauthorized copying, distribution or attribution is prohibited and actionable by law.
// ==================================================================
// 🔊 [CBY-SND] צלילים — נוצרים בקוד, בלי אף קובץ אודיו
//
// דווח: "סאונדים תוסיף".
//
// ⚠️⚠️ **למה הצלילים מסונתזים ולא קבצי mp3 — וזו החלטה ולא קיצור דרך.**
//
// קובצי אודיו היו מוסיפים לאפליקציה מגה-בייטים, היו דורשים רשת
// בטעינה הראשונה, והיו שוברים את ההבטחה המרכזית של PWA: לעבוד
// במלואה בלי חיבור. חוץ מזה, לכל קובץ יש בעלים — ואפליקציה
// שאמורה להגיע לילדים דרך רכזת מתנדבים לא יכולה לשאת סיכון
// רישוי על צליל.
//
// Web Audio מייצר את כל אלה מגלים בסיסיים: 12 צלילים, אפס בתים,
// אפס רישיונות, וזהים בכל מכשיר.
//
// ⚠️ **שלוש מלכודות שנמדדו ומטופלות כאן:**
//
//   1. **iOS לא מנגן עד שהמשתמש נוגע.** AudioContext נולד
//      במצב "suspended" ו-iOS משחרר אותו רק בתוך מחווה אמיתית של
//      המשתמש. לכן ההקשר נוצר בעצלתיים, בנגיעה הראשונה, ולא
//      בטעינת הדף — אחרת הצליל הראשון פשוט לא נשמע, בלי שגיאה.
//
//   2. **צליל שחוזר 30 פעם בשנייה הופך לרעש.** לכל צליל יש חלון
//      מינימלי בין הפעלות.
//
//   3. **ילד עם אוזניות.** עוצמה מתונה, בלי פסגות חדות, ועם
//      דעיכה אקספוננציאלית שמונעת את ה"קליק" שנשמע בסוף כל צליל
//      שנקטע בבת אחת.
//
// 🔒 [CBY-PROOF] יוצר ובעלים בלעדי: דניאל אברהם חדאד / Daniel Avraham Haddad
// טביעת אצבע: CBY-T7R4L2E9
// ==================================================================

(function (global) {
  'use strict';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var FINGERPRINT = 'CBY-T7R4L2E9';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var ctx = null;
  var master = null;
  var muted = false;
  var lastAt = {};
  var KEY = 'cby-sound-off';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  try { muted = global.localStorage.getItem(KEY) === '1'; } catch (e) { }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️ יצירה עצלה. ההקשר נוצר רק כשבאמת מנגנים, וההשמה הראשונה
     כמעט תמיד מגיעה מתוך נגיעה של המשתמש — וזה בדיוק מה ש-iOS
     דורש כדי לשחרר את האודיו. */
  function ac() {
    if (ctx) return ctx;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.32;
      master.connect(ctx.destination);
    } catch (e) { ctx = null; }
    return ctx;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function resume() {
    var c = ac();
    if (c && c.state === 'suspended') { try { c.resume(); } catch (e) { } }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* צליל בסיסי: תדר, משך, גל, עוצמה, והחלקה בתדר */
  function tone(freq, dur, type, vol, slideTo, delay) {
    var c = ac();
    if (!c || muted) return;
    var t0 = c.currentTime + (delay || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // ⚠️ דעיכה אקספוננציאלית ולא ניתוק חד: ניתוק חד מייצר "קליק"
    // ששומעים בבירור באוזניות והופך צליל נעים למטריד.
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol || 0.25), t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    osc.connect(g); g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* רעש — לגלים, לחול ולחפירה */
  function noise(dur, vol, filterHz, sweepTo) {
    var c = ac();
    if (!c || muted) return;
    var n = Math.floor(c.sampleRate * dur);
    var buf = c.createBuffer(1, n, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = c.createBufferSource();
    src.buffer = buf;
    var f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(filterHz || 900, c.currentTime);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, c.currentTime + dur);
    var g = c.createGain();
    g.gain.setValueAtTime(vol || 0.18, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️ חלון מינימלי בין הפעלות של אותו צליל. בלעדיו, איסוף של
     חמישה פריטים באותה שנייה נשמע כמו זמזום ולא כמו חמישה איסופים. */
  function gate(name, ms) {
    var now = (global.performance && performance.now()) || Date.now();
    if (lastAt[name] && now - lastAt[name] < ms) return false;
    lastAt[name] = now;
    return true;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️⚠️ **מה גורם ללחיצה להישמע "כמו אפליקציה".**

     הגרסה הקודמת ניגנה צליל סינוס אחד ב-70ms. זה נשמע כמו
     צפצוף של מיקרוגל. לחיצה במערכת הפעלה אמיתית בנויה משני
     רכיבים שקורים יחד:

       1. **פרץ רעש קצרצר** (‎~18ms) — זה ה"טק" הפיזי, הדבר
          שגורם למוח לפרש את הצליל כמגע במשהו מוצק.
       2. **גוף מצולם** (‎~50ms) — צליל קצר וגבוה שנותן לו אופי.

     בלי הרעש זה צפצוף. בלי הגוף זה סטטי. יחד — זו לחיצה. */
  function clickBody(freq, dur, vol, slideTo) {
    noise(0.018, (vol || 0.2) * 0.55, 3200, 1400);
    tone(freq, dur, 'triangle', vol, slideTo);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var SFX = {
    tap: function () {
      if (!gate('tap', 40)) return;
      clickBody(1180, 0.045, 0.14, 820);
    },
    click: function () {
      if (!gate('click', 50)) return;
      clickBody(880, 0.05, 0.12, 640);
    },

    /* לחיצה על כפתור ראשי — נמוכה ומלאה יותר, "כבדה" יותר */
    press: function () {
      if (!gate('press', 60)) return;
      noise(0.022, 0.13, 2600, 900);
      tone(520, 0.07, 'triangle', 0.17, 330);
      tone(1040, 0.045, 'sine', 0.06, 700);
    },

    /* מעבר בין לשוניות/מסכים — טיק קצר ומוסט מעלה */
    nav: function () {
      if (!gate('nav', 50)) return;
      noise(0.014, 0.09, 3600, 1800);
      tone(980, 0.04, 'sine', 0.10, 1320);
    },

    /* חזרה אחורה — אותו טיק, מוסט מטה */
    back: function () {
      if (!gate('back', 60)) return;
      noise(0.014, 0.09, 3200, 1500);
      tone(760, 0.05, 'sine', 0.10, 520);
    },

    /* פתיחת חלונית/מגירה — שאיפה קצרה כלפי מעלה */
    sheet: function () {
      noise(0.16, 0.10, 500, 2400);
      tone(420, 0.16, 'sine', 0.07, 740);
    },
    sheetClose: function () {
      noise(0.14, 0.09, 2200, 420);
      tone(700, 0.14, 'sine', 0.06, 380);
    },

    /* שליחת הודעה בצ'אט */
    sent: function () {
      tone(700, 0.07, 'sine', 0.11, 1080);
      tone(1080, 0.06, 'sine', 0.06, 1320, 0.05);
    },

    /* צאבי עונה — שתי תווים חמים, לא התראה */
    reply: function () {
      tone(587, 0.12, 'sine', 0.10, 587);
      tone(784, 0.16, 'sine', 0.09, 784, 0.09);
    },

    /* מתג */
    onSw: function () { clickBody(880, 0.05, 0.12, 1320); },
    offSw: function () { clickBody(880, 0.05, 0.12, 560); },

    /* שגיאה עדינה — לא צפירה */
    nope: function () {
      if (!gate('nope', 200)) return;
      tone(330, 0.09, 'triangle', 0.10, 262);
      tone(247, 0.12, 'triangle', 0.09, 208, 0.07);
    },

    /* ══════════════════════════════════════════════════════════
       ⚠️⚠️ צליל הצלחה — למה הגרסה הקודמת נשמעה זולה
       ══════════════════════════════════════════════════════════

       'good' היה שני צלילי סינוס עולים. זה הצליל של תנור מיקרוגל
       שסיים, ולא של «צדקת».

       מה שגורם לצליל להישמע **מקצועי** הוא לא מנגינה ארוכה יותר
       אלא שלושה דברים שקורים יחד:

         1. **אקורד, לא רצף.** שלושה תווים שמתחילים כמעט יחד
            (הפרש 45ms) נשמעים כהרמוניה אחת. אותם תווים בהפרש
            150ms נשמעים כשלושה צפצופים.
         2. **פעמון מעל.** תו גבוה בעוצמה נמוכה שנשאר תלוי אחרי
            שהאקורד נגמר — זה מה שנותן «ברק».
         3. **דעיכה ארוכה מהאירוע.** אקורד שנחתך ב-0.2 שניות
            נשמע זול; אותו אקורד שדועך 0.9 שניות נשמע יקר.

       האקורד: דו-מי-סול (C-E-G) — מז'ור, הצליל שכל אוזן מזהה
       כ"נכון". */
    correct: function () {
      if (!gate('correct', 120)) return;
      [523.25, 659.25, 783.99].forEach(function (f, i) {
        tone(f, 0.75, 'sine', 0.115, f, i * 0.045);
        tone(f * 2, 0.34, 'triangle', 0.028, f * 2, i * 0.045);
      });
      tone(1567.98, 0.90, 'sine', 0.055, 1567.98, 0.16);
      noise(0.22, 0.035, 7000, 3000);
    },

    /* רצף של שלוש ומעלה — אותו אקורד, פלוס קפיצה לאוקטבה */
    correctBig: function () {
      if (!gate('correct', 120)) return;
      [523.25, 659.25, 783.99, 1046.50].forEach(function (f, i) {
        tone(f, 0.85, 'sine', 0.115, f, i * 0.045);
        tone(f * 2, 0.36, 'triangle', 0.030, f * 2, i * 0.045);
      });
      [1318.51, 1567.98, 2093.00].forEach(function (f, i) {
        tone(f, 0.75 - i * 0.12, 'sine', 0.05 - i * 0.012, f, 0.20 + i * 0.075);
      });
      noise(0.30, 0.045, 8000, 3000);
    },

    /* תשובה שגויה — רך, יורד, בלי עוקץ */
    wrongSoft: function () {
      if (!gate('wrongSoft', 200)) return;
      tone(392.00, 0.28, 'sine', 0.085, 392.00);
      tone(329.63, 0.40, 'sine', 0.075, 329.63, 0.14);
    },

    /* סיום חידון — קדנצה קצרה */
    quizDone: function () {
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach(function (f, i) {
        tone(f, 0.55, 'sine', 0.10, f, i * 0.105);
      });
      [1046.50, 1318.51, 1567.98].forEach(function (f, i) {
        tone(f, 1.4, 'sine', 0.055, f, 0.60 + i * 0.035);
      });
      noise(0.5, 0.04, 7000, 2200);
    },

    /* ——— צלילי משחק נוספים ——— */

    /* טיק-טק של זמן אוזל — עולה בדחיפות ככל שנשאר פחות */
    tick: function () {
      if (!gate('tick', 120)) return;
      tone(1500, 0.035, 'square', 0.055, 1500);
    },
    tickHot: function () {
      if (!gate('tick', 120)) return;
      tone(1980, 0.045, 'square', 0.085, 1980);
      noise(0.012, 0.05, 4000, 2000);
    },

    /* אזהרה — משהו רע עומד לקרות */
    warn: function () {
      if (!gate('warn', 500)) return;
      tone(392, 0.16, 'sawtooth', 0.07, 330);
      tone(330, 0.20, 'sawtooth', 0.06, 262, 0.12);
    },

    /* צעד על חול — רעש קצר ועמום מאוד. ⚠️ עוצמה 0.05 בכוונה:
       צעדים אמורים להישמע כשמקשיבים, לא להתחרות בשאר הצלילים. */
    step: function () {
      if (!gate('step', 170)) return;
      noise(0.075, 0.05, 700, 260);
    },

    /* חתירה במים */
    swim: function () {
      if (!gate('swim', 260)) return;
      noise(0.17, 0.055, 480, 1500);
    },

    /* גל מתנפץ — נשמע לסירוגין ברקע של משחקי חוף */
    surf: function () {
      noise(0.85, 0.075, 260, 1500);
      noise(0.55, 0.045, 1800, 380);
    },

    /* קול רקע של שחף — נדיר בכוונה, פעם בכמה עשרות שניות */
    gull: function () {
      tone(1320, 0.10, 'sine', 0.045, 1760);
      tone(1760, 0.09, 'sine', 0.038, 1320, 0.11);
      tone(1500, 0.12, 'sine', 0.030, 1100, 0.24);
    },

    /* ⚠️⚠️ **צליל הפתיחה.**
       זו החתימה הקולית של האפליקציה — הדבר שילד ישמע פעמיים
       ביום ויזהה. שלושה רכיבים, בסדר הזה:
         · **גל** — רעש מסונן שנפתח כלפי מעלה, כמו גל שמתנפץ;
           הוא ממקם אותנו בים לפני שנשמע תו אחד.
         · **ארפג'יו** בסולם מז'ור פנטטוני (רה-פה#-לה-סי-רה),
           חמישה תווים עולים. פנטטוני הוא הסולם שאי אפשר לזייף
           בו — כל צירוף בתוכו נשמע נעים.
         · **פעמון** גבוה בסוף, שנשאר תלוי באוויר רבע שנייה.
       סה"כ 1.25 שניות — מספיק כדי להרגיש כמו פתיחה, קצר מספיק
       כדי לא לעכב את הילד. */
    boot: function () {
      noise(0.55, 0.14, 300, 2000);
      var notes = [587.33, 739.99, 880.00, 987.77, 1174.66];
      notes.forEach(function (f, i) {
        tone(f, 0.42, 'sine', 0.13, f, 0.10 + i * 0.085);
        tone(f * 2, 0.20, 'triangle', 0.035, f * 2, 0.10 + i * 0.085);
      });
      tone(1760, 0.85, 'sine', 0.075, 1760, 0.52);
      tone(2637, 0.60, 'sine', 0.030, 2637, 0.54);
      noise(0.35, 0.05, 6000, 2500);
    },
    collect: function () {
      if (!gate('collect', 55)) return;
      tone(880, 0.09, 'sine', 0.22, 1320);
      tone(1320, 0.10, 'sine', 0.12, 1760, 0.045);
    },
    good: function () {
      if (!gate('good', 90)) return;
      tone(660, 0.10, 'triangle', 0.20, 880);
      tone(990, 0.14, 'triangle', 0.16, 1180, 0.08);
    },
    hit: function () {
      if (!gate('hit', 120)) return;
      tone(180, 0.20, 'sawtooth', 0.20, 70);
      noise(0.16, 0.14, 700, 160);
    },
    sting: function () {
      if (!gate('sting', 140)) return;
      tone(300, 0.10, 'square', 0.14, 120);
      tone(150, 0.22, 'sawtooth', 0.16, 60, 0.06);
    },
    dig: function () {
      if (!gate('dig', 90)) return;
      noise(0.22, 0.24, 1400, 350);
    },
    wave: function () {
      if (!gate('wave', 900)) return;
      noise(1.5, 0.10, 520, 180);
    },
    count: function () {
      tone(520, 0.11, 'triangle', 0.20);
    },
    go: function () {
      tone(780, 0.16, 'triangle', 0.24, 1040);
    },
    /* ניצחון — ארפג'יו עולה. ⚠️ שלושה תווים ולא מנגינה: מנגינה
       ארוכה מעכבת את הילד לפני מסך התוצאה והופכת למעצבנת בשלב
       השלישי שמנגנים אותו. */
    win: function () {
      [523, 659, 784, 1046].forEach(function (f, i) {
        tone(f, 0.20, 'triangle', 0.22, null, i * 0.10);
      });
    },
    lose: function () {
      [392, 330, 262].forEach(function (f, i) {
        tone(f, 0.24, 'sine', 0.20, null, i * 0.12);
      });
    },
    star: function () {
      [784, 988, 1175].forEach(function (f, i) {
        tone(f, 0.16, 'sine', 0.18, null, i * 0.09);
      });
    },
    levelUp: function () {
      [523, 784, 1046, 1318].forEach(function (f, i) {
        tone(f, 0.22, 'triangle', 0.20, null, i * 0.08);
      });
    },
    /* "דיבור" — פעימות קצרות שמלוות טקסט שנכתב. ⚠️ עוצמה נמוכה
       מאוד: זה תבלין מתחת לסף המודע, ואם שומעים אותו — הוא חזק מדי. */
    blip: function () {
      if (!gate('blip', 55)) return;
      tone(340 + Math.random() * 220, 0.045, 'sine', 0.055);
    },
    /* חפירה בחול — שתי שכבות: גרידה ואז נפילת חול */
    sand: function () {
      if (!gate('sand', 120)) return;
      noise(0.26, 0.20, 1800, 420);
      noise(0.34, 0.10, 700, 260);
    },
    /* בקיעה — קליפה נסדקת */
    hatch: function () {
      tone(900, 0.05, 'square', 0.10, 620);
      tone(700, 0.06, 'square', 0.09, 480, 0.07);
      noise(0.18, 0.10, 2200, 600);
    },
    /* מצאתם! — הצליל שמסמן משימה שהושלמה */
    found: function () {
      [659, 880, 1174, 1568].forEach(function (f, i) {
        tone(f, 0.22, 'triangle', 0.24, null, i * 0.085);
      });
      noise(0.5, 0.06, 3000, 900);
    },
    /* שועל נבהל */
    scare: function () {
      if (!gate('scare', 130)) return;
      tone(520, 0.09, 'sawtooth', 0.13, 900);
      tone(880, 0.12, 'triangle', 0.14, 1400, 0.05);
    },
    /* קריאת עידוד קצרה */
    cheer: function () {
      if (!gate('cheer', 400)) return;
      [523, 698, 880].forEach(function (f, i) {
        tone(f, 0.14, 'triangle', 0.17, null, i * 0.07);
      });
    },
    /* שער שעברנו בו */
    gate: function () {
      if (!gate('gate', 90)) return;
      tone(740, 0.10, 'sine', 0.18, 1100);
      tone(1110, 0.12, 'sine', 0.10, 1480, 0.05);
    },
    /* טפטוף מים — רקע עדין */
    drip: function () {
      if (!gate('drip', 700)) return;
      tone(1200, 0.10, 'sine', 0.06, 420);
    }
  };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */


  /* ══════════════════════════════════════════════════════════
     רקע ים — לולאה רציפה ושקטה
     ══════════════════════════════════════════════════════════
     ⚠️⚠️ **למה זה לא "עוד צליל" אלא מחולל נפרד.**

     גל בודד שמתנגן שוב ושוב נשמע כמו לולאה — האוזן קולטת את
     נקודת החיבור תוך שתי חזרות והיא הופכת למטרידה. ים אמיתי אף
     פעם לא חוזר על עצמו.

     לכן כאן אין קובץ ואין לולאה: יש **מקור רעש ורוד רציף** שעובר
     דרך מסנן מעביר-נמוכים, ותדר החיתוך של המסנן נע לאט ובאקראי
     סביב 400Hz. התוצאה היא גלים שמתקרבים ומתרחקים בלי תבנית.

     ⚠️ העוצמה נמוכה בכוונה (6%): רקע שמורגש אבל לא נשמע. אם
     שומעים אותו במפורש — הוא חזק מדי, וילד שמשחק שעה יכבה אותו. */
  var ambSrc = null, ambGain = null, ambFilter = null, ambTimer = 0;
  var ambOn = false;
  try { ambOn = global.localStorage.getItem('cby-amb-on') === '1'; } catch (e) { }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function ambientStart() {
    var c = ac();
    if (!c || ambSrc) return;
    try {
      // שתי שניות של רעש ורוד, מנוגנות בלולאה — המסנן הוא שמשתנה
      var n = Math.floor(c.sampleRate * 2);
      var buf = c.createBuffer(1, n, c.sampleRate);
      var d = buf.getChannelData(0);
      var b0 = 0, b1 = 0, b2 = 0;
      for (var i = 0; i < n; i++) {
        var w = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + w * 0.0990460;
        b1 = 0.96300 * b1 + w * 0.2965164;
        b2 = 0.57000 * b2 + w * 1.0526913;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.12;
      }
      // ⚠️ היחלשות בקצוות מונעת "פופ" בנקודת החיבור של הלולאה
      var fade = Math.floor(c.sampleRate * 0.05);
      for (var j = 0; j < fade; j++) {
        d[j] *= j / fade;
        d[n - 1 - j] *= j / fade;
      }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      ambSrc = c.createBufferSource();
      ambSrc.buffer = buf;
      ambSrc.loop = true;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      ambFilter = c.createBiquadFilter();
      ambFilter.type = 'lowpass';
      ambFilter.frequency.value = 420;
      ambFilter.Q.value = 0.6;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      ambGain = c.createGain();
      ambGain.gain.value = 0;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      ambSrc.connect(ambFilter);
      ambFilter.connect(ambGain);
      ambGain.connect(master);
      ambSrc.start();
      ambGain.gain.linearRampToValueAtTime(0.06, c.currentTime + 2.5);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      // גאות ושפל של המסנן — זה מה שיוצר את תחושת הגלים
      clearInterval(ambTimer);
      ambTimer = setInterval(function () {
        if (!ambFilter || !ctx) return;
        var target = 260 + Math.random() * 520;
        try {
          ambFilter.frequency.linearRampToValueAtTime(target, ctx.currentTime + 3.5 + Math.random() * 3);
        } catch (e) { }
      }, 3800);
    } catch (e) { ambSrc = null; }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function ambientStop() {
    clearInterval(ambTimer);
    ambTimer = 0;
    if (ambGain && ctx) {
      try { ambGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.8); } catch (e) { }
    }
    var src = ambSrc;
    ambSrc = null;
    setTimeout(function () { if (src) { try { src.stop(); } catch (e) { } } }, 1000);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function ambient(on) {
    if (on == null) return ambOn;
    ambOn = !!on;
    try { global.localStorage.setItem('cby-amb-on', ambOn ? '1' : '0'); } catch (e) { }
    if (ambOn) { resume(); ambientStart(); } else ambientStop();
    return ambOn;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️ שלושה כוכבים אמורים להישמע כשלושה **אירועים**, לא כאקורד.
     המרווח של 260ms הוא מה שנותן לילד להספיק להרגיש כל אחד. */
  function starSeq(n) {
    var k = Math.max(0, Math.min(3, n || 0));
    for (var i = 0; i < k; i++) {
      (function (d) { setTimeout(function () { play('star'); }, d); })(i * 260);
    }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     ⚠️⚠️ נוף קולי למשחקים
     ══════════════════════════════════════════════════════════

     דווח: "אין מספיק סאונדים, גם במשחקים".

     במשחקים היו 35 אפקטים — לא מעט — אבל כולם **תגובתיים**: הם
     נשמעו רק כשקרה משהו. בין אירוע לאירוע שררה דממה מוחלטת, ודממה
     היא מה שגורם למשחק להישמע כמו אב-טיפוס.

     ⚠️ מה שחסר אינו עוד אפקטים, אלא **רקע חי**: גלים שמתנפצים
     במרווחים לא סדירים, ומדי פעם שחף. הלא-סדירות היא העיקר —
     גל כל 7.0 שניות בדיוק נשמע כמו מכונה, גל כל 5 עד 11 שניות
     נשמע כמו חוף. */
  var sceneTimer = 0, gullTimer = 0;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function sceneStart(kind) {
    sceneStop();
    resume();
    var beach = kind !== 'sea';
    var plan = function () {
      var wait = (beach ? 5000 : 7000) + Math.random() * 6000;
      sceneTimer = setTimeout(function () {
        if (!muted) play(beach ? 'surf' : 'swim');
        plan();
      }, wait);
    };
    plan();
    if (beach) {
      var planGull = function () {
        gullTimer = setTimeout(function () {
          if (!muted && Math.random() < 0.55) play('gull');
          planGull();
        }, 18000 + Math.random() * 26000);
      };
      planGull();
    }
    ambientStart();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function sceneStop() {
    clearTimeout(sceneTimer); sceneTimer = 0;
    clearTimeout(gullTimer); gullTimer = 0;
    if (!ambOn) ambientStop();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function play(name) {
    resume();
    var f = SFX[name];
    if (f) { try { f(); } catch (e) { } }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️⚠️ **למה צליל פתיחה לא יכול פשוט "לנגן בטעינה".**
     כל הדפדפנים המודרניים פותחים AudioContext במצב suspended עד
     למגע ראשון של המשתמש. קריאה ל-play בזמן הטעינה פשוט לא
     תשמיע כלום — והמפתח יחשוב שהקוד עובד כי אין שגיאה.
     כאן: אם האודיו כבר משוחרר — מנגנים מיד. אם לא — הצליל
     נשמר וממתין, ומנוגן ברגע שהילד נוגע במסך בפעם הראשונה. */
  var pending = null;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function playSoon(name) {
    var c = ac();
    if (c && c.state === 'running') { play(name); return true; }
    pending = name;
    resume();
    setTimeout(function () {
      var c2 = ac();
      if (pending && c2 && c2.state === 'running') { var n = pending; pending = null; play(n); }
    }, 120);
    return false;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function flushPending() {
    if (!pending) return;
    var n = pending; pending = null;
    setTimeout(function () { play(n); }, 30);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function setMuted(v) {
    muted = !!v;
    try { global.localStorage.setItem(KEY, muted ? '1' : '0'); } catch (e) { }
    if (master) master.gain.value = muted ? 0 : 0.32;
    if (!muted && ambOn) { resume(); ambientStart(); }
    if (muted) ambientStop();
    return muted;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function toggle() { return setMuted(!muted); }
  function isMuted() { return muted; }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* שחרור אודיו בנגיעה הראשונה בכל מקום בדף */
  function arm() {
    var once = function () {
      resume();
      setTimeout(flushPending, 60);
      document.removeEventListener('pointerdown', once);
      document.removeEventListener('touchstart', once);
      document.removeEventListener('keydown', once);
    };
    document.addEventListener('pointerdown', once);
    document.addEventListener('touchstart', once);
    document.addEventListener('keydown', once);
  }
  if (typeof document !== 'undefined') arm();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  global.CBY_SND = {
    play: play, playSoon: playSoon, starSeq: starSeq,
    sceneStart: sceneStart, sceneStop: sceneStop,
    toggle: toggle, setMuted: setMuted, isMuted: isMuted,
    resume: resume, ambient: ambient, OWNER: 'דניאל אברהם חדאד', FINGERPRINT: FINGERPRINT
  };
})(window);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */
