/* ==================================================================
   © כל הזכויות שמורות | ALL RIGHTS RESERVED
   צאבי הצב — שומר צבי הים
   יוצר ובעלים בלעדי: דניאל אברהם חדאד | Creator & sole owner: Daniel Avraham Haddad
   🔒 [CBY-PROOF] טביעת אצבע: CBY-T7R4L2E9 · מזהה יוצר: DAH-CBY-2026
   Unauthorized copying, distribution or attribution is prohibited.
   ================================================================== */
// ==================================================================
// © כל הזכויות שמורות | ALL RIGHTS RESERVED
// יוצר ובעלים בלעדי: דניאל אברהם חדאד | Daniel Avraham Haddad
// אפליקציית "צאבי הצב — שומר צבי הים" וכל רכיביה הם קניינו הבלעדי.
// טביעת אצבע: CBY-T7R4L2E9
// ==================================================================
// 🧠 [CBY-KB] המנצח — מי עונה, על מה, ומתי שותקים.
//
// המודול הזה לא מחפש בעצמו. הוא מפעיל את השכבות לפי הסדר הנכון
// ומחליט מה יוצא החוצה:
//
//   1. CBY_SMART  — מפצל שאלה שיש בה יותר מבקשה אחת
//   2. CBY_MIND   — משלים נושא חסר ("וזה מסוכן?" ➜ "וזה מסוכן? פלסטיק")
//   3. CBY_TALK   — משפט המשך ממשיך את הנושא הפתוח במקום להתחיל מחדש
//   4. CBY_MATCH  — דירוג משוקלל מול כל מילות המפתח במאגר
//   5. שומר התחום — שאלה שאינה על צבי ים מקבלת הכוונה חזרה
//   6. CBY_TALK.fallback — "לא הבנתי" שמציע מה כן ידוע
//
// ⚠️ הכלל שמנחה את הכול: תשובה שגויה בביטחון גרועה מ"לא יודע",
// במיוחד לילד שלומד מהתשובה.
// ==================================================================
(function (global) {
  'use strict';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var LANG = 'he';
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ————— עזרי טקסט ————— */

  function normalize(s) {
    if (global.CBY_LEX) return CBY_LEX.normalize(s);
    return String(s || '').toLowerCase()
      .replace(/[?!.,:;'"״׳()\-_/\\]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  function strip(w) {
    return global.CBY_LEX ? CBY_LEX.stripPrefix(w) : w;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function pickOne(list, fallbackText) {
    if (!list || !list.length) return fallbackText || '';
    return list[Math.floor(Math.random() * list.length)];
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function bodyOf(entry) {
    if (!entry) return '';
    var r = entry.response;
    if (Array.isArray(r)) return r[Math.floor(Math.random() * r.length)];
    return r || '';
  }

  function dataOf(brain) {
    if (!brain) return [];
    if (Array.isArray(brain)) return brain;
    return brain.data || [];
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ————— שומר התחום ————— */

  // מילים כלליות מדי: שאלה שמורכבת רק מהן מקבלת את תשובת הפתיחה.
  var GENERIC = {
    'צב': 1, 'צבים': 1, 'צבי': 1, 'הצב': 1, 'הצבים': 1, 'ים': 1, 'הים': 1,
    'turtle': 1, 'turtles': 1, 'צאבי': 1
  };

  function isBareTurtleQuery(question) {
    var w = normalize(question).split(' ').filter(Boolean);
    if (!w.length || w.length > 3) return false;
    for (var i = 0; i < w.length; i++) {
      if (!GENERIC[w[i]] && !GENERIC[strip(w[i])]) return false;
    }
    return true;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function findEntry(brain, keyword) {
    var data = dataOf(brain);
    for (var i = 0; i < data.length; i++) {
      var keys = data[i].keys || [];
      for (var k = 0; k < keys.length; k++) {
        if (normalize(keys[k]) === normalize(keyword)) return data[i];
      }
    }
    return null;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ⚠️⚠️ **אוצר המילים של התחום מגיע מהמאגר עצמו.**
     lexicon.js מחזיק רשימה ידנית, והיא הייתה נכונה כל עוד המאגר
     היה קטן. ברגע שנוספו מאות מונחי מילון, כל מונח טכני שלא היה
     ברשימה נראה לשומר התחום כנושא זר — ו"מה זה פיברופפילומה"
     קיבל את התשובה "אני מדבר רק על צבי ים".

     כאן נבנית פעם אחת מפה של **כל** מילה שמופיעה במילות המפתח
     של המאגר. מילה כזו היא בהגדרה מילה מהתחום, והרשימה מתעדכנת
     מעצמה בכל בנייה מחדש של brain.json. */
  var topicMap = null, topicFor = null;

  function buildTopicMap(brain) {
    if (topicMap && topicFor === brain) return topicMap;
    topicMap = Object.create(null);
    var list = (brain && brain.topic) || [];
    for (var i = 0; i < list.length; i++) topicMap[list[i]] = 1;
    topicFor = brain;
    return topicMap;
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function inBrainVocab(brain, word) {
    var m = buildTopicMap(brain);
    if (m[word]) return true;
    var b = strip(word);
    return !!m[b];
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* כמה השאלה שייכת לעולם צבי הים */
  function relevance(question, brain) {
    if (!global.CBY_LEX) return { onTopic: true, off: 0, topic: 1, words: 1 };
    var s = CBY_LEX.topicScore(question);
    var topic = s.topic;

    if (brain && brain.topic) {
      var w = normalize(question).split(' ').filter(Boolean);
      for (var i = 0; i < w.length; i++) {
        if (w[i].length >= 3 && inBrainVocab(brain, w[i])) { topic++; }
      }
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    return {
      onTopic: topic > 0 || s.words <= 2,
      off: s.off, topic: topic, words: s.words
    };
  }

  /* ⚠️⚠️ **מי רשאי להמשיך את הנושא הפתוח — והשאלה הזו קריטית.**
     זיהוי משפט המשך מסתפק בפתיחה במילת שאלה קצרה, ולכן "מי ראש
     הממשלה" נראה לו בדיוק כמו "ולמה?". נמדד: שאלה על ראש הממשלה
     קיבלה את התשובה על השריון, כי היא "המשיכה" את הנושא הפתוח.

     הכלל כאן: ממשיכים רק כשהמשפט באמת נשען על מה שנאמר קודם —
     כלומר אין בו מילות תוכן כלל, או שהוא פותח במילת קישור, או
     שיש בו מילה מעולם צבי הים. מילה מנושא זר פוסלת המשך תמיד. */
  var CONNECT_RE = /^(ו|אז |ואז |נו |אבל |באמת|ברצינות|עוד|ועוד|תמשיך|המשך|ספר עוד|מה עוד)/;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function canContinue(question, brain) {
    var t = String(question || '').trim();
    if (CONNECT_RE.test(t)) return true;
    if (!global.CBY_LEX || !global.CBY_TALK) return true;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var content = CBY_TALK.contentWords(t, LANG);
    var toks = t.split(/\s+/).filter(Boolean);

    for (var i = 0; i < content.length; i++) {
      if (CBY_LEX.isOffTopicWord(content[i])) return false;
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* ⚠️⚠️ **אורך המשפט הוא הקריטריון, לא נוכחות מילה מהתחום —
       וזו הייתה דליפה אמיתית שנמדדה.**

       הכלל הקודם אמר: "יש במשפט מילה מעולם צבי הים ➜ מותר להמשיך".
       זה עבד כשאוצר התחום היה רשימה ידנית קצרה. ברגע שהוא נגזר
       אוטומטית מהמאגר הוא גדל ל-1,351 מילים, ובתוכן מילים גנריות
       לגמרי כמו "אוויר" (כי צבים נושמים אוויר).

       התוצאה שנמדדה: "מה מזג האוויר" נחשב למשפט המשך, המשיך את
       הנושא הפתוח — ומי ששאל על מזג האוויר קיבל את התשובה על
       מחמאה שנאמרה שלוש שאלות קודם.

       משפט המשך אמיתי נשען על מה שנאמר ואין לו נושא משלו:
       "ולמה?", "באמת?", "והשועלים?". ברגע שיש שתי מילות תוכן או
       יותר — זו שאלה חדשה, גם אם במקרה יש בה מילה מהתחום, ואם
       הדירוג לא מצא לה תשובה עדיף להודות בכך. */
    /* משפט בלי אות עברית אחת ("2", "42") אינו משפט המשך */
    if (!/[א-ת]/.test(t)) return false;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    /* ⚠️ מילה מהלקסיקון **המובנה** מספיקה גם למשפט ארוך, ומילה
       מאוצר התחום **הנגזר** — לא. ההבחנה הזו היא כל התיקון:
       הלקסיקון המובנה קצר ומדויק ("אורות", "מדוזות", "קן"),
       ואילו האוצר הנגזר רחב ומכיל מילים גנריות ("אוויר"). הראשון
       מזהה שאלת המשך אמיתית, השני היה פותח דלת לכל שאלה בעולם. */
    for (var k = 0; k < content.length; k++) {
      if (CBY_LEX.isTopicWord(content[k])) return true;
    }

    if (!content.length) return toks.length <= 3;
    if (content.length > 1) return false;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    return !!(brain && brain.topic && inBrainVocab(brain, content[0]));
  }

  function offTopicAnswer(brain) {
    return {
      text: pickOne(brain && brain.offtopic,
        'אני צאבי ואני מדבר רק על צבי ים 🐢 שאלו אותי עליהם!'),
      id: 'offtopic', score: 0, kind: 'offtopic',
      follow: ['למה צבי ים נעלמים?', 'איך מצילים ביצים?', 'מה אני יכול לעשות?']
    };
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ————— תשובה לשאלה אחת ————— */

  function answerOne(brain, question) {
    var data = dataOf(brain);
    var q = String(question || '').trim();
    if (!q) return null;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var rel = relevance(q, brain);

    // (0) "צבים" / "צב ים" בלבד — תשובת הפתיחה הכללית
    if (isBareTurtleQuery(q)) {
      var intro = findEntry(brain, 'מה זה צב ים');
      if (intro) {
        return {
          text: bodyOf(intro), entry: intro, id: (intro.keys || [])[0],
          score: 99, kind: 'qa', follow: intro.follow || []
        };
      }
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // (1) השלמת נושא חסר, ואז דירוג משוקלל מול כל המאגר.
    //
    // ⚠️ הדירוג בא **לפני** המשך השיחה, וזה הסדר הנכון: שאלה
    // שיש לה תשובה משלה במאגר צריכה לקבל אותה, גם אם היא פותחת
    // ב"מה" או ב"למה". המשך השיחה הוא מה שקורה כשאין התאמה —
    // לא במקומה. בסדר ההפוך כל שאלה שמתחילה במילת שאלה נבלעה
    // בנושא הקודם, וזה נמדד: "מה זה חוות הדגרה" קיבל תשובה על
    // מיני הצבים בישראל.
    // ⚠️ קודם על המשפט **כפי שנאמר**, ורק אם אין התאמה — על המשפט
    // שהבינה השלימה. ההשלמה מוסיפה מילה חזקה ("צב גלדי"), והיא
    // מושכת את כיסוי השאלה כלפי מטה: נמדד ש"כמה עמוק הוא צולל?"
    // התאים מצוין לערך על הצלילה, ואחרי ההשלמה נפסל לגמרי.
    var hit = null;
    if (global.CBY_MATCH) {
      hit = CBY_MATCH.best(q, data, LANG, { mustHit: q });

      if (!hit && global.CBY_MIND) {
        var rw = CBY_MIND.rewrite(q);
        if (rw && rw.changed) {
          hit = CBY_MATCH.best(rw.text, data, LANG, { mustHit: q });
        }
      }
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // ⚠️ "ולמה?" בלי שום מילת תוכן משלו — הילד מבקש **עוד**, לא
    // את אותה תשובה שוב. הדירוג יחזיר במקרה כזה את הערך הקודם
    // (מילות הנושא עדיין באוויר), ולכן במשפט המשך ריק מתוכן
    // מנסים קודם להמשיך את השיחה, ורק אם אין חומר חדש — חוזרים
    // לתשובת הדירוג.
    if (global.CBY_TALK && CBY_TALK.isFollowUp(q, LANG) &&
        CBY_TALK.contentWords(q, LANG).length === 0) {
      var more = CBY_TALK.continueTopic(q, data, LANG);
      if (more) {
        return {
          text: more.text, entry: more.entry,
          id: (more.entry && more.entry.keys) ? more.entry.keys[0] : 'continue',
          score: 90, kind: 'continue', how: more.how,
          follow: (more.entry && more.entry.follow) || []
        };
      }
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    if (hit && hit.entry) {
      return {
        text: bodyOf(hit.entry), entry: hit.entry,
        id: (hit.entry.keys || [])[0],
        score: hit.score, qCov: hit.qCov, ambiguous: hit.ambiguous,
        kind: 'qa', follow: hit.entry.follow || []
      };
    }

    // (2) אין התאמה — אולי זה בכלל משפט המשך ("ולמה?", "עוד")
    if (global.CBY_TALK && CBY_TALK.isFollowUp(q, LANG) && canContinue(q, brain)) {
      var cont = CBY_TALK.continueTopic(q, data, LANG);
      if (cont) {
        return {
          text: cont.text, entry: cont.entry,
          id: (cont.entry && cont.entry.keys) ? cont.entry.keys[0] : 'continue',
          score: 90, kind: 'continue', how: cont.how,
          follow: (cont.entry && cont.entry.follow) || []
        };
      }
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // (3) נושא זר מובהק — מחזירים לצבים
    if (rel.off > 0 || (rel.topic === 0 && rel.words >= 3)) {
      return offTopicAnswer(brain);
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    // (4) לא הבנתי — אבל מציעים מה כן ידוע
    if (global.CBY_TALK) {
      var fb = CBY_TALK.fallback(q, data, LANG);
      if (fb) {
        return {
          text: fb, entry: null, id: null, score: 0, kind: 'fallback',
          follow: starterQuestions(brain, 3)
        };
      }
    }

    // (5) אין שום קרבה — ההכוונה הרגילה
    return offTopicAnswer(brain);
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ————— ה-API הראשי ————— */

  function answer(brain, question) {
    var q = String(question || '').trim();
    if (!q) {
      return {
        text: 'שאלו אותי משהו על צבי ים — למה הם נעלמים, איך מצילים אותם, או מה זה אבקוע 🐢',
        id: null, score: 0, kind: 'empty',
        follow: ['למה צבי ים בסכנה?', 'מה זה אבקוע?', 'איך אפשר לעזור?']
      };
    }

    // שאלה שיש בה כמה בקשות — עונים על כולן
    var parts = [q];
    if (global.CBY_SMART) {
      try {
        var split = CBY_SMART.splitIntents(q);
        if (split && split.length > 1) parts = split;
      } catch (e) { parts = [q]; }
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    var texts = [], last = null, usedIds = {};
    for (var i = 0; i < parts.length; i++) {
      var res = answerOne(brain, parts[i]);
      if (!res) continue;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      // אותה תשובה לשני חלקים — אומרים אותה פעם אחת
      if (res.id && usedIds[res.id]) continue;
      if (res.id) usedIds[res.id] = 1;

      texts.push(res.text);
      last = res;
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

      // רישום בזיכרון השיחה — כך "ולמה?" הבא יידע על מה מדובר
      if (global.CBY_TALK) {
        CBY_TALK.note(parts[i], res.entry || null, res.text, LANG, res.kind === 'continue');
      }
      if (global.CBY_MIND) {
        CBY_MIND.note(parts[i], res.text, null);
      }
    }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

    if (!last) return offTopicAnswer(brain);

    return {
      text: texts.join(' '),
      id: last.id,
      score: last.score,
      kind: last.kind,
      parts: parts.length,
      follow: last.follow || []
    };
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  /* ————— עובדות, ברכות והצעות ————— */

  function randomFact(brain) {
    var facts = (brain && brain.facts) || [];
    if (!facts.length) return 'צבי ים חשובים לים, לחוף ולכולנו 🐢';
    return facts[Math.floor(Math.random() * facts.length)];
  }

  function randomGreeting(brain) {
    var g = (brain && brain.greetings) || ['שלום! אני צאבי 🐢'];
    return g[Math.floor(Math.random() * g.length)];
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  var STARTERS = [
    'למה צבי ים נעלמים?',
    'למה הם חשובים לים?',
    'מה זה אבקוע?',
    'איך מצילים ביצים?',
    'מי זה צב ים חום?',
    'מי זה צב ים ירוק?',
    'מה זה צב גלדי?',
    'למה פלסטיק מסוכן להם?',
    'מה זה חוות הדגרה?',
    'מה עושים אם מצאתי צב?',
    'איך אני יכול לעזור?',
    'מתי עונת ההטלה?',
    'כמה ביצים יש בקן?',
    'מה קובע אם יבקע זכר או נקבה?',
    'למה תאורה בחוף מסוכנת?',
    'מה זה מכמורת?',
    'כמה שנים חיים צבי ים?',
    'מה הם אוכלים?',
    'מה זה שלל לוואי?',
    'איך מתנדבים עוזרים?',
    'מה זה החתמה?',
    'כמה קינים יש בישראל?',
    'כמה אבקועים שורדים?',
    'איך הם מנווטים?'
  ];
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  function starterQuestions(brain, n) {
    var out = STARTERS.slice();
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out.slice(0, n || 8);
  }

  function reset() {
    if (global.CBY_TALK) CBY_TALK.reset();
    if (global.CBY_MIND) CBY_MIND.reset();
  }
/* © דניאל אברהם חדאד · CBY-T7R4L2E9 */

  global.CBY_KB = {
    answer: answer,
    answerOne: answerOne,
    normalize: normalize,
    randomFact: randomFact,
    randomGreeting: randomGreeting,
    starterQuestions: starterQuestions,
    relevance: relevance,
    reset: reset,
    fingerprint: 'CBY-T7R4L2E9'
  };
})(typeof window !== 'undefined' ? window : globalThis);
