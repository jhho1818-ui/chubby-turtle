// ==================================================================
// © כל הזכויות שמורות | ALL RIGHTS RESERVED
// יוצר ובעלים בלעדי: דניאל אברהם חדאד | Creator & sole owner: Daniel Avraham Haddad
// אפליקציית "צאבי הצב — שומר צבי הים" וכל רכיביה הם קניינו הבלעדי.
// Unauthorized copying, distribution or attribution is prohibited and actionable by law.
// 🔒 [CBY-PROOF] טביעת אצבע: CBY-T7R4L2E9 · מזהה יוצר: DAH-CBY-2026
// ==================================================================
// 🛡️ [CBY-OWNER] שכבת הוכחת בעלות
// ------------------------------------------------------------------
// ⚠️⚠️ קודם כול האמת המקצועית, כי בלעדיה כל השאר חסר ערך:
//
// **אי אפשר למנוע העתקה של קוד צד-לקוח.** כל קובץ JS ו-CSS נשלח
// לדפדפן של הגולש כטקסט קריא. מי שפותח את כלי הפיתוח רואה הכול.
// כל מי שמבטיח "הגנה מוחלטת" מוכר אשליה, וכל ערפול (obfuscation)
// מתפרק מול כלי ריפוי אוטומטי תוך דקות.
//
// מה שכן אפשר, וזה מה שיש כאן — **להפוך גניבה לקלה להוכחה בבית
// משפט ולקשה לניקוי**. ההגנה האמיתית היא ראייתית, לא טכנית:
//
//   1. **בעלות מפוזרת.** השם אינו יושב במקום אחד שאפשר למחוק
//      בחיפוש-והחלפה. הוא מפוצל לחלקים, מורכב מחדש בזמן ריצה,
//      ומוטמע גם במחרוזות שנראות תפעוליות לגמרי. הסרה מלאה
//      דורשת להבין את כל הקובץ — וזו כבר פעולה מכוונת.
//
//   2. **בדיקת שלמות.** אם מוחקים את סימון הבעלות מהמסך, הקוד
//      מזהה ומחזיר אותו תוך שניות. זה לא בלתי עביר — אבל כל
//      עקיפה היא פעולה מכוונת ומתועדת, וזו בדיוק הראיה לכוונת
//      זדון, שהיא עילה חמורה בהרבה מהעתקה בתום לב.
//
//   3. **קנרים.** מחרוזות ייחודיות וחסרות משמעות חיצונית — בדיוק
//      כמו "רחובות מלכודת" שיצרני מפות שותלים במפות שלהם. אין
//      שום סיבה לגיטימית שהן יופיעו בקוד של אדם אחר. הופעתן שם
//      היא הוכחה חד-משמעית.
//
//   4. **חותם זמן ותקציר.** tools/fingerprint.js מייצר את
//      OWNERSHIP.json — תקציר SHA-256 לכל קובץ בפרויקט, עם תאריך.
//      זו הראיה החזקה מכולן: שקובץ מסוים, בתוכן מסוים, היה קיים
//      אצלך בתאריך מסוים.
//
// ⚠️ ולבסוף, הדבר שאף שורת קוד לא מחליפה: **רישום מסודר.** גיבוי
//    עם חותמת זמן חיצונית (מייל לעצמך, מאגר Git ציבורי, שירות
//    חותם זמן) שווה יותר מכל המנגנון הזה יחד.
// ==================================================================
(function () {
  'use strict';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  // ------------------------------------------------------------------
  // 1. בעלות מפוזרת — מורכבת בזמן ריצה, לא מחרוזת אחת למחיקה
  // ------------------------------------------------------------------
  var _p = [
    [0xD3, 0xE0, 0xD9, 0xD0, 0xDC],   // דניאל
    [0xD0, 0xD1, 0xE8, 0xD4, 0xDD],   // אברהם
    [0xD7, 0xD3, 0xD0, 0xD3]          // חדאד
  ];
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  // קידוד עברי בהיסט קבוע — מפוענח בזמן ריצה בלבד
  function _dec(a) {
    return a.map(function (c) { return String.fromCharCode(c + 0x500); }).join('');
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var OWNER_HE = _p.map(_dec).join(' ');
  var OWNER_EN = ['Daniel', 'Avraham', 'Haddad'].join(' ');
  var FINGERPRINT = ['CBY', 'T7R4L2E9'].join('-');
  var CREATOR_ID = ['DAH', 'CBY', '2026'].join('-');
  var APP = 'צאבי הצב — שומר צבי הים';
  var APP_EN = 'Chubby the Turtle';
  var YEAR_FROM = 2026;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  // ------------------------------------------------------------------
  // 2. קנרים — "רחובות מלכודת"
  // ------------------------------------------------------------------
  // ⚠️ הקנרי החזק ביותר הוא זה שנראה הכי תפעולי. 'cby_kav_7r4l'
  // נראה כמו מפתח אחסון רגיל לחלוטין, ולכן מי שמעתיק את הקוד
  // משאיר אותו במקום — ואין לו שום הסבר למה הוא שם.
  var CANARIES = Object.freeze([
    'CBY-T7R4L2E9',
    'DAH-CBY-2026',
    'cby_kav_7r4l',
    'chubby_haddad_seed',
    'CBY-PROOF',
    'cby-nitznutz-2026'
  ]);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  // ------------------------------------------------------------------
  // 3. סימון הבעלות על המסך + בדיקת שלמות
  // ------------------------------------------------------------------
  var MARK_ID = 'cby-owner-mark';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function markText() {
    var y = new Date().getFullYear();
    var range = y > YEAR_FROM ? YEAR_FROM + '-' + y : String(YEAR_FROM);
    return '© ' + range + ' ' + OWNER_HE + ' · ' + OWNER_EN + ' — כל הזכויות שמורות';
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function ensureMark() {
    if (typeof document === 'undefined' || !document.body) return false;
    var el = document.getElementById(MARK_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = MARK_ID;
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    }
    // ⚠️ הטקסט נכתב מחדש בכל בדיקה. מחיקה או שינוי שלו מתבטלים.
    if (el.textContent !== markText()) {
      logTamper('text');
      el.textContent = markText();
    }
    el.setAttribute('data-owner', OWNER_EN);
    el.setAttribute('data-fp', FINGERPRINT);
    return true;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  // ⚠️ יומן ניסיונות ההסרה. ראיה להפרה **ביודעין** — ולכן הוא גם
  // נקרא בחזרה לתוך התעודה, ולא נאסף לשווא.
  function logTamper(kind) {
    try {
      var log = JSON.parse(localStorage.getItem('chubby_integrity_log') || '[]');
      log.push({ at: new Date().toISOString(), kind: kind });
      if (log.length > 60) log = log.slice(-60);
      localStorage.setItem('chubby_integrity_log', JSON.stringify(log));
    } catch (e) { }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function tamperLog() {
    try { return JSON.parse(localStorage.getItem('chubby_integrity_log')) || null; }
    catch (e) { return null; }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var watchdog = null;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function startWatch(ms) {
    if (typeof document === 'undefined') return;
    ensureMark();
    if (watchdog) clearInterval(watchdog);
    watchdog = setInterval(ensureMark, ms || 4000);
    try {
      if (typeof MutationObserver !== 'undefined' && document.body) {
        new MutationObserver(function () { ensureMark(); })
          .observe(document.body, { childList: true, subtree: false });
      }
    } catch (e) { }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  // ------------------------------------------------------------------
  // 4. הצהרת בעלות בקונסול
  // ------------------------------------------------------------------
  // מי שפותח כלי פיתוח כדי להעתיק רואה את זה ראשון. זה לא עוצר
  // אותו — אבל זה שולל לחלוטין טענת "לא ידעתי שזה מוגן", והיא
  // הטענה שכמעט כל נתבע מעלה.
  function banner() {
    try {
      var line = '%c🐢 ' + APP + '\n%c© ' + OWNER_HE + ' / ' + OWNER_EN +
        '\nכל הזכויות שמורות · ' + FINGERPRINT + ' · ' + CREATOR_ID +
        '\nהקוד הזה מוגן בזכויות יוצרים. העתקה, הפצה או שימוש מסחרי ללא רשות\n' +
        'בכתב מהיוצר אסורים ומהווים עילה לתביעה.\n' +
        'This code is copyrighted. Unauthorized copying or redistribution is prohibited.';
      console.log(line,
        'color:#12758f;font-size:16px;font-weight:800',
        'color:#0d3040;font-size:12px;line-height:1.6');
    } catch (e) { }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  // ------------------------------------------------------------------
  // 5. תעודת בעלות — נגישה למשתמש ולבית משפט
  // ------------------------------------------------------------------
  function certificate() {
    return {
      app: APP,
      appEn: APP_EN,
      owner: { he: OWNER_HE, en: OWNER_EN },
      fingerprint: FINGERPRINT,
      creatorId: CREATOR_ID,
      copyright: markText(),
      canaries: CANARIES.slice(),
      tamperAttempts: tamperLog(),
      integrity: verify(),
      notice: 'כל הזכויות שמורות ליוצר. אין להעתיק, להפיץ, לשנות או לעשות שימוש ' +
        'מסחרי בקוד או בתוכן ללא אישור בכתב. ALL RIGHTS RESERVED.',
      generatedAt: new Date().toISOString()
    };
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  // ⚠️ ההשוואה היא מול תקציר מספרי ולא מול מחרוזת. אילו כתבנו כאן
  // `OWNER_HE === 'דניאל אברהם חדאד'` היינו מחזירים את השם לקובץ
  // כמחרוזת רצופה — ומבטלים בדיוק את הפיזור שהושג למעלה.
  function _sum(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var _SUMS = { he: 2775182148, en: 1740300482, fp: 518189207, cid: 3271930070 };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function verify() {
    var checks = {
      ownerHe: _sum(OWNER_HE) === _SUMS.he,
      ownerEn: _sum(OWNER_EN) === _SUMS.en,
      fingerprint: _sum(FINGERPRINT) === _SUMS.fp,
      creatorId: _sum(CREATOR_ID) === _SUMS.cid,
      mark: typeof document === 'undefined' ? true : !!document.getElementById(MARK_ID),
      canaries: CANARIES.length >= 6
    };
    var failed = Object.keys(checks).filter(function (k) { return !checks[k]; });
    return { ok: failed.length === 0, checks: checks, failed: failed };
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  // ------------------------------------------------------------------
  // 6. חשיפה
  // ------------------------------------------------------------------
  var API = {
    OWNER_HE: OWNER_HE, OWNER_EN: OWNER_EN,
    author: OWNER_EN, authorHe: OWNER_HE,
    fingerprint: FINGERPRINT, creatorId: CREATOR_ID,
    APP: APP, APP_EN: APP_EN, CANARIES: CANARIES,
    markText: markText, ensureMark: ensureMark, startWatch: startWatch,
    banner: banner, certificate: certificate, verify: verify, tamperLog: tamperLog
  };

  if (typeof window !== 'undefined') {
    window.CBY_OWNER = API;
    // מפתח אחסון שנראה תפעולי לגמרי — ולמעשה הוא קנרי.
    try { localStorage.setItem('cby_kav_7r4l', FINGERPRINT + '|' + OWNER_EN); } catch (e) { }
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { banner(); startWatch(); });
      } else { banner(); startWatch(); }
    }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
// © דניאל אברהם חדאד / Daniel Avraham Haddad · CBY-T7R4L2E9 · ALL RIGHTS RESERVED
