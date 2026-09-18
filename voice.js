// ==================================================================
// © כל הזכויות שמורות | ALL RIGHTS RESERVED
// יוצר ובעלים בלעדי: דניאל אברהם חדאד | Creator & sole owner: Daniel Avraham Haddad
// אפליקציית "צאבי הצב — שומר צבי הים" וכל רכיביה הם קניינו הבלעדי.
// Unauthorized copying, distribution or attribution is prohibited and actionable by law.
// ==================================================================
// 🗣️ [CBY-VOICE] קול, האזנה וסנכרון שפתיים — שכבה אחת
//
// דווח: "תשפר את הסאונד והקול והאזנה וצאבי, הכל".
//
// ⚠️⚠️ **מה באמת היה חובבני בקול, ולמה זה לא היה עניין של "עוצמה".**
//
// שלושה דברים נפרדים נשמעו רע, וכל אחד מהם מסיבה אחרת:
//
//  1. **הפה זז באקראי ולא לפי המילים.** האנימציה הגרילה צורת פה
//     כל 70 מ"ש בלי שום קשר למה שנאמר. התוצאה: הקול נגמר והפה
//     ממשיך, או להפך. זה בדיוק מה שגורם לדמות להיראות כמו בובה
//     שמישהו מפעיל ולא כמו מישהו שמדבר.
//
//     ⚠️ הפתרון: `onboundary`. אירוע שהדפדפן יורה **בכל מילה**
//     שהוא מתחיל להגות, עם המיקום בטקסט. מכאן אפשר לדעת כמה
//     הברות יש במילה, לפתוח את הפה בהתאם, ולסגור אותו בין מילים.
//     הפה נעצר בדיוק כשהקול נעצר, כי אותו אירוע מניע את שניהם.
//
//  2. **הקול נבחר אקראית.** `getVoices()` מחזיר רשימה שמסודרת
//     לפי המערכת, ו-`lang='he-IL'` לבדו נותן לדפדפן לבחור — לפעמים
//     קול עברי טוב, לפעמים קול רובוטי, ולפעמים קול אנגלי שקורא
//     עברית כג'יבריש. כאן יש דירוג מפורש שמעדיף קול עברי מקומי,
//     ונופל אחורה בסדר הגיוני.
//
//     ⚠️ ובנוסף: הרשימה **ריקה** בטעינה הראשונה כמעט בכל דפדפן,
//     והיא מתמלאת מאוחר יותר דרך `onvoiceschanged`. בחירה חד־פעמית
//     בהתחלה נכשלת בשקט, ולכן הבחירה נעשית מחדש בכל אמירה.
//
//  3. **ההאזנה הייתה עיוורת.** לחצת על המיקרופון ולא קרה כלום עד
//     שסיימת לדבר: אין חיווי שהוא מקשיב, אין טקסט זמני, ואם לא
//     זוהה כלום — שקט מוחלט. ילד לוחץ שוב ושוב ומוותר.
//     כאן: כפתור פועם, תוצאות ביניים שנכתבות בשדה בזמן אמת,
//     הודעת שגיאה מפורשת לכל מקרה, וסגירה אוטומטית.
//
// 🔒 [CBY-PROOF] יוצר ובעלים בלעדי: דניאל אברהם חדאד / Daniel Avraham Haddad
// טביעת אצבע: CBY-T7R4L2E9
// ==================================================================

(function (global) {
  'use strict';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var FINGERPRINT = 'CBY-T7R4L2E9';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     1. הגדרות
     ══════════════════════════════════════════════════════════ */
  var KEY_VOICE = 'cby-voice-off';
  var KEY_NAME = 'cby-voice-name';
  var KEY_RATE = 'cby-voice-rate';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var enabled = true, rate = 1.0, preferredName = '';
  try {
    enabled = global.localStorage.getItem(KEY_VOICE) !== '1';
    preferredName = global.localStorage.getItem(KEY_NAME) || '';
    rate = parseFloat(global.localStorage.getItem(KEY_RATE) || '1') || 1;
  } catch (e) { }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var synth = global.speechSynthesis || null;
  var speaking = false;
  var onTalk = null;       // callback(on) — מי שמזיז את הפה
  var onWord = null;       // callback(openAmount) — פתיחת פה לכל מילה

  /* ══════════════════════════════════════════════════════════
     2. ניקוי טקסט להקראה
     ══════════════════════════════════════════════════════════
     ⚠️ אמוג'י אחד באמצע משפט הורס את כל המשפט: מנוע ההקראה
     מבטא אותו בשם האנגלי ("turtle", "sparkles") ושובר את הזרימה
     העברית. גם סוגריים, מרכאות ומקפים מייצרים הפסקות מוזרות. */
  function clean(text) {
    return String(text || '')
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️‍]/gu, ' ')
      .replace(/[«»"'`״׳]/g, ' ')
      .replace(/[–—]/g, ', ')
      .replace(/\s*\.\s*\.\s*\.\s*/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     3. בחירת הקול
     ══════════════════════════════════════════════════════════ */
  function allVoices() {
    if (!synth) return [];
    try { return synth.getVoices() || []; } catch (e) { return []; }
  }

  function hebrewVoices() {
    return allVoices().filter(function (v) {
      return v.lang && v.lang.toLowerCase().indexOf('he') === 0;
    });
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️ דירוג מפורש ולא "הראשון ברשימה". סדר העדיפויות נקבע ממה
     שנשמע טוב בפועל: קול עברי מקומי (localService) הוא כמעט תמיד
     הקול האיכותי שמותקן במערכת; קול עברי מרוחק הוא השני; ורק אם
     אין עברית בכלל — נופלים לברירת המחדל של המערכת, שלפחות לא
     תקרוס. */
  function pickVoice() {
    var he = hebrewVoices();
    if (!he.length) return null;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    if (preferredName) {
      for (var i = 0; i < he.length; i++) {
        if (he[i].name === preferredName) return he[i];
      }
    }
    var local = he.filter(function (v) { return v.localService; });
    if (local.length) return local[0];
    return he[0];
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function voiceList() {
    return hebrewVoices().map(function (v) {
      return { name: v.name, lang: v.lang, local: !!v.localService };
    });
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function setVoiceName(name) {
    preferredName = name || '';
    try { global.localStorage.setItem(KEY_NAME, preferredName); } catch (e) { }
  }

  function setRate(r) {
    rate = Math.max(0.6, Math.min(1.5, r || 1));
    try { global.localStorage.setItem(KEY_RATE, String(rate)); } catch (e) { }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     4. דיבור עם סנכרון שפתיים אמיתי
     ══════════════════════════════════════════════════════════ */

  /* כמה הברות במילה עברית — הערכה לפי אותיות תנועה ואורך.
     ⚠️ זו לא בלשנות מדויקת ולא צריכה להיות: המטרה היא שהפה ייפתח
     **יותר** במילה ארוכה ו**פחות** במילה קצרה, וזה מה שהעין קולטת. */
  function openFor(word) {
    var w = String(word || '');
    var len = w.replace(/[^א-תa-z]/gi, '').length;
    if (len <= 1) return 0.25;
    if (len <= 3) return 0.45;
    if (len <= 5) return 0.68;
    return 0.85;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     ⚠️⚠️ מנוע תנועת הפה — עצמאי מהקול
     ══════════════════════════════════════════════════════════

     דווח: "שהשפתיים שלו יזוזו שהוא מדבר... שישמעו אותו, לא היה".

     שתי התלונות הן בעצם באג אחד: **תנועת הפה הייתה תלויה לגמרי
     במנוע ההקראה של הדפדפן.** אם הוא לא דיבר — ולזה יש שלוש
     סיבות נפוצות ולגיטימיות — הפה פשוט לא זז בכלל:

       1. אין קול עברי מותקן במכשיר (נפוץ מאוד ב-Windows)
       2. getVoices() עדיין ריק בשנייה הראשונה אחרי הטעינה
       3. הדפדפן חוסם הקראה לפני מגע ראשון של המשתמש

     ⚠️ **התיקון: להפריד בין השניים.** הפה מונע מטיימר משלו שרץ על
     המילים בקצב קריאה — כלומר צאבי **תמיד** נראה מדבר. כשמנוע
     ההקראה כן עובד ויורה onboundary, האירועים האמיתיים משתלטים
     והטיימר נעצר, כי סנכרון אמיתי תמיד עדיף על הערכה.

     כך: קול + פה = מושלם. בלי קול = עדיין נראה שהוא מדבר.
     אף פעם לא דמות קפואה שממנה יוצא טקסט. */
  var driver = null;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function stopDriver() {
    if (driver) { clearInterval(driver.t); driver = null; }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function driveMouth(text, rateVal) {
    stopDriver();
    var words = String(text || '').split(/\s+/).filter(Boolean);
    if (!words.length) return;
    var i = 0;
    /* ⚠️ 170 מילים לדקה זה קצב דיבור טבעי בעברית. מהר מדי והפה
       מרפרף; לאט מדי והוא נראה כאילו הוא לועס. */
    var step = Math.max(110, 60000 / (170 * (rateVal || 1)));
    if (onTalk) onTalk(true);
    if (onWord) onWord(openFor(words[0]));
    i = 1;
    driver = {
      fromTTS: false,
      t: setInterval(function () {
        if (i >= words.length) { stopDriver(); if (onTalk) onTalk(false); return; }
        if (onWord) onWord(openFor(words[i]));
        i++;
      }, step)
    };
  }

  function stop() {
    stopDriver();
    if (!synth) { if (onTalk) onTalk(false); return; }
    try { synth.cancel(); } catch (e) { }
    speaking = false;
    if (onTalk) onTalk(false);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     ⚠️⚠️ שלוש המלכודות של speechSynthesis בכרום
     ══════════════════════════════════════════════════════════

     דווח פעמיים: "לא שומעים את צאבי כשנכנסים".

     אין כאן שגיאה אחת אלא שלוש התנהגויות של הדפדפן, וכל אחת
     מהן לבדה מספיקה כדי שהאמירה **תיבלע בשקט** — בלי חריגה,
     בלי הודעה בקונסול, בלי שום סימן שמשהו נכשל:

       1. **getVoices() ריק בשנייה הראשונה.** קריאה ל-speak לפני
          שהרשימה נטענה פשוט לא מפיקה קול. הרשימה מגיעה מאוחר
          יותר דרך onvoiceschanged — ואז כבר מאוחר.

       2. **cancel() מיד לפני speak() מבטל את שניהם.** זו תקלה
          ידועה בכרום: הפקודות נכנסות לאותה תור, והביטול מספיק
          מהיר כדי לתפוס גם את האמירה שאחריו.

       3. **המנוע מתחיל במצב paused.** בלי resume() אחרי speak,
          התור עומד — האמירה "בתור" לנצח.

     ⚠️ הפתרון אינו לנחש איזו מהן קרתה, אלא **למדוד**: אם onstart
     לא נורה תוך 700ms, האמירה לא יצאה לדרך — מנסים שוב, פעם
     אחת. ניסיון חוזר יחיד מכסה את כל שלושתן ואינו יכול ליצור
     דיבור כפול, כי onstart מבטל אותו. */
  /* ⚠️ ההמתנה קורית **פעם אחת בלבד**. בלי הדגל הזה, מכשיר שאין
     בו קולות בכלל היה משלם שנייה שלמה של המתנה לפני **כל** משפט
     — כלומר כל תשובה של צאבי הייתה מתחילה באיחור. */
  var voicesSettled = false;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function whenVoicesReady(cb) {
    if (!synth || voicesSettled) { cb(); return; }
    var tries = 0;
    (function poll() {
      var list = [];
      try { list = synth.getVoices() || []; } catch (e) { }
      if (list.length || tries >= 8) { voicesSettled = true; cb(); return; }
      tries++;
      setTimeout(poll, 120);
    })();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function speak(text, opts) {
    opts = opts || {};
    var t = clean(text);
    if (!t) { if (opts.done) opts.done(); return false; }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* ⚠️ הפה יוצא לדרך **לפני** ובלי קשר להצלחת ההקראה. */
    if (opts.mouth !== false) driveMouth(t, opts.rate || rate);

    if (!enabled || !synth) { if (opts.done) opts.done(); return false; }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    whenVoicesReady(function () { utter(t, opts, 0); });
    return true;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function utter(t, opts, attempt) {
    if (!enabled || !synth) { if (opts.done) opts.done(); return false; }
    try {
      /* ⚠️ בניסיון הראשון **אין** cancel — ראו מלכודת 2 למעלה.
         בניסיון החוזר כן, כי אז ייתכן שתקועה אמירה קודמת. */
      if (attempt > 0) { try { synth.cancel(); } catch (e2) { } }
      var u = new global.SpeechSynthesisUtterance(t);
      u.lang = 'he-IL';
      u.rate = opts.rate || rate;
      u.pitch = opts.pitch != null ? opts.pitch : 1.12;
      u.volume = opts.volume != null ? opts.volume : 1;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      var v = pickVoice();
      if (v) u.voice = v;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      var started = false;
      u.onstart = function () {
        started = true;
        speaking = true;
        /* ⚠️ הטיימר מתאפס לרגע ההתחלה האמיתי של הקול. בלי זה הוא
           מקדים אותו בכ-200ms — ההשהיה שלוקח למנוע להתחיל — והפה
           רץ לפני הצליל לכל אורך המשפט. */
        driveMouth(t, u.rate);
        if (onTalk) onTalk(true);
      };

      /* ⚠️⚠️ **הלב של התיקון.** `onboundary` נורה בכל מילה שמנוע
         ההקראה מתחיל להגות, עם `charIndex` — המיקום בטקסט. מכאן
         אפשר לגזור את המילה עצמה, ולפתוח את הפה בהתאם לאורכה.

         כך הפה נע **עם** הקול ולא במקביל אליו, ונעצר בדיוק ברגע
         שהקול נעצר — כי אותו מקור מניע את שניהם.

         ⚠️ לא כל דפדפן יורה את האירוע הזה (בעיקר בקולות מרוחקים).
         לכן `onTalk(true)` לבדו כבר מפעיל את הפה במצב ברירת המחדל,
         וה-boundary רק **משפר** אותו כשהוא קיים. נפילה חיננית. */
      u.onboundary = function (ev) {
        if (ev.name && ev.name !== 'word') return;
        /* ⚠️ מהרגע שיש אירוע אמיתי אחד — הטיימר מיותר ומזיק:
           שני מקורות שמניעים את אותו פה יוצרים ריצוד. */
        if (driver) { clearInterval(driver.t); driver = null; }
        if (!onWord) return;
        var idx = ev.charIndex || 0;
        var rest = t.slice(idx);
        var m = rest.match(/^\s*(\S+)/);
        onWord(openFor(m ? m[1] : ''));
      };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      u.onend = function () {
        speaking = false;
        stopDriver();
        if (onTalk) onTalk(false);
        if (opts.done) opts.done();
      };
      /* ⚠️ onerror **לא** עוצר את הפה: אם ההקראה נכשלה (אין קול
         עברי, אין רשת לקול מרוחק), הטיימר ממשיך לבדו והילד עדיין
         רואה את צאבי מדבר. זו כל הנקודה של ההפרדה. */
      u.onerror = function () {
        speaking = false;
        if (opts.done) opts.done();
      };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      synth.speak(u);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      /* מלכודת 3: התור עלול להתחיל מושהה */
      setTimeout(function () { try { synth.resume(); } catch (e3) { } }, 30);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      /* המדידה: לא התחיל תוך 700ms — מנסים שוב, פעם אחת בלבד */
      if (attempt === 0) {
        setTimeout(function () {
          if (!started && enabled) utter(t, opts, 1);
        }, 700);
      }
      return true;
    } catch (e) {
      if (opts.done) opts.done();
      return false;
    }
  }

  function setEnabled(on) {
    enabled = !!on;
    try { global.localStorage.setItem(KEY_VOICE, enabled ? '0' : '1'); } catch (e) { }
    if (!enabled) stop();
    return enabled;
  }
  function toggle() { return setEnabled(!enabled); }
  function isEnabled() { return enabled; }
  function isSpeaking() { return speaking; }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function bind(talkCb, wordCb) { onTalk = talkCb; onWord = wordCb; }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     5. האזנה — זיהוי דיבור בעברית
     ══════════════════════════════════════════════════════════ */

  var SR = global.SpeechRecognition || global.webkitSpeechRecognition;
  var rec = null, listening = false;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function canListen() { return !!SR; }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️ הודעות שגיאה מפורשות. "לא עבד" הוא התשובה הגרועה ביותר:
     המשתמש לא יודע אם להרשות מיקרופון, לדבר חזק יותר, או לוותר. */
  var ERRORS = {
    'no-speech': 'לא שמעתי כלום 🎤 נסו לדבר קצת יותר חזק.',
    'audio-capture': 'לא מצאתי מיקרופון במכשיר הזה.',
    'not-allowed': 'צריך לאשר גישה למיקרופון בהגדרות הדפדפן 🎤',
    'service-not-allowed': 'זיהוי הדיבור חסום בדפדפן הזה.',
    'network': 'זיהוי הדיבור צריך חיבור לאינטרנט.',
    'aborted': ''
  };

  function listen(cb) {
    if (!SR) { cb({ error: 'זיהוי דיבור לא נתמך בדפדפן הזה 🐢 אפשר להקליד.' }); return; }
    if (listening) { stopListen(); return; }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    try {
      rec = new SR();
      rec.lang = 'he-IL';
      /* ⚠️ תוצאות ביניים דלוקות. בלעדיהן המסך שקט עד סוף המשפט,
         והמשתמש לא יודע אם המכשיר בכלל שומע אותו. */
      rec.interimResults = true;
      rec.continuous = false;
      rec.maxAlternatives = 1;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      rec.onstart = function () {
        listening = true;
        cb({ state: 'start' });
      };
      rec.onresult = function (ev) {
        var interim = '', finalText = '';
        for (var i = ev.resultIndex; i < ev.results.length; i++) {
          var tr = ev.results[i][0].transcript;
          if (ev.results[i].isFinal) finalText += tr;
          else interim += tr;
        }
        if (finalText) cb({ final: finalText.trim() });
        else if (interim) cb({ interim: interim.trim() });
      };
      rec.onerror = function (ev) {
        listening = false;
        var msg = ERRORS[ev.error];
        cb({ error: msg == null ? 'לא הצלחתי לשמוע. נסו שוב 🎤' : msg });
      };
      rec.onend = function () {
        listening = false;
        cb({ state: 'end' });
      };
      rec.start();
    } catch (e) {
      listening = false;
      cb({ error: 'לא הצלחתי להפעיל את המיקרופון.' });
    }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function stopListen() {
    if (rec) { try { rec.stop(); } catch (e) { } }
    listening = false;
  }
  function isListening() { return listening; }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️ טעינת הקולות היא אסינכרונית כמעט בכל דפדפן. הקריאה הזו
     "מחממת" את הרשימה כך שהאמירה הראשונה כבר תמצא קול עברי. */
  if (synth) {
    try {
      synth.getVoices();
      if (typeof synth.onvoiceschanged !== 'undefined') {
        synth.onvoiceschanged = function () {
          synth.getVoices();
          voicesSettled = true;
          /* ⚠️ אם ברכת הפתיחה ממתינה רק בגלל שלא היה קול — עכשיו
             יש, אז אומרים אותה מיד ולא מחכים למגע. */
          if (pendingSpeech && hebrewVoices().length) {
            var txt = pendingSpeech; pendingSpeech = null;
            setTimeout(function () { speak(txt); }, 150);
          }
        };
      }
    } catch (e) { }
  }

  /* ══════════════════════════════════════════════════════════
     ⚠️⚠️ אמירה שמחכה לרגע שבה מותר לדבר
     ══════════════════════════════════════════════════════════

     דווח: "שנכנסים שיגיד שלום... לא היה".

     ברכת הפתיחה נאמרה בשנייה הראשונה אחרי הטעינה — כלומר בדיוק
     בשני הרגעים הגרועים ביותר:
       · הדפדפן עדיין חוסם הקראה כי לא היה מגע משתמש
       · getVoices() עדיין ריק, ולכן נבחר קול לא מתאים או כלום

     ⚠️ אין כאן "ניסיון שנכשל" שאפשר לתפוס — הדפדפן פשוט **בולע**
     את האמירה בשקט. לכן מדידה: אם אחרי 900ms מנוע ההקראה לא
     התחיל לדבר, מניחים שהוא נחסם, וממתינים למגע הראשון. */
  var pendingSpeech = null, pendingArmed = false;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function armGesture() {
    if (pendingArmed) return;
    pendingArmed = true;
    var once = function () {
      document.removeEventListener('pointerdown', once, true);
      document.removeEventListener('keydown', once, true);
      pendingArmed = false;
      if (pendingSpeech) {
        var txt = pendingSpeech; pendingSpeech = null;
        setTimeout(function () { speak(txt); }, 120);
      }
    };
    document.addEventListener('pointerdown', once, true);
    document.addEventListener('keydown', once, true);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function speakSoon(text) {
    var t = clean(text);
    if (!t) return false;
    speak(t);
    setTimeout(function () {
      var live = false;
      try { live = !!(synth && (synth.speaking || synth.pending)); } catch (e) { }
      if (!live && enabled) { pendingSpeech = t; armGesture(); }
    }, 900);
    return true;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* האם בכלל יש קול עברי במכשיר — משמש את מסך ההגדרות כדי לומר
     את האמת לילד במקום להשאיר אותו מנחש למה אין קול. */
  function hasHebrew() { return hebrewVoices().length > 0; }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  global.CBY_VOICE = {
    speak: speak, speakSoon: speakSoon, stop: stop, bind: bind, hasHebrew: hasHebrew,
    setEnabled: setEnabled, toggle: toggle, isEnabled: isEnabled, isSpeaking: isSpeaking,
    listen: listen, stopListen: stopListen, isListening: isListening, canListen: canListen,
    voiceList: voiceList, setVoiceName: setVoiceName, setRate: setRate,
    getRate: function () { return rate; },
    getVoiceName: function () { var v = pickVoice(); return v ? v.name : ''; },
    OWNER: 'דניאל אברהם חדאד', FINGERPRINT: FINGERPRINT
  };
})(window);
