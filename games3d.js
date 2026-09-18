// ==================================================================
// © כל הזכויות שמורות | ALL RIGHTS RESERVED
// יוצר ובעלים בלעדי: דניאל אברהם חדאד | Creator & sole owner: Daniel Avraham Haddad
// אפליקציית "צאבי הצב — שומר צבי הים" וכל רכיביה הם קניינו הבלעדי.
// Unauthorized copying, distribution or attribution is prohibited and actionable by law.
// ==================================================================
// 🎮 [CBY-G3D] משחקי ההצלה — תלת-ממד, שלבים, דמויות אדם וקריינות
//
// ⚠️⚠️ **גרסה 2 — נכתבה מחדש מול משוב שנמדד מהמסך, לא מהערכה.**
//
// המשתמש שיחק וכתב בדיוק מה לא עבד. כל סעיף כאן הוא תיקון של
// דבר ששבר את המשחק בפועל:
//
//  1. **"הוא הולך הפוך".** נכון, וזה היה באג ולא סגנון: `miniTurtle`
//     נבנה עם הראש ב‑+Z, ומשחק הריצה מתקדם אל ‑Z. כלומר האבקוע
//     רץ אל הים **עם הגב קדימה**. הדמות נבנית עכשיו עם הראש
//     ב‑−Z, שזה כיוון "פנימה למסך" המקובל, וכל משחק מסובב אותה
//     לכיוון התנועה האמיתי שלה.
//
//  2. **"לא מבין איך מנקים את הים".** המשחק לא הסביר את עצמו:
//     איסוף קרה בשקט כשנגעת, ולא היה שום סימן מה לאסוף וממה
//     להתרחק. נוספו טבעת איסוף גלויה סביב צאבי, סמן על הפריט
//     הקרוב, הפריט **נשאב** אל הצב, ושורת הנחיה קבועה על המסך.
//
//  3. **"איזו גדר זאת".** הגדר הייתה טבעת דקה. עכשיו זו גדר
//     אמיתית — עמודים, רשת ושלט — בדיוק כמו שמגדרים קן בחוף,
//     עם מונה שניות שנשאר גלוי.
//
//  4. **"שהשחקן יהיה אדם שמחפש".** צודק: את הקינים מוצא מתנדב,
//     לא צב. נוסף מודל אדם מלא — כובע, אפוד, תרמיל ואת חפירה —
//     שהולך על החול, וכשהוא מוצא נחשף בור עם ביצים.
//
//  5. **"מהים אל החוף".** העקבות מתחילות בקו המים ועולות אל
//     הקן, כי זה הכיוון שבו הנקבה עולה בלילה.
//
//  6. **"שיהיה מקצועי, סאונדים, שישמעו את צאבי".** נוספה קריינות
//     בעברית (Web Speech) לחידון, לשלבים ולהצלחות, ועוד צלילים.
//
// 🔒 [CBY-PROOF] יוצר ובעלים בלעדי: דניאל אברהם חדאד / Daniel Avraham Haddad
// טביעת אצבע: CBY-T7R4L2E9 · כל העתקה ללא רשות אסורה ומקימה עילה לתביעה.
// ==================================================================

(function (global) {
  'use strict';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var OWNER = 'דניאל אברהם חדאד';
  var FINGERPRINT = 'CBY-T7R4L2E9';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var TH = null;
  function T() { return global.THREE; }
  function snd(n) { if (global.CBY_SND) global.CBY_SND.play(n); }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️⚠️ **בידוד דו-כיווני למספרים — באג עברית אמיתי שנמדד.**

     בתוך פסקה בעברית (RTL), המחרוזת "0/8" מוצגת על ידי הדפדפן
     כ-"8/0". זה לא באג של הדפדפן אלא האלגוריתם הדו-כיווני של
     יוניקוד: הספרות הן תווים ניטרליים-חלש, והלוכסן שביניהן יורש
     את כיוון ההקשר. התוצאה: ילד קרא "8 מתוך 0" וחשב שהוא כבר
     סיים, או שנתקע.

     התיקון הוא לעטוף כל ביטוי מספרי בתווי בידוד: U+2066 (LRI)
     בהתחלה ו-U+2069 (PDI) בסוף. הם אינם נראים, אינם תופסים
     רוחב, ומכריחים את הקטע להיקרא משמאל לימין בתוך טקסט ימני. */
  var LRI = '⁦', PDI = '⁩';
  function ltr(s) { return LRI + s + PDI; }
  function frac(a, b) { return LRI + a + '/' + b + PDI; }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     1. הגדרות המשחקים והשלבים
     ══════════════════════════════════════════════════════════ */

  var GAMES = {

    hatch: {
      title: 'מסע אל הים',
      icon: '🌊',
      lead: 'אבקוע בקע הלילה ומטפס החוצה מהקן. עכשיו הוא צריך להגיע לים — ואתם מובילים אותו.',
      how: 'גררו את האצבע ימינה ושמאלה (או חצים). אספו אחים 🐣 וטיפות 💧, עקפו מכשולים, והתרחקו מאורות.',
      world: 'night-beach',
      fact: 'אבקוע מתמצא לפי הכיוון הבהיר ביותר באופק. תאורה בחוף חזקה מאור הים — ולכן הוא זוחל לכביש במקום למים.',
      learn: 'זיהום אור: כל אור כבוי בחוף בלילה מציל אבקועים.',
      say: 'האבקוע יוצא מהקן. הובילו אותו אל הים!',
      levels: [
        { name: 'לילה ראשון', dist: 210, speed: 10, obst: 0.50, lamps: 0, sibs: 7, time: 60 },
        { name: 'הגלים קרובים', dist: 260, speed: 11, obst: 0.70, lamps: 1, sibs: 9, time: 62 },
        { name: 'טיילת מוארת', dist: 320, speed: 12, obst: 0.90, lamps: 2, sibs: 11, time: 66 },
        { name: 'ערב סוער', dist: 380, speed: 13, obst: 1.10, lamps: 2, sibs: 12, time: 70 },
        { name: 'חוף עמוס', dist: 450, speed: 14, obst: 1.35, lamps: 3, sibs: 14, time: 76 },
        { name: 'אורות הכביש', dist: 520, speed: 15, obst: 1.60, lamps: 4, sibs: 15, time: 82 },
        { name: 'מרוץ נגד השחר', dist: 600, speed: 16.5, obst: 1.85, lamps: 4, sibs: 17, time: 88 },
        { name: 'הלילה הארוך', dist: 690, speed: 18, obst: 2.10, lamps: 5, sibs: 19, time: 96 }
      ]
    },

    clean: {
      title: 'נקו את הים',
      icon: '🛍️',
      lead: 'שקית ניילון במים נראית בדיוק כמו מדוזה. אספו את הפלסטיק — ואל תיגעו במדוזות האמיתיות.',
      how: 'גררו את האצבע וצאבי שוחה. כל פריט פלסטיק שנכנס לטבעת הכחולה נאסף אליו. ורוד = מדוזה = להתרחק!',
      world: 'reef',
      fact: 'לצב ים אין דרך להבחין בין שקית למדוזה. בליעה של פיסת פלסטיק אחת כבר מעלה את הסיכון לחייו.',
      learn: 'פלסטיק בים: מה שנראה כמו אוכל — הורג.',
      say: 'אספו את הפלסטיק, והתרחקו מהמדוזות הוורודות.',
      levels: [
        { name: 'מים רדודים', quota: 8, time: 55, trash: 6, jelly: 2, drift: 1.0 },
        { name: 'אחרי הסערה', quota: 11, time: 58, trash: 7, jelly: 3, drift: 1.1 },
        { name: 'ליד המזח', quota: 14, time: 62, trash: 8, jelly: 4, drift: 1.2 },
        { name: 'זרם צפוני', quota: 17, time: 66, trash: 8, jelly: 5, drift: 1.35 },
        { name: 'שונית עמוסה', quota: 20, time: 70, trash: 9, jelly: 6, drift: 1.5 },
        { name: 'נחיל מדוזות', quota: 24, time: 74, trash: 9, jelly: 8, drift: 1.65 },
        { name: 'מפרץ הפלסטיק', quota: 28, time: 80, trash: 10, jelly: 9, drift: 1.8 },
        { name: 'ניקיון גדול', quota: 33, time: 88, trash: 11, jelly: 11, drift: 2.0 }
      ]
    },

    release: {
      title: 'שחרור לים',
      icon: '🏥',
      lead: 'צב שסיים שיקום במרכז ההצלה חוזר הביתה. עברו דרך שערי השחרור והתחמקו מרשתות רפאים.',
      how: 'גררו כדי לשחות. כל שער ירוק = נקודות. פגיעה ברשת עולה לב 💙.',
      world: 'open-sea',
      fact: 'כ‑70 אחוז מהצבים שמגיעים למרכז הארצי להצלת צבי ים במכמורת חוזרים לים אחרי שיקום.',
      learn: 'רשת רפאים היא רשת דיג נטושה שממשיכה ללכוד שנים אחרי שאבדה.',
      say: 'עברו דרך השערים הירוקים והיזהרו מהרשתות.',
      levels: [
        { name: 'צעדים ראשונים', gates: 8, speed: 12, nets: 2, gap: 2.8, moving: 0, time: 70 },
        { name: 'מעבר המזח', gates: 10, speed: 13, nets: 3, gap: 2.7, moving: 0, time: 74 },
        { name: 'נתיב הסירות', gates: 12, speed: 14, nets: 4, gap: 2.6, moving: 1, time: 78 },
        { name: 'רשתות רפאים', gates: 14, speed: 15, nets: 6, gap: 2.5, moving: 1, time: 82 },
        { name: 'זרם פתוח', gates: 16, speed: 16, nets: 7, gap: 2.4, moving: 2, time: 86 },
        { name: 'מעבר צר', gates: 18, speed: 17, nets: 8, gap: 2.2, moving: 2, time: 92 },
        { name: 'לב הים', gates: 21, speed: 18, nets: 10, gap: 2.1, moving: 3, time: 98 },
        { name: 'הביתה', gates: 24, speed: 19.5, nets: 12, gap: 2.0, moving: 4, time: 106 }
      ]
    },

    fox: {
      title: 'שמרו על הקן',
      icon: '🦊',
      lead: 'שועלים וכלבים מריחים את הקן מרחוק. הבריחו אותם עד עלות השחר.',
      how: 'לחצו על כל טורף שמתקרב — הוא יברח, וזה בלי הגבלה. «הציבו גדר» מגנה על הקן לכמה שניות, והיא נטענת מחדש כל 14 שניות.',
      world: 'night-beach',
      fact: 'בישראל טורפים הם אחת הסיבות המרכזיות לאובדן קינים — ולכן כל קן שמאותר מגודר באותו יום.',
      learn: 'גידור קן הוא הפעולה הפשוטה שמצילה הכי הרבה ביצים.',
      say: 'לחצו על השועלים כדי להבריח אותם. שמרו על הביצים!',
      levels: [
        { name: 'לילה שקט', secs: 40, rate: 2.6, speed: 1.05, dogs: 0, fences: 2, eggs: 8 },
        { name: 'ריח בחול', secs: 45, rate: 2.3, speed: 1.15, dogs: 0, fences: 2, eggs: 8 },
        { name: 'שני שועלים', secs: 50, rate: 2.0, speed: 1.25, dogs: 1, fences: 2, eggs: 8 },
        { name: 'כלב משוטט', secs: 56, rate: 1.8, speed: 1.35, dogs: 2, fences: 3, eggs: 8 },
        { name: 'ליל ירח', secs: 62, rate: 1.6, speed: 1.45, dogs: 2, fences: 3, eggs: 8 },
        { name: 'משפחת שועלים', secs: 68, rate: 1.4, speed: 1.58, dogs: 3, fences: 3, eggs: 8 },
        { name: 'לפני השחר', secs: 76, rate: 1.22, speed: 1.7, dogs: 4, fences: 4, eggs: 8 },
        { name: 'הלילה הארוך', secs: 86, rate: 1.05, speed: 1.85, dogs: 5, fences: 4, eggs: 8 }
      ]
    },

    eggs: {
      title: 'סריקת חופים',
      icon: '🥚',
      lead: 'אתם מתנדבי רשות הטבע והגנים. נקבה עלתה מהים בלילה והטילה — לכו לפי העקבות שמהמים אל החוף ומצאו את הקן.',
      how: 'גררו כדי להוביל את המתנדב. המד מראה חם או קר לפי הקרבה לקן. כשחם — לוחצים «חפרו».',
      world: 'day-beach',
      fact: 'מתנדבים סורקים חופים עם שחר: רק אז העקבות של הנקבה שעלתה בלילה עדיין ברורות בחול.',
      learn: 'סריקת בוקר: הולכים לפי העקבות מהים אל החוף, לא מנחשים.',
      say: 'לכו לפי העקבות מהים, ומצאו את הקן!',
      /* ⚠️ `decoy` = מסלולי עקבות מטעים. דווח: "תוסיף עקבות של
         רכב ושל יצורים אחרים כדי ליצור בלבול בשלבים מתקדמים".
         זה גם נכון מקצועית: חוף אמיתי בבוקר מלא בעקבות של כלבים,
         ציפורים, הולכי רגל וטרקטורונים, והמיומנות של מתנדב היא
         בדיוק היכולת לזהות איזה מסלול הוא של צב. */
      levels: [
        { name: 'סריקת בוקר', nests: 1, digs: 6, area: 9, time: 60, decoy: 0 },
        { name: 'שני קינים', nests: 2, digs: 10, area: 10, time: 74, decoy: 1 },
        { name: 'חוף רחב', nests: 2, digs: 9, area: 12, time: 78, decoy: 2 },
        { name: 'רוח מחקה עקבות', nests: 3, digs: 13, area: 13, time: 90, decoy: 3 },
        { name: 'אחרי הגשם', nests: 3, digs: 12, area: 14, time: 92, decoy: 4 },
        { name: 'עונת שיא', nests: 4, digs: 16, area: 15, time: 104, decoy: 5 },
        { name: 'חוף ארוך', nests: 4, digs: 15, area: 16, time: 108, decoy: 6 },
        { name: 'סוקר ראשי', nests: 5, digs: 18, area: 17, time: 122, decoy: 8 }
      ]
    }
  };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var ORDER = ['hatch', 'clean', 'release', 'fox', 'eggs'];
  var MAX_STARS = ORDER.length * 8 * 3;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     2. שמירת התקדמות
     ══════════════════════════════════════════════════════════
     ⚠️ הכל בתוך try/catch: בגלישה פרטית, או כשאחסון אתרים חסום,
     קריאה ל-localStorage **זורקת** — ובלי עטיפה כל מסך המשחקים
     היה נופל לבן. משחק חייב לעבוד גם בלי זיכרון. */
  var PKEY = 'cby-g3d-progress-v1';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function loadProg() {
    try { return JSON.parse(global.localStorage.getItem(PKEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function saveProg(p) {
    try { global.localStorage.setItem(PKEY, JSON.stringify(p)); } catch (e) { }
  }
  function starsFor(gid, lv) {
    var p = loadProg();
    return (p[gid] && p[gid][lv]) || 0;
  }
  function setStars(gid, lv, s) {
    var p = loadProg();
    p[gid] = p[gid] || {};
    if ((p[gid][lv] || 0) < s) p[gid][lv] = s;
    saveProg(p);
  }
  function isUnlocked(gid, lv) {
    return lv === 0 || starsFor(gid, lv - 1) > 0;
  }
  function totalStars() {
    var p = loadProg(), n = 0, g, l;
    for (g in p) for (l in p[g]) n += p[g][l];
    return n;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     3. קריינות — צאבי מדבר
     ══════════════════════════════════════════════════════════
     דווח: "שישמעו גם את צאבי".

     ⚠️ שלוש מלכודות ב-Web Speech שנמדדו ומטופלות כאן:

     1. **רשימת הקולות ריקה בטעינה הראשונה.** getVoices() מחזיר []
        עד שהדפדפן טוען את הקולות, ולכן בחירת קול עברי בפעם
        הראשונה נכשלת בשקט ומתקבל קול אנגלי שקורא עברית כג'יבריש.
        לכן הבחירה נעשית בכל אמירה מחדש, ולא פעם אחת בהתחלה.

     2. **אמוג'י נקרא בקול.** "🐢" הופך ל"turtle" באמצע משפט עברי.
        כל תו שאינו עברית, ספרה או פיסוק בסיסי — מוסר לפני ההקראה.

     3. **הקראה חופפת.** בלי cancel() לפני כל אמירה, שני משפטים
        מנוגנים יחד ואי אפשר להבין אף אחד. */
  var voiceOn = true;
  try { voiceOn = global.localStorage.getItem('cby-voice-off') !== '1'; } catch (e) { }

  function cleanForSpeech(text) {
    return String(text || '')
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}←-⇿⬀-⯿️]/gu, ' ')
      .replace(/[«»"'`]/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function say(text) {
    if (!voiceOn || !global.speechSynthesis) return;
    var t = cleanForSpeech(text);
    if (!t) return;
    try {
      global.speechSynthesis.cancel();
      var u = new global.SpeechSynthesisUtterance(t);
      u.lang = 'he-IL';
      u.rate = 1.0;
      u.pitch = 1.15;
      var vs = global.speechSynthesis.getVoices() || [];
      for (var i = 0; i < vs.length; i++) {
        if (vs[i].lang && vs[i].lang.toLowerCase().indexOf('he') === 0) { u.voice = vs[i]; break; }
      }
      global.speechSynthesis.speak(u);
    } catch (e) { }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function stopVoice() {
    try { if (global.speechSynthesis) global.speechSynthesis.cancel(); } catch (e) { }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function toggleVoice() {
    voiceOn = !voiceOn;
    try { global.localStorage.setItem('cby-voice-off', voiceOn ? '0' : '1'); } catch (e) { }
    if (!voiceOn) stopVoice();
    return voiceOn;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     4. ממשק — נבנה בקוד, כולל הסגנון
     ══════════════════════════════════════════════════════════ */

  var CSS = [
    '#g3d{position:fixed;top:0;left:0;right:0;bottom:0;z-index:120;display:none;',
    'flex-direction:column;background:#04202e;color:#fff;font-family:inherit;direction:rtl;',
    'height:100vh;height:100dvh;overflow:hidden;',
    '-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;',
    'touch-action:none;overscroll-behavior:none}',
    '#g3d.on{display:flex}',

    '#g3d-bar{display:flex;align-items:center;gap:8px;flex:0 0 auto;',
    'padding:calc(env(safe-area-inset-top,0px) + 9px) calc(env(safe-area-inset-right,0px) + 12px) 9px',
    ' calc(env(safe-area-inset-left,0px) + 12px);background:rgba(0,0,0,.34)}',
    '#g3d-bar h3{margin:0;font-size:clamp(15px,4.2vw,19px);font-weight:800;flex:1;',
    'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#g3d-bar .sub{font-size:clamp(10px,2.9vw,12.5px);opacity:.75;font-weight:700;white-space:nowrap}',

    '.g3d-btn{border:0;border-radius:14px;padding:11px 16px;font:inherit;font-weight:800;',
    'font-size:clamp(13px,3.6vw,15px);cursor:pointer;background:#7fe3c4;color:#04202e;',
    'min-height:44px;min-width:44px;line-height:1.1;touch-action:manipulation}',
    '.g3d-btn:active{transform:scale(.96)}',
    '.g3d-btn.ghost{background:rgba(255,255,255,.15);color:#fff}',
    '.g3d-btn.warn{background:#ffd98a;color:#3a2a00}',
    '.g3d-btn[disabled]{opacity:.4}',

    '#g3d-stage{position:relative;flex:1 1 auto;min-height:0}',
    '#g3d-canvas{display:block;width:100%;height:100%;touch-action:none}',

    '#g3d-hud{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;',
    'padding:calc(env(safe-area-inset-top,0px) + 10px) calc(env(safe-area-inset-right,0px) + 12px)',
    ' calc(env(safe-area-inset-bottom,0px) + 10px) calc(env(safe-area-inset-left,0px) + 12px);',
    'display:flex;flex-direction:column;gap:7px}',
    '.g3d-row{display:flex;gap:7px;align-items:center;flex-wrap:wrap}',
    /* ⚠️ unicode-bidi:isolate על כל גלולה — ראו ההסבר על "0/8" למעלה */
    '.g3d-pill{background:rgba(3,26,38,.68);border-radius:999px;padding:6px 12px;',
    'font-weight:800;font-size:clamp(12px,3.3vw,14px);white-space:nowrap;unicode-bidi:isolate}',
    '.g3d-pill b{color:#ffd98a;font-variant-numeric:tabular-nums}',
    '#g3d-meter{height:9px;border-radius:999px;background:rgba(255,255,255,.22);',
    'overflow:hidden;flex:1;min-width:70px}',
    '#g3d-meter i{display:block;height:100%;width:0;',
    'background:linear-gradient(90deg,#7fe3c4,#ffd98a);transition:width .18s}',
    '#g3d-msg{position:absolute;left:8px;right:8px;top:34%;text-align:center;',
    'font-size:clamp(22px,7vw,34px);font-weight:900;',
    'text-shadow:0 4px 18px rgba(0,0,0,.65);pointer-events:none;unicode-bidi:isolate}',
    /* שורת הנחיה קבועה — "לא מבין איך מנקים את הים" */
    '#g3d-hint{position:absolute;left:12px;right:12px;',
    'bottom:calc(env(safe-area-inset-bottom,0px) + 74px);text-align:center;',
    'font-size:clamp(11.5px,3.2vw,13.5px);font-weight:700;line-height:1.5;',
    'background:rgba(3,26,38,.62);border-radius:14px;padding:8px 12px;',
    'pointer-events:none;transition:opacity .4s}',
    '#g3d-hint.fade{opacity:.34}',
    '#g3d-tools{position:absolute;left:0;right:0;',
    'bottom:calc(env(safe-area-inset-bottom,0px) + 14px);',
    'display:flex;justify-content:center;gap:9px;flex-wrap:wrap;pointer-events:auto;padding:0 12px}',

    '#g3d-panel{position:absolute;top:0;left:0;right:0;bottom:0;overflow-y:auto;',
    '-webkit-overflow-scrolling:touch;touch-action:pan-y;',
    'padding:16px calc(env(safe-area-inset-right,0px) + 16px)',
    ' calc(env(safe-area-inset-bottom,0px) + 24px) calc(env(safe-area-inset-left,0px) + 16px);',
    'background:linear-gradient(180deg,rgba(4,32,46,.95),rgba(4,32,46,.99))}',
    '#g3d-panel.hide{display:none}',
    '.g3d-lead{max-width:620px;margin:0 auto 6px;font-size:clamp(13px,3.7vw,15px);',
    'line-height:1.6;opacity:.93}',
    '.g3d-how{max-width:620px;margin:0 auto 10px;font-size:clamp(11.5px,3.2vw,13px);',
    'line-height:1.55;opacity:.72}',
    '.g3d-learn{max-width:620px;margin:0 auto 16px;font-size:clamp(11.5px,3.2vw,13px);',
    'background:rgba(127,227,196,.13);border-radius:14px;padding:9px 13px;line-height:1.55}',
    '.g3d-levels{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));',
    'gap:10px;max-width:620px;margin:0 auto}',
    '.g3d-lv{background:rgba(255,255,255,.09);border:0;border-radius:18px;padding:13px 7px;',
    'text-align:center;cursor:pointer;color:#fff;font:inherit;min-height:96px;',
    'touch-action:manipulation;transition:transform .12s,background .12s}',
    '.g3d-lv:active{transform:scale(.96)}',
    '.g3d-lv.lock{opacity:.38}',
    '.g3d-lv .n{font-size:clamp(19px,5.4vw,23px);font-weight:900;line-height:1;display:block;',
    'font-variant-numeric:tabular-nums}',
    '.g3d-lv .t{font-size:clamp(10px,2.9vw,11.5px);opacity:.82;margin-top:5px;',
    'min-height:26px;display:block;line-height:1.3}',
    '.g3d-lv .s{font-size:13px;letter-spacing:2px;margin-top:5px;display:block;color:#ffd98a}',

    '#g3d-end{position:absolute;top:0;left:0;right:0;bottom:0;display:none;',
    'align-items:center;justify-content:center;background:rgba(2,18,26,.88);padding:16px}',
    '#g3d-end.on{display:flex}',
    '.g3d-card{background:#0d3546;border-radius:24px;padding:20px;max-width:380px;width:100%;',
    'text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5);max-height:88%;overflow-y:auto}',
    '.g3d-card h4{margin:0 0 4px;font-size:clamp(19px,5.6vw,24px)}',
    '.g3d-card .stars{font-size:clamp(28px,9vw,36px);letter-spacing:4px;margin:6px 0;color:#ffd98a}',
    '.g3d-card .sc{font-size:clamp(13px,3.8vw,15px);font-weight:800;color:#ffd98a;',
    'unicode-bidi:isolate}',
    '.g3d-card .fact{font-size:clamp(11.5px,3.3vw,13px);line-height:1.6;opacity:.88;',
    'margin:12px 0 14px;background:rgba(255,255,255,.07);border-radius:14px;',
    'padding:11px 13px;text-align:right}',
    '.g3d-card .acts{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}',

    /* תדריך זיהוי עקבות */
    '#g3d-brief{position:absolute;top:0;left:0;right:0;bottom:0;display:none;',
    'align-items:center;justify-content:center;background:rgba(2,18,26,.92);padding:14px;z-index:3}',
    '#g3d-brief.on{display:flex}',
    '.brief{background:#0d3546;border-radius:22px;padding:18px;max-width:420px;width:100%;',
    'max-height:92%;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.5)}',
    '.brief h4{margin:0 0 10px;font-size:clamp(17px,5vw,21px);text-align:center}',
    '.brief .row{display:flex;gap:11px;align-items:center;background:rgba(255,255,255,.07);',
    'border-radius:15px;padding:10px 12px;margin-bottom:8px}',
    '.brief .row.good{background:rgba(127,227,196,.17);border:1px solid rgba(127,227,196,.4)}',
    '.brief .pic{flex:0 0 auto;width:62px;height:52px;border-radius:10px;background:#d6bb84;',
    'position:relative;overflow:hidden}',
    '.brief .pic i{position:absolute;background:#9c8156;display:block}',
    '.brief .tx b{display:block;font-size:clamp(13px,3.7vw,15px)}',
    '.brief .tx span{display:block;font-size:clamp(11px,3.1vw,12.5px);opacity:.78;line-height:1.5}'
  ].join('');
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var el = {};
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function build() {
    if (el.root) return;
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var root = document.createElement('div');
    root.id = 'g3d';
    root.innerHTML =
      '<div id="g3d-bar">' +
      '<button type="button" class="g3d-btn ghost" id="g3d-back">◀</button>' +
      '<h3 id="g3d-title">משחק</h3>' +
      '<span class="sub" id="g3d-sub"></span>' +
      '<button type="button" class="g3d-btn ghost" id="g3d-voice" aria-label="קול">🗣️</button>' +
      '<button type="button" class="g3d-btn ghost" id="g3d-mute" aria-label="צליל">🔊</button>' +
      '</div>' +
      '<div id="g3d-stage">' +
      '<canvas id="g3d-canvas"></canvas>' +
      '<div id="g3d-hud">' +
      '<div class="g3d-row">' +
      '<span class="g3d-pill" id="g3d-score">⭐ <b>0</b></span>' +
      '<span class="g3d-pill" id="g3d-life">💙💙💙</span>' +
      '<span class="g3d-pill" id="g3d-time">⏱ <b>0</b></span>' +
      '</div>' +
      '<div class="g3d-row"><div id="g3d-meter"><i></i></div>' +
      '<span class="g3d-pill" id="g3d-goal"></span></div>' +
      '<div id="g3d-msg"></div>' +
      '<div id="g3d-hint"></div>' +
      '<div id="g3d-tools"></div>' +
      '</div>' +
      '<div id="g3d-panel" class="hide"></div>' +
      '<div id="g3d-brief"><div class="brief" id="g3d-brief-in"></div></div>' +
      '<div id="g3d-end"><div class="g3d-card">' +
      '<h4 id="g3d-end-title"></h4>' +
      '<div class="stars" id="g3d-end-stars"></div>' +
      '<div class="sc" id="g3d-end-score"></div>' +
      '<div class="fact" id="g3d-end-fact"></div>' +
      '<div class="acts">' +
      '<button type="button" class="g3d-btn" id="g3d-next">השלב הבא ▶</button>' +
      '<button type="button" class="g3d-btn ghost" id="g3d-retry">שוב</button>' +
      '<button type="button" class="g3d-btn ghost" id="g3d-levels">השלבים</button>' +
      '</div></div></div>' +
      '</div>';
    document.body.appendChild(root);

    el.root = root;
    el.canvas = root.querySelector('#g3d-canvas');
    el.title = root.querySelector('#g3d-title');
    el.sub = root.querySelector('#g3d-sub');
    el.score = root.querySelector('#g3d-score b');
    el.life = root.querySelector('#g3d-life');
    el.time = root.querySelector('#g3d-time b');
    el.meter = root.querySelector('#g3d-meter i');
    el.goal = root.querySelector('#g3d-goal');
    el.msg = root.querySelector('#g3d-msg');
    el.hint = root.querySelector('#g3d-hint');
    el.tools = root.querySelector('#g3d-tools');
    el.panel = root.querySelector('#g3d-panel');
    el.brief = root.querySelector('#g3d-brief');
    el.briefIn = root.querySelector('#g3d-brief-in');
    el.hud = root.querySelector('#g3d-hud');
    el.end = root.querySelector('#g3d-end');
    el.endTitle = root.querySelector('#g3d-end-title');
    el.endStars = root.querySelector('#g3d-end-stars');
    el.endScore = root.querySelector('#g3d-end-score');
    el.endFact = root.querySelector('#g3d-end-fact');
    el.mute = root.querySelector('#g3d-mute');
    el.voice = root.querySelector('#g3d-voice');
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    root.querySelector('#g3d-back').onclick = function () { snd('click'); close(); };
    root.querySelector('#g3d-retry').onclick = function () { snd('click'); start(curGame, curLevel); };
    root.querySelector('#g3d-levels').onclick = function () { snd('click'); showLevels(curGame); };
    root.querySelector('#g3d-next').onclick = function () {
      snd('click');
      var g = GAMES[curGame];
      if (curLevel + 1 < g.levels.length) start(curGame, curLevel + 1);
      else showLevels(curGame);
    };
    el.mute.onclick = function () {
      var m = global.CBY_SND ? global.CBY_SND.toggle() : true;
      el.mute.textContent = m ? '🔇' : '🔊';
    };
    el.voice.onclick = function () {
      el.voice.textContent = toggleVoice() ? '🗣️' : '🤐';
    };
    if (global.CBY_SND) el.mute.textContent = global.CBY_SND.isMuted() ? '🔇' : '🔊';
    el.voice.textContent = voiceOn ? '🗣️' : '🤐';
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     5. מנוע: רנדרר, לולאה, קלט
     ══════════════════════════════════════════════════════════ */

  var renderer = null, scene = null, camera = null;
  var raf = 0, lastT = 0, running = false;
  var curGame = null, curLevel = 0, G = null;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var input = { x: 0, y: 0, down: false, tapX: 0, tapY: 0, tapped: false,
                kL: false, kR: false, kU: false, kD: false };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function normPos(ev) {
    var r = el.canvas.getBoundingClientRect();
    var p = (ev.touches && ev.touches[0]) ? ev.touches[0] : ev;
    return {
      x: ((p.clientX - r.left) / r.width) * 2 - 1,
      y: -(((p.clientY - r.top) / r.height) * 2 - 1)
    };
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function bindInput() {
    var c = el.canvas;
    function down(e) {
      var n = normPos(e);
      input.x = n.x; input.y = n.y; input.down = true;
      input.tapX = n.x; input.tapY = n.y; input.tapped = true;
      if (e.cancelable) e.preventDefault();
    }
    function move(e) {
      var n = normPos(e);
      input.x = n.x; input.y = n.y;
      if (e.cancelable) e.preventDefault();
    }
    function up() { input.down = false; }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* ⚠️ גם Pointer וגם Touch: אייפונים ישנים לא תומכים ב-Pointer
       Events, ובלי שכבת ה-touch המשחק לא הגיב שם לאצבע כלל. */
    c.addEventListener('pointerdown', down);
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    c.addEventListener('touchstart', down, { passive: false });
    c.addEventListener('touchmove', move, { passive: false });
    c.addEventListener('touchend', up);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    global.addEventListener('keydown', function (e) {
      if (!el.root || !el.root.classList.contains('on')) return;
      if (e.key === 'ArrowLeft') input.kL = true;
      if (e.key === 'ArrowRight') input.kR = true;
      if (e.key === 'ArrowUp') input.kU = true;
      if (e.key === 'ArrowDown') input.kD = true;
      if (e.key === 'Escape') close();
    });
    global.addEventListener('keyup', function (e) {
      if (e.key === 'ArrowLeft') input.kL = false;
      if (e.key === 'ArrowRight') input.kR = false;
      if (e.key === 'ArrowUp') input.kU = false;
      if (e.key === 'ArrowDown') input.kD = false;
    });
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function initGL() {
    if (renderer) return true;
    TH = T();
    if (!TH) return false;
    try {
      renderer = new TH.WebGLRenderer({ canvas: el.canvas, antialias: true, alpha: false });
      if (TH.sRGBEncoding != null) renderer.outputEncoding = TH.sRGBEncoding;
      renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
      camera = new TH.PerspectiveCamera(56, 1, 0.1, 400);
      bindInput();
      global.addEventListener('resize', resize);
      global.addEventListener('orientationchange', function () { setTimeout(resize, 220); });
      return true;
    } catch (e) {
      console.warn('G3D init failed', e);
      return false;
    }
  }

  function resize() {
    if (!renderer || !el.canvas) return;
    var w = el.canvas.clientWidth || 360;
    var h = el.canvas.clientHeight || 480;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = h > w ? Math.min(74, 56 + (h / w - 1) * 26) : 54;
    camera.updateProjectionMatrix();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (!scene || !renderer) return;
    var t = now / 1000;
    var dt = Math.min(0.05, Math.max(0.001, t - lastT));
    lastT = t;
    if (running && G) {
      try { G.step(dt, t); } catch (e) { console.warn('game step', e); }
    }
    stepFx(dt);
    renderer.render(scene, camera);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     6. ערכת בנייה של עולמות
     ══════════════════════════════════════════════════════════ */

  function mat(color, o) {
    o = o || {};
    return new TH.MeshPhysicalMaterial({
      color: color,
      roughness: o.rough != null ? o.rough : 0.75,
      metalness: 0,
      /* ⚠️ ציפוי עדין על הכל: בלעדיו כל משטח מט לגמרי ונראה כמו
         קרטון. 0.1 היה כמעט אפס; 0.22 נותן ניצוץ שמרמז על חומר
         בלי להפוך את הסצנה למראה. */
      clearcoat: o.coat != null ? o.coat : 0.22,
      clearcoatRoughness: o.coatR != null ? o.coatR : 0.45,
      transparent: o.op != null && o.op < 1,
      opacity: o.op != null ? o.op : 1,
      side: o.side || TH.FrontSide
    });
  }
  function flat(color, op) {
    return new TH.MeshBasicMaterial({
      color: color, transparent: op != null && op < 1, opacity: op != null ? op : 1
    });
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function skyDome(top, bottom) {
    var m = new TH.ShaderMaterial({
      side: TH.BackSide, depthWrite: false,
      uniforms: { top: { value: new TH.Color(top) }, bot: { value: new TH.Color(bottom) } },
      vertexShader:
        'varying float h;void main(){h=normalize(position).y;' +
        'gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:
        'uniform vec3 top;uniform vec3 bot;varying float h;' +
        'void main(){gl_FragColor=vec4(mix(bot,top,clamp(h*0.5+0.5,0.0,1.0)),1.0);}'
    });
    return new TH.Mesh(new TH.SphereGeometry(300, 24, 16), m);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️ סכום האורות נשאר סביב 1.2. הגרסה הראשונה הייתה 1.0+1.0+0.4
     וכל החול הגיע לרוויה — במשחק "מצאו את הביצים" כל המסך היה לבן
     והעקבות, שהן כל המשחק, נעלמו לגמרי. */
  function lights(s, kind) {
    var amb, key, fill;
    if (kind === 'night') {
      amb = new TH.AmbientLight(0x7d93c4, 0.46);
      key = new TH.DirectionalLight(0xb9cdf5, 0.52);
      fill = new TH.DirectionalLight(0xffc98f, 0.22);
    } else if (kind === 'sea') {
      amb = new TH.AmbientLight(0x9fd9f2, 0.52);
      key = new TH.DirectionalLight(0xffffff, 0.62);
      fill = new TH.DirectionalLight(0x4fa8cc, 0.26);
    } else {
      /* ⚠️⚠️ **החוף היומי יצא שרוף.**
         0.5 סביבתי + 0.72 ראשי + 0.22 מילוי + 0.42 נגדי = 1.86
         על חול בגוון 0xd6bb84, שהוא ממילא בהיר. התוצאה על המסך:
         צהוב אחיד בלי צל, בלי עומק ובלי שום פרט — כלומר חול נעלם
         והמשחק נראה כמו רקע צבוע.
         ⚠️ הכלל: סכום התאורה על משטח בהיר צריך להישאר מתחת ל-1.3,
         אחרת כל ההבדלים בין הגוונים נמחקים בקצה העליון. */
      amb = new TH.AmbientLight(0xffeecb, 0.38);
      key = new TH.DirectionalLight(0xfff6e0, 0.58);
      fill = new TH.DirectionalLight(0xffc98a, 0.16);
    }
    key.position.set(4, 9, 6);
    fill.position.set(-5, 4, -4);
    s.add(amb); s.add(key); s.add(fill);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* ⚠️⚠️ **אור נגדי — הדבר היחיד שהכי משנה איך סצנה נראית.**

       שתי מנורות מלפנים נותנות בהירות, אבל הדמות והרקע מקבלים
       את אותו אור ולכן נמסים זה לזה — וזה בדיוק מה שנקרא "שטוח".

       אור שלישי **מאחור** מדליק קו דק על הקצה העליון של כל גוף
       מעוגל, וקו הקצה הזה הוא מה שמפריד את הדמות מהרקע ונותן
       תחושת נפח. זו טכניקה סטנדרטית בצילום ובאנימציה (three-point
       lighting), והיא עולה מנורה אחת בלבד. */
    var rim = new TH.DirectionalLight(
      kind === 'night' ? 0xa8c4ff : (kind === 'sea' ? 0xbff0ff : 0xfff0d0),
      kind === 'night' ? 0.55 : 0.42);
    rim.position.set(-2, 6, -9);
    s.add(rim);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function sandPlane(w, d, color) {
    var g = new TH.Group();
    var p = new TH.Mesh(new TH.PlaneGeometry(w, d), mat(color || 0xe8d3a3, { rough: 1, coat: 0 }));
    p.rotation.x = -Math.PI / 2;
    g.add(p);
    var n = 1400, pos = new Float32Array(n * 3), i;
    for (i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * w;
      pos[i * 3 + 1] = 0.02;
      pos[i * 3 + 2] = (Math.random() - 0.5) * d;
    }
    var bg = new TH.BufferGeometry();
    bg.setAttribute('position', new TH.Float32BufferAttribute(pos, 3));
    g.add(new TH.Points(bg, new TH.PointsMaterial({
      color: 0xc9ac74, size: 0.08, transparent: true, opacity: 0.5
    })));
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* ⚠️ כתמי גוון רחבים על החול. מישור בצבע אחיד קורא כנייר צבעוני
       גם עם גרגרים עליו; כתמים בהירים וכהים יוצרים את אי-האחידות
       שהעין מזהה כחול אמיתי. */
    for (i = 0; i < 26; i++) {
      var patch = new TH.Mesh(new TH.CircleGeometry(1.2 + Math.random() * 2.6, 12),
        new TH.MeshBasicMaterial({
          color: Math.random() < 0.5 ? 0xffffff : 0x000000,
          transparent: true, opacity: 0.035 + Math.random() * 0.03, depthWrite: false
        }));
      patch.rotation.x = -Math.PI / 2;
      patch.position.set((Math.random() - 0.5) * w, 0.015, (Math.random() - 0.5) * d);
      patch.scale.set(1, 0.6 + Math.random() * 0.6, 1);
      g.add(patch);
    }
    return g;
  }

  function seaPlane(w, d, color, op) {
    var m = new TH.Mesh(new TH.PlaneGeometry(w, d, 40, 40),
      mat(color || 0x1f7fa8, { rough: 0.22, coat: 1, op: op != null ? op : 0.94 }));
    m.rotation.x = -Math.PI / 2;
    return m;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️⚠️ **כיוון הגלים — "תשפר את הים וכיוון גלים".**

     הגרסה הראשונה הזיזה קודקודים בסינוס דו-ממדי סימטרי, כלומר
     הים "רעד" במקום. גל אמיתי **נוסע**: הפאזה שלו תלויה במרחק
     מהחוף, והוא מתקדם לכיוון היבשה.

     כאן `dir` קובע את ציר הנסיעה ו-`t` מזיז את הפאזה, כך שהגלים
     זוחלים לכיוון החוף ולא מהבהבים. הגל הקצר שמנוגד בכיוון מוסיף
     את הרעש שמונע מהים להיראות כמו בד מגוהץ. */
  function waveTick(m, t, amp, speed) {
    if (!m || !m.geometry || !m.geometry.attributes) return;
    var p = m.geometry.attributes.position, a = amp || 0.16, sp = speed || 2.2, i;
    for (i = 0; i < p.count; i++) {
      var y = p.getY(i), x = p.getX(i);
      p.setZ(i,
        Math.sin(y * 0.30 + t * sp) * a +
        Math.sin(y * 0.11 + x * 0.06 - t * sp * 0.55) * a * 0.55 +
        Math.cos(x * 0.24 - t * sp * 0.8) * a * 0.28);
    }
    p.needsUpdate = true;
    m.geometry.computeVertexNormals();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* קו הקצף — הסימן שאומר "כאן הים נוגע בחול" */
  function foamLine(w) {
    var g = new TH.Group(), i;
    for (i = 0; i < 3; i++) {
      var f = new TH.Mesh(new TH.PlaneGeometry(w, 1.1 + i * 0.5),
        new TH.MeshBasicMaterial({
          color: 0xffffff, transparent: true, opacity: 0.30 - i * 0.08, depthWrite: false
        }));
      f.rotation.x = -Math.PI / 2;
      f.position.set(0, 0.07 + i * 0.005, i * 0.8);
      f.userData.ph = i * 1.1;
      g.add(f);
    }
    return g;
  }
  function foamTick(g, t) {
    if (!g) return;
    g.children.forEach(function (f, i) {
      f.position.z = i * 0.8 + Math.sin(t * 1.5 + f.userData.ph) * 0.55;
      f.material.opacity = (0.30 - i * 0.08) * (0.7 + Math.sin(t * 1.5 + f.userData.ph) * 0.3);
    });
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️⚠️ **קרני השמש נראו כמו טרפזים שקופים.**

     הן נבנו מחרוטים פתוחים עם DoubleSide. לחרוט יש **קצה חד**,
     ו-DoubleSide מכפיל את האטימות בכל מקום שבו הצופה רואה גם את
     הדופן הקדמית וגם את האחורית. התוצאה: צורה גאומטרית עם גבול
     ברור — בדיוק ההפך מאור.

     ⚠️ אור נראה כאור רק כשיש לו **קצה מטושטש**. אין דרך לקבל את
     זה מגאומטריה; צריך שקיפות שמשתנה לרוחב הקרן. לכן כאן: מרקם
     של מפל שקיפות שנוצר על canvas, על מישור פשוט, בערבוב חיבורי
     (additive) שהוא הדרך שבה אור באמת מצטבר.

     בונוס: מישור אחד במקום חרוט בן 7 פאות, ו-canvas אחד שמשותף
     לכל הקרניים. */
  var beamTex = null, dotTex = null;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function dotTexture() {
    if (dotTex) return dotTex;
    var cv = document.createElement('canvas');
    cv.width = 32; cv.height = 32;
    var c2 = cv.getContext('2d');
    var gr = c2.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0.0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.35, 'rgba(255,255,255,0.75)');
    gr.addColorStop(1.0, 'rgba(255,255,255,0)');
    c2.fillStyle = gr;
    c2.fillRect(0, 0, 32, 32);
    dotTex = new TH.CanvasTexture(cv);
    return dotTex;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function beamTexture() {
    if (beamTex) return beamTex;
    var cv = document.createElement('canvas');
    cv.width = 64; cv.height = 4;
    var g2 = cv.getContext('2d');
    var grd = g2.createLinearGradient(0, 0, 64, 0);
    grd.addColorStop(0.00, 'rgba(255,255,255,0)');
    grd.addColorStop(0.38, 'rgba(255,255,255,0.55)');
    grd.addColorStop(0.55, 'rgba(255,255,255,0.75)');
    grd.addColorStop(1.00, 'rgba(255,255,255,0)');
    g2.fillStyle = grd;
    g2.fillRect(0, 0, 64, 4);
    beamTex = new TH.CanvasTexture(cv);
    return beamTex;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function sunbeams(n, spread, h) {
    var g = new TH.Group(), i;
    var tex = beamTexture();
    for (i = 0; i < n; i++) {
      var w = 1.6 + Math.random() * 2.6;
      var m = new TH.Mesh(
        new TH.PlaneGeometry(w, h || 26),
        new TH.MeshBasicMaterial({
          map: tex, color: 0xdcf6ff, transparent: true, opacity: 0.085,
          depthWrite: false, blending: TH.AdditiveBlending, side: TH.DoubleSide
        }));
      m.position.set((Math.random() - 0.5) * spread, (h || 26) / 2 - 3,
        (Math.random() - 0.5) * spread);
      m.rotation.z = (Math.random() - 0.5) * 0.26;
      m.userData.billboard = true;
      g.add(m);
    }
    g.userData.beams = true;
    return g;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* הקרניים תמיד פונות למצלמה — אחרת, כשהמצלמה זזה, מישור דק
     נראה מהצד ונעלם לגמרי לרגע. */
  function beamTick(g, cam) {
    if (!g || !cam) return;
    g.children.forEach(function (m) {
      m.rotation.y = Math.atan2(cam.position.x - m.position.x, cam.position.z - m.position.z);
    });
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function bubbleField(n, spread) {
    var g = new TH.Group(), i;
    for (i = 0; i < n; i++) {
      var b = new TH.Mesh(new TH.SphereGeometry(0.05 + Math.random() * 0.09, 8, 6),
        new TH.MeshBasicMaterial({ color: 0xeaffff, transparent: true, opacity: 0.38 }));
      b.position.set((Math.random() - 0.5) * spread, Math.random() * 16 - 5, (Math.random() - 0.5) * spread);
      b.userData.sp = 0.5 + Math.random() * 1.1;
      g.add(b);
    }
    return g;
  }
  function bubbleTick(g, dt, top) {
    if (!g) return;
    g.children.forEach(function (b) {
      b.position.y += b.userData.sp * dt;
      if (b.position.y > (top || 10)) b.position.y = -5;
    });
  }

  function starField(n, r) {
    var pos = new Float32Array(n * 3), i;
    for (i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, e = Math.random() * 0.9 + 0.1;
      pos[i * 3] = Math.cos(a) * r * Math.cos(e);
      pos[i * 3 + 1] = Math.sin(e) * r;
      pos[i * 3 + 2] = Math.sin(a) * r * Math.cos(e);
    }
    var bg = new TH.BufferGeometry();
    bg.setAttribute('position', new TH.Float32BufferAttribute(pos, 3));
    /* ⚠️⚠️ **כוכבים ריבועיים.**
       PointsMaterial בלי מפה מצייר כל נקודה כ**ריבוע** מלא. בגודל
       0.9 אי אפשר לראות את זה; ברגע שהגדלנו כדי שהכוכבים בכלל
       ייראו, השמיים התמלאו במרובעים לבנים.
       נקודה עגולה דורשת מרקם עם אלפא — אין דרך אחרת. */
    return new TH.Points(bg, new TH.PointsMaterial({
      color: 0xffffff, size: 2.6, map: dotTexture(),
      transparent: true, opacity: 0.9, depthWrite: false,
      sizeAttenuation: true, fog: false, blending: TH.AdditiveBlending
    }));
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* צל מגע — ⚠️ בלי צל, כל דמות נראית כמרחפת מעל החול ולא עומדת
     עליו. צל אמיתי דורש shadow map ומוריד קצב פריימים בטלפון,
     ולכן כאן זה כתם כהה שקוף מתחת לדמות: 1% מהעלות, 90% מהאפקט. */
  function contactShadow(r, op) {
    var s = new TH.Mesh(new TH.CircleGeometry(r || 0.6, 20),
      new TH.MeshBasicMaterial({
        color: 0x2a1f10, transparent: true, opacity: op || 0.22, depthWrite: false
      }));
    s.rotation.x = -Math.PI / 2;
    s.position.y = 0.03;
    return s;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     7. דמויות ואביזרים
     ══════════════════════════════════════════════════════════ */

  /* ⚠️⚠️ **הצב נבנה עם הראש ב‑Z שלילי — וזה תיקון של באג שדווח:
     "במשחק מסע אל הים הוא הולך הפוך".**

     בגרסה הראשונה הראש היה ב‑+Z. משחקי הריצה והשחייה מתקדמים
     אל ‑Z (פנימה למסך, מהמצלמה והלאה), ולכן האבקוע רץ אל הים
     עם הגב קדימה — בדיוק כמו שנראה בצילום המסך.

     `-Z` הוא כיוון "קדימה" המוסכם בגרפיקה תלת-ממדית, וברגע
     שהדמות בנויה נכון, כל משחק פשוט מסובב אותה לכיוון התנועה
     האמיתי שלה ואין יותר מקום לטעות. */
  function miniTurtle(shellCol, skinCol, scale) {
    var g = new TH.Group();
    var sk = mat(skinCol || 0x86ca8b, { rough: 0.55, coat: 0.4 });
    var sh = mat(shellCol || 0xb9762f, { rough: 0.45, coat: 0.7 });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var body = new TH.Mesh(new TH.SphereGeometry(0.5, 20, 14), sh);
    body.scale.set(1.1, 0.52, 1.25);
    g.add(body);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // לוחיות על השריון — בלעדיהן זה סתם כיפה חומה
    [[0, 0.18], [-0.26, -0.12], [0.26, -0.12], [0, -0.42]].forEach(function (p) {
      var pl = new TH.Mesh(new TH.SphereGeometry(0.17, 10, 8),
        mat(shellCol ? 0xcf9247 : 0xcf9247, { rough: 0.4, coat: 0.7 }));
      pl.scale.set(1, 0.24, 1.1);
      pl.position.set(p[0], 0.23, p[1]);
      g.add(pl);
    });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var belly = new TH.Mesh(new TH.SphereGeometry(0.46, 16, 12), mat(0xf7e6c0, { rough: 0.8 }));
    belly.scale.set(1.05, 0.3, 1.18);
    belly.position.y = -0.14;
    g.add(belly);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var head = new TH.Mesh(new TH.SphereGeometry(0.29, 18, 14), sk);
    head.position.set(0, 0.07, -0.66);
    g.add(head);
    g.userData.head = head;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    [-1, 1].forEach(function (s) {
      var e = new TH.Mesh(new TH.SphereGeometry(0.085, 10, 8), flat(0xffffff));
      e.position.set(s * 0.115, 0.11, -0.86);
      g.add(e);
      var p = new TH.Mesh(new TH.SphereGeometry(0.048, 8, 8), flat(0x140d07));
      p.position.set(s * 0.125, 0.11, -0.91);
      g.add(p);
      var sp = new TH.Mesh(new TH.SphereGeometry(0.022, 6, 6), flat(0xffffff));
      sp.position.set(s * 0.10, 0.145, -0.94);
      g.add(sp);
    });

    // חיוך קטן — הדמות צריכה להיות מזוהה גם בגודל של 40 פיקסלים
    var smile = new TH.Mesh(new TH.TorusGeometry(0.07, 0.016, 6, 14, Math.PI),
      flat(0xc9655a));
    smile.rotation.z = Math.PI;
    smile.rotation.x = -0.2;
    smile.position.set(0, -0.01, -0.90);
    g.add(smile);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    g.userData.fl = [];
    [[-1, -0.42], [1, -0.42], [-1, 0.42], [1, 0.42]].forEach(function (f) {
      var fl = new TH.Mesh(new TH.SphereGeometry(0.2, 12, 8), sk);
      fl.scale.set(0.95, 0.28, 0.6);
      fl.position.set(f[0] * 0.56, -0.02, f[1]);
      fl.rotation.y = f[0] * (f[1] < 0 ? 0.4 : -0.4);
      g.add(fl);
      g.userData.fl.push({ m: fl, s: f[0] });
    });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    if (scale) g.scale.setScalar(scale);
    return g;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     ⚠️⚠️ השחקן הוא צאבי עצמו — ולא "עוד צב"
     ══════════════════════════════════════════════════════════

     דווח: "תשפר את צאבי... אני רוצה מקצועי... עוד קצת גרפיקה".

     הדמות הראשית עברה שכתוב מלא — שריון רחב עם תפרים, ראש מחוץ
     לשריון, עיניים נכונות, קו פה ששוכב על החוטם. אבל **במשחקים
     המשיך לשחק צב אחר**: miniTurtle, מודל של שבעה כדורים עם שתי
     נקודות שחורות במקום עיניים.

     ⚠️ זה לא רק פער איכות, זה פער **זהות**. ילד מדבר עם צאבי,
     נכנס למשחק, ומוביל לים דמות שהוא לא מזהה. כל העבודה על
     הדמות הראשית לא נספרת כי היא לא מופיעה איפה שמשחקים.

     כאן: השחקן בכל המשחקים הוא המודל האמיתי מ-chubby3d.js.

     ⚠️ שתי התאמות הכרחיות:
       · **כיוון** — בדמות הראשית הראש ב-Z חיובי (היא מביטה אל
         הילד); במשחקים כל התנועה היא לכיוון Z שלילי. סיבוב של
         180° סביב Y מיישר את זה, ומכאן הכול עובד כרגיל.
       · **קנה מידה** — הדמות המלאה רחבה כ-2.26 יחידות מול 1.1
         של miniTurtle, ולכן 0.46 הוא היחס שמשאיר את כל המרחקים
         והפגיעות במשחקים בדיוק כפי שהיו.

     miniTurtle נשאר בשימוש להמון אבקועים ברקע: שם צריך עשרות
     עותקים, ופרטים שאיש לא יראה הם רק עלות. */
  function chubbyModel(scale) {
    var built = global.CBY_3D && global.CBY_3D.buildChubby
      ? global.CBY_3D.buildChubby('classic') : null;
    if (!built || !built.group) return miniTurtle(null, null, scale);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var outer = new TH.Group();
    var inner = built.group;
    inner.rotation.y = Math.PI;
    inner.position.y = -0.55;          // מרכוז סביב מרכז הגוף
    inner.scale.setScalar(0.46 * (scale || 1));
    outer.add(inner);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    outer.userData.chubby = true;
    outer.userData.parts = built.parts;
    outer.userData.head = built.parts.head;
    outer.userData.fl = []
      .concat(built.parts.frontFlippers || [], built.parts.backFlippers || [])
      .map(function (f) { return { m: f.g, s: f.side, base: f.g.rotation.x }; });
    return outer;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function swimTick(t, turtle, speed) {
    if (!turtle || !turtle.userData.fl) return;
    var ch = turtle.userData.chubby;
    turtle.userData.fl.forEach(function (f, i) {
      /* ⚠️ בצאבי המלא הסנפיר הוא **משוט** שמסובב כבר סביב Y, ולכן
         חתירה היא rotation.x (הנפה מעלה-מטה) ולא rotation.z
         (שהיה מסובב את המשוט סביב צירו — פיתול, לא חתירה). */
      if (ch) f.m.rotation.x = (f.base || 0) + Math.sin(t * (speed || 6) + i * 1.7) * 0.45;
      else f.m.rotation.z = Math.sin(t * (speed || 6) + i * 1.7) * 0.5;
    });
    if (turtle.userData.head) {
      turtle.userData.head.rotation.y = Math.sin(t * 1.4) * 0.14;
    }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️⚠️ **מודל אדם — "שהשחקן במקרה הזה יהיה אדם שמחפש".**

     זו הערה נכונה לגמרי, ולא רק ויזואלית: את הקינים בישראל מוצא
     **מתנדב**, לא צב. משחק שבו צב מחפש את הקן של עצמו מלמד משהו
     שלא קורה.

     המודל נבנה מפרימיטיבים עם הסימנים שמזהים מתנדב סריקה אמיתי:
     כובע רחב שוליים, אפוד זוהר, תרמיל ואת חפירה. */
  function humanModel(shirt, skin) {
    var g = new TH.Group();
    var SK = mat(skin || 0xe8b98d, { rough: 0.8 });
    var SH = mat(shirt || 0x2f9e78, { rough: 0.9 });
    var PANT = mat(0x35506b, { rough: 0.95 });

    var hips = new TH.Group();
    hips.position.y = 0.92;
    g.add(hips);
    g.userData.hips = hips;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var torso = new TH.Mesh(new TH.CylinderGeometry(0.21, 0.26, 0.62, 12), SH);
    torso.position.y = 0.31;
    hips.add(torso);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // אפוד זוהר — הסימן שאומר "מתנדב" ולא "מטייל"
    var vest = new TH.Mesh(new TH.CylinderGeometry(0.235, 0.275, 0.40, 12),
      mat(0xf2d128, { rough: 0.55 }));
    vest.position.y = 0.34;
    hips.add(vest);
    [-1, 1].forEach(function (s) {
      var strip = new TH.Mesh(new TH.BoxGeometry(0.06, 0.40, 0.02), flat(0xf7f7f7));
      strip.position.set(s * 0.09, 0.34, 0.27);
      hips.add(strip);
    });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var neck = new TH.Mesh(new TH.CylinderGeometry(0.06, 0.07, 0.10, 8), SK);
    neck.position.y = 0.66;
    hips.add(neck);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var head = new TH.Mesh(new TH.SphereGeometry(0.155, 16, 14), SK);
    head.scale.set(1, 1.1, 0.95);
    head.position.y = 0.80;
    hips.add(head);
    g.userData.head = head;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // כובע רחב שוליים — בחוף בשמונה בבוקר זה לא אקססורי
    var brim = new TH.Mesh(new TH.CylinderGeometry(0.30, 0.30, 0.025, 18),
      mat(0xe7d9b6, { rough: 1 }));
    brim.position.y = 0.90;
    hips.add(brim);
    var crown = new TH.Mesh(new TH.CylinderGeometry(0.135, 0.155, 0.13, 14),
      mat(0xe7d9b6, { rough: 1 }));
    crown.position.y = 0.965;
    hips.add(crown);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    [-1, 1].forEach(function (s) {
      var eye = new TH.Mesh(new TH.SphereGeometry(0.022, 8, 8), flat(0x22160c));
      eye.position.set(s * 0.055, 0.815, -0.135);
      hips.add(eye);
    });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // תרמיל
    var bag = new TH.Mesh(new TH.BoxGeometry(0.26, 0.30, 0.15), mat(0x9c5b35, { rough: 1 }));
    bag.position.set(0, 0.36, 0.26);
    hips.add(bag);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    g.userData.arms = [];
    [-1, 1].forEach(function (s) {
      var arm = new TH.Group();
      arm.position.set(s * 0.245, 0.55, 0);
      hips.add(arm);
      var upper = new TH.Mesh(new TH.CylinderGeometry(0.055, 0.05, 0.46, 8), SH);
      upper.position.y = -0.23;
      arm.add(upper);
      var hand = new TH.Mesh(new TH.SphereGeometry(0.055, 8, 8), SK);
      hand.position.y = -0.47;
      arm.add(hand);
      g.userData.arms.push({ g: arm, s: s });
    });

    g.userData.legs = [];
    [-1, 1].forEach(function (s) {
      var leg = new TH.Group();
      leg.position.set(s * 0.11, 0, 0);
      hips.add(leg);
      var thigh = new TH.Mesh(new TH.CylinderGeometry(0.075, 0.065, 0.86, 8), PANT);
      thigh.position.y = -0.43;
      leg.add(thigh);
      var shoe = new TH.Mesh(new TH.BoxGeometry(0.13, 0.08, 0.26), mat(0x2c2c30, { rough: 1 }));
      shoe.position.set(0, -0.88, -0.05);
      leg.add(shoe);
      g.userData.legs.push({ g: leg, s: s });
    });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // את חפירה ביד ימין
    var spade = new TH.Group();
    spade.position.set(0.30, 0.20, -0.06);
    spade.rotation.z = 0.3;
    hips.add(spade);
    var handle = new TH.Mesh(new TH.CylinderGeometry(0.022, 0.022, 0.62, 7),
      mat(0xb98b4e, { rough: 1 }));
    spade.add(handle);
    var blade = new TH.Mesh(new TH.BoxGeometry(0.15, 0.20, 0.03),
      mat(0xa8adb5, { rough: 0.35, coat: 0.6 }));
    blade.position.y = -0.38;
    spade.add(blade);
    g.userData.spade = spade;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    g.add(contactShadow(0.42, 0.26));
    return g;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* הליכה — ⚠️ בלי תנועת רגליים הדמות גולשת על החול כמו פסל על
     גלגיליות, וזה מה שהופך סצנה "לא מקצועית" יותר מכל דבר אחר. */
  function walkTick(h, t, speed, moving) {
    if (!h || !h.userData.legs) return;
    var amp = moving ? 0.58 : 0.04;
    var w = t * (speed || 7);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* ⚠️⚠️ **צעדים — מסונכרנים לרגל, לא לטיימר.**
       הפיתוי הוא לנגן צעד כל X מילישניות. זה תמיד יוצא לא מסונכרן
       ברגע שהדמות מאיצה או נעצרת.
       כאן הצעד נורה כשהסינוס של הרגליים חוצה את האפס — כלומר
       **בדיוק** ברגע שרגל נוגעת בקרקע. כשהדמות עוצרת, moving
       הופך ל-false והצעדים נפסקים מעצמם. */
    if (moving) {
      var phase = Math.floor(w / Math.PI);
      if (h.userData.lastStep !== phase) {
        h.userData.lastStep = phase;
        snd('step');
      }
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    h.userData.legs.forEach(function (l, i) {
      l.g.rotation.x = Math.sin(w + i * Math.PI) * amp;
    });
    h.userData.arms.forEach(function (a, i) {
      a.g.rotation.x = Math.sin(w + i * Math.PI + Math.PI) * amp * 0.7;
    });
    if (h.userData.hips) {
      h.userData.hips.position.y = 0.92 + (moving ? Math.abs(Math.sin(w)) * 0.035 : 0);
    }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function foxModel(isDog) {
    var g = new TH.Group();
    var col = isDog ? 0x4b4038 : 0xe0701c;
    var M = mat(col, { rough: 0.9 });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* ⚠️ הראש ב‑Z שלילי, כמו אצל הצב ומאותה סיבה: הטורף רץ אל
       הקן, והקן נמצא לפניו. */
    var body = new TH.Mesh(new TH.SphereGeometry(0.34, 14, 10), M);
    body.scale.set(1, 0.78, 1.6);
    body.position.y = 0.40;
    g.add(body);

    var chest = new TH.Mesh(new TH.SphereGeometry(0.23, 12, 9), mat(0xf6ece0, { rough: 1 }));
    chest.scale.set(0.8, 0.7, 1.0);
    chest.position.set(0, 0.30, -0.30);
    g.add(chest);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var head = new TH.Mesh(new TH.SphereGeometry(0.23, 14, 10), M);
    head.position.set(0, 0.56, -0.48);
    g.add(head);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var snout = new TH.Mesh(new TH.ConeGeometry(0.11, 0.32, 10), M);
    snout.rotation.x = -Math.PI / 2;
    snout.position.set(0, 0.50, -0.74);
    g.add(snout);
    var nose = new TH.Mesh(new TH.SphereGeometry(0.04, 8, 8), flat(0x1a1208));
    nose.position.set(0, 0.50, -0.89);
    g.add(nose);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    [-1, 1].forEach(function (s) {
      var ear = new TH.Mesh(new TH.ConeGeometry(0.095, 0.24, 8), M);
      ear.position.set(s * 0.13, 0.74, -0.44);
      g.add(ear);
      var inner = new TH.Mesh(new TH.ConeGeometry(0.05, 0.14, 7), mat(0x2a1c12, { rough: 1 }));
      inner.position.set(s * 0.13, 0.74, -0.49);
      g.add(inner);
      var eye = new TH.Mesh(new TH.SphereGeometry(0.042, 8, 8), flat(0xffe08a));
      eye.position.set(s * 0.10, 0.60, -0.64);
      g.add(eye);
      var pup = new TH.Mesh(new TH.SphereGeometry(0.020, 6, 6), flat(0x160f06));
      eye.add(pup);
      pup.position.z = -0.03;
    });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var tail = new TH.Mesh(new TH.SphereGeometry(0.17, 12, 8),
      mat(isDog ? 0x3e352e : 0xc25c13, { rough: 1 }));
    tail.scale.set(0.8, 0.8, 1.7);
    tail.position.set(0, 0.46, 0.66);
    g.add(tail);
    g.userData.tail = tail;
    if (!isDog) {
      var tip = new TH.Mesh(new TH.SphereGeometry(0.13, 10, 8), mat(0xfaf3e6, { rough: 1 }));
      tip.position.set(0, 0.46, 0.94);
      g.add(tip);
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    g.userData.legs = [];
    [[-1, -0.40], [1, -0.40], [-1, 0.34], [1, 0.34]].forEach(function (p) {
      var l = new TH.Mesh(new TH.CylinderGeometry(0.058, 0.048, 0.40, 7), M);
      l.position.set(p[0] * 0.19, 0.20, p[1]);
      g.add(l);
      g.userData.legs.push(l);
    });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    g.add(contactShadow(0.5, 0.2));
    return g;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️⚠️ **גדר אמיתית — "איזו גדר זאת, תשפר, לא מובן".**

     צודק לגמרי. הגרסה הראשונה הייתה טבעת דקה שקופה שהופיעה
     ונעלמה: אי אפשר היה להבין שהיא הוצבה, מה היא עושה, ומתי היא
     נגמרת.

     כך מגדרים קן באמת בחוף: עמודי עץ נעוצים בחול, רשת מתוחה
     ביניהם, ושלט "קן מוגן — נא לא להתקרב". זה גם מה שהופך את
     המשחק למובן במבט אחד — רואים חפץ, לא אפקט. */
  function fenceRing(radius, posts) {
    var g = new TH.Group();
    var n = posts || 14, i;
    var wood = mat(0x8a5f34, { rough: 1 });
    var net = mat(0xd8e6c8, { rough: 0.9, op: 0.9 });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    for (i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var px = Math.cos(a) * radius, pz = Math.sin(a) * radius;

      var post = new TH.Mesh(new TH.CylinderGeometry(0.055, 0.065, 1.05, 7), wood);
      post.position.set(px, 0.52, pz);
      g.add(post);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      var cap = new TH.Mesh(new TH.SphereGeometry(0.07, 8, 6), wood);
      cap.position.set(px, 1.05, pz);
      g.add(cap);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      // שני חוטים אופקיים בין עמוד לעמוד
      var a2 = ((i + 1) / n) * Math.PI * 2;
      var nx = Math.cos(a2) * radius, nz = Math.sin(a2) * radius;
      var seg = Math.hypot(nx - px, nz - pz);
      [0.42, 0.80].forEach(function (h) {
        var wire = new TH.Mesh(new TH.BoxGeometry(seg, 0.035, 0.035), net);
        wire.position.set((px + nx) / 2, h, (pz + nz) / 2);
        wire.rotation.y = -Math.atan2(nz - pz, nx - px);
        g.add(wire);
      });
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // שלט
    var signPost = new TH.Mesh(new TH.CylinderGeometry(0.05, 0.05, 1.5, 7), wood);
    signPost.position.set(0, 0.75, radius + 0.35);
    g.add(signPost);
    var board = new TH.Mesh(new TH.BoxGeometry(1.15, 0.62, 0.05),
      mat(0xfff3d4, { rough: 0.85 }));
    board.position.set(0, 1.35, radius + 0.35);
    g.add(board);
    var stripe = new TH.Mesh(new TH.BoxGeometry(1.15, 0.13, 0.055),
      flat(0xe05a3c));
    stripe.position.set(0, 1.55, radius + 0.36);
    g.add(stripe);
    var stripe2 = new TH.Mesh(new TH.BoxGeometry(0.85, 0.09, 0.055), flat(0x3a6b8c));
    stripe2.position.set(0, 1.28, radius + 0.36);
    g.add(stripe2);
    var stripe3 = new TH.Mesh(new TH.BoxGeometry(0.62, 0.09, 0.055), flat(0x3a6b8c));
    stripe3.position.set(0, 1.13, radius + 0.36);
    g.add(stripe3);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    return g;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function trashModel(kind) {
    var g = new TH.Group();
    /* ⚠️ הפסולת בגוונים אפורים-כחלחלים קרים, המדוזות בוורוד חם.
       ההפרדה הזו היא כל המשחק: ילד צריך להבחין ביניהן במבט חטוף
       על מסך טלפון בתנועה. */
    if (kind === 0) {
      var bag = new TH.Mesh(new TH.SphereGeometry(0.36, 14, 10),
        mat(0xeef4f8, { rough: 0.2, coat: 1, op: 0.88 }));
      bag.scale.set(1, 1.15, 0.62);
      g.add(bag);
      [-1, 1].forEach(function (s) {
        var h = new TH.Mesh(new TH.TorusGeometry(0.13, 0.032, 6, 12, Math.PI),
          mat(0xeef4f8, { op: 0.88 }));
        h.position.set(s * 0.15, 0.38, 0);
        g.add(h);
      });
    } else if (kind === 1) {
      g.add(new TH.Mesh(new TH.CylinderGeometry(0.17, 0.19, 0.66, 12),
        mat(0xa9dcea, { rough: 0.12, coat: 1, op: 0.85 })));
      var cap = new TH.Mesh(new TH.CylinderGeometry(0.095, 0.095, 0.15, 10), mat(0x2f7fd0));
      cap.position.y = 0.39;
      g.add(cap);
      var label = new TH.Mesh(new TH.CylinderGeometry(0.175, 0.185, 0.22, 12),
        mat(0xdfe8ee, { rough: 0.9 }));
      g.add(label);
    } else if (kind === 2) {
      var s2 = new TH.Mesh(new TH.CylinderGeometry(0.038, 0.038, 0.78, 8), mat(0xe8503f));
      s2.rotation.z = 0.5;
      g.add(s2);
    } else {
      g.add(new TH.Mesh(new TH.TorusGeometry(0.28, 0.038, 6, 14), mat(0x6f8f80, { rough: 1 })));
      var n2 = new TH.Mesh(new TH.TorusGeometry(0.19, 0.032, 6, 12), mat(0x6f8f80, { rough: 1 }));
      n2.rotation.x = 1.1;
      g.add(n2);
    }
    return g;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function jellyModel() {
    var g = new TH.Group(), i;
    var bell = new TH.Mesh(
      new TH.SphereGeometry(0.38, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62),
      mat(0xff8ec4, { rough: 0.16, coat: 1, op: 0.78 }));
    bell.scale.set(1, 0.92, 1);
    g.add(bell);
    var glow = new TH.Mesh(new TH.SphereGeometry(0.44, 14, 10),
      new TH.MeshBasicMaterial({ color: 0xff6fb3, transparent: true, opacity: 0.14, depthWrite: false }));
    glow.scale.set(1, 0.7, 1);
    g.add(glow);
    var rim = new TH.Mesh(new TH.TorusGeometry(0.35, 0.04, 8, 20), mat(0xff5aa5, { op: 0.9 }));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.05;
    g.add(rim);
    for (i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      var tn = new TH.Mesh(new TH.CylinderGeometry(0.024, 0.009, 0.72, 6),
        mat(0xffb8dc, { op: 0.8 }));
      tn.position.set(Math.cos(a) * 0.21, -0.42, Math.sin(a) * 0.21);
      g.add(tn);
    }
    return g;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function eggModel() {
    var e = new TH.Mesh(new TH.SphereGeometry(0.15, 12, 10), mat(0xfff6e4, { rough: 0.85 }));
    e.scale.set(1, 1.12, 1);
    return e;
  }

  function nestModel(n) {
    var g = new TH.Group(), i;
    var pit = new TH.Mesh(new TH.SphereGeometry(0.75, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(0xc2a470, { rough: 1 }));
    pit.scale.set(1, 0.34, 1);
    pit.rotation.x = Math.PI;
    g.add(pit);
    var rim = new TH.Mesh(new TH.TorusGeometry(0.76, 0.08, 8, 24), mat(0xd8bc86, { rough: 1 }));
    rim.rotation.x = Math.PI / 2;
    g.add(rim);
    g.userData.eggs = [];
    for (i = 0; i < (n || 8); i++) {
      var e = eggModel();
      var a = (i / (n || 8)) * Math.PI * 2, r = 0.14 + Math.random() * 0.28;
      e.position.set(Math.cos(a) * r, 0.06 + Math.random() * 0.05, Math.sin(a) * r);
      e.rotation.set(Math.random(), Math.random(), Math.random());
      g.add(e);
      g.userData.eggs.push(e);
    }
    return g;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     8. אפקטים
     ══════════════════════════════════════════════════════════ */

  var fx = [];
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function burst(pos, color, n) {
    if (!scene) return;
    for (var i = 0; i < (n || 12); i++) {
      var m = new TH.Mesh(new TH.SphereGeometry(0.07, 6, 5), flat(color));
      m.position.copy(pos);
      scene.add(m);
      fx.push({
        m: m, life: 0.55 + Math.random() * 0.3, t: 0,
        v: new TH.Vector3((Math.random() - 0.5) * 5, Math.random() * 4 + 1, (Math.random() - 0.5) * 5)
      });
    }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* קונפטי חגיגי — לרגע ההצלחה */
  function confetti(pos, n) {
    if (!scene) return;
    var cols = [0xffd98a, 0x7fe3c4, 0xff9ec4, 0x8fd4ff, 0xfff3d4];
    for (var i = 0; i < (n || 26); i++) {
      var m = new TH.Mesh(new TH.BoxGeometry(0.11, 0.05, 0.11),
        flat(cols[(Math.random() * cols.length) | 0]));
      m.position.copy(pos);
      m.position.y += 0.4;
      scene.add(m);
      fx.push({
        m: m, life: 1.3 + Math.random() * 0.6, t: 0, spin: true,
        v: new TH.Vector3((Math.random() - 0.5) * 4.5, Math.random() * 6 + 3, (Math.random() - 0.5) * 4.5)
      });
    }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function stepFx(dt) {
    for (var i = fx.length - 1; i >= 0; i--) {
      var f = fx[i];
      f.t += dt;
      f.v.y -= 9 * dt;
      f.m.position.x += f.v.x * dt;
      f.m.position.y += f.v.y * dt;
      f.m.position.z += f.v.z * dt;
      if (f.spin) { f.m.rotation.x += dt * 9; f.m.rotation.z += dt * 7; }
      else f.m.scale.setScalar(Math.max(0.01, 1 - f.t / f.life));
      if (f.t >= f.life) {
        if (scene) scene.remove(f.m);
        if (f.m.geometry) f.m.geometry.dispose();
        fx.splice(i, 1);
      }
    }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function clearFx() {
    fx.forEach(function (f) { if (scene) scene.remove(f.m); });
    fx = [];
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var msgTimer = 0;
  function flash(text, ms) {
    if (!el.msg) return;
    el.msg.textContent = text;
    clearTimeout(msgTimer);
    msgTimer = setTimeout(function () { el.msg.textContent = ''; }, ms || 900);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var hintTimer = 0;
  function hint(text) {
    if (!el.hint) return;
    el.hint.textContent = text || '';
    el.hint.classList.remove('fade');
    clearTimeout(hintTimer);
    /* ⚠️ ההנחיה נשארת על המסך ורק מתעמעמת. ילד שמסתבך באמצע השלב
       צריך למצוא אותה שם — הודעה שנעלמת אחרי שתי שניות עוזרת רק
       למי שכבר הבין. */
    if (text) hintTimer = setTimeout(function () { el.hint.classList.add('fade'); }, 5000);
  }

  var lastTickSec = -1;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function hud(o) {
    if (o.score != null) el.score.textContent = Math.round(o.score);
    if (o.lives != null) {
      el.life.style.display = o.lives < 0 ? 'none' : '';
      el.life.textContent = o.lives > 0 ? new Array(o.lives + 1).join('💙') : '💔';
    }
    if (o.time != null) {
      var sec = Math.max(0, Math.ceil(o.time));
      el.time.textContent = sec;
      /* ⚠️⚠️ **ספירה לאחור נשמעת.**
         מונה שרק יורד על המסך לא יוצר שום מתח — הילד לא מסתכל
         עליו, הוא מסתכל על המשחק. עשר השניות האחרונות **חייבות**
         להישמע, ובחמש האחרונות הטיק נעשה גבוה וחד יותר.
         ⚠️ הטיק נורה רק כשהשנייה השלמה משתנה, לא בכל פריים —
         אחרת אלה 60 טיקים בשנייה. */
      if (sec !== lastTickSec) {
        if (running && sec > 0 && sec <= 10) snd(sec <= 5 ? 'tickHot' : 'tick');
        if (running && sec === 10) snd('warn');
        lastTickSec = sec;
      }
    }
    if (o.pct != null) el.meter.style.width = Math.max(0, Math.min(100, o.pct * 100)) + '%';
    if (o.goal != null) el.goal.textContent = o.goal;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function tools(list) {
    el.tools.innerHTML = '';
    (list || []).forEach(function (item) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'g3d-btn' + (item.warn ? ' warn' : '');
      b.textContent = item.label;
      b.onclick = function () { snd('click'); item.on(b); };
      el.tools.appendChild(b);
      item.el = b;
    });
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     9. מסכי בחירה, התחלה וסיום
     ══════════════════════════════════════════════════════════ */

  function starStr(n) {
    n = Math.max(0, Math.min(3, n | 0));
    return new Array(n + 1).join('★') + new Array(3 - n + 1).join('☆');
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function rateStars(ratio) {
    if (ratio >= 0.92) return 3;
    if (ratio >= 0.68) return 2;
    return 1;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function showLevels(gid) {
    stop();
    curGame = gid;
    var g = GAMES[gid];
    el.title.textContent = g.icon + ' ' + g.title;
    el.sub.textContent = '⭐ ' + frac(totalStars(), MAX_STARS);
    el.hud.style.display = 'none';
    el.end.classList.remove('on');
    el.panel.classList.remove('hide');
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var html = '<p class="g3d-lead">' + g.lead + '</p>' +
      '<p class="g3d-how">' + g.how + '</p>' +
      '<p class="g3d-learn">📚 <b>מה לומדים:</b> ' + g.learn + '</p>' +
      '<div class="g3d-levels">';
    g.levels.forEach(function (lv, i) {
      var open = isUnlocked(gid, i), s = starsFor(gid, i);
      var adv = i >= 5 ? ' ⚡' : '';
      html += '<button type="button" class="g3d-lv' + (open ? '' : ' lock') +
        '" data-lv="' + i + '"' + (open ? '' : ' disabled') + '>' +
        '<span class="n">' + (open ? (i + 1) : '🔒') + '</span>' +
        '<span class="t">' + lv.name + adv + '</span>' +
        '<span class="s">' + starStr(s) + '</span></button>';
    });
    html += '</div>';
    el.panel.innerHTML = html;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    Array.prototype.forEach.call(el.panel.querySelectorAll('.g3d-lv'), function (b) {
      b.onclick = function () {
        snd('click');
        start(gid, parseInt(b.getAttribute('data-lv'), 10));
      };
    });
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function finish(win, score, ratio) {
    if (!running) return;
    running = false;
    var g = GAMES[curGame];
    var st = win ? rateStars(ratio == null ? 1 : ratio) : 0;
    if (win) {
      setStars(curGame, curLevel, st);
      snd(st >= 3 ? 'levelUp' : 'win');
      /* כל כוכב נשמע בנפרד — שלושה כוכבים הם שלושה אירועים */
      if (global.CBY_SND && global.CBY_SND.starSeq) {
        setTimeout(function () { global.CBY_SND.starSeq(st); }, 420);
      }
      say(st >= 3 ? 'מצוין! שלושה כוכבים!' : 'כל הכבוד, עברתם את השלב!');
    } else {
      snd('lose');
      say('כמעט. נסו שוב.');
    }

    el.endTitle.textContent = win
      ? (curLevel + 1 === g.levels.length ? 'סיימתם את כל השלבים! 🏆' : 'שלב הושלם! 🎉')
      : 'כמעט! נסו שוב 🐢';
    el.endStars.textContent = starStr(st);
    el.endScore.textContent = 'ניקוד: ' + ltr(String(Math.round(score)));
    el.endFact.textContent = '💡 ' + g.fact;
    el.end.classList.add('on');
    el.root.querySelector('#g3d-next').disabled = !win || curLevel + 1 >= g.levels.length;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    if (win && global.CBY && global.CBY.addStars) {
      try { global.CBY.addStars(Math.max(1, st) * 2); } catch (e) { }
    }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function stop() {
    running = false;
    G = null;
    if (global.CBY_SND && global.CBY_SND.sceneStop) global.CBY_SND.sceneStop();
    if (el.brief) el.brief.classList.remove('on');
    clearFx();
    stopVoice();
    if (scene) { while (scene.children.length) scene.remove(scene.children[0]); }
    if (el.tools) el.tools.innerHTML = '';
    if (el.msg) el.msg.textContent = '';
    if (el.hint) el.hint.textContent = '';
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function newScene(world) {
    scene = new TH.Scene();
    if (world === 'night-beach') {
      scene.add(skyDome(0x0d2340, 0x2b4670));
      scene.add(starField(260, 160));
      /* ⚠️⚠️ **שמיים ריקים = מסך ריק.**
         שני שלישים מהמסך במשחק הלילי היו כחול כהה אחיד. כוכבים
         בגודל 0.9 במרחק 160 הם פחות מפיקסל — כלומר לא היו שם.
         ירח אינו קישוט: הוא הדבר היחיד שנותן לשמיים עומק, והוא
         גם **נכון לנושא** — אבקועים מוצאים את הים לפי האור מעל
         המים, וזה בדיוק מה שהמשחק מלמד. */
      /* ⚠️ fog:false הוא הדבר היחיד שחשוב כאן. MeshBasicMaterial
         מושפע מהערפל כברירת מחדל, ולכן הירח — במרחק 100 יחידות
         בתוך ערפל שמסתיים ב-130 — יצא **אפור-כחול**, כלומר כתם
         ולא ירח. */
      var moon = new TH.Mesh(new TH.SphereGeometry(4.0, 22, 18),
        new TH.MeshBasicMaterial({ color: 0xfdfaef, fog: false }));
      moon.position.set(-24, 30, -92);
      scene.add(moon);
      var halo = new TH.Sprite(new TH.SpriteMaterial({
        map: dotTexture(), color: 0xcfe2ff, transparent: true, opacity: 0.55,
        depthWrite: false, blending: TH.AdditiveBlending, fog: false
      }));
      halo.scale.setScalar(34);
      halo.position.copy(moon.position);
      scene.add(halo);
      scene.fog = new TH.Fog(0x22385e, 34, 130);
      lights(scene, 'night');
    } else if (world === 'day-beach') {
      scene.add(skyDome(0x4fb8e8, 0xdaf2fc));
      scene.fog = new TH.Fog(0x9fd2e8, 44, 160);
      lights(scene, 'day');
    } else if (world === 'reef') {
      scene.add(skyDome(0x2aa2cf, 0x073b56));
      scene.fog = new TH.Fog(0x0e5d81, 16, 62);
      lights(scene, 'sea');
    } else {
      scene.add(skyDome(0x1f8fc0, 0x05314a));
      scene.fog = new TH.Fog(0x0a5a80, 18, 86);
      lights(scene, 'sea');
    }
    return scene;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function countdown(done) {
    var n = 3;
    flash(ltr('3'), 700);
    snd('count');
    var iv = setInterval(function () {
      n--;
      if (n > 0) { flash(ltr(String(n)), 700); snd('count'); }
      else {
        clearInterval(iv);
        flash('יאללה! 🐢', 700);
        snd('go');
        done();
      }
    }, 800);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function start(gid, lv) {
    stop();
    curGame = gid; curLevel = lv;
    var g = GAMES[gid], L = g.levels[lv];
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    el.panel.classList.add('hide');
    el.end.classList.remove('on');
    el.hud.style.display = '';
    el.title.textContent = g.icon + ' ' + g.title;
    el.sub.textContent = 'שלב ' + ltr(String(lv + 1)) + ' · ' + L.name;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    newScene(g.world);
    resize();
    lastTickSec = -1;

    /* ⚠️ נוף קולי חי לכל אורך השלב: גלים במרווחים לא סדירים,
       ומדי פעם שחף בעולמות החוף. בלי זה המשחק **שקט** בין
       אירוע לאירוע, וזה מה שגורם לו להישמע לא גמור. */
    if (global.CBY_SND && global.CBY_SND.sceneStart) {
      global.CBY_SND.sceneStart(g.world === 'reef' || g.world === 'sea' ? 'sea' : 'beach');
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    G = BUILDERS[gid](L);
    lastT = performance.now() / 1000;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    running = false;
    renderer.render(scene, camera);
    hint(g.how);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* ⚠️⚠️ **תדריך לפני השלב — "שיהיה הסבר בהתחלה איך נראות
       עקבות של צב ים".**

       זו לא הערה על נוחות אלא על תוקף: משחק שמבקש לזהות עקבות
       בלי ללמד קודם מה מזהים הוא משחק ניחוש. אחרי שנוספו מסלולים
       מטעים, בלי התדריך הזה השלבים המתקדמים היו הופכים לתסכול
       במקום למיומנות.

       התדריך מוצג רק בשלב הראשון ובשלב שבו נכנסים מסיחים —
       ולא בכל פעם. חזרה על הסבר שכבר הובן היא מס. */
    var briefKey = 'cby-brief-' + gid;
    var seen = 0;
    try { seen = parseInt(global.localStorage.getItem(briefKey) || '0', 10) || 0; } catch (e) { }
    var needBrief = gid === 'eggs' && (lv === 0 || (lv === 1 && seen < 2));
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function go() {
      say(g.say);
      countdown(function () {
        lastT = performance.now() / 1000;
        running = true;
      });
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    if (needBrief) {
      try { global.localStorage.setItem(briefKey, String(seen + 1)); } catch (e) { }
      showBrief(lv > 0, go);
    } else go();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ציורי העקבות בתדריך — נבנים ב-CSS טהור, בלי תמונות */
  function trackPic(kind) {
    var h = '';
    var i;
    if (kind === 'turtle') {
      for (i = 0; i < 4; i++) {
        var y = 4 + i * 12;
        h += '<i style="width:9px;height:6px;border-radius:3px;left:8px;top:' + y + 'px"></i>';
        h += '<i style="width:9px;height:6px;border-radius:3px;right:8px;top:' + (y + 3) + 'px"></i>';
      }
      h += '<i style="width:10px;height:46px;left:26px;top:3px;background:#a88f61"></i>';
    } else if (kind === 'car') {
      h += '<i style="width:8px;height:46px;left:14px;top:3px"></i>';
      h += '<i style="width:8px;height:46px;right:14px;top:3px"></i>';
    } else if (kind === 'dog') {
      for (i = 0; i < 5; i++) {
        h += '<i style="width:7px;height:7px;border-radius:50%;left:' +
          (18 + (i % 2) * 16) + 'px;top:' + (4 + i * 9) + 'px"></i>';
      }
    } else {
      for (i = 0; i < 4; i++) {
        h += '<i style="width:8px;height:14px;border-radius:4px;left:' +
          (20 + (i % 2) * 14) + 'px;top:' + (4 + i * 12) + 'px"></i>';
      }
    }
    return h;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function showBrief(withDecoys, done) {
    var html = '<h4>🔎 איך מזהים עקבות של צב ים?</h4>' +
      '<div class="row good"><div class="pic">' + trackPic('turtle') + '</div>' +
      '<div class="tx"><b>✅ צב ים</b><span>שתי שורות טביעות <b>רחבות</b> וסימטריות, ' +
      'ובאמצע <b>חריץ גרירה רציף</b> של הבטן. החריץ האמצעי הוא הסימן — ' +
      'אף יצור אחר בחוף לא משאיר אותו.</span></div></div>';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    if (withDecoys) {
      html += '<div class="row"><div class="pic">' + trackPic('car') + '</div>' +
        '<div class="tx"><b>❌ רכב</b><span>שני פסים רציפים ורחבים, בלי טביעות בכלל.</span></div></div>' +
        '<div class="row"><div class="pic">' + trackPic('dog') + '</div>' +
        '<div class="tx"><b>❌ כלב</b><span>כפות קטנות ולא סימטריות, במרחק צר.</span></div></div>' +
        '<div class="row"><div class="pic">' + trackPic('human') + '</div>' +
        '<div class="tx"><b>❌ אדם</b><span>טביעות נעל מוארכות, שורה אחת מתחלפת.</span></div></div>';
    }

    html += '<div class="acts" style="display:flex;justify-content:center;margin-top:14px">' +
      '<button type="button" class="g3d-btn" id="brief-go">הבנתי, מתחילים ▶</button></div>';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    el.briefIn.innerHTML = html;
    el.brief.classList.add('on');
    say('עקבות של צב ים הן שתי שורות רחבות, ובאמצע חריץ גרירה. זה הסימן.');
    el.briefIn.querySelector('#brief-go').onclick = function () {
      snd('click');
      stopVoice();
      el.brief.classList.remove('on');
      done();
    };
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     10. המשחקים
     ══════════════════════════════════════════════════════════ */

  var BUILDERS = {};
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ---------- 10.1 מסע אל הים ----------

     ⚠️⚠️ **נכתב מחדש מול שלוש הערות שנמדדו:**

     "הוא הולך הפוך"  ➜ האבקוע פונה עכשיו אל ‑Z, לכיוון הים.
     "תעשה שהוא יוצא מהחול" ➜ השלב נפתח בקן: האבקוע מבצבץ מהחול,
                              חול מתעופף, והאחים קוראים לו.
     "ומעודדים אותו" ➜ אחים רצים לצידו ומריעים, ועידוד מופיע
                       על המסך בכל רבע דרך.
     "והוא הולך לים"  ➜ הים גלוי מהרגע הראשון כיעד, ומתקרב
                       באמת ככל שמתקדמים. */
  BUILDERS.hatch = function (L) {
    var LANE = 5.2;
    var s = {
      score: 0, lives: 3, dist: 0, time: L.time, sibs: 0,
      x: 0, hurt: 0, emerge: 0, cheer: 0
    };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var track = new TH.Group();
    scene.add(track);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var sand = sandPlane(17, 320, 0xb89a6c);
    sand.position.z = -110;
    track.add(sand);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* ⚠️ **הים תמיד גלוי — וזה מה שנותן לריצה מטרה.**
       בגרסה הקודמת הים הונח בקצה המסלול, מאות יחידות מאחורי
       הערפל, והילד רץ לתוך חושך בלי לראות לאן. עכשיו יש שני
       ימים: אחד "אופק" שנשאר תמיד לפנים, ואחד אמיתי שמתקרב
       באמת — וכשהוא ממלא את המסך, השלב נגמר. */
    var horizon = seaPlane(160, 120, 0x175f88, 0.95);
    horizon.position.set(0, 0.04, -118);
    scene.add(horizon);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var sea = seaPlane(80, 90, 0x2079a8, 0.96);
    sea.position.set(0, 0.06, -L.dist - 34);
    track.add(sea);
    var foam = foamLine(80);
    foam.position.set(0, 0.02, -L.dist + 10);
    track.add(foam);

    // הקן שממנו הוא יוצא
    var homeNest = nestModel(5);
    homeNest.position.set(0, 0.04, 2.4);
    homeNest.scale.setScalar(1.25);
    track.add(homeNest);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var player = chubbyModel(1.02);
    player.position.set(0, -0.55, 0);      // מתחיל מתחת לחול
    scene.add(player);
    var pShadow = contactShadow(0.55, 0.26);
    scene.add(pShadow);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* אחים שרצים לצידו ומעודדים */
    var buddies = [];
    [-1, 1].forEach(function (side) {
      var b = miniTurtle(0x8a5f34, 0x9be0a6, 0.6);
      b.position.set(side * 2.2, 0.26, 1.4);
      scene.add(b);
      buddies.push({ g: b, side: side, ph: Math.random() * 6 });
    });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var items = [], lamps = [], spawnZ = -16;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function addItem(type, x, z) {
      var m;
      if (type === 'sib') {
        m = miniTurtle(0x8a5f34, 0x9be0a6, 0.46);
        m.rotation.y = Math.PI;      // פונה אל השחקן, כאילו מחכה לו
      } else if (type === 'drop') {
        m = new TH.Mesh(new TH.SphereGeometry(0.26, 12, 10),
          mat(0x7fd8ff, { rough: 0.1, coat: 1, op: 0.85 }));
      } else if (type === 'wood') {
        m = new TH.Mesh(new TH.CylinderGeometry(0.30, 0.34, 2.8, 8), mat(0x7a5a3a, { rough: 1 }));
        m.rotation.z = Math.PI / 2;
        m.rotation.y = (Math.random() - 0.5) * 0.8;
      } else if (type === 'bottle') {
        m = trashModel(1);
        m.rotation.z = 1.4;
      } else if (type === 'chair') {
        m = new TH.Group();
        var seat = new TH.Mesh(new TH.BoxGeometry(1.2, 0.12, 1.1), mat(0x3f7fc0, { rough: 0.8 }));
        seat.position.y = 0.5;
        m.add(seat);
        var backr = new TH.Mesh(new TH.BoxGeometry(1.2, 0.9, 0.12), mat(0x3f7fc0, { rough: 0.8 }));
        backr.position.set(0, 0.95, 0.5);
        m.add(backr);
        [[-0.5, -0.45], [0.5, -0.45], [-0.5, 0.45], [0.5, 0.45]].forEach(function (p) {
          var lg = new TH.Mesh(new TH.CylinderGeometry(0.05, 0.05, 0.5, 6), mat(0xdddddd));
          lg.position.set(p[0], 0.25, p[1]);
          m.add(lg);
        });
      } else {
        m = new TH.Group();
        var hole = new TH.Mesh(new TH.CircleGeometry(1.0, 20), mat(0x8a7049, { rough: 1 }));
        hole.rotation.x = -Math.PI / 2;
        hole.position.y = 0.03;
        m.add(hole);
        var lip = new TH.Mesh(new TH.TorusGeometry(1.0, 0.11, 7, 20), mat(0xc7ab7c, { rough: 1 }));
        lip.rotation.x = Math.PI / 2;
        lip.position.y = 0.05;
        m.add(lip);
      }
      m.position.x = x;
      m.position.z = z;
      if (type !== 'pit') m.position.y = (type === 'drop') ? 0.5 : 0.34;
      track.add(m);
      items.push({ g: m, type: type, spin: type === 'drop' ? 2.4 : 0 });
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function addLamp(x, z) {
      var g = new TH.Group();
      var pole = new TH.Mesh(new TH.CylinderGeometry(0.09, 0.11, 4.2, 8), mat(0x555a60));
      pole.position.y = 2.1;
      g.add(pole);
      var arm = new TH.Mesh(new TH.CylinderGeometry(0.06, 0.06, 0.7, 6), mat(0x555a60));
      arm.rotation.z = Math.PI / 2;
      arm.position.set(-Math.sign(x) * 0.35, 4.2, 0);
      g.add(arm);
      var bulb = new TH.Mesh(new TH.SphereGeometry(0.40, 14, 12), flat(0xfff0b0));
      bulb.position.set(-Math.sign(x) * 0.68, 4.18, 0);
      g.add(bulb);
      var glow = new TH.Mesh(new TH.ConeGeometry(3.0, 4.6, 16, 1, true),
        new TH.MeshBasicMaterial({
          color: 0xffe9a0, transparent: true, opacity: 0.17,
          depthWrite: false, side: TH.DoubleSide
        }));
      glow.position.set(-Math.sign(x) * 0.68, 1.95, 0);
      glow.rotation.x = Math.PI;
      g.add(glow);
      g.position.set(x, 0, z);
      scene.add(g);
      lamps.push({ g: g, x: x, z: z });
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    for (var li = 0; li < L.lamps; li++) {
      addLamp((li % 2 ? 1 : -1) * (LANE + 1.8), -55 - li * (L.dist / (L.lamps + 1)));
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var CHEERS = ['קדימה! 🐢', 'יופי! ממשיכים!', 'הים קרוב!', 'אתם אלופים! ⭐'];
    var cheerAt = 0.25;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    hud({ score: 0, lives: 3, time: L.time, pct: 0, goal: '🐣 ' + frac(0, L.sibs) });

    return {
      step: function (dt, t) {
        /* ——— בקיעה: האבקוע מבצבץ מהחול ——— */
        if (s.emerge < 1) {
          s.emerge = Math.min(1, s.emerge + dt * 0.75);
          player.position.y = -0.55 + s.emerge * 0.89;
          player.rotation.x = (1 - s.emerge) * 0.5;
          player.scale.setScalar(0.84);
          pShadow.position.set(0, 0.03, 0);
          pShadow.material.opacity = 0.26 * s.emerge;
          if (s.emerge > 0.2 && Math.random() < dt * 9) {
            burst(new TH.Vector3((Math.random() - 0.5) * 0.8, 0.1, (Math.random() - 0.5) * 0.8),
              0xd8bc86, 3);
          }
          if (s.emerge >= 1) {
            flash('צאו לדרך! 🐣', 900);
            snd('hatch');
            say('האבקוע יצא! רוצים אל הים!');
          }
          if (s.emerge > 0.05 && s.emerge < 0.12) snd('sand');
          camera.position.set(0, 1.15, 3.4);
          camera.lookAt(0, 0.55, -3);
          hud({ time: L.time });
          return;
        }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        s.time -= dt;
        var sp = L.speed;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        var tx = s.x;
        if (input.down) tx = input.x * LANE;
        if (input.kL) tx -= dt * 9;
        if (input.kR) tx += dt * 9;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        /* משיכת האור — הלב של המשחק */
        lamps.forEach(function (lp) {
          var d = Math.abs(lp.z + s.dist);
          if (d < 17) {
            tx += (lp.x > 0 ? 1 : -1) * (1 - d / 17) * 5.5 * dt;
            if (d < 9 && Math.random() < dt * 1.4) hint('⚠️ האור מושך אותו! התרחקו');
          }
        });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        s.x += (tx - s.x) * Math.min(1, dt * 9);
        s.x = Math.max(-LANE, Math.min(LANE, s.x));
        player.position.x = s.x;
        player.position.y = 0.34 + Math.abs(Math.sin(t * 9)) * 0.08;
        player.rotation.x = 0;
        player.rotation.z = (tx - s.x) * -0.22;
        player.rotation.y = (tx - s.x) * 0.10;
        pShadow.position.set(s.x, 0.03, 0);
        swimTick(t, player, 12);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        buddies.forEach(function (b) {
          b.g.position.x = s.x + b.side * (1.9 + Math.sin(t * 1.4 + b.ph) * 0.35);
          b.g.position.y = 0.26 + Math.abs(Math.sin(t * 8 + b.ph)) * 0.09;
          b.g.position.z = 1.5 + Math.sin(t * 0.9 + b.ph) * 0.4;
          swimTick(t + b.ph, b.g, 11);
        });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        s.dist += sp * dt;
        track.position.z = s.dist;
        lamps.forEach(function (lp) { lp.g.position.z = lp.z + s.dist; });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        while (spawnZ + s.dist > -62) {
          spawnZ -= 4.6 + Math.random() * 4;
          var x = (Math.random() - 0.5) * LANE * 1.85;
          var r = Math.random();
          if (r < 0.30) addItem('sib', x, spawnZ);
          else if (r < 0.42) addItem('drop', x, spawnZ);
          else if (r < 0.42 + 0.16 * L.obst) addItem('wood', x, spawnZ);
          else if (r < 0.42 + 0.28 * L.obst) addItem('pit', x, spawnZ);
          else if (r < 0.42 + 0.36 * L.obst) addItem('bottle', x, spawnZ);
          else if (r < 0.42 + 0.44 * L.obst) addItem('chair', x, spawnZ);
        }

        for (var i = items.length - 1; i >= 0; i--) {
          var it = items[i];
          var wz = it.g.position.z + s.dist;
          if (it.spin) it.g.rotation.y += it.spin * dt;
          if (wz > 6) { track.remove(it.g); items.splice(i, 1); continue; }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

          if (Math.abs(wz) < 0.95 && Math.abs(it.g.position.x - s.x) < 1.0) {
            if (it.type === 'sib') {
              s.sibs++; s.score += 12;
              burst(new TH.Vector3(it.g.position.x, 0.6, 0), 0x9be0a6, 10);
              snd('collect');
            } else if (it.type === 'drop') {
              s.score += 5;
              burst(new TH.Vector3(it.g.position.x, 0.7, 0), 0x7fd8ff, 8);
              snd('collect');
            } else if (s.hurt <= 0) {
              s.lives--; s.hurt = 1.2; s.score = Math.max(0, s.score - 6);
              burst(new TH.Vector3(it.g.position.x, 0.5, 0), 0xff8a6a, 14);
              snd('hit');
              flash('אאוץ׳!', 600);
            }
            track.remove(it.g);
            items.splice(i, 1);
          }
        }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        if (s.hurt > 0) {
          s.hurt -= dt;
          player.visible = Math.floor(s.hurt * 14) % 2 === 0;
        } else player.visible = true;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        var pct = Math.min(1, s.dist / L.dist);
        if (pct >= cheerAt && cheerAt < 1) {
          flash(CHEERS[Math.min(CHEERS.length - 1, Math.round(cheerAt * 4) - 1)], 1100);
          snd('cheer');
          cheerAt += 0.25;
        }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        /* ⚠️ המצלמה הייתה 2.2 יחידות מעל הצב ורק 4.4 מאחוריו —
           זווית של 27° מלמעלה, ומזווית כזו רואים **רק את גב
           השריון**. הדמות שהילד מכיר נעלמה לגמרי.
           1.25 על 3.6 זו זווית של 19°: רואים את קימור השריון,
           את הראש שמבצבץ קדימה ואת המשוטים חותרים בצדדים. */
        /* ⚠️ גם ממצלמה נמוכה, מבט ישר מאחור מראה **רק** את כיפת
           השריון — הראש נמצא בצד השני שלה. הסטה לרוחב של 1.05
           הופכת את זה למבט שלושת-רבעי: רואים את קימור השריון, את
           הראש שמציץ מלפנים ואת המשוטים חותרים. זו הזווית
           הסטנדרטית במשחקי ריצה, ומאותה סיבה בדיוק. */
        camera.position.set(s.x * 0.45 + 0.34, 1.32, 3.5);
        camera.lookAt(s.x * 0.2 - 0.12, 0.58, -8.5);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        waveTick(sea, t, 0.26, 2.6);
        waveTick(horizon, t, 0.5, 1.4);
        foamTick(foam, t);
        if (Math.random() < dt * 0.35) snd('wave');
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        hud({
          score: s.score, lives: s.lives, time: s.time, pct: pct,
          goal: '🐣 ' + frac(s.sibs, L.sibs)
        });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        if (s.dist >= L.dist) {
          s.score += s.lives * 18 + Math.round(s.time) * 2;
          confetti(new TH.Vector3(s.x, 0.6, -1), 30);
          finish(true, s.score, (s.sibs / L.sibs) * 0.6 + (s.lives / 3) * 0.4);
        } else if (s.lives <= 0 || s.time <= 0) {
          finish(false, s.score, 0);
        }
      }
    };
  };

  /* ---------- 10.2 נקו את הים ----------

     ⚠️⚠️ **"לא מבין איך מנקים את הים במשחק" — וזו הייתה תלונה
     על עיצוב, לא על באג.**

     המכניקה עבדה: נגעת בפריט, הוא נאסף. אבל שום דבר על המסך לא
     אמר את זה. אין סימן מה לאסוף, אין סימן ממה להתרחק, האיסוף
     קרה בשקט, והצב פנה למצלמה בזמן שהוא שוחה הצידה.

     ארבעה שינויים, כל אחד מהם עונה על "איך אני יודע ש...":

       • **טבעת איסוף כחולה** סביב צאבי — רואים את הטווח.
       • **הפריט נשאב** אל הצב ומתכווץ לתוכו במקום להיעלם.
       • **סמן מרחף** מעל הפריט הקרוב ביותר — תמיד יש יעד.
       • **הצב פונה לכיוון השחייה** (3/4), ולא אל המצלמה. */
  BUILDERS.clean = function (L) {
    var s = { score: 0, lives: 3, got: 0, time: L.time, hurt: 0, x: 0, y: 0, face: 0 };
    var BX = 6.6, BY = 3.8, REACH = 1.25;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var beams = sunbeams(9, 26, 30);
    scene.add(beams);
    var bubbles = bubbleField(60, 28);
    scene.add(bubbles);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* חלקיקי אבק בזרם — מוסיפים עומק לשכבות המים */
    var motes = bubbleField(70, 30);
    motes.children.forEach(function (m) {
      m.material.color.setHex(0xdff4ff);
      m.material.opacity = 0.16;
      m.scale.setScalar(0.5);
      m.userData.sp *= 0.25;
    });
    scene.add(motes);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var floor = sandPlane(70, 70, 0x60644a);
    floor.position.y = -6.5;
    scene.add(floor);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var surface = seaPlane(80, 60, 0x3fb0d8, 0.28);
    surface.position.y = 7.4;
    scene.add(surface);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var deco = new TH.Group(), i;
    for (i = 0; i < 16; i++) {
      /* ⚠️ כל הסלעים היו באותו אפור בדיוק ובאותה צורה עגולה, ולכן
         נקראו כבועות מלט. גיוון גוון + כיווץ לא-אחיד בשלושת הצירים
         הופך סדרת כדורים לסדרת סלעים. */
      var rc = [0x6c7b70, 0x7a7f74, 0x5f6e69, 0x83836f][(Math.random() * 4) | 0];
      var rock = new TH.Mesh(new TH.SphereGeometry(0.4 + Math.random() * 0.9, 7, 5),
        mat(rc, { rough: 1, coat: 0.05 }));
      rock.scale.set(0.8 + Math.random() * 0.7, 0.4 + Math.random() * 0.35, 0.8 + Math.random() * 0.7);
      rock.rotation.set(Math.random(), Math.random() * 3, Math.random() * 0.4);
      rock.position.set((Math.random() - 0.5) * 34, -6.35, (Math.random() - 0.5) * 34);
      deco.add(rock);
    }
    /* ⚠️ עשב הים היה BoxGeometry ברוחב 0.1 — כלומר מקל ירוק.
       עלה אמיתי **מתחדד** כלפי מעלה ומתעקל. ConeGeometry פתוח עם
       שתי פאות בלבד נותן בדיוק את זה בעלות של מרובע אחד, והטיה
       אקראית בבסיס הופכת שדה מסודר לשדה. */
    /* ⚠️ עשב הים היה BoxGeometry ברוחב 0.1 — מקל ירוק. הניסיון
       השני (חרוט ברדיוס 0.14) יצא **חנית**: בסיס רחב וקצה מחודד.
       עלה של עשב ים הוא סרט דק שכמעט לא מתחדד. חרוט בשתי פאות
       הוא בדיוק סרט שטוח דו-צדדי, וברדיוס 0.055 הוא נקרא כעלה. */
    for (i = 0; i < 90; i++) {
      var bh = 0.9 + Math.random() * 1.5;
      var blade = new TH.Mesh(
        new TH.ConeGeometry(0.055, bh, 2, 1, true),
        mat(Math.random() < 0.35 ? 0x4fa36a : 0x387f52,
          { rough: 1, side: TH.DoubleSide }));
      blade.position.set((Math.random() - 0.5) * 30, -6.42 + bh / 2, (Math.random() - 0.5) * 30);
      blade.rotation.z = (Math.random() - 0.5) * 0.4;
      blade.rotation.y = Math.random() * 3;
      blade.userData.ph = Math.random() * 6;
      blade.userData.lean = blade.rotation.z;
      deco.add(blade);
    }
    scene.add(deco);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var player = chubbyModel(1.0);
    scene.add(player);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* טבעת האיסוף — הדבר היחיד שהופך "נגעתי" ל"אספתי" */
    var reach = new TH.Mesh(new TH.TorusGeometry(REACH, 0.055, 8, 34),
      new TH.MeshBasicMaterial({ color: 0x8fdcff, transparent: true, opacity: 0.55 }));
    scene.add(reach);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* סמן היעד — מרחף מעל הפריט הקרוב */
    var marker = new TH.Group();
    var arrow = new TH.Mesh(new TH.ConeGeometry(0.17, 0.34, 4),
      new TH.MeshBasicMaterial({ color: 0x7fe3c4 }));
    arrow.rotation.x = Math.PI;
    marker.add(arrow);
    marker.visible = false;
    scene.add(marker);

    var trash = [], jelly = [];
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function spawnTrash() {
      var k = (Math.random() * 4) | 0;
      var m = trashModel(k);
      /* ⚠️⚠️ **באג שדווח: "אי אפשר לאסוף פלסטיק ואי אפשר להיפגע
         מהמדוזות".** והוא היה אמיתי לגמרי.

         הפריטים נוצרו בעומק z בין ‑1.5 ל‑‑4, והשחקן שוחה במישור
         z=0. בדיקת ההתנגשות השתמשה ב-`distanceTo`, שהוא מרחק
         **תלת־ממדי** — ולכן גם כשהפריט והצב נראו חופפים לגמרי
         על המסך, המרחק האמיתי ביניהם היה 1.5 עד 4 יחידות, הרבה
         מעבר לטווח האיסוף (1.25). שום דבר לא נאסף ושום מדוזה
         לא עקצה, אף פעם.

         שני תיקונים יחד: הפריטים נוצרים כמעט באותו מישור
         (‑0.35..0.35), **וגם** ההתנגשות נבדקת בשני צירים בלבד.
         מה שנראה חופף על המסך — חופף גם בקוד. */
      m.position.set((Math.random() - 0.5) * BX * 2, (Math.random() - 0.5) * BY * 2,
        (Math.random() - 0.5) * 0.7);
      m.userData.ph = Math.random() * 6;
      scene.add(m);
      trash.push(m);
    }
    function spawnJelly() {
      var j = jellyModel();
      j.position.set((Math.random() - 0.5) * BX * 2, (Math.random() - 0.5) * BY * 2,
        (Math.random() - 0.5) * 0.7);
      j.userData.ph = Math.random() * 6;
      j.userData.vx = (Math.random() - 0.5) * 0.6 * L.drift;
      j.userData.vy = (Math.random() - 0.5) * 0.4 * L.drift;
      scene.add(j);
      jelly.push(j);
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    for (i = 0; i < L.trash; i++) spawnTrash();
    for (i = 0; i < L.jelly; i++) spawnJelly();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    camera.position.set(0, 0, 9.8);
    camera.lookAt(0, 0, 0);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    hud({ score: 0, lives: 3, time: L.time, pct: 0, goal: '🛍️ ' + frac(0, L.quota) });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    return {
      step: function (dt, t) {
        s.time -= dt;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        var tx = s.x, ty = s.y;
        if (input.down) { tx = input.x * BX; ty = input.y * BY; }
        if (input.kL) tx -= dt * 10;
        if (input.kR) tx += dt * 10;
        if (input.kU) ty += dt * 8;
        if (input.kD) ty -= dt * 8;
        tx = Math.max(-BX, Math.min(BX, tx));
        ty = Math.max(-BY, Math.min(BY, ty));
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        var k = Math.min(1, dt * 5.5);
        var vx = (tx - s.x);
        s.x += vx * k;
        s.y += (ty - s.y) * k;
        player.position.set(s.x, s.y, 0);

        /* ⚠️ **הצב פונה לכיוון השחייה.** הראש שלו ב‑Z שלילי, ולכן
           סיבוב של +90° סביב Y מפנה אותו שמאלה ו‑‑90° ימינה.
           כאן הזווית נעה ברציפות בין שני הצדדים לפי המהירות, כך
           שרואים גם את הפנים וגם את כיוון התנועה. */
        var want = Math.max(-1, Math.min(1, vx * 2.2));
        s.face += (want - s.face) * Math.min(1, dt * 4);
        player.rotation.y = Math.PI + s.face * 1.15;
        player.rotation.z = -vx * 0.2;
        swimTick(t, player, 6);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        reach.position.set(s.x, s.y, 0);
        reach.material.opacity = 0.40 + Math.sin(t * 3) * 0.16;
        reach.rotation.z += dt * 0.5;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        bubbleTick(bubbles, dt, 12);
        bubbleTick(motes, dt, 12);
        beamTick(beams, camera);
        deco.children.forEach(function (b) {
          if (b.userData.ph != null) b.rotation.z = (b.userData.lean || 0) + Math.sin(t * 1.1 + b.userData.ph) * 0.18;
        });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        /* פסולת — ⚠️ נשאבת אל הצב במקום להיעלם בשקט */
        var near = null, nearD = 1e9;
        for (i = trash.length - 1; i >= 0; i--) {
          var m = trash[i];
          if (m.userData.pull) {
            m.userData.pull += dt * 3.4;
            m.position.lerp(player.position, Math.min(1, dt * 11));
            m.scale.setScalar(Math.max(0.01, 1 - m.userData.pull));
            if (m.userData.pull >= 1) {
              scene.remove(m);
              trash.splice(i, 1);
              spawnTrash();
            }
            continue;
          }
          m.position.y += Math.sin(t * 0.8 + m.userData.ph) * dt * 0.5;
          m.rotation.z += dt * 0.5;
          m.rotation.y += dt * 0.3;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

          /* מרחק במישור המסך בלבד — ראו ההסבר ביצירת הפריטים */
          var d = Math.hypot(m.position.x - player.position.x,
                             m.position.y - player.position.y);
          if (d < nearD) { nearD = d; near = m; }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

          if (d < REACH) {
            m.userData.pull = 0.001;
            s.got++; s.score += 10;
            burst(m.position, 0xa8e6ff, 10);
            snd('collect');
            if (s.got === 1) hint('יופי! כל פריט פלסטיק בטבעת נאסף אליכם');
          }
        }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        if (near) {
          marker.visible = true;
          marker.position.set(near.position.x, near.position.y + 0.85 + Math.sin(t * 3) * 0.1, near.position.z);
        } else marker.visible = false;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        jelly.forEach(function (j) {
          j.position.x += j.userData.vx * dt * 3;
          j.position.y += j.userData.vy * dt * 3 + Math.sin(t * 1.3 + j.userData.ph) * dt * 0.7;
          if (j.position.x < -BX - 1 || j.position.x > BX + 1) j.userData.vx *= -1;
          if (j.position.y < -BY - 1 || j.position.y > BY + 1) j.userData.vy *= -1;
          j.scale.y = 1 + Math.sin(t * 2.4 + j.userData.ph) * 0.14;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

          var jd = Math.hypot(j.position.x - player.position.x,
                              j.position.y - player.position.y);
          if (s.hurt <= 0 && jd < 1.05) {
            s.lives--; s.hurt = 1.4; s.score = Math.max(0, s.score - 8);
            burst(j.position, 0xffa7cf, 14);
            snd('sting');
            flash('זו מדוזה אמיתית! 🪼', 900);
            hint('🪼 ורוד = מדוזה אמיתית. אל תיגעו בה!');
          }
        });

        if (s.hurt > 0) {
          s.hurt -= dt;
          player.visible = Math.floor(s.hurt * 14) % 2 === 0;
        } else player.visible = true;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        hud({
          score: s.score, lives: s.lives, time: s.time,
          pct: s.got / L.quota, goal: '🛍️ ' + frac(s.got, L.quota)
        });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        if (s.got >= L.quota) {
          s.score += Math.round(s.time) * 3 + s.lives * 15;
          confetti(player.position, 28);
          finish(true, s.score, (s.lives / 3) * 0.5 + Math.min(1, s.time / (L.time * 0.45)) * 0.5);
        } else if (s.lives <= 0 || s.time <= 0) {
          finish(false, s.score, 0);
        }
      }
    };
  };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ---------- 10.3 שחרור לים ---------- */
  BUILDERS.release = function (L) {
    var s = { score: 0, lives: 3, passed: 0, time: L.time, x: 0, y: 0, z: 0, hurt: 0 };
    var BX = 5.2, BY = 3.2;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var beams2 = sunbeams(8, 30, 34);
    scene.add(beams2);
    var bubbles = bubbleField(40, 30);
    scene.add(bubbles);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var floor = sandPlane(60, 320, 0x8f7d55);
    floor.position.set(0, -7.5, -130);
    scene.add(floor);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var surface = seaPlane(80, 320, 0x2a93c4, 0.35);
    surface.position.set(0, 7.5, -130);
    scene.add(surface);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var player = chubbyModel(1.05);
    scene.add(player);

    var gates = [], nets = [], gz = -22;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function addGate(z) {
      var g = new TH.Group();
      var ring = new TH.Mesh(new TH.TorusGeometry(L.gap, 0.16, 10, 30), mat(0x7fe3c4, { coat: 1 }));
      g.add(ring);
      var glow = new TH.Mesh(new TH.TorusGeometry(L.gap, 0.40, 8, 26),
        new TH.MeshBasicMaterial({ color: 0x7fe3c4, transparent: true, opacity: 0.22 }));
      g.add(glow);
      g.position.set((Math.random() - 0.5) * BX * 1.3, (Math.random() - 0.5) * BY * 1.3, z);
      scene.add(g);
      gates.push({ g: g, hit: false, glow: glow });
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function addNet(z, moving) {
      var g = new TH.Group();
      var w = 2.8 + Math.random() * 1.6, h = 2.4 + Math.random() * 1.4;
      var i, netMat = mat(0x54756a, { rough: 1 });
      for (i = 0; i <= 5; i++) {
        var v = new TH.Mesh(new TH.CylinderGeometry(0.038, 0.038, h, 5), netMat);
        v.position.x = -w / 2 + (w / 5) * i;
        g.add(v);
      }
      for (i = 0; i <= 4; i++) {
        var hh = new TH.Mesh(new TH.CylinderGeometry(0.038, 0.038, w, 5), netMat);
        hh.rotation.z = Math.PI / 2;
        hh.position.y = -h / 2 + (h / 4) * i;
        g.add(hh);
      }
      var buoy = new TH.Mesh(new TH.SphereGeometry(0.17, 10, 8), mat(0xe05a3c, { rough: 0.7 }));
      buoy.position.set(0, h / 2 + 0.2, 0);
      g.add(buoy);
      g.position.set((Math.random() - 0.5) * BX * 1.6, (Math.random() - 0.5) * BY * 1.4, z);
      g.userData.w = w; g.userData.h = h;
      g.userData.mv = moving ? (0.6 + Math.random() * 0.9) : 0;
      g.userData.ph = Math.random() * 6;
      scene.add(g);
      nets.push(g);
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var spacing = 15;
    for (var i2 = 0; i2 < L.gates; i2++) addGate(gz - i2 * spacing);
    for (var i3 = 0; i3 < L.nets; i3++) {
      addNet(gz - 7 - i3 * (L.gates * spacing / (L.nets + 1)), i3 < L.moving);
    }
    var endZ = gz - (L.gates - 1) * spacing - 16;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    hud({ score: 0, lives: 3, time: L.time, pct: 0, goal: '⭕ ' + frac(0, L.gates) });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    return {
      step: function (dt, t) {
        s.time -= dt;
        s.z -= L.speed * dt;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        var tx = s.x, ty = s.y;
        if (input.down) { tx = input.x * BX; ty = input.y * BY; }
        if (input.kL) tx -= dt * 11;
        if (input.kR) tx += dt * 11;
        if (input.kU) ty += dt * 9;
        if (input.kD) ty -= dt * 9;
        tx = Math.max(-BX, Math.min(BX, tx));
        ty = Math.max(-BY, Math.min(BY, ty));
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        var k = Math.min(1, dt * 6);
        s.x += (tx - s.x) * k;
        s.y += (ty - s.y) * k;
        player.position.set(s.x, s.y, s.z);
        /* שוחה אל ‑Z, ולכן פונה קדימה בלי סיבוב — הראש כבר שם */
        player.rotation.y = (tx - s.x) * -0.18;
        player.rotation.z = (tx - s.x) * -0.2;
        player.rotation.x = (ty - s.y) * -0.16;
        swimTick(t, player, 7);

        bubbleTick(bubbles, dt, 14);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        gates.forEach(function (gt) {
          gt.g.rotation.z += dt * 0.35;
          gt.glow.material.opacity = 0.18 + Math.sin(t * 2.6 + gt.g.position.z) * 0.08;
          if (!gt.hit && s.z < gt.g.position.z + 0.5 && s.z > gt.g.position.z - 0.9) {
            var d = Math.hypot(s.x - gt.g.position.x, s.y - gt.g.position.y);
            gt.hit = true;
            if (d < L.gap) {
              s.passed++; s.score += 20;
              burst(gt.g.position, 0x7fe3c4, 16);
              snd('gate');
            } else {
              flash('פספסתם שער', 620);
            }
          }
        });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        nets.forEach(function (n) {
          if (n.userData.mv) n.position.x = Math.sin(t * n.userData.mv + n.userData.ph) * BX * 0.9;
          if (s.hurt <= 0 && Math.abs(s.z - n.position.z) < 0.7) {
            if (Math.abs(s.x - n.position.x) < n.userData.w / 2 + 0.4 &&
                Math.abs(s.y - n.position.y) < n.userData.h / 2 + 0.4) {
              s.lives--; s.hurt = 1.4; s.score = Math.max(0, s.score - 10);
              burst(player.position, 0xff9a6a, 14);
              snd('hit');
              flash('רשת רפאים!', 850);
              hint('🕸️ רשת רפאים — רשת דיג נטושה. עקפו אותה!');
            }
          }
        });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        if (s.hurt > 0) {
          s.hurt -= dt;
          player.visible = Math.floor(s.hurt * 14) % 2 === 0;
        } else player.visible = true;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        camera.position.set(s.x * 0.5, s.y * 0.5 + 1.2, s.z + 7.5);
        camera.lookAt(s.x * 0.3, s.y * 0.3, s.z - 8);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        hud({
          score: s.score, lives: s.lives, time: s.time,
          pct: Math.min(1, s.z / endZ), goal: '⭕ ' + frac(s.passed, L.gates)
        });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        if (s.z <= endZ) {
          s.score += s.lives * 20 + Math.round(s.time) * 2;
          confetti(player.position, 30);
          finish(true, s.score, s.passed / L.gates);
        } else if (s.lives <= 0 || s.time <= 0) {
          finish(false, s.score, 0);
        }
      }
    };
  };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ---------- 10.4 שמרו על הקן ---------- */
  BUILDERS.fox = function (L) {
    /* ⚠️⚠️ **"נגמרו לי הגדרות, אין אני יכול עוד להגן על הביצים?"**

       שאלה מצוינת, והתשובה בגרסה הקודמת הייתה: לא — וזה היה
       תכנון שגוי. משחק שמגיע למצב שבו לשחקן **אין שום פעולה
       להשפיע בה** הוא משחק שנגמר בלי שהודיעו לו.

       שני תיקונים:

       1. **הגדר נטענת מחדש.** כל 14 שניות מתווספת גדר אחת (עד
          התקרה של השלב). כך אף פעם אין מצב של "נגמר", רק של
          "צריך לחכות" — וזה גם מלמד משהו נכון: גידור הוא משאב
          מוגבל שמתחדש, בדיוק כמו צוות מתנדבים.

       2. **תמיד יש פעולה זמינה.** לחיצה על טורף מבריחה אותו,
          והיא **בלתי מוגבלת**. זו הייתה תמיד ההגנה העיקרית, אבל
          שום דבר על המסך לא אמר את זה. עכשיו כתוב על הכפתור
          כמה זמן נשאר לגדר הבאה, וההנחיה חוזרת ומזכירה. */
    var s = {
      score: 0, eggs: L.eggs, time: L.secs, fences: L.fences,
      shield: 0, next: 1.6, scared: 0, recharge: 0
    };
    var FENCE_R = 2.9, FENCE_SECS = 7, RECHARGE = 14;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var beach = sandPlane(46, 46, 0x9c8258);
    scene.add(beach);

    var sea = seaPlane(70, 30, 0x14496b, 0.96);
    sea.position.set(0, 0.06, -23);
    scene.add(sea);
    var foam = foamLine(70);
    foam.position.set(0, 0.03, -8.6);
    scene.add(foam);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    for (var d = 0; d < 9; d++) {
      var dune = new TH.Mesh(new TH.SphereGeometry(3 + Math.random() * 3, 12, 8),
        mat(0x8f7449, { rough: 1 }));
      dune.scale.set(1.6, 0.34, 1);
      dune.position.set((Math.random() - 0.5) * 44, -0.9, 15 + Math.random() * 8);
      scene.add(dune);
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var nest = nestModel(L.eggs);
    nest.position.set(0, 0.05, 0);
    nest.scale.setScalar(1.7);
    scene.add(nest);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var guard = chubbyModel(0.85);
    guard.position.set(2.0, 0.35, 1.6);
    guard.rotation.y = 2.4;
    scene.add(guard);
    var gShadow = contactShadow(0.6, 0.22);
    gShadow.position.set(2.0, 0.03, 1.6);
    scene.add(gShadow);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* ⚠️ הגדר האמיתית — נבנית פעם אחת ורק מוצגת/מוסתרת. בנייה
       מחדש בכל הצבה הייתה יוצרת גמגום של פריים שלם בטלפון. */
    var fence = fenceRing(FENCE_R, 14);
    fence.visible = false;
    scene.add(fence);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var preds = [];
    function spawnPred() {
      var isDog = Math.random() < (L.dogs / (L.dogs + 4));
      var m = foxModel(isDog);
      var a = Math.random() * Math.PI * 2;
      var r = 11.5 + Math.random() * 3;
      m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      m.scale.setScalar(1.45);
      scene.add(m);
      preds.push({
        g: m, sp: (isDog ? 1.35 : 1.0) * L.speed * (0.85 + Math.random() * 0.4),
        flee: 0, dog: isDog
      });
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    camera.position.set(0, 7.4, 11.0);
    camera.lookAt(0, 0.4, 0.2);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var fenceBtn = null;
    function fenceLabel() {
      if (s.fences > 0) return '🚧 הציבו גדר ' + ltr('(' + s.fences + ')');
      return '🚧 גדר חדשה בעוד ' + ltr(Math.ceil(RECHARGE - s.recharge) + 'ש׳');
    }
    function refreshFenceBtn() {
      if (fenceBtn) {
        fenceBtn.textContent = fenceLabel();
        fenceBtn.disabled = s.fences <= 0 || s.shield > 0;
      }
    }

    tools([{
      label: fenceLabel(),
      warn: true,
      on: function (btn) {
        fenceBtn = btn;
        if (s.fences <= 0 || s.shield > 0) return;
        s.fences--;
        s.shield = FENCE_SECS;
        refreshFenceBtn();
        flash('הגדר הוצבה! 🚧', 900);
        hint('🚧 הגדר מגנה ' + ltr(FENCE_SECS + ' שניות') + '. בינתיים — המשיכו ללחוץ על הטורפים!');
        snd('good');
        say('הגדר הוצבה');
      }
    }]);
    fenceBtn = el.tools.querySelector('button');
    refreshFenceBtn();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    hud({ score: 0, lives: -1, time: L.secs, pct: 1, goal: '🥚 ' + frac(s.eggs, L.eggs) });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    return {
      step: function (dt, t) {
        s.time -= dt;
        s.next -= dt;
        if (s.shield > 0) s.shield -= dt;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        /* טעינת גדר מחדש — אף פעם לא נשארים בלי שום אפשרות */
        if (s.fences < L.fences) {
          s.recharge += dt;
          if (s.recharge >= RECHARGE) {
            s.recharge = 0;
            s.fences++;
            snd('good');
            flash('גדר חדשה זמינה! 🚧', 900);
          }
          refreshFenceBtn();
        } else if (s.recharge !== 0) { s.recharge = 0; refreshFenceBtn(); }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        fence.visible = s.shield > 0;
        if (fence.visible) {
          // הגדר "נבנית" בקפיצה קטנה ומתחילה להבהב לפני שנעלמת
          var grow = Math.min(1, (FENCE_SECS - s.shield) * 4);
          fence.scale.setScalar(0.6 + grow * 0.4);
          fence.visible = s.shield > 1.2 || Math.floor(s.shield * 6) % 2 === 0;
        }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        if (s.next <= 0) {
          spawnPred();
          s.next = L.rate * (0.7 + Math.random() * 0.6);
        }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        /* ⚠️ מגע = הברחה לפי **מרחק במסך**, לא Raycaster. אצבע של
           ילד אינה מדויקת כמו סמן עכבר, ובדיקה גאומטרית טהורה
           פספסה כמעט תמיד. */
        if (input.tapped) {
          input.tapped = false;
          var best = null, bestD = 0.24;
          preds.forEach(function (p) {
            if (p.flee > 0) return;
            var v = p.g.position.clone();
            v.y = 0.5;
            v.project(camera);
            var dd = Math.hypot(v.x - input.tapX, v.y - input.tapY);
            if (dd < bestD) { bestD = dd; best = p; }
          });
          if (best) {
            best.flee = 2.6;
            s.score += 15;
            s.scared++;
            burst(best.g.position, 0xffd98a, 12);
            snd('scare');
            if (s.scared === 1) hint('👏 יופי! לחיצה על טורף מבריחה אותו');
          } else {
            snd('tap');
            /* ⚠️ תזכורת: ההגנה העיקרית אינה הגדר אלא הלחיצה, והיא
               בלתי מוגבלת. שחקן שמפספס לחיצות חושב שנגמרו לו
               האמצעים, כשלמעשה הוא פשוט לא פגע. */
            hint('👆 לחצו ישירות על השועל — זו ההגנה העיקרית, והיא בלי הגבלה!');
          }
        }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        for (var i = preds.length - 1; i >= 0; i--) {
          var p = preds[i], g = p.g, dirx, dirz;
          if (p.flee > 0) { p.flee -= dt; dirx = g.position.x; dirz = g.position.z; }
          else { dirx = -g.position.x; dirz = -g.position.z; }
          var len = Math.hypot(dirx, dirz) || 1;
          dirx /= len; dirz /= len;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

          var sp = p.flee > 0 ? p.sp * 3.2 : p.sp * 2.4;
          g.position.x += dirx * sp * dt;
          g.position.z += dirz * sp * dt;
          /* הראש ב‑Z שלילי, ולכן הזווית היא atan2 של הכיוון ההפוך */
          g.rotation.y = Math.atan2(-dirx, -dirz);

          if (g.userData.legs) {
            g.userData.legs.forEach(function (l, li) {
              l.rotation.x = Math.sin(t * 11 + li * 1.6) * 0.55;
            });
          }
          if (g.userData.tail) g.userData.tail.rotation.y = Math.sin(t * 7) * 0.3;
          g.position.y = Math.abs(Math.sin(t * 11)) * 0.06;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

          var dn = Math.hypot(g.position.x, g.position.z);
          if (p.flee > 0 && dn > 16) { scene.remove(g); preds.splice(i, 1); continue; }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

          if (p.flee <= 0 && s.shield > 0 && dn < FENCE_R + 0.5) {
            p.flee = 2.6;
            burst(g.position, 0x7fe3c4, 10);
            snd('good');
            continue;
          }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

          if (p.flee <= 0 && dn < 1.4) {
            s.eggs--;
            s.score = Math.max(0, s.score - 12);
            burst(new TH.Vector3(0, 0.4, 0), 0xffe0b0, 16);
            snd('hit');
            flash('הוא לקח ביצה! 🥚', 800);
            if (nest.userData.eggs && nest.userData.eggs[s.eggs]) {
              nest.userData.eggs[s.eggs].visible = false;
            }
            p.flee = 2.4;
          }
        }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        guard.position.y = 0.35 + Math.sin(t * 2) * 0.04;
        swimTick(t, guard, 3);
        waveTick(sea, t, 0.14, 1.8);
        foamTick(foam, t);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        hud({
          score: s.score, lives: -1, time: s.time,
          pct: s.eggs / L.eggs, goal: '🥚 ' + frac(s.eggs, L.eggs)
        });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        if (s.eggs <= 0) finish(false, s.score, 0);
        else if (s.time <= 0) {
          s.score += s.eggs * 25;
          confetti(new TH.Vector3(0, 0.8, 0), 32);
          finish(true, s.score, s.eggs / L.eggs);
        }
      }
    };
  };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ---------- 10.5 סריקת חופים ----------

     ⚠️⚠️ **נכתב מחדש מול "שהשחקן יהיה אדם שמחפש הסורק", "תשפר את
     הים וכיוון גלים" ו"שיהיה מהים אל החוף".**

     שלוש הערות, וכולן נכונות מבחינה מקצועית ולא רק ויזואלית:

       • את הקן מוצא **מתנדב**, לא צב. השחקן הוא עכשיו אדם עם
         כובע, אפוד וא-ת חפירה, שהולך על החול.
       • העקבות מתחילות **בקו המים** ועולות אל הקן — זה הכיוון
         שבו הנקבה עולה בלילה, וזה מה שמתנדב מחפש בבוקר.
       • הים למעלה עם גלים שנוסעים אל החוף וקו קצף נע, במקום
         מלבן תכלת שטוח שריחף מעל החול. */
  BUILDERS.eggs = function (L) {
    var A = L.area;
    var s = { score: 0, found: 0, digs: L.digs, time: L.time, x: 0, z: A * 0.2, moving: 0 };
    var SHORE = -A - 6;

    var beach = sandPlane(A * 3, A * 3, 0xc2a577);
    scene.add(beach);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var sea = seaPlane(A * 4, A * 2.4, 0x2a8fbe, 0.96);
    sea.position.set(0, 0.05, SHORE - A * 1.1);
    scene.add(sea);
    var foam = foamLine(A * 4);
    foam.position.set(0, 0.03, SHORE);
    scene.add(foam);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // דיונות מאחור — סוגרות את התמונה
    for (var dd = 0; dd < 7; dd++) {
      var dune = new TH.Mesh(new TH.SphereGeometry(3 + Math.random() * 2.5, 12, 8),
        mat(0xbda169, { rough: 1 }));
      dune.scale.set(1.7, 0.3, 1);
      dune.position.set((Math.random() - 0.5) * A * 3, -0.7, A * 1.15 + Math.random() * 3);
      scene.add(dune);
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var nests = [], i;
    for (var n = 0; n < L.nests; n++) {
      var nx = (Math.random() - 0.5) * A * 1.5;
      var nz = (Math.random() * 0.55 + 0.10) * A;
      nests.push({ x: nx, z: nz, found: false });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      turtleTrack(nx, nz);
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* ⚠️⚠️ **עקבות צב — וזה מה שכל המשחק בנוי עליו.**

       הסימן המזהה של צב ים אינו "טביעות בחול" אלא **שילוב** של
       שלושה דברים: שתי שורות טביעות סנפיר **רחבות** (כ‑80 ס"מ
       בין השורות), סימטריות זו מול זו, ובאמצע **חריץ גרירה רציף**
       של הפלסטרון — הבטן — שנגררת על החול.

       אף יצור אחר בחוף לא משאיר חריץ אמצעי כזה. זה בדיוק ההבדל
       שמתנדב לומד לזהות, ולכן זה גם מה שמפריד כאן בין המסלול
       האמיתי למסלולים המטעים. */
    function turtleTrack(nx, nz) {
      var steps = 22, i;
      for (i = 0; i <= steps; i++) {
        var u = i / steps;
        var px = nx * u + (Math.random() - 0.5) * 0.4;
        var pz = SHORE * (1 - u) + nz * u;
        [-1, 1].forEach(function (side) {
          var tr = new TH.Mesh(new TH.CircleGeometry(0.24, 8),
            mat(0x9c8156, { rough: 1 }));
          tr.rotation.x = -Math.PI / 2;
          tr.rotation.z = Math.random() * 0.6 - 0.3;
          tr.scale.set(1, 1.6, 1);
          tr.position.set(px + side * 0.62, 0.03, pz + (side > 0 ? 0.25 : 0));
          scene.add(tr);
        });
        // חריץ הגרירה — הסימן שאין לאף יצור אחר
        if (i % 2 === 0) {
          var drag = new TH.Mesh(new TH.PlaneGeometry(0.5, 0.7), mat(0xa88f61, { rough: 1 }));
          drag.rotation.x = -Math.PI / 2;
          drag.position.set(px, 0.025, pz);
          scene.add(drag);
        }
      }
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* ⚠️ מסלולים מטעים. לכל אחד חתימה משלו, וכולם **חסרי** את
       חריץ הגרירה האמצעי — כך שילד שלמד את הסימן יכול לפסול
       אותם במבט, וילד שלא — יבזבז חפירות וילמד. */
    function decoyTrack(kind) {
      var ax = (Math.random() - 0.5) * A * 1.9;
      var bx = (Math.random() - 0.5) * A * 1.9;
      var az = SHORE + Math.random() * 3;
      var bz = (Math.random() * 0.9 + 0.05) * A;
      var steps = 24, i;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      for (i = 0; i <= steps; i++) {
        var u = i / steps;
        var px = ax + (bx - ax) * u + Math.sin(u * 7) * (kind === 'bird' ? 0.9 : 0.35);
        var pz = az + (bz - az) * u;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        if (kind === 'car') {
          /* רכב: שני פסים רציפים ורחבים, בלי טביעות בכלל */
          [-1, 1].forEach(function (side) {
            var tire = new TH.Mesh(new TH.PlaneGeometry(0.42, 1.1),
              mat(0x8f7a52, { rough: 1 }));
            tire.rotation.x = -Math.PI / 2;
            tire.position.set(px + side * 0.85, 0.028, pz);
            scene.add(tire);
          });
        } else if (kind === 'dog') {
          /* כלב: ארבע כפות קטנות, לא סימטריות, מרחק צר */
          for (var k = 0; k < 2; k++) {
            var paw = new TH.Mesh(new TH.CircleGeometry(0.13, 7),
              mat(0x9c8156, { rough: 1 }));
            paw.rotation.x = -Math.PI / 2;
            paw.position.set(px + (Math.random() - 0.5) * 0.55, 0.03,
                             pz + (Math.random() - 0.5) * 0.5);
            scene.add(paw);
          }
        } else if (kind === 'bird') {
          /* ציפור: טביעות זעירות עם שלוש אצבעות, קו מתפתל */
          var bird = new TH.Group();
          [-0.5, 0, 0.5].forEach(function (a) {
            var toe = new TH.Mesh(new TH.PlaneGeometry(0.05, 0.17),
              mat(0xa08a5e, { rough: 1 }));
            toe.rotation.x = -Math.PI / 2;
            toe.rotation.z = a;
            toe.position.set(a * 0.07, 0, 0);
            bird.add(toe);
          });
          bird.position.set(px, 0.03, pz);
          scene.add(bird);
        } else {
          /* אדם: טביעת נעל מוארכת, שורה אחת מתחלפת */
          var shoe = new TH.Mesh(new TH.PlaneGeometry(0.26, 0.62),
            mat(0x9c8156, { rough: 1 }));
          shoe.rotation.x = -Math.PI / 2;
          shoe.rotation.z = (Math.random() - 0.5) * 0.3;
          shoe.position.set(px + (i % 2 ? 0.26 : -0.26), 0.03, pz);
          scene.add(shoe);
        }
      }
    }

    var DECOYS = ['dog', 'bird', 'human', 'car', 'dog', 'human', 'bird', 'car'];
    for (var dc = 0; dc < (L.decoy || 0); dc++) decoyTrack(DECOYS[dc % DECOYS.length]);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var hero = humanModel(0x2f9e78, 0xe8b98d);
    hero.scale.setScalar(1.45);
    hero.position.set(0, 0, s.z);
    scene.add(hero);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* טבעת סריקה מתחת לרגליו — המד החם/קר */
    var ring = new TH.Mesh(new TH.TorusGeometry(1.35, 0.10, 8, 32),
      new TH.MeshBasicMaterial({ color: 0x7fe3c4, transparent: true, opacity: 0.85 }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    scene.add(ring);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    camera.position.set(0, A * 0.62, A * 1.05);
    camera.lookAt(0, 0.7, A * 0.02);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function nearest() {
      var best = 1e9, bi = -1;
      nests.forEach(function (nn, idx) {
        if (nn.found) return;
        var d = Math.hypot(nn.x - s.x, nn.z - s.z);
        if (d < best) { best = d; bi = idx; }
      });
      return { d: best, i: bi };
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var digAnim = 0;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function dig() {
      if (s.digs <= 0 || digAnim > 0) return;
      s.digs--;
      digAnim = 0.9;
      snd('sand');
      var nr = nearest();
      setTimeout(function () {
        if (nr.i >= 0 && nr.d < 1.6) {
          nests[nr.i].found = true;
          s.found++;
          s.score += 60;
          var nm = nestModel(8);
          nm.position.set(nests[nr.i].x, 0.06, nests[nr.i].z);
          nm.scale.setScalar(1.35);
          scene.add(nm);
          confetti(nm.position, 30);
          burst(nm.position, 0xfff0c8, 22);
          snd('found');
          flash('מצאתם קן! 🥚 ' + frac(s.found, L.nests), 1500);
          say('מצאתם קן! כל הכבוד!');
        } else {
          var hole = new TH.Mesh(new TH.CircleGeometry(0.55, 14), mat(0xa88b5c, { rough: 1 }));
          hole.rotation.x = -Math.PI / 2;
          hole.position.set(s.x, 0.04, s.z);
          scene.add(hole);
          s.score = Math.max(0, s.score - 4);
          flash(nr.d < 3.5 ? 'קרוב מאוד!' : 'כלום כאן…', 800);
        }
        toolsRefresh();
      }, 420);
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function toolsRefresh() {
      tools([{ label: '⛏️ חפרו ' + ltr('(' + s.digs + ')'), on: dig }]);
    }
    toolsRefresh();

    hud({ score: 0, lives: -1, time: L.time, pct: 0, goal: '🥚 ' + frac(0, L.nests) });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    return {
      step: function (dt, t) {
        s.time -= dt;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        var tx = s.x, tz = s.z;
        if (input.down) {
          tx = input.x * A * 1.15;
          tz = -input.y * A * 0.85 + A * 0.10;
        }
        if (input.kL) tx -= dt * A * 0.8;
        if (input.kR) tx += dt * A * 0.8;
        if (input.kU) tz -= dt * A * 0.7;
        if (input.kD) tz += dt * A * 0.7;
        tx = Math.max(-A * 1.2, Math.min(A * 1.2, tx));
        tz = Math.max(SHORE + 1.5, Math.min(A * 1.05, tz));
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        var k = Math.min(1, dt * 4.2);
        var ox = s.x, oz = s.z;
        s.x += (tx - s.x) * k;
        s.z += (tz - s.z) * k;
        var moved = Math.hypot(s.x - ox, s.z - oz);
        s.moving = moved > 0.004 ? 1 : 0;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        hero.position.set(s.x, 0, s.z);
        if (moved > 0.004) {
          /* הדמות פונה לכיוון ההליכה. הפנים ב‑Z שלילי. */
          hero.rotation.y = Math.atan2(-(s.x - ox), -(s.z - oz));
        }
        walkTick(hero, t, 7, s.moving);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        // אנימציית חפירה — הידיים והאת יורדים
        if (digAnim > 0) {
          digAnim -= dt;
          var u = 1 - Math.abs(digAnim - 0.45) / 0.45;
          if (hero.userData.spade) hero.userData.spade.rotation.z = 0.3 + u * 1.15;
          hero.userData.arms.forEach(function (a) { a.g.rotation.x = -u * 0.9; });
          if (hero.userData.hips) hero.userData.hips.rotation.x = u * 0.28;
          if (Math.random() < dt * 22) {
            burst(new TH.Vector3(s.x + (Math.random() - 0.5), 0.15, s.z - 0.6), 0xd8bc86, 3);
          }
        } else {
          if (hero.userData.spade) hero.userData.spade.rotation.z = 0.3;
          if (hero.userData.hips) hero.userData.hips.rotation.x = 0;
        }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        ring.position.set(s.x, 0.06, s.z);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        var nr = nearest();
        var heat = Math.max(0, 1 - nr.d / (A * 0.75));
        ring.material.color = new TH.Color().setHSL(0.55 - heat * 0.55, 0.85, 0.55);
        ring.scale.setScalar(1 + Math.sin(t * (3 + heat * 12)) * 0.07 * (0.4 + heat));
        ring.material.opacity = 0.55 + heat * 0.4;

        var label = heat > 0.88 ? 'לוהט! 🔥' : heat > 0.7 ? 'חם מאוד' :
                    heat > 0.5 ? 'חם' : heat > 0.3 ? 'פושר' : 'קר';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        // המצלמה עוקבת בעדינות
        camera.position.x += (s.x * 0.35 - camera.position.x) * Math.min(1, dt * 2);
        camera.lookAt(s.x * 0.2, 0.8, s.z - 1.5);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        waveTick(sea, t, 0.30, 2.0);
        foamTick(foam, t);
        if (Math.random() < dt * 0.3) snd('wave');
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        hud({
          score: s.score, lives: -1, time: s.time,
          pct: s.found / L.nests, goal: label + ' · 🥚 ' + frac(s.found, L.nests)
        });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

        if (s.found >= L.nests) {
          s.score += s.digs * 12 + Math.round(s.time) * 2;
          finish(true, s.score, s.digs / Math.max(1, L.digs - L.nests));
        } else if (s.time <= 0 || (s.digs <= 0 && digAnim <= 0)) {
          finish(false, s.score, 0);
        }
      }
    };
  };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     11. חידון צאבי — מסך מלא, קריינות ורצף
     ══════════════════════════════════════════════════════════

     דווח: "בחידון צאבי שיהיה מקצועי יותר וישמעו גם את צאבי".

     ⚠️ מה שהופך חידון ל"מקצועי" אינו עיצוב הכפתורים אלא שלושה
     דברים שהיו חסרים:

       1. **משוב מיידי ומנומק.** תשובה נכונה או שגויה מקבלת מיד
          הסבר קצר — אחרת החידון בודק זיכרון ולא מלמד כלום.
       2. **רצף (streak).** שלוש נכונות ברצף מכפילות ניקוד. זה
          מה שגורם לילד לרצות את השאלה הבאה.
       3. **קול.** צאבי מקריא את השאלה ואת ההסבר, ולכן גם ילד
          שקורא לאט משתתף באותו קצב.

     ⚠️ הכפתורים ננעלים לשנייה וחצי אחרי תשובה. בלי זה, ילד
     שלוחץ מהר "עונה" על השאלה הבאה בלי לראות אותה. */

  var QCSS = [
    '#cbyq{position:fixed;top:0;left:0;right:0;bottom:0;z-index:130;display:none;',
    'flex-direction:column;direction:rtl;color:#06283a;',
    'background:linear-gradient(180deg,#eaf7fc,#cfeaf5);',
    'height:100vh;height:100dvh;overflow:hidden;font-family:inherit;',
    '-webkit-tap-highlight-color:transparent}',
    '#cbyq.on{display:flex}',
    '#cbyq-bar{display:flex;align-items:center;gap:8px;',
    'padding:calc(env(safe-area-inset-top,0px) + 10px) 14px 10px;',
    'background:#0d3546;color:#fff;flex:0 0 auto}',
    '#cbyq-bar h3{margin:0;flex:1;font-size:clamp(15px,4.3vw,19px);font-weight:800}',
    '#cbyq-bar .sc{font-weight:800;color:#ffd98a;font-size:clamp(12px,3.4vw,14px);',
    'unicode-bidi:isolate}',
    '#cbyq-body{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;',
    'padding:14px 16px calc(env(safe-area-inset-bottom,0px) + 18px);',
    'display:flex;flex-direction:column;gap:12px;align-items:center}',
    '#cbyq-face{width:min(48vw,190px);height:min(38vw,150px);flex:0 0 auto;',
    'border-radius:20px;overflow:hidden;background:linear-gradient(180deg,#bfe9ff,#7fd0f0);',
    'box-shadow:0 8px 24px rgba(6,40,58,.18)}',
    '#cbyq-face canvas{display:block;width:100%;height:100%}',
    '#cbyq-prog{width:100%;max-width:560px;height:9px;border-radius:999px;',
    'background:rgba(6,40,58,.13);overflow:hidden}',
    '#cbyq-prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#1d8fb5,#7fe3c4);',
    'transition:width .25s}',
    '#cbyq-meta{width:100%;max-width:560px;display:flex;justify-content:space-between;',
    'font-size:clamp(11.5px,3.2vw,13px);font-weight:800;opacity:.72;unicode-bidi:isolate}',
    '#cbyq-q{width:100%;max-width:560px;font-size:clamp(16px,4.7vw,21px);font-weight:800;',
    'line-height:1.5;text-align:center;margin:2px 0 4px}',
    '#cbyq-opts{width:100%;max-width:560px;display:flex;flex-direction:column;gap:10px}',
    '.cbyq-opt{border:2px solid rgba(6,40,58,.12);background:#fff;border-radius:16px;',
    'padding:14px 16px;font:inherit;font-size:clamp(14px,4vw,16px);font-weight:700;',
    'text-align:right;cursor:pointer;color:#06283a;min-height:52px;',
    'touch-action:manipulation;transition:transform .12s,background .15s,border-color .15s}',
    '.cbyq-opt:active{transform:scale(.985)}',
    '.cbyq-opt.ok{background:#d8f7e6;border-color:#2fb37e}',
    '.cbyq-opt.no{background:#ffe1dc;border-color:#e0664c}',
    '.cbyq-opt.dim{opacity:.55}',
    '#cbyq-why{width:100%;max-width:560px;background:#fff;border-radius:16px;padding:13px 15px;',
    'font-size:clamp(12.5px,3.5vw,14px);line-height:1.6;box-shadow:0 6px 18px rgba(6,40,58,.1);',
    'display:none}',
    '#cbyq-why.on{display:block}',
    '#cbyq-why b{color:#12758f}',
    '#cbyq-acts{width:100%;max-width:560px;display:flex;gap:9px;justify-content:center;flex-wrap:wrap}',
    '.cbyq-btn{border:0;border-radius:14px;padding:12px 20px;font:inherit;font-weight:800;',
    'font-size:clamp(13px,3.7vw,15px);cursor:pointer;background:#12758f;color:#fff;',
    'min-height:46px;touch-action:manipulation}',
    '.cbyq-btn.ghost{background:rgba(6,40,58,.1);color:#06283a}',
    '#cbyq-streak{font-weight:800;color:#e07a1c;font-size:clamp(12px,3.4vw,14px);',
    'min-height:20px;unicode-bidi:isolate}',

    /* כרטיס הלימוד — צהוב-חם, כדי שייקרא כ"רגע לפני" ולא כתשובה */
    '#cbyq-teach{width:100%;max-width:560px;border-radius:18px;padding:15px 17px;',
    'background:linear-gradient(135deg,#fff6e2,#ffeccb);border:1px solid #f0c987;',
    'box-shadow:0 6px 20px rgba(150,100,20,.12);display:none;',
    'font-size:clamp(13px,3.7vw,15px);line-height:1.7}',
    '#cbyq-teach.on{display:block;animation:cbyqIn .3s ease}',
    '#cbyq-teach .tt{font-weight:900;color:#a6641a;display:block;margin-bottom:5px;',
    'font-size:clamp(13px,3.7vw,15px)}',
    '@keyframes cbyqIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',

    /* בורר המסלול */
    '#cbyq-pick{width:100%;max-width:560px;display:none;flex-direction:column;gap:12px}',
    '#cbyq-pick.on{display:flex;animation:cbyqIn .3s ease}',
    '.cbyq-track{border:2px solid rgba(6,40,58,.12);background:#fff;border-radius:18px;',
    'padding:16px 18px;font:inherit;text-align:right;cursor:pointer;color:#06283a;',
    'box-shadow:0 6px 18px rgba(6,40,58,.08);touch-action:manipulation}',
    '.cbyq-track:active{transform:scale(.985)}',
    '.cbyq-track b{display:block;font-size:clamp(15px,4.4vw,18px);font-weight:900}',
    '.cbyq-track span{display:block;color:#3d5a68;font-size:clamp(12px,3.4vw,13.5px);',
    'margin-top:3px;line-height:1.6}'
  ].join('');
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var qel = {}, qState = null, qFace = null;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* 40 שאלות — כל אחת עם הסבר. ⚠️ ההסבר הוא העיקר: חידון בלי
     הסבר הוא מבחן, וחידון עם הסבר הוא שיעור. */
  /* ══════════════════════════════════════════════════════════
     ⚠️⚠️ מאגר שאלות החידון
     ══════════════════════════════════════════════════════════

     דווח: "כששואל מה זה דבר מסוים, שיתן קודם תקציר מה זה — שילמד,
     ואז הילד ידע מה לבחור".

     ⚠️ **וזו אבחנה נכונה לגמרי.** שאלה כמו «מה זו אריבדה?» מול ילד
     שלא שמע את המילה מעולם אינה שאלת ידע — היא **הגרלה**. הוא
     בוחר אקראית, לומד אפס, והמשוב אחרי התשובה מגיע מאוחר מדי:
     מי שניחש נכון לא יודע למה, ומי שטעה כבר הפסיק להקשיב.

     שאלה טובה בודקת **הבנה** של משהו שהוצג, לא זיכרון של מילה
     שלא הוצגה. לכן לכל שאלת מונח יש כאן שדה `teach` — כרטיס קצר
     שמוצג **לפני** התשובות, וצאבי מקריא אותו. הילד לומד, ואז
     בוחר מתוך ידיעה. זה הופך את החידון מבחינה ללימוד.

     מבנה כל שאלה:
       [0] השאלה
       [1] שלוש אפשרויות
       [2] אינדקס התשובה הנכונה
       [3] ההסבר שאחרי התשובה
       [4] כרטיס הלימוד שלפני התשובות (null = אין צורך)
       [5] מסלול: '' לשניהם · 'k' לילדים · 'a' למבוגרים ומדריכים
  */
  var QUESTIONS = [
    ['כמה מיני צבי ים יש בעולם?', ['שבעה', 'שלושים', 'מאה ועשרים'], 0,
     'שבעה מינים בלבד, וכולם נמצאים בסכנה כזו או אחרת.', null, ''],

    ['איך צבי ים נושמים?', ['בזימים', 'בריאות — אוויר מעל המים', 'דרך השריון'], 1,
     'צב ים הוא זוחל ונושם אוויר. לכן צב שנלכד ברשת מתחת למים עלול לטבוע תוך דקות.', null, ''],

    ['מה קובע אם יבקע זכר או נקבה?', ['גודל הביצה', 'טמפרטורת החול', 'עומק הקן'], 1,
     'המנגנון נקרא TSD. חול חם יוצר נקבות, חול קריר יוצר זכרים, והפרש של שתי מעלות משנה הכול.',
     'אצל רוב בעלי החיים המין נקבע בגנים. אצל צבי ים הוא נקבע **אחרי** ההטלה, לפי משהו בסביבה של הקן.', ''],

    ['כמה ביצים יש בערך בקן אחד?', ['כעשר', 'כמאה', 'כאלף'], 1,
     'בערך 100 ביצים בקן, ונקבה מטילה 3 עד 5 קינים בעונה אחת.', null, ''],

    ['כמה אבקועים שורדים עד לבגרות?', ['אחד מתוך אלף', 'מחצית', 'תשעה מכל עשרה'], 0,
     'רק אחד מתוך כאלף. לכן כל אבקוע שמגיע למים באמת חשוב.', null, ''],

    ['למה שקית ניילון מסוכנת לצב ים?', ['היא חדה', 'היא נראית כמו מדוזה', 'היא מריחה רע'], 1,
     'במים שקית נראית בדיוק כמו מדוזה, והצב בולע אותה.', null, ''],

    ['מה מספר הדיווח על צב ים בישראל?', ['100', '3639*', '106'], 1,
     'מוקד רשות הטבע והגנים — 3639*. שיחה אחת יכולה להציל קן שלם.', null, ''],

    ['אילו מינים מקננים בישראל?', ['חום וירוק', 'גלדי וניצי', 'זית וקמפ-רידלי'], 0,
     'צב ים חום (רוב הקינים) וצב ים ירוק, שנדיר הרבה יותר.', null, ''],

    ['כמה זמן נמשכת הדגירה בחול?', ['שבוע', 'כחודשיים', 'שנה'], 1,
     'בערך 45 עד 60 ימים, תלוי בטמפרטורת החול.', null, ''],

    ['למה אור בחוף מסוכן לאבקועים?', ['הוא מחמם', 'הוא מבלבל אותם והם זוחלים לכביש', 'הוא מסנוור דגים'], 1,
     'אבקוע הולך אל האופק הבהיר. תאורה בחוף בהירה מהים — ולכן הוא הולך לכיוון הלא נכון.', null, ''],

    ['מה זו רשת רפאים?', ['רשת דיג נטושה שממשיכה ללכוד', 'רשת להגנת קן', 'סוג של אצה'], 0,
     'רשת שאבדה בים וממשיכה ללכוד בעלי חיים שנים אחר כך.',
     'ביטוי מקצועי מעולם הדיג. הוא מתאר ציוד דיג שאיבד את בעליו — ולא הפסיק לעבוד.', ''],

    ['מה אוכל צב ים ירוק בוגר?', ['דגים', 'עשב ים ואצות', 'סרטנים'], 1,
     'הירוק הבוגר הוא צמחוני ורועה עשב ים, ובכך שומר על היער התת-ימי.', null, ''],

    ['איזה צב ים הוא הגדול בעולם?', ['הגלדי', 'הניצי', 'הזית'], 0,
     'הצב הגלדי. הגדול שנמדד שקל 916 קילוגרם.', null, ''],

    ['למה נראה שצב ים בוכה?', ['הוא עצוב', 'בלוטות מוציאות מלח', 'חול בעיניים'], 1,
     'בלוטות ליד העיניים מפרישות את עודפי המלח מהגוף.', null, ''],

    ['מה עושים כשמוצאים צב חלש בחוף?', ['מחזירים לים', 'מדווחים ל-3639* ולא נוגעים', 'נותנים לו מים'], 1,
     'צב חלש שמוחזר לים טובע. מדווחים, מצלים עליו ומחכים לפקח.', null, ''],

    ['כמה זמן חי צב ים?', ['חמש שנים', 'חמישים עד שמונים שנה', 'מאתיים שנה'], 1,
     'בערך 50 עד 80 שנה, והם מגיעים לבגרות רק אחרי 20 עד 30 שנה.', null, ''],

    ['מה זה קרפקס?', ['השריון העליון', 'השריון התחתון', 'הסנפיר'], 0,
     'הקרפקס הוא השריון העליון; התחתון נקרא פלסטרון.',
     'לצב ים יש שני שריונות — אחד מלמעלה ואחד מלמטה — ולכל אחד שם מקצועי משלו.', ''],

    ['לאן חוזרת נקבה להטיל ביצים?', ['לכל חוף', 'לחוף שבו היא בקעה', 'לחוף הקרוב לאזור המזון'], 1,
     'היא חוזרת לחוף שבו היא עצמה בקעה, לפעמים אחרי 25 שנה.', null, ''],

    ['מה זה TED ברשת דיג?', ['מכשיר מדידה', 'מדף מילוט לצבים', 'סוג של פיתיון'], 1,
     'Turtle Excluder Device — סורג שמפנה צבים אל פתח מילוט ומציל אלפים בשנה.',
     'ראשי תיבות באנגלית של התקן שמותקן בתוך רשת מכמורת. הוא נועד לפתור בעיה אחת: צב שנכנס לרשת ולא יכול לצאת לנשום.', ''],

    ['איפה נמצא מרכז ההצלה הארצי לצבי ים?', ['אילת', 'מכמורת', 'עכו'], 1,
     'במכמורת, ופועל מאז 1999. יותר מ-700 צבים טופלו בו.', null, ''],

    ['מה עושים עם קן שנמצא במקום מסוכן?', ['משאירים', 'מעבירים לחוות הדגרה', 'מכסים בבטון'], 1,
     'מעבירים אותו בשעות הראשונות אחרי ההטלה בלבד — אחר כך תזוזה הורגת את הביצים.', null, ''],

    ['מתי עונת ההטלה בישראל?', ['מאי–אוגוסט', 'דצמבר–פברואר', 'כל השנה'], 0,
     'ההטלה במאי עד אוגוסט, והבקיעה ביולי עד ספטמבר.', null, ''],

    ['מה מנווט צבי ים בים הפתוח?', ['הכוכבים', 'השדה המגנטי של כדור הארץ', 'זרמי אוויר'], 1,
     'הם חשים את השדה המגנטי — מצפן טבעי מובנה.', null, ''],

    ['למה רכב על החול מסוכן לקן?', ['הוא רועש', 'הוא מהדק את החול והאבקועים לא יוצאים', 'הוא מחמם'], 1,
     'החול הדחוס הופך למכסה, והאבקועים נלכדים מתחתיו.', null, ''],

    ['כמה זמן קיימים צבי ים על כדור הארץ?', ['אלף שנה', 'יותר ממאה מיליון שנה', 'מיליון שנה'], 1,
     'הם שחו לצד הדינוזאורים ושרדו את ההכחדה שחיסלה אותם.', null, ''],

    ['מה קורה כשאין מספיק צבי ים גלדיים?', ['יש יותר אצות', 'מדוזות מתרבות', 'הים מתחמם'], 1,
     'הגלדי אוכל מדוזות. בלעדיו אוכלוסיות המדוזות גדלות.', null, ''],

    ['מה זה אבקוע?', ['ביצה', 'צב שזה עתה בקע', 'צב בוגר'], 1,
     'אבקוע — צב ים בן יום, בגודל של כף יד ובמשקל של כ-20 גרם.',
     'בעברית יש מילה מיוחדת לגור של צב ים ביום הראשון שלו, והיא באה מהפועל לבקוע — לצאת מהביצה.', 'k'],

    ['כמה עמוק צולל צב גלדי?', ['עשרה מטרים', 'יותר מ-1,000 מטר', 'מאה מטרים'], 1,
     'יותר מ-1,300 מטר — עמוק יותר מכל זוחל אחר.', null, ''],

    ['מה עושים מתנדבים בסריקת בוקר?', ['שוחים', 'מאתרים עקבות של נקבה שעלתה בלילה', 'מאכילים צבים'], 1,
     'הם הולכים על החוף עם שחר, כשהעקבות מהים אל החוף עדיין ברורות.', null, ''],

    ['מה זה פלסטרון?', ['השריון התחתון', 'סנפיר אחורי', 'המקור'], 0,
     'הפלסטרון הוא השריון התחתון, הבטני.',
     'השריון של צב ים בנוי משני חלקים. כבר למדנו שהעליון נקרא קרפקס — ולתחתון יש שם משלו.', ''],

    ['במה משתמשת נקבה כדי לחפור את הקן?', ['בסנפירים האחוריים', 'במקור', 'בסנפירים הקדמיים'], 0,
     'בסנפירים האחוריים בלבד, לעומק של כחצי מטר.', null, ''],

    ['מה זו אריבדה?', ['סוג של אצה', 'עלייה המונית של נקבות לחוף באותו לילה', 'זרם ימי'], 1,
     'אלפי נקבות רידלי עולות יחד — הצפת טורפים שמגדילה את הישרדות הביצים.',
     'אריבדה היא מילה בספרדית שפירושה הגעה. חוקרים אימצו אותה כדי לתאר תופעה שקורית בחופים מסוימים באמריקה, ואף פעם לא בישראל.', ''],

    ['למה צב ניצי נמצא בסכנה חמורה?', ['בגלל ציד לשריון היפה שלו', 'כי אין לו מזון', 'בגלל הקור'], 0,
     'השריון שלו שימש לתכשיטים, וזה כמעט חיסל את המין.', null, ''],

    ['מה עושים אם רואים אבקוע זוחל לכביש?', ['מרימים ומחזירים לים', 'מדווחים ומאפשרים לו לזחול לכיוון הים', 'משאירים'], 1,
     'מדווחים ל-3639*. הזחילה עצמה חשובה — היא חורטת בו את זיהוי החוף.', null, ''],

    ['כמה נקבות צב חום מטילות באגן הים התיכון?', ['כ-2,500', 'כמיליון', 'כ-50'], 0,
     'כ-2,500 נקבות צב חום וכ-450 נקבות צב ים ירוק בלבד באגן כולו.', null, 'a'],

    ['מה זו פיברופפילומה?', ['מחלת גידולים נגיפית', 'סוג של אצה', 'פצע מרשת'], 0,
     'מחלת גידולים המקושרת לנגיף, ונפוצה יותר במים מזוהמים.',
     'מחלה שמופיעה אצל צבי ים בכל העולם. השם מורכב משתי מילים: פיברו — רקמת חיבור, ופפילומה — גידול שפיר.', 'a'],

    ['במה מזהים צב חום מצב ירוק?', ['במספר הלוחיות בצד השריון', 'בצבע העיניים', 'באורך הזנב'], 0,
     'לחום 5 זוגות לוחיות צד, לירוק 4 — וגם הראש של החום גדול בהרבה.', null, ''],

    ['מה קורה לקן שנחפר קרוב מדי לקו המים?', ['הוא מתקרר', 'הוא מוצף והביצים מתות', 'שום דבר'], 1,
     'הצפה הורגת את העוברים. לכן קן כזה מועבר לחוות הדגרה.', null, ''],

    ['מה שיעור הצבים שחוזרים לים אחרי שיקום במכמורת?', ['כ-70 אחוז', 'כ-10 אחוז', 'כ-99 אחוז'], 0,
     'כ-70 אחוז מהצבים שמגיעים למרכז מוחזרים לים.', null, 'a'],

    ['מה הדבר הפשוט ביותר שילד יכול לעשות למען צבי ים?', ['לגעת בהם בעדינות', 'לאסוף פסולת מהחוף', 'להאכיל אותם'], 1,
     'חצי שעה של איסוף פסולת מוציאה מהים בדיוק את מה שצב עלול לבלוע.', null, 'k'],

    /* ——— מסלול מבוגרים ומדריכים ——— */

    ['מהי טמפרטורת הציר (Pivotal) אצל צב חום?', ['כ-24 מעלות', 'כ-29 מעלות', 'כ-34 מעלות'], 1,
     'סביב 29 מעלות מתקבל יחס של חצי-חצי. מעל — נקבות, מתחת — זכרים.',
     'טמפרטורת הציר היא הטמפרטורה שבה בדיוק נוצרים זכרים ונקבות בשיעור שווה. היא הערך המרכזי שכל תוכנית ניהול קינים עובדת מולו.', 'a'],

    ['מה המשמעות של התחממות החופים ליחס המינים?', ['יותר זכרים', 'האוכלוסייה הופכת לנקבית ברובה', 'אין השפעה'], 1,
     'באתרים חמים כבר נמדדו מעל 90 אחוז נקבות. מחסור בזכרים הוא סיכון ארוך טווח לאוכלוסייה.', null, 'a'],

    ['מהו חלון הזמן להעברת קן בלי לפגוע בעוברים?', ['עד כ-12 שעות מההטלה', 'עד שבוע', 'בכל שלב'], 0,
     'אחרי שהעובר נצמד לדופן הביצה, סיבוב של הביצה קורע את הקרומים והעובר מת.',
     'העברת קן היא פעולה מקצועית עם חלון זמן צר מאוד. אחריו, אותה פעולה בדיוק הופכת מהצלה להריגה.', 'a'],

    ['מה מטרת תגי הסנפיר ותגי ה-PIT?', ['קישוט', 'זיהוי הפרט לאורך שנים', 'מעקב GPS'], 1,
     'תג מתכת על הסנפיר ושבב מתחת לעור מזהים את אותו פרט בכל עלייה לחוף — כך יודעים כמה קינים הטילה נקבה וכמה שנים חלפו.',
     'תגית זיהוי אינה משדרת שום דבר. היא רק מאפשרת לזהות שוב את אותו הפרט אם ייתפס או יעלה לחוף בעתיד — וזה מספיק כדי לבנות ממנו מחקר שלם.', 'a'],

    ['מה מודד משדר לוויין (PTT) שמודבק על שריון?', ['טמפרטורת גוף', 'מסלול תנועה ודפוסי צלילה', 'גיל'], 1,
     'המשדר משדר מיקום בכל עלייה לנשימה, ומכאן נבנים מסלולי הנדידה ואזורי המזון.', null, 'a'],

    ['איזה סוג קרס מפחית פגיעה בצבים בדיג ארוך-חכה?', ['קרס J', 'קרס עגול (Circle hook)', 'אין הבדל'], 1,
     'הקרס העגול נתפס בזווית הפה ולא נבלע, ולכן קל בהרבה לחלץ אותו והפגיעה הפנימית קטנה.', null, 'a'],

    ['מה זו הלם קור (Cold stunning)?', ['מחלה', 'שיתוק זמני מירידת טמפרטורת מים', 'סוג של הרעלה'], 1,
     'מתחת לכ-10 מעלות הצב מאבד את היכולת לשחות ולצוף, נסחף לחוף ועלול לטבוע או למות מדלקת ריאות.',
     'צב ים הוא בעל דם קר. טמפרטורת הגוף שלו היא טמפרטורת המים סביבו — ולכן ירידה חדה במים היא אירוע רפואי.', 'a'],

    ['באיזה נספח של אמנת CITES נמצאים כל מיני צבי הים?', ['נספח I', 'נספח II', 'הם לא באמנה'], 0,
     'נספח I — האיסור המחמיר ביותר. סחר בינלאומי מסחרי בהם ובמוצריהם אסור לחלוטין.',
     'CITES היא אמנה בינלאומית שמסדירה סחר במינים בסכנה. היא מחלקת מינים לנספחים לפי חומרת הסיכון, ונספח I הוא החמור ביותר.', 'a'],

    ['מה מצב אוכלוסיית הצב החום בים התיכון לפי IUCN?', ['תת-אוכלוסייה נפרדת בהערכה נפרדת', 'נכחדה', 'אינה מוערכת'], 0,
     'הצב החום הים תיכוני מוערך כתת-אוכלוסייה נפרדת, כי היא מבודדת גנטית מהאוכלוסייה האטלנטית.', null, 'a'],

    ['מה ההשפעה של הצללת חוות הדגרה על הקן?', ['אין השפעה', 'מורידה טמפרטורה ומגדילה שיעור זכרים', 'מייבשת את החול'], 1,
     'הצללה היא כלי ניהול ישיר ביחס המינים — מורידה את טמפרטורת הקן בכמעלה עד שתיים.', null, 'a'],

    ['איזה אורך גל של תאורת חוף פוגע פחות באבקועים?', ['כחול-לבן', 'ענבר או אדום', 'אין הבדל'], 1,
     'אבקועים רגישים בעיקר לאורכי גל קצרים. תאורת ענבר או אדום, נמוכה ומוסטת מהים, מפחיתה משמעותית את הבלבול.', null, 'a'],

    ['מה נמצא במחקרי בליעת פלסטיק לגבי אבקועים?', ['נדרשים עשרות פריטים כדי לסכן', 'כבר פריט אחד מעלה משמעותית את סיכון התמותה', 'פלסטיק עובר בלי נזק'], 1,
     'אצל אבקועים, בליעת פריט בודד כבר מעלה את הסיכון — מערכת העיכול קטנה וחסימה אחת מספיקה.', null, 'a'],

    ['מה המשמעות של חומת הגנה או קיר ים בחוף קינון?', ['משפרת את החוף', 'חוסמת את הגישה ומצמצמת שטח הטלה', 'מקררת את החול'], 1,
     'הקשחת חופים מונעת מנקבות להגיע לאזור היבש, ומצמצמת את רצועת החול שבה אפשר בכלל לקנן.', null, 'a'],

    ['מה עושים ראשית כשמגיע צב פצוע למרכז שיקום?', ['מאכילים', 'מייצבים — נוזלים, חימום מבוקר והערכה רפואית', 'מחזירים מיד למים'], 1,
     'צב שנחלש סובל כמעט תמיד מהתייבשות ומחוסר איזון. האכלה לפני ייצוב מסוכנת.', null, 'a'],

    ['מהי חשיבות המידע שנאסף בסריקת בוקר גם כשלא נמצא קן?', ['אין חשיבות', 'עקבות ללא קן (False crawl) הן נתון מחקרי', 'רק לסטטיסטיקה של מתנדבים'], 1,
     'עלייה שהסתיימה בלי הטלה מעידה על הפרעה בחוף — תאורה, מכשולים או דריכה — וזה בדיוק מה שצריך לתקן.',
     'לא כל עלייה של נקבה מסתיימת בהטלה. לפעמים היא עולה, מסתובבת וחוזרת לים בלי להטיל. למקרה הזה יש שם מקצועי ויש לו משמעות.', 'a']
  ];
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function qBuild() {
    if (qel.root) return;
    var st = document.createElement('style');
    st.textContent = QCSS;
    document.head.appendChild(st);

    var r = document.createElement('div');
    r.id = 'cbyq';
    r.innerHTML =
      '<div id="cbyq-bar">' +
      '<button type="button" class="cbyq-btn ghost" id="cbyq-close" style="background:rgba(255,255,255,.16);color:#fff">✖</button>' +
      '<h3>🧠 חידון צאבי</h3><span class="sc" id="cbyq-score"></span></div>' +
      '<div id="cbyq-body">' +
      '<div id="cbyq-face"><canvas id="cbyq-canvas"></canvas></div>' +
      '<div id="cbyq-prog"><i></i></div>' +
      '<div id="cbyq-meta"><span id="cbyq-count"></span><span id="cbyq-streak"></span></div>' +
      '<div id="cbyq-q"></div>' +
      '<div id="cbyq-pick"></div>' +
      '<div id="cbyq-teach"></div>' +
      '<div id="cbyq-opts"></div>' +
      '<div id="cbyq-why"></div>' +
      '<div id="cbyq-acts"></div>' +
      '</div>';
    document.body.appendChild(r);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    qel.root = r;
    qel.body = r.querySelector('#cbyq-body');
    qel.face = r.querySelector('#cbyq-canvas');
    qel.prog = r.querySelector('#cbyq-prog i');
    qel.count = r.querySelector('#cbyq-count');
    qel.streak = r.querySelector('#cbyq-streak');
    qel.q = r.querySelector('#cbyq-q');
    qel.teach = r.querySelector('#cbyq-teach');
    qel.pick = r.querySelector('#cbyq-pick');
    qel.opts = r.querySelector('#cbyq-opts');
    qel.why = r.querySelector('#cbyq-why');
    qel.acts = r.querySelector('#cbyq-acts');
    qel.score = r.querySelector('#cbyq-score');
    r.querySelector('#cbyq-close').onclick = qClose;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function qClose() {
    snd('click');
    stopVoice();
    if (qel.root) qel.root.classList.remove('on');
    if (global.CBY_3D && CBY_3D.stopFace) { try { CBY_3D.stopFace(); } catch (e) { } }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function qOpen() {
    qBuild();
    qel.root.classList.add('on');
    if (global.CBY_SND) global.CBY_SND.resume();
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* פרצוף צאבי בצד השאלה — ⚠️ "שישמעו גם את צאבי" הוא חצי; לראות
       אותו מדבר הוא החצי השני, ובלעדיו הקול נשמע כמו מכונה. */
    if (global.CBY_3D && CBY_3D.initFace) {
      try { CBY_3D.initFace(qel.face); } catch (e) { }
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    qPick();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     ⚠️⚠️ שני מסלולים — ילדים ומבוגרים
     ══════════════════════════════════════════════════════════

     דווח: "שיהיה גם לילדים וגם למבוגרים".

     ⚠️ הפתרון הגרוע הוא מאגר אחד מעורבב: ילד בן שבע שנופל על
     שאלה על טמפרטורת הציר מפסיק לשחק, ומדריך שמקבל "מה זה
     אבקוע" מפסיק להתייחס לזה ברצינות. אותו מאגר לא יכול לשרת
     את שניהם.

     שני מסלולים עם חפיפה: רוב השאלות מתאימות לשניהם, וכל צד
     מקבל גם את השאלות שהן שלו בלבד. כך אף אחד לא מקבל חידון
     קצר מדי, ואף אחד לא מקבל שאלה שאינה בשבילו. */
  function qPick() {
    qel.pick.classList.add('on');
    qel.q.textContent = 'למי החידון?';
    qel.teach.classList.remove('on');
    qel.opts.innerHTML = '';
    qel.why.classList.remove('on');
    qel.acts.innerHTML = '';
    qel.count.textContent = '';
    qel.streak.textContent = '';
    qel.prog.style.width = '0%';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var kidN = QUESTIONS.filter(function (q) { return q[5] !== 'a'; }).length;
    var admN = QUESTIONS.filter(function (q) { return q[5] !== 'k'; }).length;

    qel.pick.innerHTML = '';
    [['k', '🧒 לילדים', 'שאלות על צבי ים, החיים שלהם והדרך להציל אותם. לכל מונח חדש יש הסבר לפני השאלה.', kidN],
     ['a', '🎓 למבוגרים ולמדריכים', 'כולל ניהול קינים, טמפרטורת ציר, טלמטריה, לכידה אגבית, חקיקה ופרוטוקול פליטה.', admN]
    ].forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cbyq-track';
      b.innerHTML = '<b>' + t[1] + '</b><span>' + t[2] + ' · ' +
        ltr(String(t[3])) + ' שאלות במאגר</span>';
      b.onclick = function () { snd('press'); qStart(t[0]); };
      qel.pick.appendChild(b);
    });
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    qFaceTalk(true);
    say('למי החידון? לילדים, או למבוגרים ולמדריכים?');
    setTimeout(function () { qFaceTalk(false); }, 3200);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function qStart(track) {
    qel.pick.classList.remove('on');
    var pool = QUESTIONS.filter(function (q) {
      return track === 'k' ? q[5] !== 'a' : q[5] !== 'k';
    });
    for (var i = pool.length - 1; i > 0; i--) {
      var j = (Math.random() * (i + 1)) | 0, tmp = pool[i];
      pool[i] = pool[j]; pool[j] = tmp;
    }
    qState = {
      pool: pool.slice(0, 8), i: 0, ok: 0, score: 0,
      streak: 0, best: 0, locked: false, track: track
    };
    qNext();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function qFaceTalk(on) {
    if (global.CBY_3D && CBY_3D.setFaceTalking) {
      try { CBY_3D.setFaceTalking(on); } catch (e) { }
    }
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function qNext() {
    var st = qState;
    if (st.i >= st.pool.length) return qDone();
    var q = st.pool[st.i];
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    qel.why.classList.remove('on');
    qel.acts.innerHTML = '';
    qel.q.textContent = q[0];
    qel.count.textContent = 'שאלה ' + frac(st.i + 1, st.pool.length);
    qel.streak.textContent = st.streak >= 2 ? ('🔥 רצף ' + ltr(String(st.streak))) : '';
    qel.score.textContent = '⭐ ' + ltr(String(st.score));
    qel.prog.style.width = ((st.i / st.pool.length) * 100) + '%';
    st.locked = false;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    qel.opts.innerHTML = '';
    qel.teach.classList.remove('on');
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    function showOptions() {
      qel.opts.innerHTML = '';
      q[1].forEach(function (text, idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'cbyq-opt';
        b.textContent = text;
        b.onclick = function () { qAnswer(idx, b); };
        qel.opts.appendChild(b);
      });
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* ⚠️⚠️ **כרטיס הלימוד — לפני התשובות, לא אחריהן.**
       שאלה על מונח שהילד לא שמע מעולם היא הגרלה, לא שאלה. כאן
       הוא קודם מקבל הסבר קצר (וצאבי מקריא אותו), לוחץ «הבנתי»,
       ורק אז רואה את האפשרויות. ההבדל בין ניחוש ללמידה הוא
       חמש השניות האלה. */
    if (q[4]) {
      qel.teach.innerHTML = '<span class="tt">💡 רגע לפני — מה זה בכלל</span>' + q[4];
      qel.teach.classList.add('on');

      var go = document.createElement('button');
      go.type = 'button';
      go.className = 'cbyq-btn';
      go.textContent = 'הבנתי, לשאלה ✓';
      qel.acts.appendChild(go);
      go.onclick = function () {
        snd('press');
        qel.acts.innerHTML = '';
        showOptions();
      };
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      qFaceTalk(true);
      var line = q[0] + '. ' + String(q[4]).replace(/\*\*/g, '');
      say(line);
      setTimeout(function () { qFaceTalk(false); }, Math.min(11000, 1200 + line.length * 68));
    } else {
      showOptions();
      qFaceTalk(true);
      say(q[0]);
      setTimeout(function () { qFaceTalk(false); }, Math.min(6000, 900 + q[0].length * 75));
    }
    qel.body.scrollTop = 0;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function qAnswer(idx, btn) {
    var st = qState;
    if (st.locked) return;
    st.locked = true;
    var q = st.pool[st.i];
    var right = idx === q[2];
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    Array.prototype.forEach.call(qel.opts.children, function (b, i) {
      b.classList.add('dim');
      if (i === q[2]) { b.classList.add('ok'); b.classList.remove('dim'); }
    });
    if (!right) { btn.classList.add('no'); btn.classList.remove('dim'); }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    if (right) {
      st.ok++;
      st.streak++;
      st.best = Math.max(st.best, st.streak);
      /* ⚠️ מכפיל רצף — שלוש נכונות ברצף שוות כפול. זה מה שהופך
         "עוד שאלה" מחובה לרצון. */
      var mult = st.streak >= 3 ? 2 : 1;
      st.score += 10 * mult;
      snd(st.streak >= 3 ? 'correctBig' : 'correct');
    } else {
      st.streak = 0;
      /* ⚠️ לא 'sting'. צליל פגיעה חד על תשובה שגויה בחידון לימודי
         מלמד ילד שטעות היא עונש. צליל רך ויורד אומר «לא נורא,
         בוא נראה למה» — וזה בדיוק מה שההסבר שמופיע מיד אחריו
         עושה. */
      snd('wrongSoft');
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    qel.score.textContent = '⭐ ' + ltr(String(st.score));
    qel.streak.textContent = st.streak >= 2 ? ('🔥 רצף ' + ltr(String(st.streak))) : '';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    qel.why.innerHTML = (right ? '<b>נכון! ✅</b> ' : '<b>לא בדיוק. ❌</b> ') + q[3];
    qel.why.classList.add('on');
    qFaceTalk(true);
    say((right ? 'נכון! ' : 'לא בדיוק. ') + q[3]);
    setTimeout(function () { qFaceTalk(false); }, Math.min(8000, 1200 + q[3].length * 70));
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var nb = document.createElement('button');
    nb.type = 'button';
    nb.className = 'cbyq-btn';
    nb.textContent = st.i + 1 >= st.pool.length ? 'לסיכום ◀' : 'לשאלה הבאה ◀';
    nb.disabled = true;
    qel.acts.innerHTML = '';
    qel.acts.appendChild(nb);
    /* נעילה קצרה: ילד שלוחץ מהר "עונה" על השאלה הבאה בלי לראותה */
    setTimeout(function () { nb.disabled = false; }, 900);
    nb.onclick = function () { snd('click'); st.i++; qNext(); };
  }

  function qDone() {
    var st = qState;
    snd('quizDone');
    qel.q.textContent = 'סיימתם! ' + frac(st.ok, st.pool.length) + ' תשובות נכונות';
    qel.opts.innerHTML = '';
    qel.teach.classList.remove('on');
    qel.prog.style.width = '100%';
    qel.count.textContent = '';
    qel.streak.textContent = st.best >= 3 ? ('🔥 הרצף הטוב ביותר: ' + ltr(String(st.best))) : '';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var msg = st.ok === st.pool.length ? 'מושלם! אתם מומחי צבי ים 🏆'
            : st.ok >= st.pool.length - 2 ? 'כמעט מושלם! כל הכבוד 🎉'
            : st.ok >= st.pool.length / 2 ? 'יפה מאוד! עוד סבב ותשתפרו 💙'
            : 'התחלה טובה. נסו שוב — כל שאלה מלמדת משהו 🐢';
    qel.why.innerHTML = '<b>' + msg + '</b><br>ניקוד: ' + ltr(String(st.score)) + ' ⭐';
    qel.why.classList.add('on');
    snd(st.ok >= st.pool.length - 1 ? 'levelUp' : 'win');
    qFaceTalk(true);
    say(msg);
    setTimeout(function () { qFaceTalk(false); }, 3000);
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    if (global.CBY && global.CBY.addStars) {
      try { global.CBY.addStars(st.ok * 2); } catch (e) { }
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    qel.acts.innerHTML = '';
    var again = document.createElement('button');
    again.type = 'button';
    again.className = 'cbyq-btn';
    again.textContent = 'סבב נוסף 🔁';
    again.onclick = function () { snd('click'); qPick(); };
    var back = document.createElement('button');
    back.type = 'button';
    back.className = 'cbyq-btn ghost';
    back.textContent = 'חזרה';
    back.onclick = qClose;
    qel.acts.appendChild(again);
    qel.acts.appendChild(back);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ══════════════════════════════════════════════════════════
     12. ממשק ציבורי
     ══════════════════════════════════════════════════════════ */

  function open(gid) {
    build();
    if (gid === 'quiz') { qOpen(); return; }
    if (!GAMES[gid]) gid = ORDER[0];
    if (!initGL()) {
      alert('המכשיר הזה לא תומך בגרפיקת תלת-ממד 🐢 אפשר לשחק בחידון ולשוחח עם צאבי.');
      return;
    }
    el.root.classList.add('on');
    if (global.CBY_SND) global.CBY_SND.resume();
    setTimeout(resize, 30);
    if (!raf) raf = requestAnimationFrame(loop);
    showLevels(gid);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function close() {
    stop();
    if (el.root) el.root.classList.remove('on');
    cancelAnimationFrame(raf);
    raf = 0;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function progress() {
    var out = {}, gid;
    for (gid in GAMES) {
      var done = 0, st = 0;
      for (var i = 0; i < GAMES[gid].levels.length; i++) {
        var v = starsFor(gid, i);
        if (v > 0) done++;
        st += v;
      }
      out[gid] = { title: GAMES[gid].title, done: done, total: GAMES[gid].levels.length, stars: st };
    }
    out.totalStars = totalStars();
    out.maxStars = MAX_STARS;
    return out;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  global.CBY_G3D = {
    open: open,
    close: close,
    quiz: function () { build(); qOpen(); },
    levels: showLevels,
    progress: progress,
    say: say,
    GAMES: GAMES,
    ORDER: ORDER,
    OWNER: OWNER,
    FINGERPRINT: FINGERPRINT
  };
})(window);
