const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace(/books\[0\]/g, 'visibleBooks[0]');
content = content.replace(/books\.slice/g, 'visibleBooks.slice');
fs.writeFileSync('src/App.tsx', content);
