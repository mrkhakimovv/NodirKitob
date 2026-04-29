import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// The problematic injection is at line 414:
// 412:           {/* --- Main App Content --- */}
// 413:           {/* Main layout depends on whether user is admin and wants ONLY admin view */}
// 414:           {isAdmin ? (
// 415:             <div className="absolute top-0 left-0 w-full h-[calc(100%-4rem-env(safe-area-inset-bottom))] bg-[#121212] z-30 flex flex-col overflow-hidden sm:rounded-[48px]">
// 416:               <div className="pt-12 px-6 pb-6 bg-[#000000] rounded-b-[48px] shadow-lg relative overflow-hidden flex-shrink-0">
// 417:                  <div className="flex justify-between items-center z-10 relative">
// 418:                    <div className="w-10"></div>
// 419:                    <h2 className="text-xl font-bold text-white uppercase tracking-wider text-center">ADMIN <span className="text-[#fec204]">PANEL</span></h2>
// 420:                    <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center text-red-500 rounded-full bg-[#1c1c1c]/5 active:scale-90 transition-transform">
// 421:                       <LogOut size={18} />
// 422:                    </button>
// 423:                  </div>
// 424:               </div>
// 425:               
// 426:               <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 custom-scrollbar">

// Let's replace that back to the normal structure.
code = code.replace(
  /\{\/\* Main layout depends on whether user is admin and wants ONLY admin view \*\/\}\s*\{isAdmin \? \([\s\S]*?<div className="flex-1 overflow-y-auto px-4 py-4 pb-8 custom-scrollbar">/,
  `{/* --- User App Content --- */}
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 custom-scrollbar">`
);

// We need to also find where I broke `</>)}` at the end of the file.
code = code.replace(
  /<\/>\)}\n\s*<\/div>\n\s*\);\n}/,
  `          </>\n        )}\n      </div>\n    </div>\n  );\n}`
);

// We should remove the old Admin View wrapper because we will manage rendering via isAdmin.
// The old Admin View was: `{/* ADMIN VIEW */}\n      {activeTab === 'admin' && isAdmin && (`
// Let's replace the whole ADMIN VIEW with a properly formatted AdminView if isAdmin.
// Let's just find the `isAdmin` rendering and re-do the whole conditional properly.

fs.writeFileSync('src/App.tsx.backup', code);
