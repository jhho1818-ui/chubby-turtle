/* ==================================================================
   © כל הזכויות שמורות | ALL RIGHTS RESERVED
   יוצר ובעלים בלעדי: דניאל אברהם חדאד | Creator & sole owner: Daniel Avraham Haddad
   אין להעתיק, להפיץ, לשנות או לייחס יצירה זו לאדם אחר.
   Unauthorized copying, distribution or attribution is prohibited and actionable.
   🔒 [CBY-PROOF] CBY-T7R4L2E9 · DAH-BZY-2026
   ==================================================================
   🧠 צאבי מבין יותר ממשפט אחד  [CBY-SMART]
   ------------------------------------------------------------------
   דווח: "שאני מתקשר איתו ואומר לו אני בסדר ושואל ישר מה מזג
   האוויר, הוא לא יודע לענות לי במקביל על שתיהם — הוא מתבלבל
   ואומר לי בסדר מצוין ומתעלם מהמילה מזג אוויר".

   ⚠️ למה זה קרה, וזה לא באג נקודתי אלא מבנה: askBazzi בנוי
   כשרשרת של שערים, וכל שער **יוצא מיד** ברגע שהוא מזהה משהו:

       מודעות → מזג אוויר → פקודות קול → מאגר הידע
          ↑
       "אני בסדר" נתפס כאן, ו-return. השאר לא נבדק בכלל.

   כלומר צאבי לא "התבלבל" — הוא מעולם לא הגיע למילים "מזג
   האוויר". כל משפט קיבל בדיוק תשובה אחת, מהשער הראשון שהתאים.

   הפתרון הוא לא לשכתב את השרשרת — זו הדרך הבטוחה ביותר לשבור
   את כל מה שכבר עובד. במקום זה מפצלים את המשפט **לפני** שהוא
   נכנס לשרשרת, ומעבירים כל חלק בנפרד. השרשרת נשארת בדיוק כפי
   שהיא, ופשוט רצה פעמיים.

   ⚠️ הכלל המנחה בפיצול: **עדיף לפספס פיצול מאשר לפצל בטעות.**
   משפט שלא פוצל מתנהג כמו קודם — לא נורא. משפט שפוצל שלא לצורך
   ("אני לא יודע מה לעשות" → "אני לא יודע" + "מה לעשות") נותן
   שתי תשובות מטופשות, וזה גרוע מהבעיה המקורית.
   ================================================================== */
(function () {
  'use strict';

  var OWNER = 'דניאל אברהם חדאד';
  var OWNER_EN = 'Daniel Avraham Haddad';
  var FINGERPRINT = 'CBY-T7R4L2E9';

  // ==================================================================
  // 1. פיצול משפט לכמה בקשות
  // ==================================================================

  // מילות שאלה שפותחות בקשה חדשה
  var ASK_WORDS = ['מה', 'מהו', 'מהי', 'איך', 'מתי', 'איפה', 'למה', 'כמה', 'מי',
                   'איזה', 'איזו', 'האם', 'תגיד', 'תספר', 'ספר', 'תסביר', 'הסבר',
                   'תראה', 'ומה', 'תפתח', 'פתח'];

  // ⚠️ הרשימה הזו היא הבלם. אחרי הפעלים האלה מילת שאלה היא חלק
  // מהמשפט ולא בקשה חדשה: "אני לא **יודע** מה לעשות",
  // "תגיד לי מה **שאתה** חושב". פיצול שם הורס משפט תקין.
  var NO_SPLIT_AFTER = ['יודע', 'יודעת', 'רוצה', 'רוצים', 'חושב', 'חושבת', 'אומר',
                        'אומרת', 'שואל', 'שואלת', 'מבין', 'מבינה', 'זוכר', 'זוכרת',
                        'ראיתי', 'שמעתי', 'למדתי', 'בטוח', 'בטוחה', 'הבנתי', 'תלוי',
                        'לדעת', 'להבין', 'לזכור', 'שכחתי', 'אכפת', 'משנה'];

  // ⚠️ פתיחות שאינן בקשה בפני עצמן. "תגיד לי מה זה עוקץ" התפצל
  // ל"תגיד לי" + "מה זה עוקץ", וצאבי היה עונה משהו על "תגיד לי"
  // לפני שהוא עונה על השאלה האמיתית. זו בדיוק הפטפטת המיותרת
  // שהפיצול אמור למנוע, לא ליצור.
  var LEAD_INS = ['תגיד לי', 'תגיד', 'ספר לי', 'תספר לי', 'תסביר לי', 'תראה לי',
                  'אמור לי', 'שאלה', 'שאלה קטנה', 'תשמע', 'תקשיב', 'רגע'];

  var MAX_PARTS = 3;
  var MIN_WORDS = 2;

  function words(s) {
    return String(s || '').trim().split(/\s+/).filter(Boolean);
  }

  /* האם המילה היא מילת שאלה (עם או בלי ו' החיבור) */
  function isAskWord(w) {
    var t = String(w || '').replace(/[?!.,;:]/g, '');
    if (ASK_WORDS.indexOf(t) >= 0) return true;
    if (t.charAt(0) === 'ו' && ASK_WORDS.indexOf(t.slice(1)) >= 0) return true;
    return false;
  }

  function isBlocked(w) {
    var t = String(w || '').replace(/[?!.,;:]/g, '');
    if (NO_SPLIT_AFTER.indexOf(t) >= 0) return true;
    // צורות עם ש' / ל' מוקדמות: "שיודע", "ליודע"
    if (t.length > 1 && NO_SPLIT_AFTER.indexOf(t.slice(1)) >= 0) return true;
    return false;
  }

  /* מפצל משפט לרשימת בקשות. מחזיר [text] אם אין מה לפצל. */
  function splitIntents(text) {
    var raw = String(text == null ? '' : text).trim();
    if (!raw) return [];
    // משפט קצר הוא בקשה אחת, נקודה. אין מה לחפש בו.
    if (words(raw).length < MIN_WORDS * 2) return [raw];

    // שלב א: פיצול על סימני פיסוק חזקים
    var chunks = raw.split(/\s*[?!]+\s*|\s*[,;]\s*|\s+\.\s+/).map(function (s) {
      return s.trim();
    }).filter(Boolean);

    // שלב ב: בתוך כל חלק, פיצול לפני מילת שאלה
    var out = [];
    chunks.forEach(function (chunk) {
      var w = words(chunk);
      // ⚠️ **כל** נקודות החיתוך ולא רק הראשונה. "מה שלומך ומה
      // השעה" מכיל שתי בקשות, ועצירה אחרי החיתוך הראשון הייתה
      // משאירה אותן דבוקות — כלומר חוזרת בדיוק לבעיה המקורית,
      // רק צעד אחד מאוחר יותר.
      var cuts = [];
      // מתחילים מ-MIN_WORDS: מילת שאלה בתחילת המשפט היא הפתיחה
      // שלו ולא בקשה שנייה.
      for (var i = MIN_WORDS; i < w.length; i++) {
        if (!isAskWord(w[i])) continue;
        if (isBlocked(w[i - 1])) continue;          // ⚠️ הבלם
        if (w.length - i < MIN_WORDS) continue;     // הזנב קצר מדי
        var since = cuts.length ? i - cuts[cuts.length - 1] : i;
        if (since < MIN_WORDS) continue;            // שני חיתוכים צמודים
        cuts.push(i);
      }
      if (cuts.length) {
        var from = 0;
        cuts.concat([w.length]).forEach(function (at) {
          if (at > from) out.push(w.slice(from, at).join(' '));
          from = at;
        });
      } else {
        out.push(chunk);
      }
    });

    // שלב ג: מיזוג פתיחות ושברים
    var clean = [];
    for (var k = 0; k < out.length; k++) {
      var part = out[k].trim();
      var bare = part.replace(/[?!.,;:]/g, '').trim();
      // ⚠️ פתיחה מתמזגת **קדימה** אל הבקשה שהיא מקדימה, ולא
      // אחורה: "תגיד לי" שייך ל"מה זה עוקץ" שאחריו.
      if (LEAD_INS.indexOf(bare) >= 0 && k + 1 < out.length) {
        out[k + 1] = part + ' ' + out[k + 1];
        continue;
      }
      if (words(part).length < MIN_WORDS && clean.length) {
        clean[clean.length - 1] += ' ' + part;
      } else if (words(part).length >= 1) {
        clean.push(part);
      }
    }

    if (clean.length <= 1) return [raw];
    // ⚠️ תקרה. משפט שהתפצל לחמישה חלקים כמעט תמיד פוצל בטעות,
    // וחמש תשובות ברצף הן הצפה ולא אינטליגנציה.
    if (clean.length > MAX_PARTS) return [raw];
    return clean;
  }

  // ==================================================================
  // 2. גיוון — שלא תחזור אותה תשובה
  // ==================================================================
  // דווח: "הוא עונה אותה תשובה כל הזמן".
  //
  // ⚠️ Math.random לבדו לא פותר את זה: בהגרלה מתוך ארבע אפשרויות
  // יש 25% שהתשובה הבאה תהיה זהה לקודמת, וזה בדיוק מה שמורגש
  // כ"אותה תשובה". לכן שומרים זיכרון קצר ומוציאים ממנו.
  var recent = {};
  var MEMORY = 3;

  function pickVaried(list, key, rnd) {
    if (!list || !list.length) return '';
    if (list.length === 1) return list[0];
    key = key || 'default';
    var used = recent[key] || (recent[key] = []);
    var pool = list.filter(function (x) { return used.indexOf(x) < 0; });
    // אם כולן נוצלו — מתחילים סבב חדש, אבל בלי לחזור על האחרונה
    if (!pool.length) {
      var last = used[used.length - 1];
      pool = list.filter(function (x) { return x !== last; });
      used.length = 0;
    }
    var r = typeof rnd === 'function' ? rnd() : Math.random();
    var pick = pool[Math.floor(r * pool.length) % pool.length];
    used.push(pick);
    while (used.length > Math.min(MEMORY, list.length - 1)) used.shift();
    return pick;
  }

  function resetVariety(key) {
    if (key) delete recent[key]; else recent = {};
  }

  // ==================================================================
  // 3. יום ותאריך בעברית
  // ==================================================================
  var DAYS = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי',
              'יום חמישי', 'יום שישי', 'שבת'];
  var MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

  /* "יום שישי, 14 באוגוסט 2026" */
  function dateLine(d) {
    var dt = (d instanceof Date) ? d : new Date(d == null ? Date.now() : d);
    if (isNaN(dt.getTime())) return '';
    return DAYS[dt.getDay()] + ', ' + dt.getDate() + ' ב' + MONTHS[dt.getMonth()] + ' ' + dt.getFullYear();
  }

  /* "בבוקר" / "בצהריים" ... — נשען על המודול שכבר קיים, כדי
     שלא יהיו שתי הגדרות של אותו דבר שיתפצלו בעדכון הראשון. */
  function partOfDay(d) {
    var dt = (d instanceof Date) ? d : new Date(d == null ? Date.now() : d);
    try {
      if (typeof window !== 'undefined' && window.BZY_NUM_HE) {
        return window.BZY_NUM_HE.dayPart(dt.getHours());
      }
    } catch (e) {}
    var h = dt.getHours();
    if (h >= 5 && h <= 10) return 'בבוקר';
    if (h >= 11 && h <= 14) return 'בצהריים';
    if (h >= 15 && h <= 17) return 'אחר הצהריים';
    if (h >= 18 && h <= 21) return 'בערב';
    return 'בלילה';
  }

  /* "היום יום שישי, 14 באוגוסט 2026, והשעה 15:40 אחר הצהריים" */
  function nowLine(d) {
    var dt = (d instanceof Date) ? d : new Date(d == null ? Date.now() : d);
    if (isNaN(dt.getTime())) return '';
    var hh = String(dt.getHours()).padStart(2, '0');
    var mm = String(dt.getMinutes()).padStart(2, '0');
    return 'היום ' + dateLine(dt) + ', והשעה ' + hh + ':' + mm + ' ' + partOfDay(dt);
  }

  var API = {
    splitIntents: splitIntents, isAskWord: isAskWord, isBlocked: isBlocked,
    pickVaried: pickVaried, resetVariety: resetVariety,
    dateLine: dateLine, nowLine: nowLine, partOfDay: partOfDay,
    ASK_WORDS: ASK_WORDS, NO_SPLIT_AFTER: NO_SPLIT_AFTER,
    MAX_PARTS: MAX_PARTS, DAYS: DAYS, MONTHS: MONTHS,
    owner: OWNER, ownerEn: OWNER_EN, fingerprint: FINGERPRINT
  };

  if (typeof window !== 'undefined') window.CBY_SMART = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
