/* ==================================================================
   🐢 צאבי הצב — הדמות בתלת-ממד
   © כל הזכויות שמורות | דניאל אברהם חדאד / Daniel Avraham Haddad
   טביעת אצבע: CBY-T7R4L2E9
   ------------------------------------------------------------------
   ⚠️⚠️ **מה עושה דמות "חמודה" — וזה לא עניין של טעם.**

   הגרסה הקודמת הייתה צב מדויק: פרופורציות של בעל חיים אמיתי,
   עיניים בגודל סביר, אפודה. היא נראתה כמו צעצוע של מוזיאון —
   נכונה ולא אהובה.

   מה שמפעיל אצל בני אדם (וילדים במיוחד) תחושת חיבה נקרא
   "סכמת התינוק", והוא רשימה קצרה של יחסים:

     • ראש **גדול** ביחס לגוף — כאן 55% מרוחב הגוף, לא 30%
     • עיניים **ענקיות**, מרוחקות, ונמוכות במסגרת הפנים
     • אישון גדול + שני נצנוצים — עין עם נצנוץ אחד נראית מזוגגת
     • חוטם קטן ועגול, בלי לסת בולטת
     • גוף עגול בלי אף פינה חדה
     • גפיים קצרות ועבות
     • סומק על הלחיים

   ⚠️ **ומה שהופך אותו למיוחד ולא ל"עוד צב חמוד":** שני סימני זיהוי
   שהם רק שלו — כתם בצורת לב על השריון, וכוכב ים קטן בשם "נצנוץ"
   שיושב לו על הגב. ילד זוכר דמות לפי הדברים שאפשר לצייר מהזיכרון.

   ⚠️ **והתנועה חשובה כמו הצורה.** דמות שעומדת דוממת מתה, גם אם
   היא מעוצבת מושלם. כאן: נשימה, מצמוץ אקראי עם מצמוץ-כפול,
   הטיית ראש סקרנית, חתירה בסנפירים ובועות מהחוטם.
   ================================================================== */
(function (global) {
  'use strict';

  var TH = null;

  /* ——— במה ראשית ——— */
  var renderer = null, scene = null, camera = null, canvas = null, raf = 0;

  /* ——— במת הטיפול ——— */
  var careRenderer = null, careScene = null, careCam = null, careRaf = 0;

  /* ——— חלקי הדמות (הבמה הראשית) ——— */
  var rig = null;
  var bubbles = null;
  var noseBub = null, noseT = 0;
  var t0 = performance.now();
  var talking = false;
  var mood = 'happy';

  /* מצמוץ: תזמון אקראי, ולפעמים כפול — כמו עין אמיתית */
  var blinkAt = 1.5, blinkPhase = 0, doubleBlink = false;

  /* אירועים חד-פעמיים */
  var waveUntil = 0, hopUntil = 0, nodUntil = 0;

  /* ⚠️ ויזמות — צורות פה בסיסיות. [פתיחה, מתיחה לצדדים, עיגול]
     הסגירות (0,…) הן הקריטיות: בלי רגעים שבהם השפתיים נפגשות,
     הפה מרפרף ולא מדבר. ראו ההסבר המלא בלולאת האנימציה. */
  var VISEMES = [
    [0.00, 0.10, 0.00],   // מ/ב/פ — שפתיים סגורות
    [0.06, 0.00, 0.00],   // סגירה קצרה
    [0.85, 0.35, 0.00],   // אָ — פתוח רחב
    [0.55, 0.15, 0.00],   // אֶ
    [0.30, 0.90, 0.00],   // אִי — מתוח לצדדים
    [0.45, 0.00, 0.85],   // אוֹ — עגול
    [0.22, 0.00, 0.95],   // אוּ — עגול וצר
    [0.40, 0.55, 0.00],   // ש/ס
    [0.65, 0.20, 0.10]    // הברה פתוחה
  ];
  var visOpen = 0, visWide = 0, visRound = 0;
  var visTo = [0, 0, 0], visAt = 0;
  var lastRigT = 0;

  /* ⚠️⚠️ **פתיחת פה מונחית-מילה — הסנכרון האמיתי.**

     כשמנוע ההקראה מודיע שהוא מתחיל להגות מילה (אירוע onboundary
     ב-voice.js), הוא מעביר לכאן כמה לפתוח את הפה לפי אורך המילה.
     `wordUntil` מחזיק את הצורה הזו לזמן קצר, וכל עוד הוא פעיל הוא
     **גובר** על טבלת הוויזמות האקראית.

     כך מילה ארוכה פותחת פה רחב, מילה קצרה פותחת מעט, ובין מילים
     הפה נסגר — וזה בדיוק ההבדל בין "בובה שמרפרפת" ל"מישהו מדבר".
     כשהדפדפן לא יורה את האירוע, הערך פשוט נשאר 0 והוויזמות
     האקראיות ממשיכות כרגיל. */
  var wordOpen = 0, wordUntil = 0;

  function speakWord(amount) {
    wordOpen = Math.max(0, Math.min(1, amount || 0.5));
    wordUntil = (performance.now() - t0) / 1000 + 0.26;
  }

  /* ⚠️⚠️ **לאן צאבי מסתכל — וזה השינוי הקטן עם ההשפעה הגדולה.**
     דמות שמביטה ישר קדימה נראית כמו פסל. עיניים שעוקבות אחרי
     האצבע יוצרות תחושה שהוא **שם לב אליך** — וזה ההבדל בין
     אנימציה לחברות. כשאין מגע הוא מסתכל סביב מעצמו, לאט,
     כמו מישהו שמתעניין במה שקורה. */
  var gaze = { x: 0, y: 0, tx: 0, ty: 0, idleUntil: 0 };

  function lookAt(nx, ny) {
    gaze.tx = Math.max(-1, Math.min(1, nx));
    gaze.ty = Math.max(-1, Math.min(1, ny));
    gaze.idleUntil = (performance.now() - t0) / 1000 + 2.4;
  }

  function T() { return global.THREE; }

  function mat(color, opts) {
    opts = opts || {};
    return new TH.MeshPhysicalMaterial({
      color: color,
      roughness: opts.roughness != null ? opts.roughness : 0.55,
      metalness: opts.metalness != null ? opts.metalness : 0.0,
      clearcoat: opts.clearcoat != null ? opts.clearcoat : 0.18,
      clearcoatRoughness: opts.clearcoatRoughness != null ? opts.clearcoatRoughness : 0.55,
      transparent: !!opts.transparent,
      opacity: opts.opacity != null ? opts.opacity : 1
    });
  }

  function basic(color, opacity) {
    return new TH.MeshBasicMaterial({
      color: color,
      transparent: opacity != null && opacity < 1,
      opacity: opacity != null ? opacity : 1
    });
  }

  /* ——— לוח הצבעים ——— */
  var C = {
    skin:      0x86ca8b,   // ירוק מנטה רך — לא זיתי, לא ניאון
    skinDeep:  0x6aad74,
    /* ⚠️⚠️ **השריון קרא כלחמנייה.**
       הצבעים הקודמים (קרמל בהיר + לוחיות בהירות עוד יותר) נתנו
       הפרש בהירות של פחות מ-10% בין הכיפה ללוחיות. תחת תאורה רכה
       זה נעלם לגמרי, ומה שנשאר על המסך היה כיפה בז' חלקה — כלומר
       ביצה, לא צב.
       הפתרון אינו "עוד לוחיות" אלא **תפרים**: קווים כהים בין
       הלוחיות. בטבע זה בדיוק מה שהעין מזהה כשריון. */
    shell:     0xa2661f,   // ענבר-זית עמוק
    shellHi:   0xc78d3c,
    shellLow:  0x6b3d13,
    seam:      0x4a2a0d,   // התפר בין הלוחיות — הפרט שאומר "צב"
    belly:     0xf7e6c0,   // שמנת
    cheek:     0xff9fb0,
    eyeWhite:  0xfffdf7,
    iris:      0x5e3512,
    mouth:     0x8a3a2e,
    lip:       0x35201a,   // קו הפה — חום-פחם כהה, כמו קו מצויר
    maw:       0x2b1108,   // חלל הפה
    tongue:    0xe98c86,
    /* ⚠️ הכתום המקורי (0xf4762f) יצא, אחרי המרת הצבע של המנוע,
       באותה בהירות כמעט של השריון — והכוכב נעלם בתוכו. כוכב הים
       הוא סימן זיהוי, ולכן הוא חייב **ניגודיות**, לא רק גוון. */
    star:      0xdd4a12,   // "נצנוץ" — כוכב הים
    starHi:    0xf59152,
    heart:     0xfff4e2
  };

  /* ══════════════════════════════════════════════════════════
     בניית הדמות
     ═══════════════════════════════════════════════════════════ */
  function buildChubby(variant) {
    variant = variant || 'classic';
    if (!TH) TH = T();          // אפשר לבנות את הדמות גם בלי אתחול במה
    if (!TH) return null;

    var g = new TH.Group();
    var parts = { root: g };

    var skin = mat(C.skin, { roughness: 0.5, clearcoat: 0.45 });
    var skinDeep = mat(C.skinDeep, { roughness: 0.6 });
    /* ⚠️ clearcoat 0.75 על כיפה חלקה יצר כתם ספקולרי ענק בקודקוד:
       ראש השריון יצא **לבן**, והלוחיות שם נעלמו. שריון של צב הוא
       קרן מט, לא פלסטיק מצופה. */
    var shellMat = mat(C.shell, { roughness: 0.62, clearcoat: 0.18 });
    var shellHiMat = mat(C.shellHi, { roughness: 0.58, clearcoat: 0.15 });
    var shellLowMat = mat(C.shellLow, { roughness: 0.65, clearcoat: 0.3 });
    var bellyMat = mat(C.belly, { roughness: 0.7, clearcoat: 0.2 });

    /* ——— גוף ———
       ⚠️ הגרסה הראשונה קראה כ**ביצה**: הבטן הקרמית כיסתה כמעט את
       כל הצללית, והשריון — הדבר היחיד שאומר "צב" — נשאר מאחור.
       כאן הכיפה גבוהה יותר והבטן נמוכה וקטנה, כך שמלפנים רואים
       שלוש שכבות ברורות: שריון קרמל למעלה, שפה כהה באמצע,
       בטן שמנת למטה. */
    var body = new TH.Group();
    body.position.y = 0.55;
    g.add(body);
    parts.body = body;

    var belly = new TH.Mesh(new TH.SphereGeometry(0.74, 32, 24), bellyMat);
    belly.scale.set(1.28, 0.40, 1.14);
    belly.position.y = -0.17;
    body.add(belly);

    /* ——— ⚠️⚠️ השריון: **רחב ונמוך**, לא גבוה ———
       הכיפה הקודמת הייתה גבוהה כמעט כמו שהיא רחבה (1.04 מול 1.16),
       וכשראש גדול חוסם את מרכזה, מה שנשאר לעין הוא קשת גבוהה
       משני צידי הראש — כלומר **ביצה**.
       שריון של צב ים רחב פי שניים מגובהו. ברגע שמשטיחים אותו,
       הראש יושב לפניו במקום בתוכו, ושניהם נקראים כשני איברים
       נפרדים. */
    var dome = new TH.Mesh(
      new TH.SphereGeometry(0.80, 40, 26, 0, Math.PI * 2, 0, Math.PI * 0.56),
      shellMat
    );
    dome.scale.set(1.34, 0.80, 1.28);
    dome.position.y = 0.06;
    body.add(dome);

    /* ——— ⚠️⚠️ תפרי הלוחיות ———

       הגרסה הקודמת ניסתה "לוחיות": שישה כדורים שטוחים בגוון בהיר
       יותר, מונחים על הכיפה. בצילום המסך הם פשוט לא היו שם —
       הפרש הבהירות נבלע בתאורה הרכה, והשריון נקרא כלחמנייה בז'.

       כאן ההיגיון הפוך: **לא מוסיפים בליטות, מציירים תפרים.**
       קווים כהים דקים שרצים על פני הכיפה הם מה שהעין מזהה
       כשריון — בדיוק כמו בצב אמיתי, שבו הלוחיות חלקות והגבול
       ביניהן הוא קו כהה.

       שני תפרים אורכיים (משני צידי שורת החוליות המרכזית) ושלושה
       תפרים רוחביים חוצים אותם — יחד: רשת של לוחיות קריאה
       לחלוטין, בחמישה מש'ים בלבד. */
    var SHELL_R = 0.80, SHELL_SX = 1.34, SHELL_SY = 0.80, SHELL_SZ = 1.28, SHELL_Y = 0.06;

    function domePoint(theta, phi, lift) {
      var k = (lift == null ? 1.012 : lift);
      var sp = Math.sin(phi), cp = Math.cos(phi);
      return new TH.Vector3(
        sp * Math.sin(theta) * SHELL_R * SHELL_SX * k,
        cp * SHELL_R * SHELL_SY * k + SHELL_Y,
        sp * Math.cos(theta) * SHELL_R * SHELL_SZ * k
      );
    }

    var seamMat = new TH.MeshBasicMaterial({ color: C.seam });

    function seam(fn, steps, radius) {
      var pts = [];
      for (var i = 0; i <= steps; i++) pts.push(fn(i / steps));
      var curve = new TH.CatmullRomCurve3(pts);
      var m = new TH.Mesh(
        new TH.TubeGeometry(curve, steps * 2, radius || 0.0155, 6, false), seamMat);
      body.add(m);
      return m;
    }

    /* ⚠️ **טבעות אופקיות = כוורת.** הניסיון הראשון שם שלושה תפרים
       רוחביים שהקיפו את כל הכיפה. שלוש טבעות מקבילות על כיפה הן
       הצורה של כוורת קש או סלסלה, לא של שריון.
       תבנית של שריון צב היא **רדיאלית**: תפרים שיוצאים מהמרכז
       החוצה, ועליהם טבעת אחת בלבד שמפרידה בין לוחיות הצלעות
       ללוחיות השוליים. */
    /* ⚠️ תשעה תפרים שרצו מהקודקוד עד השוליים יצרו **כלוב**: רשת
       צפופה ואחידה שנקראת כסלסלת קש או כקסדה. שריון אמיתי בנוי
       מלוחיות **רחבות**, ומעט קווים.
       כאן: שתי טבעות שמגדירות דיסקה מרכזית וטבעת לוחיות סביבה,
       ושמונה תפרים קצרים רק **בין** הטבעות. סה"כ עשרה קווים,
       וכל לוחית גדולה מספיק כדי להיקרא כלוחית. */
    seam(function (u) { return domePoint(-Math.PI + u * Math.PI * 2, 0.72); }, 44, 0.016);
    seam(function (u) { return domePoint(-Math.PI + u * Math.PI * 2, 1.26); }, 44, 0.016);
    for (var ri = 0; ri < 8; ri++) {
      (function (th) {
        seam(function (u) { return domePoint(th, 0.72 + u * 0.54); }, 10, 0.014);
      })((Math.PI * 2 / 8) * ri + Math.PI / 8);
    }

    /* ——— שוליים משוננים ———
       הקצה המשונן הוא חלק מהצללית של צב ים, וצללית היא מה שקוראים
       קודם כול. */
    for (var mi = 0; mi < 20; mi++) {
      var mth = (Math.PI * 2 / 20) * mi;
      var mp = domePoint(mth, 1.54, 1.005);
      var marg = new TH.Mesh(new TH.SphereGeometry(0.115, 12, 10), shellMat);
      /* ⚠️ בגוון **בהיר יותר** אלה נקראו כשורת גלולות צהובות תפורות
         על השפה. תפקידן הוא הצללית בלבד — קצה משונן — ולכן הן
         בצבע השריון עצמו, רחבות מהמרווח ביניהן, וכמעט שטוחות. */
      marg.position.copy(mp);
      marg.scale.set(3.10, 0.30, 0.40);
      marg.rotation.y = mth;
      body.add(marg);
    }

    /* ⭐ סימן הזיהוי הראשון: כתם בצורת לב על השריון.
       ⚠️ קודם הוא ריחף 0.11 יחידות **לפני** פני הכיפה (y=0.80 אבל
       z=0.42 בעוד המשטח שם הוא z=0.31), ולכן נראה כמו פתק לבן
       תלוי באוויר. כאן הוא מונח על המשטח ומסובב לפי הנורמל. */
    var heartShape = new TH.Shape();
    heartShape.moveTo(0, -0.14);
    heartShape.bezierCurveTo(0.20, 0.04, 0.13, 0.20, 0, 0.11);
    heartShape.bezierCurveTo(-0.13, 0.20, -0.20, 0.04, 0, -0.14);
    var heart = new TH.Mesh(new TH.ShapeGeometry(heartShape), basic(C.heart, 0.95));
    heart.rotation.x = -0.999;
    heart.position.set(0, 0.523, 0.745);
    heart.scale.setScalar(1.20);
    body.add(heart);
    parts.heart = heart;

    // שפת השריון — הקו הכהה שמפריד בין השריון לבטן
    var rim = new TH.Mesh(new TH.TorusGeometry(1.0, 0.048, 12, 48), shellLowMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.055;
    rim.scale.set(1.053, 1.006, 1);
    body.add(rim);

    /* ——— ראש: גדול, נמוך, מוטה קדימה ——— */
    var head = new TH.Group();
    head.position.set(0, 0.54, 1.34);
    g.add(head);
    parts.head = head;

    /* ⚠️⚠️ **הראש היה קבור בתוך השריון.**
       הוא ישב ב-z=0.99 בעוד חזית הכיפה היא z=1.02 — כלומר צידי
       הראש היו **מאחורי** דופן השריון, ומה שנשאר גלוי היה רצועה
       אנכית צרה באמצע. זה מה שנקרא על המסך כ"ביצה ירוקה".
       כאן הראש יצא קדימה מעבר לקו השריון, וצוואר ארוך יותר מחבר
       ביניהם כך שזה לא נראה כמו ראש מרחף. */
    var neck = new TH.Mesh(new TH.SphereGeometry(0.30, 20, 16), skinDeep);
    neck.scale.set(0.95, 0.82, 1.95);
    neck.position.set(0, -0.06, -0.46);
    head.add(neck);

    /* ⚠️ הראש היה **ביצה ירוקה**: כדור ברדיוס 0.52 בקושי משוטח,
       שתלוי לפני השריון ויורד מתחת לקו הבטן. ראש של תינוק עגול
       ורחב, לא ארוך — ולכן כאן הוא נמוך יותר, רחב יותר מגובהו,
       ויושב **בתוך** קו הגוף ולא מתחתיו. */
    var skull = new TH.Mesh(new TH.SphereGeometry(0.44, 32, 26), skin);
    skull.scale.set(1.12, 0.86, 0.98);
    head.add(skull);

    // חוטם קטן ונמוך — בלי לסת בולטת
    var snout = new TH.Mesh(new TH.SphereGeometry(0.235, 20, 16), skin);
    snout.scale.set(0.98, 0.70, 0.78);
    snout.position.set(0, -0.155, 0.38);
    head.add(snout);
    parts.snout = snout;

    /* ⚠️ נחיריים ברדיוס 0.026 במרחק 0.144 זה מזה נקראו כזוג עיניים
       קטנות מתחת לעיניים האמיתיות. נחיר הוא חריץ, לא כדור. */
    /* ⚠️⚠️ **קשקשי ראש — נוסו והוסרו.**
       שני קווים אורכיים על הקודקוד וקו רוחבי מעל העיניים נראו
       במודל כמו קשקשי הראש של צב ים אמיתי. על המסך הם נקראו
       **ככובע מצחייה**: שני הקווים היו התפרים של הכיפה, והקו
       הרוחבי היה המצחייה.
       ⚠️ הכלל שחוזר כאן בפעם השלישית: קו סגור על משטח קמור נקרא
       כאובייקט נפרד שמונח עליו, לא כתבנית שעליו. */

    [-0.052, 0.052].forEach(function (x) {
      var n = new TH.Mesh(new TH.SphereGeometry(0.019, 8, 8), basic(0x2f5a3a));
      n.scale.set(0.85, 1.15, 0.6);
      n.position.set(x, -0.098, 0.575);
      head.add(n);
    });

    /* ——— עיניים ענקיות ——— */
    parts.eyes = [];
    [-0.222, 0.222].forEach(function (x) {
      var eye = new TH.Group();
      eye.position.set(x, 0.005, 0.330);
      head.add(eye);

      /* ⚠️⚠️ **ברק העין — הכתם הלבן שנראה כמו נגיסה.**
         החומר היה roughness 0.12 עם clearcoat מלא, כלומר כמעט
         מראה. אור מכוון על כדור כזה מייצר כתם ספקולרי **ענק**
         שנופל על גבול הקשתית ונקרא כחור בעין. הנצנוץ המכוון
         שלנו הלך לאיבוד לידו.
         כאן החומר עמום בהרבה, כך שהברק היחיד שרואים הוא זה
         שמוקם בכוונה. */
      var white = new TH.Mesh(new TH.SphereGeometry(0.200, 26, 20),
        new TH.MeshPhysicalMaterial({
          color: C.eyeWhite, roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.4
        }));
      white.scale.set(1, 1.04, 0.86);
      eye.add(white);

      /* ⚠️ קשתית ברדיוס 0.172 מול לובן 0.196 השאירה טבעת לבנה
         דקה מדי: העין נקראה כאישון ענק בתוך טבעת חומה, וזה נראה
         כמו עין חולה ולא כמו עין של תינוק. יחס נכון: לובן נראה,
         קשתית גדולה, אישון קטן ממנה בבירור. */
      var iris = new TH.Mesh(new TH.SphereGeometry(0.146, 22, 18),
        new TH.MeshPhysicalMaterial({ color: C.iris, roughness: 0.45, clearcoat: 0.3 }));
      /* ⚠️ קשתית גדולה יחסית ללובן — זה מה שהופך עין ל"עין של
         תינוק". לובן רחב מסביב לקשתית קטנה קורא כמבט מבוגר,
         ולפעמים כמבט מבוהל. */
      /* ⚠️⚠️ **הקשתית הייתה קבורה בתוך הלובן.**
         היא ישבה ב-z=0.098 בעוד פני הלובן ברוחב שלה נמצאים
         ב-z=0.118 — כלומר החלק החיצוני שלה בצבץ והשאר לא, והגבול
         בין השניים יצא **משונן**. על המסך זה נראה כמו עין סדוקה.
         כל אלמנט של העין חייב לשבת **לפני** פני הלובן בכל רוחבו,
         לא רק במרכז. */
      iris.position.z = 0.135;
      iris.scale.set(1, 1, 0.55);
      eye.add(iris);

      var pupil = new TH.Mesh(new TH.SphereGeometry(0.081, 16, 14), basic(0x140d07));
      pupil.position.z = 0.190;
      pupil.scale.set(1, 1, 0.45);
      eye.add(pupil);

      // ⚠️ **שני נצנוצים, לא אחד.** נצנוץ בודד קורא כהשתקפות על
      // זכוכית; שניים — אחד גדול למעלה ואחד קטן בצד הנגדי —
      // קוראים כלחות, וזה מה שעושה עין "חיה".
      var spark = new TH.Mesh(new TH.SphereGeometry(0.038, 14, 14), basic(0xffffff));
      // ⚠️ עומק הנצנוץ חושב לפי **פני** הכדור בנקודה הזו, לא לפי
      // מרכזו. הערך הקודם (0.188) היה גדול מרדיוס העין בנקודה
      // הזו (0.156), ולכן הנצנוץ ריחף באוויר לפני העין וקרא
      // כבועה לבנה מודבקת ולא כהשתקפות.
      /* ⚠️⚠️ הנצנוץ חייב להיות **לפני** האישון, לא אחריו.
      // הערך הקודם (z=0.150) היה מאחורי חזית האישון (0.198),
      // ולכן נראה רק החלק שבצבץ סביב הקשתית — שני חריצים לבנים
      // שנראו כמו נגיסות בעין ולא כהשתקפות. */
      spark.position.set(-0.056, 0.074, 0.243);
      eye.add(spark);

      var spark2 = new TH.Mesh(new TH.SphereGeometry(0.018, 10, 10), basic(0xffffff, 0.8));
      spark2.position.set(0.060, -0.056, 0.236);
      eye.add(spark2);

      // ⚠️ **אין כאן רשת של עפעף, ובכוונה.** הניסיון הראשון הוסיף
      // חצי כדור בצבע העור מעל העין; הוא נראה כל הזמן, קרא כקרן
      // או כגבה לבנה ענקית, והרס את הפנים. מצמוץ נעשה בכיווץ
      // גובה של העין עצמה — פשוט, נכון ובלי גאומטריה מיותרת.
      parts.eyes.push({ group: eye, iris: iris, pupil: pupil });
    });

    parts.brows = [];

    /* ——— ⚠️⚠️ הפה — נכתב מחדש בפעם השנייה, ובצדק ———

       דווח: "הפה של צאבי נורא, חשבתי שיפרת".

       צילום המסך הראה בדיוק מה קרה. הגרסה הקודמת בנתה שפתיים
       **תלת־ממדיות**: שתי קשתות טורוס עבות (רדיוס צינור 0.03)
       ושני כדורי פינה. במודל זה נשמע נכון. על המסך זה נראה כמו
       גוש מסטיק ורוד תקוע על הסנטר, וכדורי הפינה בלטו החוצה
       כמו שתי ניבים.

       ⚠️ **הטעות המושגית: פה של דמות חמודה אינו עצם, הוא ציור.**

       כל מסקוט מצויר — מפיקסאר ועד סנריו — מצייר את הפה כקו שטוח
       על פני הראש. ברגע שנותנים לו נפח משלו הוא הופך לאיבר נפרד
       שמודבק לפנים, וזה בדיוק מה שהעין קוראת כ"מכוער".

       הגרסה הזו:
         • **קו חיוך דק** (רדיוס צינור 0.013 במקום 0.03) שיושב על
           פני החוטם ולא מתחתיו — במנוחה זה כל מה שרואים.
         • **חלל כהה** שנפתח רק בדיבור, ונמתח בין קו החיוך לשפה
           התחתונה.
         • **בלי כדורי פינה ובלי "קשת קופידון"** — שניהם היו
           אובייקטים נפרדים שנקראו כפגמים, והקופידון אפילו נקרא
           כאף שני מתחת לאף האמיתי.
         • **לשון** שמופיעה רק בפתיחה רחבה באמת. */
    var lipMat = new TH.MeshBasicMaterial({ color: C.lip });

    /* ⚠️⚠️ **למה טורוס שטוח לא יכול לעבוד — ההסבר שחסר בפעמיים
       הקודמות.**

       גם גרסת "השפתיים התלת־ממדיות" וגם גרסת "קו החיוך הדק" בנו
       את הפה מקשת **מישורית** (טורוס) שהונחה מול החוטם. חוטם הוא
       כדור. קשת מישורית על כדור נוגעת בו רק בנקודה אחת: במרכז
       היא שקועה בתוך הבשר, ובקצוות היא מרחפת באוויר — ומה שנראה
       על המסך הוא צורה ורודה תלויה, לא פה.

       זו בדיוק הסיבה שהילד כתב "הפה נורא" גם אחרי התיקון.

       ⚠️ **הפתרון: הקו חייב לשכב על פני הכדור.**

       כאן קו הפה הוא TubeGeometry לאורך עקומה שכל נקודה בה מחושבת
       **על** האליפסואיד של החוטם. הוא נוגע בפנים לכל אורכו, נראה
       נכון מכל זווית, ואינו יכול לרחף או לשקוע. */
    var SN = { cy: -0.155, cz: 0.38, rx: 0.2303, ry: 0.1645, rz: 0.1833 };

    function snoutPoint(u, v, lift) {
      var k = (lift == null ? 1.022 : lift);
      var cv = Math.cos(v);
      return new TH.Vector3(
        SN.rx * Math.sin(u) * cv * k,
        SN.cy + SN.ry * Math.sin(v) * k,
        SN.cz + SN.rz * Math.cos(u) * cv * k
      );
    }

    // dir = +1 חיוך, -1 עצב.  קשת שמרכזה נמוך והקצוות שלה עולים.
    function mouthLine(dir) {
      var pts = [];
      for (var i = 0; i <= 22; i++) {
        var s = -1 + (2 * i) / 22;
        var u = s * 0.78;
        var v = (dir > 0 ? -0.52 : -0.20) + dir * 0.32 * s * s;
        pts.push(snoutPoint(u, v));
      }
      var m = new TH.Mesh(
        new TH.TubeGeometry(new TH.CatmullRomCurve3(pts), 44, 0.0145, 6, false), lipMat);
      head.add(m);
      return m;
    }

    var smile = mouthLine(1);
    var frown = mouthLine(-1);
    frown.visible = false;
    parts.lipBot = smile;
    parts.lipSad = frown;

    /* ——— ⚠️⚠️ **חלל הפה — נבנה מחדש כמשטח על הפנים** ———

       שלוש גרסאות נכשלו באותה טעות בדיוק: החלל היה **גוף נפרד**
       (כדור מכווץ) שהונח מול החוטם.
         · דחוף פנימה  → החלק העליון שלו נעלם מאחורי פני החוטם,
                          ובין קו החיוך לחלל נשארה רצועה ירוקה —
                          קו החיוך נקרא כשפם.
         · דחוף החוצה  → הקצוות ריחפו מול הפנים, והחלל נקרא
                          כאף ליצן מודבק.
       שתי התוצאות הן אותה בעיה: **משטח שטוח על כדור**.

       ⚠️ הפתרון היחיד שעובד: לא להניח צורה על הפנים, אלא לבנות
       משטח שכל קודקוד שלו יושב **על** האליפסואיד של החוטם.

       הרשת כאן נמתחת בין שתי עקומות:
         · העליונה — **בדיוק** עקומת קו החיוך, ולכן אין ולא יכול
           להיות רווח בין הקו לפתח.
         · התחתונה — אותה עקומה, מוסטת מטה בפתיחה שמתאפסת
           בפינות: (1 - s²). כך הפה נפתח באמצע והפינות נשארות
           במקומן — בדיוק כמו פה אמיתי, ולא כמו סדק שנפער לרוחב.

       העדכון בכל פריים הוא כתיבה של 161 קודקודים. זה כלום. */
    var MN = 22, MM = 6;
    var mawGeo = new TH.BufferGeometry();
    var mawPos = new Float32Array((MN + 1) * (MM + 1) * 3);
    var mawIdx = [];
    for (var jj = 0; jj < MM; jj++) {
      for (var ii = 0; ii < MN; ii++) {
        var i0 = jj * (MN + 1) + ii;
        mawIdx.push(i0, i0 + MN + 1, i0 + 1, i0 + 1, i0 + MN + 1, i0 + MN + 2);
      }
    }
    mawGeo.setIndex(mawIdx);
    mawGeo.setAttribute('position', new TH.BufferAttribute(mawPos, 3));

    var maw = new TH.Mesh(mawGeo, new TH.MeshBasicMaterial({
      color: C.maw, side: TH.DoubleSide
    }));
    maw.visible = false;
    head.add(maw);
    parts.maw = maw;

    parts.mawSet = function (amount, widthK) {
      var k = Math.max(0, Math.min(1, amount || 0));
      maw.visible = k > 0.03;
      if (!maw.visible) return;
      var wk = widthK || 1;
      var arr = mawPos, n = 0;
      for (var j2 = 0; j2 <= MM; j2++) {
        var tj = j2 / MM;
        for (var i2 = 0; i2 <= MN; i2++) {
          var sx = -1 + (2 * i2) / MN;
          var uu = sx * 0.78 * wk;
          var vTop = -0.52 + 0.32 * sx * sx;
          var vv = vTop - k * 0.55 * (1 - sx * sx) * tj;
          var pt = snoutPoint(uu, vv, 1.006);
          arr[n++] = pt.x; arr[n++] = pt.y; arr[n++] = pt.z;
        }
      }
      mawGeo.attributes.position.needsUpdate = true;
      mawGeo.computeBoundingSphere();
    };
    parts.mawSet(0);

    parts.tongue = null;
    parts.mouthGrp = null;

    parts.lipTop = null;
    parts.corners = [];
    parts.jaw = null;

    /* ——— לחיים ורודות ——— */
    parts.cheeks = [];
    [-0.345, 0.345].forEach(function (x) {
      var cheek = new TH.Mesh(new TH.SphereGeometry(0.108, 14, 12),
        new TH.MeshBasicMaterial({ color: C.cheek, transparent: true, opacity: 0.5 }));
      cheek.scale.set(1, 0.72, 0.42);
      cheek.position.set(x, -0.135, 0.35);
      head.add(cheek);
      parts.cheeks.push(cheek);
    });

    /* ——— ⚠️ סנפירים — משוטים, לא כפפות ———

       הגרסה הקודמת השתמשה בכדור מכווץ שהוצמד לצד הגוף, והתוצאה
       על המסך הייתה שני גושים ירוקים עגולים — "כפפות". סנפיר של
       צב ים הוא **משוט**: שטוח מאוד, ארוך פי שניים מרוחבו, ונמשך
       החוצה ואחורה.

       הפתרון גם פותר את הבעיה שבגללה ויתרנו על סנפירים ארוכים
       בהתחלה: הבעיה לא הייתה האורך אלא שגפה **דקה** קוראת כזרוע.
       משוט רחב ושטוח ארוך — ועדיין קורא כתינוק. */
    function flipper(side, front) {
      var grp = new TH.Group();
      var len = front ? 0.70 : 0.44;
      var f = new TH.Mesh(new TH.SphereGeometry(len / 2, 20, 14), skinDeep);
      f.scale.set(front ? 0.50 : 0.62, 0.17, 1.0);
      f.position.z = len / 2;
      grp.add(f);

      // קצה מעוגל בגוון בהיר יותר — נותן לסנפיר עומק במקום צללית שטוחה
      var tip = new TH.Mesh(new TH.SphereGeometry(len * 0.20, 14, 12), skin);
      tip.scale.set(front ? 0.62 : 0.72, 0.22, 0.9);
      tip.position.z = len * 0.86;
      grp.add(tip);

      grp.position.set(side * (front ? 0.52 : 0.44), front ? 0.28 : 0.14,
        front ? 0.62 : -0.62);
      // +Z מסובב החוצה ואחורה: כ-116° לפנים, כ-140° לאחוריים
      grp.rotation.y = side * (front ? 2.03 : 2.44);
      grp.rotation.x = front ? -0.10 : -0.05;
      return grp;
    }

    parts.frontFlippers = [];
    parts.backFlippers = [];
    [-1, 1].forEach(function (side) {
      var fr = flipper(side, true);
      g.add(fr);
      parts.frontFlippers.push({ g: fr, side: side });
      var bk = flipper(side, false);
      g.add(bk);
      parts.backFlippers.push({ g: bk, side: side });
    });

    /* ——— זנב זעיר ——— */
    var tail = new TH.Mesh(new TH.ConeGeometry(0.10, 0.24, 12), skinDeep);
    tail.rotation.x = Math.PI * 0.62;
    tail.position.set(0, 0.30, -1.02);
    g.add(tail);
    parts.tail = tail;

    /* ——— ⭐ סימן הזיהוי השני: "נצנוץ" — כוכב הים שיושב על הגב ——— */
    /* ⚠️⚠️ **כוכב הים נקרא כחתול אוריגמי.**

       הגרסה הקודמת הייתה ExtrudeGeometry של מצולע בן עשר צלעות —
       כלומר כוכב **שטוח עם קצוות חדים**, שרחף ליד השריון בזווית
       אקראית. בצילום המסך זה נראה כמו פיסת נייר מקומטת עם פרצוף,
       והילד ראה שם חתול.

       ⚠️ צורה חדה־זוויתית לא יכולה להיקרא כיצור רך. כאן הכוכב
       בנוי מכדורים מכווצים — מרכז וחמש זרועות מעוגלות — ומונח
       **על** פני השריון לפי הנורמל שלו, לא מרחף לידו. */
    /* ══════════════════════════════════════════════════════════
       ⭐ "נצנוץ" — כוכב הים שיושב לצאבי על הגב
       ══════════════════════════════════════════════════════════

       ⚠️⚠️ **שתי הגרסאות הקודמות נכשלו, ולא באותה סיבה.**

       גרסה 1 — מצולע שטוח (ExtrudeGeometry) עם קצוות חדים,
       מרחף בזווית אקראית ליד השריון. נקרא **כחתול אוריגמי**:
       צורה זוויתית חדה לא יכולה להיקרא כיצור רך.

       גרסה 2 — חמש זרועות מכדורים מכווצים. נקרא **כאיש-ג'ינג'ר**,
       ואת זה כבר אפשר להסביר במספרים: הזרועות היו באורך 0.14
       סביב מרכז ברדיוס 0.105 — יחס של 1.35:1. ⚠️ **ביחס כזה
       הזרועות ארוכות מדי מכדי להיקרא כקרניים של כוכב וקצרות
       מדי מכדי להיקרא כזרועות של כוכב ים — אז המוח בוחר את
       הפירוש המוכר יותר: גפיים.**

       מה שעובד: **יחס של 3:1 לפחות.** מרכז קטן (0.062) וקרניים
       ארוכות (0.20) — אז חמש הקרניים שולטות בצללית, והצורה
       נקראת ככוכב לפני שהיא נקראת כמשהו אחר.

       שלוש החלטות נוספות:
         · הכוכב **שוכב על** השריון לפי הנורמל שלו, לא מרחף לידו
         · לקרן יש בסיס עבה וקצה מחודד — כמו זרוע של כוכב ים
         · הפרצוף זעיר ובלי פה פעור, כי פרצוף גדול הופך כל צורה
           לדמות, וזו בדיוק הטעות שחזרה פעמיים */
    var starGrp = new TH.Group();
    /* המיקום והסיבוב חושבו מהנורמל של הכיפה בנקודה
       theta=0.85, phi=0.72 — כלומר על הכתף הימנית-עליונה של
       השריון, במקום שנראה מלפנים ולא נחסם על ידי הראש. */
    /* ⚠️ בניסיון הראשון הכוכב ישב על **הקודקוד** של הכיפה
       (phi=0.72) ולכן נראה כמעט מהצד — קו כתום דק, לא כוכב.
       phi=1.05 מוריד אותו לכתף הימנית-קדמית, במקום שבו פני
       השריון פונים אל הצופה והכוכב נראה במלוא רוחבו. */
    starGrp.position.set(0.632, 0.940, 0.688);
    starGrp.rotation.set(-0.8983, 0.4881, 0);
    starGrp.scale.setScalar(1.12);
    g.add(starGrp);
    parts.star = starGrp;
    parts.starBase = { y: 0.940 };

    var starSpin = new TH.Group();
    starGrp.add(starSpin);
    parts.starSpin = starSpin;

    var starMat = mat(C.star, { roughness: 0.55, clearcoat: 0.22 });
    var starMat2 = mat(C.starHi, { roughness: 0.6, clearcoat: 0.15 });

    // המרכז — קטן בכוונה
    var starCore = new TH.Mesh(new TH.SphereGeometry(0.062, 16, 12), starMat);
    starCore.scale.set(1, 1, 0.62);
    starSpin.add(starCore);

    for (var si = 0; si < 5; si++) {
      var sa = (Math.PI * 2 / 5) * si + Math.PI / 2;
      var arm = new TH.Group();
      arm.rotation.z = sa - Math.PI / 2;
      starSpin.add(arm);

      /* הקרן: חרוט שוכב — בסיס עבה במרכז, קצה מחודד בחוץ.
         זו הצורה שקוראים כ"קרן", ולא כדור מתוח שקורא כ"גפה". */
      /* ⚠️ ציר של ConeGeometry הוא **+Y** כברירת מחדל, וזה בדיוק
         הכיוון שאליו הקבוצה כבר מסובבת. כל סיבוב נוסף כאן מפיל
         את הקרן על הצד — וזה מה שהפך את הכוכב לגוש מקומט. */
      var ray = new TH.Mesh(new TH.ConeGeometry(0.058, 0.205, 10), starMat);
      ray.position.set(0, 0.098, -0.004);
      ray.scale.set(1, 1, 0.55);
      arm.add(ray);

      // כרית קטנה בשורש הקרן — מחברת אותה למרכז בלי תפר חד
      var joint = new TH.Mesh(new TH.SphereGeometry(0.045, 10, 8), starMat);
      joint.scale.set(1, 1, 0.6);
      joint.position.set(0, 0.035, 0);
      arm.add(joint);

      // שתי נקודות על הקרן — המרקם שהופך גוש כתום לכוכב ים
      /* ⚠️ נקודות ברדיוס 0.0125 בגוון בהיר מאוד נקראו כפנינים
         תפורות. אצל כוכב ים אלה בליטות עדינות — קטנות יותר
         וקרובות בגוון לזרוע עצמה. */
      [0.085, 0.135].forEach(function (d, k) {
        var dot = new TH.Mesh(new TH.SphereGeometry(0.0085 - k * 0.002, 8, 6), starMat2);
        dot.position.set(0, d, 0.024 - k * 0.005);
        arm.add(dot);
      });
    }

    // פרצוף זעיר — שתי נקודות וחיוך דק, על המרכז בלבד
    [[-0.030, 0.016], [0.030, 0.016]].forEach(function (pt) {
      var e = new TH.Mesh(new TH.SphereGeometry(0.0125, 8, 8), basic(0x2b1c12));
      e.position.set(pt[0], pt[1], 0.036);
      starSpin.add(e);
    });
    var starSmile = new TH.Mesh(
      new TH.TorusGeometry(0.020, 0.005, 6, 12, Math.PI), basic(0x2b1c12));
    starSmile.position.set(0, -0.004, 0.037);
    starSmile.rotation.z = Math.PI;
    starSpin.add(starSmile);

    /* ——— תוספת לפי הווריאנט ——— */
    if (variant === 'scarf') {
      var scarf = new TH.Mesh(new TH.TorusGeometry(0.44, 0.075, 12, 26),
        mat(0x4fb3d9, { roughness: 0.8, clearcoat: 0.2 }));
      scarf.position.set(0, 0.86, 0.22);
      scarf.rotation.x = 0.28;
      g.add(scarf);
    }

    return { group: g, parts: parts };
  }

  /* ══════════════════════════════════════════════════════════
     בועות
     ═══════════════════════════════════════════════════════════ */
  function makeBubbles(count) {
    var geo = new TH.BufferGeometry();
    var pos = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 3.4;
      pos[i * 3 + 1] = Math.random() * 4 - 1.6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
    }
    geo.setAttribute('position', new TH.BufferAttribute(pos, 3));
    return new TH.Points(geo, new TH.PointsMaterial({
      color: 0xcdf1ff, size: 0.075, transparent: true, opacity: 0.55,
      depthWrite: false
    }));
  }

  function setupLights(sc) {
    // ⚠️ הגרסה הראשונה הייתה שרופה לגמרי: ארבעה אורות חזקים +
    // clearcoat גבוה הפכו כל משטח ללבן, והצבעים נעלמו. אור אחד
    // ראשי מתון, מילוי קר חלש ו-rim עדין — זה כל מה שצריך.
    sc.add(new TH.AmbientLight(0xdff2ff, 0.48));

    var key = new TH.DirectionalLight(0xfff4e0, 0.78);
    key.position.set(2.2, 3.6, 4.2);
    sc.add(key);

    var fill = new TH.DirectionalLight(0x8ad4ec, 0.28);
    fill.position.set(-3.5, 1.2, 2.2);
    sc.add(fill);

    var rim = new TH.DirectionalLight(0xc9f0ff, 0.35);
    rim.position.set(-0.5, 2.0, -4.5);
    sc.add(rim);
  }

  function resizeTo(el, ren, cam) {
    if (!el || !ren || !cam) return;
    var w = Math.max(1, Math.round(el.clientWidth));
    var h = Math.max(1, Math.round(el.clientHeight));
    ren.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
    ren.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }

  /* ══════════════════════════════════════════════════════════
     אנימציה
     ═══════════════════════════════════════════════════════════ */
  function animateRig(r, t, isMain) {
    if (!r) return;
    var p = r.parts, g = r.group;

    /* דלתא-זמן אמיתית — ההחלקה של הפה חייבת להיות תלוית זמן ולא
       תלוית פריימים, אחרת הדיבור נראה אחרת במסך 60Hz ובמסך 120Hz. */
    var dt = Math.min(0.1, Math.max(0.001, t - lastRigT));
    lastRigT = t;

    /* נשימה — קטנה מאוד, וזה בדיוק העניין. תנועה שנראית לעין
       קוראת כניפוח; תנועה שמרגישים ולא רואים קוראת כחיים. */
    var breath = Math.sin(t * 1.25);
    if (p.body) {
      p.body.scale.set(1 + breath * 0.022, 1 + breath * 0.03, 1 + breath * 0.022);
    }

    /* ריחוף עדין וסיבוב סקרן */
    g.position.y = Math.sin(t * 1.15) * 0.05;
    g.rotation.y = Math.sin(t * 0.42) * 0.22;
    g.rotation.z = Math.sin(t * 0.33) * 0.03;

    /* ראש — הטיה סקרנית, לא סיבוב מכני */
    if (p.head) {
      p.head.rotation.y = Math.sin(t * 0.62) * 0.16;
      p.head.rotation.z = Math.sin(t * 0.47 + 1.2) * 0.09;
      p.head.rotation.x = -0.05 + Math.sin(t * 0.9) * 0.04;
      p.head.position.y = 0.54 + breath * 0.02;
    }

    /* חתירה בסנפירים — הקדמיים והאחוריים בפאזה הפוכה */
    if (p.frontFlippers) {
      p.frontFlippers.forEach(function (f, i) {
        f.g.rotation.x = Math.sin(t * 1.5 + i * 0.6) * 0.30;
        f.g.rotation.z = f.side * (0.30 + Math.sin(t * 1.5 + i * 0.6) * 0.12);
      });
    }
    if (p.backFlippers) {
      p.backFlippers.forEach(function (f, i) {
        f.g.rotation.x = Math.sin(t * 1.5 + Math.PI + i * 0.5) * 0.18;
      });
    }
    if (p.tail) p.tail.rotation.z = Math.sin(t * 1.9) * 0.12;

    /* ⭐ נצנוץ מתנדנד — בפיגור של חצי פעימה אחרי הגוף, כך שהוא
       נראה כמו נוסע ולא כמו חלק מהשריון */
    if (p.star && p.starBase) {
      /* ⚠️ הכוכב מסתובב סביב **הציר שלו** (starSpin), והקבוצה
         החיצונית רק מרחפת מעט. קודם סובבנו את הקבוצה עצמה, וזה
         הרס את היישור לנורמל של השריון וגרם לכוכב להיראות תלוש. */
      if (p.starSpin) p.starSpin.rotation.z = Math.sin(t * 1.15 - 0.55) * 0.20;
      p.star.position.y = p.starBase.y + Math.sin(t * 1.15 - 0.55) * 0.028;
    }

    if (isMain) {
      /* ——— מבט ——— */
      if (t > gaze.idleUntil) {
        // סריקה עצלה סביב — לא מרכז קפוא
        gaze.tx = Math.sin(t * 0.33) * 0.55;
        gaze.ty = Math.sin(t * 0.21 + 1.4) * 0.30;
      }
      gaze.x += (gaze.tx - gaze.x) * 0.10;
      gaze.y += (gaze.ty - gaze.y) * 0.10;
      if (p.eyes) {
        p.eyes.forEach(function (e) {
          e.iris.position.x = gaze.x * 0.055;
          e.iris.position.y = gaze.y * 0.045;
          e.pupil.position.x = gaze.x * 0.070;
          e.pupil.position.y = gaze.y * 0.058;
        });
      }
      if (p.head) p.head.rotation.y += gaze.x * 0.10;

      /* ——— מצמוץ ——— */
      blinkPhase += 1 / 60;
      if (blinkPhase > blinkAt) {
        var into = blinkPhase - blinkAt;
        var closed = 0;
        if (into < 0.07) closed = into / 0.07;
        else if (into < 0.13) closed = 1;
        else if (into < 0.21) closed = 1 - (into - 0.13) / 0.08;
        else if (doubleBlink && into < 0.30) closed = 0;
        else if (doubleBlink && into < 0.37) closed = (into - 0.30) / 0.07;
        else if (doubleBlink && into < 0.44) closed = 1 - (into - 0.37) / 0.07;
        else {
          closed = 0;
          blinkPhase = 0;
          blinkAt = 1.6 + Math.random() * 3.4;
          doubleBlink = Math.random() < 0.28;
        }
        if (p.eyes) {
          p.eyes.forEach(function (e) {
            e.group.scale.y = 1 - closed * 0.92;
          });
        }
      }

      /* ——— ⚠️⚠️ דיבור: ויזמות + סנכרון מילים ———

         הפה נבנה מחדש כציור ולא כעצם (ראו ההסבר בבנייה), ולכן גם
         האנימציה פשוטה יותר: קו החיוך מתעקל, החלל הכהה נמתח
         מתחתיו, והלשון מופיעה רק בפתיחה רחבה. */
      if (p.mawSet && p.lipBot) {
        if (talking) {
          if (t < wordUntil) {
            var ph = Math.sin(t * 17);
            visTo = [
              wordOpen * (0.62 + Math.abs(ph) * 0.38),
              Math.max(0, ph) * 0.45,
              Math.max(0, -ph) * 0.5
            ];
            visAt = t + 0.05;
          } else if (t > visAt) {
            var v = VISEMES[(Math.random() * VISEMES.length) | 0];
            visTo = v;
            visAt = t + 0.07 + Math.random() * 0.08;
          }
          var k = Math.min(1, dt * 14);
          visOpen += (visTo[0] - visOpen) * k;
          visWide += (visTo[1] - visWide) * k;
          visRound += (visTo[2] - visRound) * k;
        } else {
          var k2 = Math.min(1, dt * 10);
          visOpen += (0 - visOpen) * k2;
          visWide += (0 - visWide) * k2;
          visRound += (0 - visRound) * k2;
          visAt = 0;
        }

        var moodOpen = 0, moodRound = 0, smileAmt = 1;
        if (!talking) {
          if (mood === 'surprised') { moodOpen = 0.5; moodRound = 0.9; smileAmt = 0.2; }
          else if (mood === 'sad') { smileAmt = -1; }
          else { smileAmt = 1.15; }
        }

        var open = Math.min(1, visOpen + moodOpen);
        var wide = Math.min(1, visWide);
        var round = Math.min(1, visRound + moodRound);
        var w = 1 + wide * 0.22 - round * 0.32;

        /* ⚠️ עצב הופך את הקשת ב-180°, ולא רק מוריד פינות: פה עצוב
           שמוריד פינות בלבד עדיין מחייך. */
        /* ⚠️ עצב הוא **קשת אחרת**, לא אותה קשת הפוכה. שני קווי הפה
           נבנו מראש כשתי עקומות שוכבות על החוטם, ומה שמתחלף כאן
           הוא רק איזו מהן נראית — כך אין סיבוב שמנתק את הקו מהפנים. */
        var down = smileAmt < -0.1;
        p.lipBot.visible = !down;
        if (p.lipSad) p.lipSad.visible = down;
        p.lipBot.scale.set(w, 1, 1);
        if (p.lipSad) p.lipSad.scale.set(w, 1, 1);

        if (p.mawSet) p.mawSet(down ? 0 : open, w);

        if (talking && p.head) p.head.rotation.x += Math.sin(t * 9.5) * 0.012;
      }

      if (p.brows) {
        var lift = mood === 'surprised' ? 0.06 : (mood === 'sad' ? -0.03 : 0);
        p.brows.forEach(function (b, i) {
          b.position.y = 0.33 + lift + Math.sin(t * 0.8 + i) * 0.006;
        });
      }

      /* ——— נפנוף ——— */
      if (waveUntil > t && p.frontFlippers && p.frontFlippers[1]) {
        var u = 1 - (waveUntil - t) / 1.4;
        var f = p.frontFlippers[1];
        f.g.rotation.z = f.side * 0.30 - 1.15 - Math.sin(u * Math.PI * 4) * 0.45;
        f.g.rotation.x = -0.35;
      }

      /* ——— קפיצת שמחה ——— */
      if (hopUntil > t) {
        var hu = 1 - (hopUntil - t) / 0.75;
        var h = Math.sin(hu * Math.PI);
        g.position.y += h * 0.34;
        g.rotation.x = -h * 0.14;
        if (p.body) p.body.scale.y *= (1 - h * 0.07);
      } else {
        g.rotation.x = 0;
      }

      /* ——— הנהון ——— */
      if (nodUntil > t && p.head) {
        var nu = 1 - (nodUntil - t) / 0.9;
        p.head.rotation.x += Math.sin(nu * Math.PI * 3) * 0.22;
      }
    }
  }

  function animateMain(now) {
    raf = requestAnimationFrame(animateMain);
    if (!rig || !renderer || !scene || !camera) return;
    var t = (now - t0) / 1000;

    animateRig(rig, t, true);

    // ⚠️ בועה מהחוטם מדי כמה שניות. פרט קטן שאומר "הוא נושם,
    // הוא כאן" בלי שום טקסט.
    if (noseBub) {
      noseT += 1 / 60;
      var cyc = noseT % 4.4;
      var on = cyc < 1.5;
      noseBub.visible = on;
      if (on) {
        var u = cyc / 1.5;
        noseBub.position.set(0.10, 0.62 + u * 1.5, 1.42 + u * 0.12);
        var sc = 0.5 + u * 0.9;
        noseBub.scale.setScalar(sc);
        noseBub.material.opacity = 0.5 * (1 - u);
      }
    }

    if (bubbles) {
      var arr = bubbles.geometry.attributes.position.array;
      for (var i = 1; i < arr.length; i += 3) {
        arr[i] += 0.011;
        if (arr[i] > 3.2) {
          arr[i] = -1.8;
          arr[i - 1] = (Math.random() - 0.5) * 3.4;
        }
      }
      bubbles.geometry.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
  }

  /* ══════════════════════════════════════════════════════════
     אתחול
     ═══════════════════════════════════════════════════════════ */
  function initMain(canvasEl) {
    TH = T();
    if (!TH || !canvasEl) return false;
    try {
      canvas = canvasEl;
      scene = new TH.Scene();

      // ⚠️ מרחק קצר ועדשה צרה — כך הראש נראה גדול עוד יותר
      // והדמות "מתקרבת" לילד. מצלמה רחוקה עושה אותה קטנה וזרה.
      camera = new TH.PerspectiveCamera(32, 1, 0.1, 50);
      camera.position.set(0, 0.86, 6.6);
      camera.lookAt(0, 0.52, 0.25);

      renderer = new TH.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      if (TH.sRGBEncoding != null) renderer.outputEncoding = TH.sRGBEncoding;
      setupLights(scene);

      // ⚠️ הרצפה הייתה עיגול לבן ענק שתפס חצי מהמסך. עכשיו היא
      // כתם חול קטן ומעומעם מתחת לצאבי — רמז לקרקע, לא במה.
      var sand = new TH.Mesh(
        new TH.CircleGeometry(1.5, 40),
        new TH.MeshBasicMaterial({ color: 0xe0c894, transparent: true, opacity: 0.30 })
      );
      sand.rotation.x = -Math.PI / 2;
      sand.position.y = -0.30;
      scene.add(sand);

      var shade = new TH.Mesh(
        new TH.CircleGeometry(0.85, 32),
        new TH.MeshBasicMaterial({ color: 0x1b5560, transparent: true, opacity: 0.22 })
      );
      shade.rotation.x = -Math.PI / 2;
      shade.position.y = -0.285;
      shade.scale.set(1, 0.72, 1);
      scene.add(shade);

      rig = buildChubby('classic');
      rig.group.scale.setScalar(1.0);
      scene.add(rig.group);

      bubbles = makeBubbles(46);
      scene.add(bubbles);

      noseBub = new TH.Mesh(
        new TH.SphereGeometry(0.075, 14, 12),
        new TH.MeshPhysicalMaterial({
          color: 0xe8fbff, transparent: true, opacity: 0.5,
          roughness: 0.05, clearcoat: 1, transmission: 0.4
        })
      );
      noseBub.visible = false;
      scene.add(noseBub);

      resizeTo(canvas.parentElement || canvas, renderer, camera);
      if (global.ResizeObserver) {
        new ResizeObserver(function () {
          resizeTo(canvas.parentElement || canvas, renderer, camera);
        }).observe(canvas.parentElement || canvas);
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(animateMain);
      return true;
    } catch (e) {
      console.warn('Chubby 3D init failed', e);
      return false;
    }
  }

  var careRig = null;

  function animateCare(now) {
    careRaf = requestAnimationFrame(animateCare);
    if (!careRig || !careRenderer) return;
    animateRig(careRig, now / 1000, false);
    careRig.group.rotation.y += 0.15;
    careRenderer.render(careScene, careCam);
  }

  function initCare(canvasEl, variant) {
    TH = T();
    if (!TH || !canvasEl) return false;
    try {
      careScene = new TH.Scene();
      careCam = new TH.PerspectiveCamera(32, 1, 0.1, 40);
      careCam.position.set(0, 1.05, 5.1);
      careCam.lookAt(0, 0.72, 0);
      careRenderer = new TH.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
      if (TH.sRGBEncoding != null) careRenderer.outputEncoding = TH.sRGBEncoding;
      setupLights(careScene);
      careRig = buildChubby(variant || 'scarf');
      careScene.add(careRig.group);
      resizeTo(canvasEl.parentElement || canvasEl, careRenderer, careCam);
      if (global.ResizeObserver) {
        new ResizeObserver(function () {
          resizeTo(canvasEl.parentElement || canvasEl, careRenderer, careCam);
        }).observe(canvasEl.parentElement || canvasEl);
      }
      cancelAnimationFrame(careRaf);
      careRaf = requestAnimationFrame(animateCare);
      return true;
    } catch (e) {
      console.warn('Chubby 3D (care) init failed', e);
      return false;
    }
  }

  /* ══════════════════════════════════════════════════════════
     שליטה מבחוץ
     ═══════════════════════════════════════════════════════════ */
  function nowT() { return (performance.now() - t0) / 1000; }

  function setTalking(on) {
    talking = !!on;
    if (!talking) { wordOpen = 0; wordUntil = 0; }
  }

  function setMood(m) {
    mood = (m === 'sad' || m === 'surprised') ? m : 'happy';
  }

  function wave() { waveUntil = nowT() + 1.4; }
  function hop() { hopUntil = nowT() + 0.75; }
  function nod() { nodUntil = nowT() + 0.9; }
  function blinkNow() { blinkPhase = blinkAt + 0.001; }


  /* ══════════════════════════════════════════════════════════
     פרצוף קטן — לחידון
     ══════════════════════════════════════════════════════════
     דווח: "בחידון צאבי... שישמעו גם את צאבי".

     ⚠️ קול לבדו נשמע כמו מכונה. פרצוף שמדבר יחד עם הקול הוא מה
     שהופך את זה ל"צאבי שואל אותי" — ולכן כאן במה שלישית, קטנה
     ומקורבת לראש בלבד, שרצה רק כשהחידון פתוח.

     ⚠️ הבמה **נעצרת** ב-stopFace ולא רק מוסתרת: לולאת רינדור
     שממשיכה לרוץ מאחורי מסך סגור שורפת סוללה בטלפון בלי שאף אחד
     רואה פיקסל אחד. */
  var faceRenderer = null, faceScene = null, faceCam = null, faceRig = null, faceRaf = 0;
  var faceTalking = false;

  function animateFace(now) {
    faceRaf = requestAnimationFrame(animateFace);
    if (!faceRig || !faceRenderer) return;
    var t = now / 1000;
    var wasTalking = talking;
    talking = faceTalking;
    animateRig(faceRig, t, false);
    talking = wasTalking;
    faceRig.group.rotation.y = Math.sin(t * 0.55) * 0.18;
    faceRenderer.render(faceScene, faceCam);
  }

  function initFace(canvasEl) {
    TH = T();
    if (!TH || !canvasEl) return false;
    if (faceRenderer && faceRenderer.domElement === canvasEl) {
      if (!faceRaf) faceRaf = requestAnimationFrame(animateFace);
      return true;
    }
    try {
      faceScene = new TH.Scene();
      /* ⚠️ המצלמה כוונה לפרופורציות הישנות של הדמות. אחרי שהראש
         יצא קדימה (z=1.34) ושונה גובהו, המסגרת חתכה אותו בדיוק
         מתחת לעיניים — מה שנראה על המסך כמו צילום שנקטע. */
      faceCam = new TH.PerspectiveCamera(30, 1, 0.1, 40);
      faceCam.position.set(0, 0.86, 3.9);
      faceCam.lookAt(0, 0.56, 0.7);
      faceRenderer = new TH.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
      if (TH.sRGBEncoding != null) faceRenderer.outputEncoding = TH.sRGBEncoding;
      setupLights(faceScene);
      faceRig = buildChubby('classic');
      faceScene.add(faceRig.group);
      resizeTo(canvasEl.parentElement || canvasEl, faceRenderer, faceCam);
      if (global.ResizeObserver) {
        new ResizeObserver(function () {
          resizeTo(canvasEl.parentElement || canvasEl, faceRenderer, faceCam);
        }).observe(canvasEl.parentElement || canvasEl);
      }
      cancelAnimationFrame(faceRaf);
      faceRaf = requestAnimationFrame(animateFace);
      return true;
    } catch (e) {
      console.warn('Chubby 3D (face) init failed', e);
      return false;
    }
  }

  function setFaceTalking(on) { faceTalking = !!on; }
  function stopFace() { cancelAnimationFrame(faceRaf); faceRaf = 0; }

  global.CBY_3D = {
    lookAt: lookAt,
    initMain: initMain,
    initCare: initCare,
    initFace: initFace,
    setFaceTalking: setFaceTalking,
    stopFace: stopFace,
    setTalking: setTalking,
    speakWord: speakWord,
    setMood: setMood,
    wave: wave,
    hop: hop,
    nod: nod,
    blinkNow: blinkNow,
    buildChubby: buildChubby,
    fingerprint: 'CBY-T7R4L2E9'
  };
})(typeof window !== 'undefined' ? window : globalThis);
