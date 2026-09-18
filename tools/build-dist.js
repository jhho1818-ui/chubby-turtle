#!/usr/bin/env node
/* ==================================================================
   📦 [CBY-DEPLOY] בניית תיקיית dist לפרסום
   © דניאל אברהם חדאד / Daniel Avraham Haddad · CBY-T7R4L2E9
   ------------------------------------------------------------------
   ⚠️⚠️ **למה בכלל צריך שלב בנייה לאתר סטטי.**

   בלי זה, Netlify מפרסם את **כל** תיקיית הפרויקט: גם tools, גם
   קובצי ה-bat, גם המדריכים, גם ה-ZIP וגם OWNERSHIP.json. כלומר
   כל מי שמנחש שם קובץ מוריד את כלי העבודה שלך.

   ⚠️ **ורשימת הקבצים אינה נכתבת כאן ביד — היא נגזרת מ-sw.js.**
   זה לא תחכום: זו הדרך היחידה למנוע את התקלה הקלאסית שבה מוסיפים
   קובץ לאפליקציה, שוכחים אותו ברשימת הבנייה, והאתר החי נשבר —
   אבל רק אצל משתמשים חדשים, כי אצלך הכול במטמון.
   ================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

/* הרשימה נגזרת מהמערך ASSETS שב-sw.js */
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const m = sw.match(/ASSETS\s*=\s*\[([\s\S]*?)\]/);
if (!m) { console.error('[X] לא נמצא מערך ASSETS ב-sw.js'); process.exit(1); }

const assets = m[1]
  .split(',')
  .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
  .filter(Boolean)
  .map(s => s.replace(/^\.\//, ''))
  .filter(s => s && s !== '.' && !s.startsWith('//'));

/* קבצים שחייבים להתפרסם גם אם אינם ב-sw.js */
const EXTRA = ['index.html', 'manifest.json', 'sw.js', 'brain.json',
  '_redirects', 'robots.txt'];

const wanted = Array.from(new Set(assets.concat(EXTRA)));

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

let copied = 0, missing = [];
for (const rel of wanted) {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) { missing.push(rel); continue; }
  const dest = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  copied++;
}

/* ⚠️ הצהרת הבעלות מתפרסמת **בכוונה**: היא חלק מהראיה, לא סוד. */
for (const f of ['OWNERSHIP.md', 'LICENSE']) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) { fs.copyFileSync(src, path.join(DIST, f)); copied++; }
}

console.log('📦 dist נבנה · ' + copied + ' קבצים');
if (missing.length) {
  console.log('⚠️ חסרים (נמצאים ב-sw.js אבל לא בדיסק): ' + missing.join(', '));
}
console.log('🔒 © דניאל אברהם חדאד / Daniel Avraham Haddad · CBY-T7R4L2E9');
