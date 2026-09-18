#!/usr/bin/env node
/* ==================================================================
   🔢 [CBY-DEPLOY] העלאת מספר גרסת המטמון ב-sw.js
   © דניאל אברהם חדאד / Daniel Avraham Haddad · CBY-T7R4L2E9
   ------------------------------------------------------------------
   שימוש:  node tools/cache-version.js --fix

   ⚠️⚠️ **זה הצעד שאם שוכחים אותו, שום עדכון לא מגיע לאף אחד.**

   ה-Service Worker מגיש למשתמש את מה ששמור במטמון. הוא מחליף את
   המטמון רק כששם המטמון משתנה. כלומר: אפשר להעלות גרסה חדשה
   מושלמת, לראות אותה עובדת אצלך (כי אצלך אין מטמון ישן), ולחשוב
   שהכול תקין — בזמן שכל מי שהתקין את האפליקציה ממשיך לראות את
   הגרסה הישנה לנצח.

   הסקריפט הזה רץ אוטומטית לפני כל פרסום בדיוק בשביל זה.
   ================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const SW = path.resolve(__dirname, '..', 'sw.js');
let text = fs.readFileSync(SW, 'utf8');
const m = text.match(/CACHE\s*=\s*'chubby-v(\d+)'/);

if (!m) { console.error('[X] לא נמצאה שורת CACHE ב-sw.js'); process.exit(1); }

const cur = parseInt(m[1], 10);
const next = cur + 1;

if (process.argv.includes('--fix')) {
  text = text.replace(/CACHE\s*=\s*'chubby-v\d+'/, "CACHE = 'chubby-v" + next + "'");
  fs.writeFileSync(SW, text, 'utf8');
  console.log('🔢 גרסת מטמון: chubby-v' + cur + '  ➜  chubby-v' + next);
} else {
  console.log('🔢 גרסת מטמון נוכחית: chubby-v' + cur + '  (הרץ עם --fix כדי להעלות)');
}
