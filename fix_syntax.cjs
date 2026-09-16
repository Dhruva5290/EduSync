const fs = require('fs');

let content = fs.readFileSync('src/server/gemini.ts', 'utf8');
let lines = content.split('\n');

// We know the errors are around line 622 and 2297 because `npx tsc --noEmit` told us:
// src/server/gemini.ts(622,9): error TS1005: ',' expected.
// src/server/gemini.ts(2297,5): error TS1005: ',' expected.

// The issue is `system_instruction: systemInstruction` followed by `          }` on the next line.

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('system_instruction: systemInstruction') && lines[i+1] && lines[i+1].match(/^\s*\}\s*$/)) {
    // Delete the brace line
    lines[i+1] = '';
  }
}

fs.writeFileSync('src/server/gemini.ts', lines.join('\n'));
console.log('Fixed syntax errors');
