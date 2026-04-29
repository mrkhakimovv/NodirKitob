const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexExtract = /\s*\/\/ --- ADMIN PANEL NEW STATES ---[\s\S]*?attemptArchiveBook[^]*?\}\s*;\s*/;
const match = code.match(regexExtract);

if (match) {
  const adminStateBlock = match[0];
  // Remove from existing spot
  code = code.replace(adminStateBlock, '');
  
  // Find where to insert in App component
  // App component ends its top level code somewhere before "return (" that is preceded by `const filteredBooks` 
  const replacePoint = /\s*return \(\s*<div className="w-full max-w-\[480px\]/;
  
  code = code.replace(replacePoint, "\n" + adminStateBlock + "\n  return (\n    <div className=\"w-full max-w-[480px]");
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('Fixed state placement!');
} else {
  console.log('Could not find state block!');
}
