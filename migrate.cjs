const fs = require('fs');

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/import\s*\{\s*GoogleGenAI\s*,\s*Type\s*\}\s*from\s*'@google\/genai';/g, "import { GoogleGenAI } from '@google/genai';");
  content = content.replace(/import\s*\{\s*Type\s*,\s*GoogleGenAI\s*\}\s*from\s*'@google\/genai';/g, "import { GoogleGenAI } from '@google/genai';");
  
  content = content.replace(/Type\.OBJECT/g, '"object"');
  content = content.replace(/Type\.STRING/g, '"string"');
  content = content.replace(/Type\.ARRAY/g, '"array"');
  content = content.replace(/Type\.NUMBER/g, '"number"');
  content = content.replace(/Type\.BOOLEAN/g, '"boolean"');

  // We can just use a regex replace with a function for the whole ai.models.generateContent call
  // Since JS regex engine supports matching up to config block.
  // A generateContent call looks like:
  // ai.models.generateContent({
  //   model: 'gemini-3.6-flash',
  //   contents: promptContext,
  //   config: {
  //     systemInstruction,
  //     responseMimeType: 'application/json',
  //     responseSchema: { ... }
  //   }
  // });
  
  // Replace the method
  content = content.replace(/ai\.models\.generateContent/g, 'ai.interactions.create');
  
  // Replace model
  content = content.replace(/model:\s*'gemini-3\.6-flash'/g, "model: 'gemini-3.8-flash'");
  content = content.replace(/model:\s*'gemini-2\.5-flash'/g, "model: 'gemini-3.8-flash'");
  content = content.replace(/model:\s*'gemini-3\.5-flash'/g, "model: 'gemini-3.8-flash'");
  
  // Replace contents -> input
  content = content.replace(/contents:/g, 'input:');
  
  // Now replace config block structure
  content = content.replace(/config:\s*\{/g, '');
  
  // Fix systemInstruction -> system_instruction
  content = content.replace(/systemInstruction:/g, 'system_instruction:');
  content = content.replace(/systemInstruction,/g, 'system_instruction: systemInstruction,');
  content = content.replace(/systemInstruction\s*\n/g, 'system_instruction: systemInstruction\n');
  
  // responseMimeType -> response_format. We will open response_format and schema
  content = content.replace(/responseMimeType:\s*'application\/json',/g, "response_format: {\n        type: 'text',\n        mime_type: 'application/json',");
  content = content.replace(/responseSchema:/g, 'schema:');
  
  // response.text -> response.output_text
  content = content.replace(/\.text/g, '.output_text');

  fs.writeFileSync(filePath, content);
}

migrateFile('src/server/gemini.ts');
console.log('Migration completed for gemini.ts');
