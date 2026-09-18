#!/usr/bin/env node
/* ==================================================================
   🔒 [CBY-PROOF] חותם זמן ותקציר — OWNERSHIP.json
   © דניאל אברהם חדאד / Daniel Avraham Haddad · CBY-T7R4L2E9
   ------------------------------------------------------------------
   שימוש:  node tools/fingerprint.js

   ⚠️⚠️ **זו הראיה החזקה ביותר בכל מנגנון הבעלות, ולא בגלל הקוד.**

   כל השאר — הסימונים בקוד, הקנרים, השמירה על הסימון במסך — מוכיח
   ש**מישהו** העתיק. הקובץ הזה מוכיח משהו אחר לגמרי: ש**אצלך**,
   בתאריך מסוים, היה קובץ עם תוכן מדויק מסוים.

   SHA-256 הוא תקציר חד-כיווני: אי אפשר להנדס ממנו את הקובץ, אבל
   כל שינוי של בית אחד משנה אותו לגמרי. כלומר — אם מחר יופיע קוד
   דומה אצל מישהו אחר, אפשר להראות שהתקציר של הקובץ שלך תואם את
   מה שרשום כאן בתאריך שקדם לו.

   ⚠️ **ומה שהופך את זה למשמעותי באמת: חותמת זמן חיצונית.**
   התאריך בקובץ הזה נכתב על ידי המחשב שלך, ולכן אפשר לטעון שהוא
   שונה. לכן הקובץ נועד להיות **מופקד** — נדחף ל-Git (שמתעד זמן
   מחוץ למחשב שלך), נשלח במייל לעצמך, או מוגש לשירות חותם זמן.
   הקוד מייצר את הראיה; ההפקדה היא מה שנותן לה תוקף.
   ================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'OWNERSHIP.json');

const OWNER_HE = 'דניאל אברהם חדאד';
const OWNER_EN = 'Daniel Avraham Haddad';
const FP = 'CBY-T7R4L2E9';
const CID = 'DAH-CBY-2026';
const APP = 'צאבי הצב — שומר צבי הים';
const APP_EN = 'Chubby the Turtle — Sea Turtle Guardian';

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.netlify', 'screenshots']);
const SKIP_FILES = new Set(['OWNERSHIP.json', '_shot.html', '_artifact-index.html']);

function walk(dir, out) {
  out = out || [];
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) { if (!SKIP_DIRS.has(name)) walk(full, out); }
    else if (!SKIP_FILES.has(name)) out.push(full);
  }
  return out;
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function countMarks(file) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { return 0; }
  let n = 0;
  for (const needle of [FP, OWNER_HE, OWNER_EN, CID]) {
    let i = 0;
    while ((i = text.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
  }
  return n;
}

/* ⚠️ אם יש Git — התקציר של ה-commit האחרון הוא עוגן זמן שנוצר
   מחוץ למחשב הזה ברגע שדוחפים. זו הסיבה היחידה שהוא כאן. */
function gitInfo() {
  try {
    const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT }).toString().trim();
    const when = execFileSync('git', ['log', '-1', '--format=%cI'], { cwd: ROOT }).toString().trim();
    const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: ROOT })
      .toString().trim();
    return { commit: head, committedAt: when, remote: remote };
  } catch (e) { return null; }
}

const files = walk(ROOT).sort();
const records = files.map(f => {
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  const st = fs.statSync(f);
  return {
    file: rel,
    bytes: st.size,
    sha256: sha256(f),
    modified: new Date(st.mtime).toISOString(),
    copyrightMarks: countMarks(f),
    owner: OWNER_EN,
    fingerprint: FP
  };
});

const totalMarks = records.reduce((a, r) => a + r.copyrightMarks, 0);

const doc = {
  '⚠️': 'This file is legal evidence of authorship. Do not edit by hand.',
  app: { he: APP, en: APP_EN },
  owner: {
    he: OWNER_HE,
    en: OWNER_EN,
    role: 'Creator and sole owner / יוצר ובעלים בלעדי'
  },
  fingerprint: FP,
  creatorId: CID,
  copyright: '© ' + new Date().getFullYear() + ' ' + OWNER_HE + ' · ' + OWNER_EN +
    ' — כל הזכויות שמורות / ALL RIGHTS RESERVED',
  notice: 'אין להעתיק, להפיץ, לשנות או לעשות שימוש מסחרי בקוד או בתוכן ללא אישור ' +
    'בכתב מהיוצר. Unauthorized copying, distribution, modification or commercial ' +
    'use is prohibited and actionable by law.',
  canaries: ['CBY-T7R4L2E9', 'DAH-CBY-2026', 'cby_kav_7r4l',
    'chubby_haddad_seed', 'CBY-PROOF', 'cby-nitznutz-2026'],
  generatedAt: new Date().toISOString(),
  git: gitInfo(),
  totals: {
    files: records.length,
    bytes: records.reduce((a, r) => a + r.bytes, 0),
    copyrightMarks: totalMarks
  },
  files: records
};

fs.writeFileSync(OUT, JSON.stringify(doc, null, 2), 'utf8');

console.log('🔒 OWNERSHIP.json נוצר');
console.log('   בעלים: ' + OWNER_HE + ' / ' + OWNER_EN);
console.log('   טביעת אצבע: ' + FP + ' · מזהה יוצר: ' + CID);
console.log('   קבצים: ' + records.length + ' · סימוני זכויות: ' + totalMarks);
console.log('   תאריך: ' + doc.generatedAt);
if (!doc.git) {
  console.log('   ⚠️ אין Git — התאריך נכתב על ידי המחשב הזה בלבד.');
  console.log('      דחיפה ל-GitHub מוסיפה חותמת זמן חיצונית, וזה מה שנותן תוקף.');
}
