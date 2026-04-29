import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// The file currently has:
// 411:         <>
// 412:           {/* --- Main App Content --- */}
// 413:           {/* Main layout depends on whether user is admin and wants ONLY admin view */}
// 414:           {isAdmin ? (
// 415:             <div className="absolute top-0 left-0 w-full h-[calc(100%-4rem-env(safe-area-inset-bottom))] bg-[#121212] z-30 flex flex-col overflow-hidden sm:rounded-[48px]">

// Wait, looking at lines 810 to 825, we have:
//               </div>
//             </div>
//           </div>
//         )}
//               <div className="flex gap-2 mb-6 overflow-x-auto hide-scroll pb-2 mt-4 mx-4 snap-x">
//               <button onClick={() => setAdminTab('orders')} className={`flex-none px-4 py-3 text-xs font-bold rounded-lg transition-colors snap-start ${adminTab === 'orders' ? 'bg-[#fec204] text-white' : 'text-white/70'}`}>Buyurtmalar</button>

// We need to replace `{isAdmin ? (` back to normal structure, wrapping the proper conditionals.

code = code.replace(
  /\{\/\* Main layout depends on whether user is admin and wants ONLY admin view \*\/\}\n\s*\{isAdmin \? \(/,
  `{/* Main App Container */}`
);

// find where Admin Panel header begins and replace with {isAdmin && (
code = code.replace(
  /<div className="absolute top-0 left-0 w-full h-\[calc\(100%-4rem-env\(safe-area-inset-bottom\)\)] bg-\[\#121212\] z-30 flex flex-col overflow-hidden sm:rounded-\[48px\]">\n\s*<div className="pt-12 px-6 pb-6 bg-\[\#000000\] rounded-b-\[48px\] shadow-lg relative overflow-hidden flex-shrink-0">/,
  `<div className="absolute top-0 left-0 w-full h-[calc(100%-4rem-env(safe-area-inset-bottom))] bg-[#121212] z-30 flex flex-col overflow-hidden sm:rounded-[48px]">
              {isAdmin && (
                <div className="pt-12 px-6 pb-6 bg-[#000000] rounded-b-[48px] shadow-lg relative overflow-hidden flex-shrink-0">`
);

// close the {isAdmin && ( header block. Under `<LogOut size={18} />\n</button>\n</div>\n</div>`
code = code.replace(
  /<LogOut size=\{18\} \/>\n\s*<\/button>\n\s*<\/div>\n\s*<\/div>/,
  `<LogOut size={18} />\n                    </button>\n                 </div>\n              </div>\n              )}`
);

// inside `flex-1 overflow-y-auto`, user's content is: `{/* HOME VIEW */}`
code = code.replace(
  /\{\/\* HOME VIEW \*\/\}/,
  `{!isAdmin ? (\n          <>\n        {/* HOME VIEW */}`
);

// Admin content begins right after CART VIEW / PROFILE VIEW. We need to find the `Profile View` close, and inject `</>) : (<>`
// Profile view close contains checkout form, etc. Let's find `adminTab === 'orders'` and put it before that.
// We remove the old Admin Tabs render because they are now in Bottom Nav!

code = code.replace(
  /<div className="flex gap-2 mb-6 overflow-x-auto hide-scroll pb-2 mt-4 mx-4 snap-x">([\s\S]*?)<\/div>\n\s*\{adminTab === 'orders' && \(/,
  `</>\n        ) : (\n          <>\n            {adminTab === 'orders' && (`
);

// At the very end, we replace `</>)}` which caused the syntax error.
code = code.replace(
  /<\/>\)}\n\s*<\/div>\n\s*\);/,
  `          </>\n        )}\n      </div>\n      {/* Bottom Nav Menu */}`
);
code = code.replace(
  /\{\/\* --- Bottom Navigation Menu --- \*\/\}/,
  `)`
); 
// Wait, the bottom nav is inside the app container, but the syntax is broken. I'll just write a script to re-construct lines 411 to the end perfectly.
fs.writeFileSync('script_fix.js', "console.log('use manual edit');");
