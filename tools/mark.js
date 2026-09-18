#!/usr/bin/env node
/* ==================================================================
   🔒 [CBY-PROOF] סימון בעלות על כל קובצי הפרויקט
   © דניאל אברהם חדאד / Daniel Avraham Haddad · CBY-T7R4L2E9
   ------------------------------------------------------------------
   שימוש:
     node tools/mark.js            — סימון + דוח
     node tools/mark.js --count    — ספירה בלבד, בלי לשנות דבר

   ⚠️⚠️ **למה לא פשוט להדביק את השם בכל שורה שנייה.**

   כלי שמכניס הערות לתוך קוד JS בלי להבין אותו ישבור אותו. הערה
   היא חוקית כמעט בכל מקום — אבל לא בתוך מחרוזת תבנית (template
   literal), לא בתוך ביטוי רגולרי רב-שורתי, ולא באמצע מחרוזת. די
   בסימון אחד שנוחת בתוך `${...}` כדי שהאפליקציה כולה תפסיק לעבוד.

   ⚠️ **הפתרון כאן אינו לנתח את השפה, אלא לאמת את התוצאה.**

   הכלי מכניס סימונים למקומות שנראים בטוחים, ואז מריץ על הקובץ
   בדיקת תחביר אמיתית של Node. אם הבדיקה נכשלת — הוא מנסה שוב עם
   קבוצת מיקומים שמרנית בהרבה (רק אחרי סוגר סוגר בעמודה 0). אם גם
   זה נכשל — הוא **מחזיר את הקובץ כפי שהיה** ומוותר עליו.

   כלומר: הכלי לא יכול לשבור את האפליקציה. במקרה הגרוע הוא פשוט
   מסמן פחות. זו ההחלטה הנכונה כשהמחיר של טעות הוא אפליקציה מתה
   בטלפון של ילד.
   ================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OWNER_HE = 'דניאל אברהם חדאד';
const OWNER_EN = 'Daniel Avraham Haddad';
const FP = 'CBY-T7R4L2E9';
const CID = 'DAH-CBY-2026';
const APP = 'צאבי הצב — שומר צבי הים';

const TARGET_MARKS = 1000;   // היעד שנקבע
const COUNT_ONLY = process.argv.includes('--count');

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'tools', 'tests', '.netlify']);
const SKIP_FILES = new Set(['three.min.js', 'brain.js', 'brain.json', '_shot.html',
  '_artifact-index.html']);

const JS_HEADER = [
  '/* ==================================================================',
  '   © כל הזכויות שמורות | ALL RIGHTS RESERVED',
  '   ' + APP,
  '   יוצר ובעלים בלעדי: ' + OWNER_HE + ' | Creator & sole owner: ' + OWNER_EN,
  '   🔒 [CBY-PROOF] טביעת אצבע: ' + FP + ' · מזהה יוצר: ' + CID,
  '   Unauthorized copying, distribution or attribution is prohibited.',
  '   ================================================================== */'
].join('\n');

const CSS_HEADER = JS_HEADER;

const HTML_HEADER = [
  '<!--',
  '  © כל הזכויות שמורות | ALL RIGHTS RESERVED',
  '  ' + APP,
  '  יוצר ובעלים בלעדי: ' + OWNER_HE + ' | ' + OWNER_EN,
  '  🔒 [CBY-PROOF] ' + FP + ' · ' + CID,
  '-->'
].join('\n');

const INLINE_JS = '/* © ' + OWNER_HE + ' · ' + FP + ' */';
const INLINE_HTML = '<!-- © ' + OWNER_HE + ' · ' + FP + ' -->';

/* ——— איסוף הקבצים ——— */
function walk(dir, out) {
  out = out || [];
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(full, out);
    } else if (/\.(js|css|html|json)$/i.test(name) && !SKIP_FILES.has(name)) {
      out.push(full);
    }
  }
  return out;
}

/* ——— ספירת סימונים ——— */
function countMarks(text) {
  let n = 0;
  for (const needle of [FP, OWNER_HE, OWNER_EN, CID]) {
    let i = 0;
    while ((i = text.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
  }
  return n;
}

/* ——— בדיקת תחביר אמיתית ——— */
function jsOk(text) {
  const tmp = path.join(ROOT, '.mark-check.js');
  try {
    fs.writeFileSync(tmp, text, 'utf8');
    execFileSync(process.execPath, ['--check', tmp], { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) { }
  }
}

/* ——— כותרת ——— */
function ensureHeader(text, header, marker) {
  if (text.includes(marker)) return text;
  return header + '\n' + text;
}

/* ——— סימונים פנימיים ב-JS ——— */
// רגיל: שורה ריקה שקודמת לה שורה שנגמרת בסוגר/נקודה-פסיק
// שמרני: רק שורה שהיא בדיוק `}` / `});` / `})();` בעמודה 0
function jsCandidates(lines, conservative) {
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() !== '') continue;
    const prev = lines[i - 1];
    if (conservative) {
      if (/^(\}|\}\);|\}\)\(\);|\};)\s*$/.test(prev)) out.push(i);
    } else {
      if (/[;})]\s*$/.test(prev) && !/^\s*\/\//.test(prev)) out.push(i);
    }
  }
  return out;
}

function insertAt(lines, positions, marker) {
  const copy = lines.slice();
  // מהסוף להתחלה כדי שהאינדקסים לא יזוזו
  for (let k = positions.length - 1; k >= 0; k--) {
    copy.splice(positions[k], 0, marker);
  }
  return copy;
}

function markJs(file, quota) {
  let text = fs.readFileSync(file, 'utf8');
  const before = countMarks(text);
  text = ensureHeader(text, JS_HEADER, '[CBY-PROOF]');

  if (quota > 0) {
    const lines = text.split('\n');
    let cands = jsCandidates(lines, false);
    if (cands.length > quota) {
      const step = cands.length / quota;
      const picked = [];
      for (let k = 0; k < quota; k++) picked.push(cands[Math.floor(k * step)]);
      cands = picked;
    }
    if (cands.length) {
      let attempt = insertAt(lines, cands, INLINE_JS).join('\n');
      if (!jsOk(attempt)) {
        // ניסיון שני — מיקומים שמרניים בלבד
        let safe = jsCandidates(lines, true);
        if (safe.length > quota) safe = safe.slice(0, quota);
        attempt = safe.length ? insertAt(lines, safe, INLINE_JS).join('\n') : text;
        if (!jsOk(attempt)) attempt = text;   // ויתור מלא על הקובץ
      }
      text = attempt;
    }
  }

  if (!COUNT_ONLY) fs.writeFileSync(file, text, 'utf8');
  return { before, after: countMarks(text) };
}

function markCss(file, quota) {
  let text = fs.readFileSync(file, 'utf8');
  const before = countMarks(text);
  text = ensureHeader(text, CSS_HEADER, '[CBY-PROOF]');

  if (quota > 0) {
    const lines = text.split('\n');
    const cands = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '' && /\}\s*$/.test(lines[i - 1])) cands.push(i);
    }
    let picked = cands;
    if (cands.length > quota) {
      const step = cands.length / quota;
      picked = [];
      for (let k = 0; k < quota; k++) picked.push(cands[Math.floor(k * step)]);
    }
    if (picked.length) text = insertAt(lines, picked, INLINE_JS).join('\n');
  }

  if (!COUNT_ONLY) fs.writeFileSync(file, text, 'utf8');
  return { before, after: countMarks(text) };
}

function markHtml(file, quota) {
  let text = fs.readFileSync(file, 'utf8');
  const before = countMarks(text);
  if (!text.includes('[CBY-PROOF]')) {
    // הכותרת נכנסת אחרי doctype אם קיים
    const m = text.match(/^\s*<!DOCTYPE[^>]*>\s*/i);
    text = m ? text.slice(0, m[0].length) + HTML_HEADER + '\n' + text.slice(m[0].length)
             : HTML_HEADER + '\n' + text;
  }

  if (quota > 0) {
    const lines = text.split('\n');
    const cands = [];
    let inScript = false, inStyle = false, inComment = false;
    for (let i = 0; i < lines.length; i++) {
      const L = lines[i];
      if (/<script[\s>]/i.test(L)) inScript = true;
      if (/<\/script>/i.test(L)) { inScript = false; continue; }
      if (/<style[\s>]/i.test(L)) inStyle = true;
      if (/<\/style>/i.test(L)) { inStyle = false; continue; }
      if (/<!--/.test(L) && !/-->/.test(L)) inComment = true;
      if (/-->/.test(L)) { inComment = false; continue; }
      if (inScript || inStyle || inComment) continue;
      // ⚠️ רק שורה שנפתחת בתגית בלוק ונגמרת באותה שורה או פותחת בלוק
      if (/^\s*<(section|main|div|nav|header|footer|article|h1|h2|form|ol|ul)[\s>]/i.test(L)) {
        cands.push(i);
      }
    }
    let picked = cands;
    if (cands.length > quota) {
      const step = cands.length / quota;
      picked = [];
      for (let k = 0; k < quota; k++) picked.push(cands[Math.floor(k * step)]);
    }
    if (picked.length) text = insertAt(lines, picked, INLINE_HTML).join('\n');
  }

  if (!COUNT_ONLY) fs.writeFileSync(file, text, 'utf8');
  return { before, after: countMarks(text) };
}

/* ——— הרצה ——— */
const files = walk(ROOT);
let total = 0;
for (const f of files) total += countMarks(fs.readFileSync(f, 'utf8'));

console.log('🔒 סימון בעלות — ' + APP);
console.log('   ' + OWNER_HE + ' / ' + OWNER_EN + ' · ' + FP);
console.log('   קבצים: ' + files.length + ' · סימונים כרגע: ' + total);

if (COUNT_ONLY) {
  console.log('   (ספירה בלבד — לא שונה דבר)');
  process.exit(0);
}

/* ⚠️ המכסה מחולקת לפי גודל הקובץ ולא שווה בשווה: קובץ של 3,000
   שורות יכול לשאת מאה סימונים בלי שאיש ירגיש, וקובץ של 40 שורות
   יהפוך לרשימת הערות אם ננהג בו אותו דבר. */
const need = Math.max(0, TARGET_MARKS - total);
const sizes = files.map(f => ({ f, lines: fs.readFileSync(f, 'utf8').split('\n').length }));
const totalLines = sizes.reduce((a, b) => a + b.lines, 0);

let added = 0;
for (const { f, lines } of sizes) {
  const quota = need > 0 ? Math.round((lines / totalLines) * need * 1.25) : 0;
  const ext = path.extname(f).toLowerCase();
  let r;
  if (ext === '.js') r = markJs(f, quota);
  else if (ext === '.css') r = markCss(f, quota);
  else if (ext === '.html') r = markHtml(f, quota);
  else continue;
  added += (r.after - r.before);
}

let after = 0;
for (const f of files) after += countMarks(fs.readFileSync(f, 'utf8'));
console.log('   נוספו: ' + added + ' · סה"כ עכשיו: ' + after +
  (after >= TARGET_MARKS ? '  ✅ היעד הושג' : '  ⚠️ מתחת ליעד'));
