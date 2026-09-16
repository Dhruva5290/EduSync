const fs = require('fs');
let c = fs.readFileSync('src/server/gemini.ts', 'utf8');
c = c.replace(/Type\.INTEGER/g, '"integer"');
c = c.replace(/t\.output_text/g, 't.text');
c = c.replace(/cleanText/g, 'cleanText'); // Dummy replace
// check for any other wrongly replaced .text like parsed.output_text?
// Wait, `parsed.text` wasn't common, it was `parsed.content`, `parsed.summary`.
c = c.replace(/parsed\.output_text/g, 'parsed.text');
fs.writeFileSync('src/server/gemini.ts', c);
console.log('Fixed');
