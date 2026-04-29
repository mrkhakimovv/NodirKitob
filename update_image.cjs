const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const pasteHandler = `

  useEffect(() => {
     if (activeTab !== 'admin' || adminTab !== 'add') return;
     const handlePaste = (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
           if (items[i].type.indexOf('image') !== -1) {
              const file = items[i].getAsFile();
              if (file) {
                 const reader = new FileReader();
                 reader.onload = (ev) => {
                    if (ev.target?.result) {
                       setBfCover(ev.target.result as string);
                    }
                 };
                 reader.readAsDataURL(file);
              }
              break;
           }
        }
     };
     document.addEventListener('paste', handlePaste);
     return () => document.removeEventListener('paste', handlePaste);
  }, [activeTab, adminTab]);
`;

code = code.replace(/};\s*fetchBooks\(\);\s*}, \[\]\);/g, `};
    fetchBooks();
  }, []);
${pasteHandler}
`);

// Now for the input and clicking part
const oldImageUI = `<div className="w-28 h-40 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center text-white/30 text-xs font-bold text-center p-4">Muqova manzili (URL) ni kiriting</div>`;
const newImageUI = `
                           <label className="w-28 h-40 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-white/30 cursor-pointer hover:border-[#FEC204] hover:text-[#FEC204] transition-colors p-4 focus-within:border-[#FEC204]">
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                       if (ev.target?.result) {
                                          setBfCover(ev.target.result as string);
                                       }
                                    };
                                    reader.readAsDataURL(file);
                                 }
                              }} />
                              <span className="text-[10px] font-bold text-current text-center">Rasm yuklash yoki Ctrl+V</span>
                           </label>
`;

code = code.replace(oldImageUI, newImageUI);

fs.writeFileSync('src/App.tsx', code);
console.log('App updated');
