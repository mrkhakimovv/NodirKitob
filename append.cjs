const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tTypeBlock = "`p-4 rounded-2xl border backdrop-blur-xl flex items-center gap-3 shadow-2xl pointer-events-auto ${t.type==='success'?'bg-green-500/20 border-green-500/30 text-green-100':t.type==='error'?'bg-red-500/20 border-red-500/30 text-red-100':'bg-blue-500/20 border-blue-500/30 text-blue-100'}`";

code += `
      {isAdmin && (
         <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none w-[90%] max-w-sm">
            <AnimatePresence>
               {toasts.map(t => (
                  <motion.div key={t.id} initial={{opacity:0, y:-20, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, y:-20, scale:0.95}} className={${tTypeBlock}}>
                     {t.type==='success'?<CheckCircle2 size={20}/>:t.type==='error'?<PlusCircle size={20} className="rotate-45"/>:<CheckCircle2 size={20}/>}
                     <span className="font-bold text-sm tracking-wide">{t.msg}</span>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>
      )}

      <AnimatePresence>
         {confirmModal.isOpen && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-end justify-center sm:items-center pointer-events-auto">
               <motion.div initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring', damping:25, stiffness:300}} className="w-full max-w-[480px] bg-[#111111] p-6 rounded-t-[32px] sm:rounded-[32px] border border-white/10 shadow-2xl space-y-6">
                  <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-2 sm:hidden"></div>
                  <h3 className="text-xl font-black text-white text-center pb-2">{confirmModal.config?.title}</h3>
                  <div className="flex gap-3">
                     <button onClick={() => setConfirmModal({isOpen:false, config:null})} className="flex-1 h-14 bg-white/5 border border-white/10 text-white font-bold rounded-2xl active:scale-95 transition-all">Bekor</button>
                     <button onClick={confirmModal.config?.onConfirm} className="flex-1 h-14 bg-red-500 text-white font-bold rounded-2xl active:scale-95 transition-all shadow-lg shadow-red-500/20">Tasdiqlayman</button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
      </>
  );
}
`;

fs.writeFileSync('src/App.tsx', code);
