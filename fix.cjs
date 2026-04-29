const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const newStateType = "<'dashboard' | 'orders' | 'books' | 'add' | 'report' | 'archive'>('dashboard')";
code = code.replace(/<'orders' \| 'books' \| 'add' \| 'report' \| 'archive'>\('orders'\)/, newStateType);

const imports = "import { Home, Inbox, Search, ShoppingBag, User, ChevronLeft, ChevronRight, Minus, Plus, Star, BookOpen, Clock, Trash2, Heart, LogOut, Package, Edit3, PlusCircle, BarChart3, Archive, ShoppingCart, LogIn, Key, HelpCircle, CheckCircle2, Navigation2 } from 'lucide-react';";
code = code.replace(/import \{.*?\} from 'lucide-react';/, imports);

const additions = `
  // --- ADMIN PANEL NEW STATES ---
  const [toasts, setToasts] = useState<{id: number, type: 'success'|'error'|'info', msg: string}[]>([]);
  const showToast = (msg: string, type: 'success'|'error'|'info' = 'info') => {
     const id = Date.now();
     setToasts(prev => [...prev, { id, type, msg }]);
     setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const [booksViewMode, setBooksViewMode] = useState<'list'|'grid'>('list');
  const [ordersFilter, setOrdersFilter] = useState<'all'|'new'|'accepted'>('all');
  const [ordersSort, setOrdersSort] = useState<'desc'|'asc'>('desc');
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, config: null|{title: string, onConfirm: ()=>void}}>({isOpen: false, config: null});

  const [adminBookSearch, setAdminBookSearch] = useState('');
  const [adminBookCat, setAdminBookCat] = useState('Barchasi');

  // Helper Wrappers for existing logic to add Toasts & Modals
  const handleAcceptOrderAdmin = async (id: string, userId: string) => {
     await acceptOrder(id, userId);
     showToast("Buyurtma qabul qilindi", 'success');
  };

  const attemptRejectOrderAdmin = (id: string) => {
     setConfirmModal({
        isOpen: true,
        config: {
           title: "Rostdan ham bekor qilasizmi?",
           onConfirm: async () => {
              await rejectOrder(id);
              showToast("Buyurtma bekor qilindi", 'error');
              setConfirmModal({ isOpen: false, config: null });
           }
        }
     });
  };

  const attemptArchiveBook = (id: string, isArchiving: boolean) => {
     setConfirmModal({
        isOpen: true,
        config: {
           title: isArchiving ? "Kitobni arxivga olasizmi?" : "Arxivdan qaytarasizmi?",
           onConfirm: () => {
              archiveBookToggle(id);
              showToast(isArchiving ? "Arxivlandi" : "Qaytarildi", 'info');
              setConfirmModal({ isOpen: false, config: null });
           }
        }
     });
  };

  return (
`;
code = code.replace(/return \(/, additions);

const adminJSX = `
          {activeTab === 'admin' && isAdmin && (
             <div className="pb-24 flex-1 overflow-y-auto hide-scroll px-4 relative min-h-full">
                {/* 3D Header - Mouse Tilt */}
                <motion.div 
                   className="mt-6 mb-8 w-full p-6 rounded-3xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 shadow-2xl relative overflow-hidden"
                   onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left - rect.width / 2;
                      const y = e.clientY - rect.top - rect.height / 2;
                      e.currentTarget.style.transform = \`perspective(1000px) rotateX(\${-y/20}deg) rotateY(\${x/20}deg)\`;
                   }}
                   onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
                   }}
                   style={{ transition: 'transform 0.1s ease-out', transformStyle: 'preserve-3d' }}
                >
                   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none"></div>
                   <h1 className="text-2xl font-black text-white relative z-10" style={{ transform: 'translateZ(30px)' }}>
                      Xush kelibsiz, <span className="text-[#FEC204]">Admin</span>
                   </h1>
                   <p className="text-white/50 text-sm font-medium mt-1 relative z-10" style={{ transform: 'translateZ(20px)' }}>
                      {new Date().toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                   </p>
                </motion.div>

                {/* --- DASHBOARD TAB --- */}
                {adminTab === 'dashboard' && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        {[
                          { val: orders.reduce((acc,o)=>acc+o.totalAmount,0), label: 'Jami savdo', icon: BarChart3, prefix: '', suffix: '', color: '#FEC204' },
                          { val: orders.length, label: 'Buyurtmalar', icon: Package, prefix: '', suffix: ' ta', color: '#3B82F6' },
                          { val: orders.filter(o=>o.status==='accepted').length, label: 'Qabul qilingan', icon: CheckCircle2, prefix: '', suffix: ' ta', color: '#10B981' },
                          { val: books.filter(b=>!b.isArchived).length, label: 'Kitoblar', icon: BookOpen, prefix: '', suffix: ' ta', color: '#8B5CF6' }
                        ].map((stat, i) => (
                           <motion.div 
                             key={i}
                             initial={{ opacity: 0, y: 20 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: i * 0.1 }}
                             className="bg-[#111111] p-4 rounded-3xl border border-white/5 shadow-lg group hover:border-[#FEC204]/50 hover:scale-[1.02] transition-all cursor-default relative overflow-hidden"
                           >
                              <stat.icon size={20} color={stat.color} className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                              <div className="text-xl font-black text-white flex items-baseline truncate">
                                 {stat.prefix}<AnimatedCounter from={0} to={stat.val} duration={1.5} />{stat.suffix}
                              </div>
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
                           </motion.div>
                        ))}
                     </div>

                     {/* Mini Chart Area */}
                     <div className="bg-[#111111] border border-white/5 p-4 rounded-3xl">
                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">So'nggi 7 kun</h3>
                        <div className="h-32 flex items-end justify-between gap-2">
                           {[...Array(7)].map((_, i) => {
                               const height = 20 + Math.random() * 80;
                               return (
                                 <div key={i} className="flex-1 flex flex-col items-center group relative">
                                    <div className="absolute -top-8 bg-black text-[#FEC204] text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                       +{Math.floor(height * 10)} ming
                                    </div>
                                    <motion.div 
                                       initial={{ height: 0 }} 
                                       animate={{ height: \`\${height}%\` }}
                                       transition={{ delay: i * 0.05, type: 'spring' }}
                                       className="w-full bg-white/10 group-hover:bg-[#FEC204] rounded-t-sm transition-colors"
                                    />
                                 </div>
                               )
                           })}
                        </div>
                     </div>
                     
                     {/* Recent Activity */}
                     <div className="bg-[#111111] border border-white/5 p-4 rounded-3xl">
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">So'nggi faoliyat</h3>
                           <button onClick={()=>setAdminTab('orders')} className="text-[#FEC204] text-[10px] font-bold uppercase hover:underline">Barchasi →</button>
                        </div>
                        <div className="space-y-3">
                           {orders.slice(0,3).map((o, idx) => (
                              <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:idx*0.1}} key={o.id} className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-xs text-[#FEC204]">{o.customerName.charAt(0)}</div>
                                 <div className="flex-1 overflow-hidden">
                                    <div className="text-sm font-bold text-white truncate">{o.customerName}</div>
                                    <div className="text-[10px] text-white/40">{new Date(o.date).toLocaleTimeString('uz-UZ', {hour:'2-digit', minute:'2-digit'})}</div>
                                 </div>
                                 <div className="text-sm font-black text-[#FEC204]">{formatPrice(o.totalAmount)}</div>
                              </motion.div>
                           ))}
                        </div>
                     </div>
                  </motion.div>
                )}

                {/* --- ORDERS TAB --- */}
                {adminTab === 'orders' && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-4">
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
                           {(['all', 'new', 'accepted'] as const).map(f => (
                              <button key={f} onClick={() => setOrdersFilter(f)} className="relative px-3 py-1.5 text-xs font-bold rounded-full">
                                 {ordersFilter === f && <motion.div layoutId="orderFilterBg" className="absolute inset-0 bg-white/10 rounded-full" />}
                                 <span className={\`relative z-10 \${ordersFilter===f ? 'text-[#FEC204]' : 'text-white/40'}\`}>
                                   {f==='all' ? 'Barcha' : f==='new' ? 'Yangi' : 'Qabul'}
                                 </span>
                              </button>
                           ))}
                        </div>
                        <button onClick={()=>setOrdersSort(s=>s==='desc'?'asc':'desc')} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-white/50 hover:text-white active:scale-90 transition-all">
                           <Navigation2 size={14} className={ordersSort==='asc' ? "rotate-180 transition-transform" : "transition-transform"} />
                        </button>
                     </div>
                     
                     <div className="space-y-4">
                       <AnimatePresence>
                        {orders
                          .filter(o => ordersFilter === 'all' ? true : ordersFilter === 'new' ? o.status === 'new' : o.status === 'accepted')
                          .sort((a,b) => ordersSort === 'desc' ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((o) => (
                           <motion.div 
                              layout
                              initial={{opacity:0, scale:0.95}}
                              animate={{opacity:1, scale:1}}
                              exit={{opacity:0, scale:0.95}}
                              key={o.id}
                              drag="x"
                              dragConstraints={{left: o.status==='new' ? -80 : 0, right: o.status==='new' ? 80 : 0}}
                              onDragEnd={(e, info) => {
                                 if (o.status !== 'new') return;
                                 if (info.offset.x > 50) handleAcceptOrderAdmin(o.id, o.userId);
                                 else if (info.offset.x < -50) attemptRejectOrderAdmin(o.id);
                              }}
                              className={\`bg-[#111111] p-4 rounded-3xl border transition-colors \${o.status === 'accepted' ? 'border-green-500/30 bg-green-500/5' : 'border-white/5'}\`}
                           >
                              <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <span className="font-black text-white">{o.id}</span>
                                       {o.status === 'new' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-[pulse-glow_2s_infinite]"></span>}
                                    </div>
                                    <div className="text-[10px] text-white/40 font-medium">{new Date(o.date).toLocaleString('uz-UZ')}</div>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-[#FEC204] font-black">{formatPrice(o.totalAmount)}</div>
                                    <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{o.paymentType}</div>
                                 </div>
                              </div>

                              <div className="space-y-2 mb-4 text-sm font-medium">
                                 <div className="flex items-start gap-2"><User size={16} className="text-white/40 shrink-0 mt-0.5"/><span className="text-white/80">{o.customerName}</span></div>
                                 <div className="flex items-start gap-2"><span className="text-white/40 font-bold shrink-0 text-xs w-4">📞</span><span className="text-white/80">{o.customerPhone}</span></div>
                                 <div className="flex items-start gap-2"><Navigation2 size={16} className="text-white/40 shrink-0 mt-0.5 rotate-90"/><span className="text-white/80 line-clamp-2">{o.customerAddress}</span></div>
                              </div>

                              <details className="group mb-4">
                                 <summary className="text-xs font-bold text-white/50 cursor-pointer list-none flex justify-between items-center bg-white/5 p-2 rounded-xl">
                                    <span>{o.items.length} ta kitob</span>
                                    <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                                 </summary>
                                 <div className="pt-2 pl-2 space-y-2">
                                    {o.items.map(i => (
                                       <div key={i.id} className="flex justify-between text-xs text-white/60">
                                          <span>• {i.title} (x{i.quantity})</span>
                                          <span>{formatPrice(i.price * i.quantity)}</span>
                                       </div>
                                    ))}
                                 </div>
                              </details>

                              {o.status === 'new' && (
                                 <div className="flex gap-2">
                                    <button onClick={()=>handleAcceptOrderAdmin(o.id, o.userId)} className="flex-1 bg-green-500/10 text-green-400 border border-green-500/20 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all">Qabul qilish</button>
                                    <button onClick={()=>attemptRejectOrderAdmin(o.id)} className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all">Bekor qilish</button>
                                 </div>
                              )}
                           </motion.div>
                        ))}
                       </AnimatePresence>
                     </div>
                  </motion.div>
                )}

                {/* --- BOOKS TAB --- */}
                {adminTab === 'books' && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-4">
                     <div className="flex gap-2 items-center">
                        <div className="relative flex-1 group">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                          <input 
                            type="text" placeholder="Qidiruv..." 
                            value={adminBookSearch} onChange={e=>setAdminBookSearch(e.target.value)}
                            className="w-full h-10 bg-[#111111] rounded-xl pl-9 pr-3 text-sm border border-white/5 focus:border-[#FEC204] outline-none text-white transition-all"
                          />
                        </div>
                        <button onClick={()=>setBooksViewMode(m=>m==='list'?'grid':'list')} className="w-10 h-10 flex items-center justify-center bg-[#111111] rounded-xl border border-white/5 active:scale-90 transition-all text-white/50 hover:text-white">
                           {booksViewMode === 'list' ? <Package size={18}/> : <Home size={18}/>}
                        </button>
                     </div>
                     
                     <div className="flex overflow-x-auto hide-scroll gap-2 pb-2">
                        {['Barchasi', ...categories].map(cat => (
                           <button key={cat} onClick={()=>setAdminBookCat(cat)} className={\`whitespace-nowrap px-3 py-1 font-bold text-xs rounded-full border \${adminBookCat===cat ? 'bg-white/10 border-white/20 text-[#FEC204]' : 'bg-transparent border-white/5 text-white/40'}\`}>
                              {cat}
                           </button>
                        ))}
                     </div>

                     <div className={booksViewMode === 'grid' ? "grid grid-cols-2 gap-4" : "space-y-3"}>
                        <AnimatePresence>
                           {books
                              .filter(b => !b.isArchived)
                              .filter(b => adminBookCat === 'Barchasi' || b.category === adminBookCat)
                              .filter(b => b.title.toLowerCase().includes(adminBookSearch.toLowerCase()) || b.author.toLowerCase().includes(adminBookSearch.toLowerCase()))
                              .map(b => (
                                 <motion.div 
                                    layout
                                    initial={{opacity:0, scale:0.95}}
                                    animate={{opacity:1, scale:1}}
                                    exit={{opacity:0, scale:0.95}}
                                    key={b.id} 
                                    className={\`group bg-[#111111] border border-white/5 rounded-2xl overflow-hidden relative \${booksViewMode === 'list' ? 'flex p-2 items-center gap-3' : 'p-3'}\`}
                                 >
                                    <div className={\`relative perspective-600 \${booksViewMode === 'list' ? 'w-16 h-20 shrink-0' : 'w-full aspect-[2/3] mb-3'}\`}>
                                       <motion.img 
                                          whileHover={{ rotateY: 10, rotateX: -5 }}
                                          src={b.coverUrl} 
                                          className="w-full h-full object-cover rounded-lg shadow-md transform-style-3d transition-transform duration-300" 
                                       />
                                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                          <button onClick={()=>startEditBook(b)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 hover:bg-[#FEC204] hover:text-black transition-colors"><Edit3 size={14}/></button>
                                       </div>
                                    </div>
                                    <div className={\`flex-1 \${booksViewMode === 'grid' ? '' : 'min-w-0'}\`}>
                                       <div className="font-bold text-sm text-white truncate">{b.title}</div>
                                       <div className="text-[10px] text-white/50 truncate mb-1">{b.author}</div>
                                       <div className="text-[#FEC204] font-black text-xs">{formatPrice(b.price)}</div>
                                    </div>
                                    {booksViewMode === 'list' && (
                                       <button onClick={()=>attemptArchiveBook(b.id, true)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center active:scale-90 transition-transform shrink-0">
                                          <Archive size={14}/>
                                       </button>
                                    )}
                                 </motion.div>
                           ))}
                        </AnimatePresence>
                     </div>
                  </motion.div>
                )}

                {/* --- ADD/EDIT TAB --- */}
                {adminTab === 'add' && (
                  <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="space-y-6">
                     <h2 className="text-xl font-black text-white">{editingBookId ? "Kitobni tahrirlash" : "Yangi kitob"}</h2>
                     
                     <div className="h-48 flex justify-center items-center perspective-1000 mb-4">
                        {bfCover ? (
                           <div className="w-28 h-40 relative book-3d-anim shadow-2xl">
                              <img src={bfCover} className="w-full h-full object-cover rounded shadow-[-10px_10px_20px_rgba(0,0,0,0.8)]" onError={(e)=>e.currentTarget.src="https://via.placeholder.com/150x200?text=Rasm+Xato"} />
                           </div>
                        ) : (
                           <div className="w-28 h-40 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center text-white/30 text-xs font-bold text-center p-4">Muqova manzili (URL) ni kiriting</div>
                        )}
                     </div>

                     <div className="space-y-4">
                        {[
                          { label: 'Sarlavha', val: bfTitle, set: setBfTitle, type: 'text' },
                          { label: 'Muallif', val: bfAuthor, set: setBfAuthor, type: 'text' },
                          { label: 'Narxi (so\\\'m)', val: bfPrice, set: setBfPrice, type: 'number' },
                          { label: 'Muqova URL', val: bfCover, set: setBfCover, type: 'text' },
                        ].map((field, i) => (
                           <div key={i} className="relative group">
                              <label className={\`absolute left-3 transition-all duration-200 pointer-events-none \${field.val ? '-top-2 text-[10px] bg-[#0A0A0A] px-1 text-[#FEC204]' : 'top-3.5 text-sm text-white/40 group-focus-within:-top-2 group-focus-within:text-[10px] group-focus-within:bg-[#0A0A0A] group-focus-within:px-1 group-focus-within:text-[#FEC204]'}\`}>
                                 {field.label}
                              </label>
                              <input 
                                type={field.type} value={field.val} onChange={e=>field.set(e.target.value)} 
                                className="w-full h-12 bg-transparent border-2 border-white/10 focus:border-[#FEC204] rounded-xl px-4 outline-none text-white font-medium transition-all"
                              />
                           </div>
                        ))}
                        
                        <div className="flex gap-4">
                           <div className="relative group flex-1">
                              <label className={\`absolute left-3 transition-all duration-200 pointer-events-none \${bfPages ? '-top-2 text-[10px] bg-[#0A0A0A] px-1 text-[#FEC204]' : 'top-3.5 text-sm text-white/40 group-focus-within:-top-2 group-focus-within:text-[10px] group-focus-within:bg-[#0A0A0A] group-focus-within:px-1 group-focus-within:text-[#FEC204]'}\`}>Sahifalar</label>
                              <input type="number" value={bfPages} onChange={e=>setBfPages(e.target.value)} className="w-full h-12 bg-transparent border-2 border-white/10 focus:border-[#FEC204] rounded-xl px-4 outline-none text-white font-medium transition-all" />
                           </div>
                           <div className="relative group flex-1">
                              <label className={\`absolute left-3 transition-all duration-200 pointer-events-none \${bfYear ? '-top-2 text-[10px] bg-[#0A0A0A] px-1 text-[#FEC204]' : 'top-3.5 text-sm text-white/40 group-focus-within:-top-2 group-focus-within:text-[10px] group-focus-within:bg-[#0A0A0A] group-focus-within:px-1 group-focus-within:text-[#FEC204]'}\`}>Yil</label>
                              <input type="number" value={bfYear} onChange={e=>setBfYear(e.target.value)} className="w-full h-12 bg-transparent border-2 border-white/10 focus:border-[#FEC204] rounded-xl px-4 outline-none text-white font-medium transition-all" />
                           </div>
                        </div>

                        <div>
                           <label className="text-xs font-bold text-white/50 uppercase tracking-widest pl-1 mb-2 block">Kategoriya</label>
                           <div className="flex flex-wrap gap-2">
                              {categories.map(cat => (
                                 <button key={cat} onClick={()=>setBfCategory(cat)} className={\`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors \${bfCategory === cat ? 'bg-[#FEC204]/20 border-[#FEC204] text-[#FEC204]' : 'bg-transparent border-white/10 text-white/50'}\`}>{cat}</button>
                              ))}
                           </div>
                        </div>

                        <div className="relative group">
                           <label className={\`absolute left-3 transition-all duration-200 pointer-events-none \${bfDescription ? '-top-2 text-[10px] bg-[#0A0A0A] px-1 text-[#FEC204]' : 'top-3.5 text-sm text-white/40 group-focus-within:-top-2 group-focus-within:text-[10px] group-focus-within:bg-[#0A0A0A] group-focus-within:px-1 group-focus-within:text-[#FEC204]'}\`}>Tavsif</label>
                           <textarea value={bfDescription} onChange={e=>setBfDescription(e.target.value)} className="w-full h-24 bg-transparent border-2 border-white/10 focus:border-[#FEC204] rounded-xl p-4 outline-none text-white font-medium transition-all resize-none"></textarea>
                        </div>
                        
                        <AnimatePresence>
                           {bfError && (
                              <motion.div initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{bfError}</motion.div>
                           )}
                        </AnimatePresence>

                        <div className="flex gap-3 pt-2">
                           {editingBookId && (
                              <button onClick={()=>{setEditingBookId(null); setAdminTab('books');}} className="w-14 h-14 rounded-xl border border-white/10 flex items-center justify-center text-white/50 active:scale-95"><ChevronLeft/></button>
                           )}
                           <button onClick={() => { handleAddOrEditBook(); showToast('Muvaffaqiyatli saqlandi', 'success'); }} className="flex-1 h-14 bg-[#FEC204] text-[#0A0A0A] rounded-xl font-black text-lg active:scale-95 transition-transform shadow-lg shadow-[#FEC204]/20 flex justify-center items-center gap-2 group">
                               <CheckCircle2 size={20} className="group-active:scale-125 transition-transform" /> Saqlash
                           </button>
                        </div>
                     </div>
                  </motion.div>
                )}

                {/* --- REPORT TAB --- */}
                {adminTab === 'report' && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-6">
                     <div className="bg-[#111111] p-6 rounded-3xl border border-white/5 text-center flex flex-col items-center shadow-xl">
                        <span className="text-[#FEC204] font-bold text-xs uppercase tracking-widest bg-[#FEC204]/10 px-3 py-1 rounded-full mb-4">Jami Savdo</span>
                        <div className="text-3xl font-black text-white flex items-baseline gap-1">
                           <AnimatedCounter from={0} to={orders.reduce((acc,o)=>acc+o.totalAmount,0)} duration={2} />
                        </div>
                        <p className="text-white/40 text-[10px] mt-2 font-bold font-mono">SO'M (Joriy oy)</p>
                     </div>

                     <div>
                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest pl-1 mb-3">Kategoriyalar bo'yicha</h3>
                        <div className="grid grid-cols-2 gap-3">
                           {categories.slice(0,4).map((cat, i) => {
                              const items = orders.flatMap(o=>o.items).filter(item => books.find(b=>b.id===item.id)?.category === cat);
                              const count = items.reduce((acc,it)=>acc+it.quantity,0);
                              return (
                                 <div key={cat} className="bg-white/5 p-3 rounded-2xl border border-white/5 flex flex-col gap-1">
                                    <span className="text-[10px] text-white/40 font-bold uppercase truncate">{cat}</span>
                                    <span className="text-lg font-black text-white">{count} <span className="text-[10px] font-normal">dona</span></span>
                                 </div>
                              )
                           })}
                        </div>
                     </div>

                     <div>
                        <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest pl-1 mb-3">Top Kitoblar</h3>
                        <div className="space-y-3">
                           {books.slice(0,3).map((b, i) => (
                              <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay: i*0.1}} key={b.id} className="bg-[#111111] border border-white/5 rounded-2xl p-3 flex items-center gap-3 relative overflow-hidden group">
                                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl font-black shrink-0 relative perspective-600">
                                    <motion.div whileHover={{rotateY:180}} transition={{duration:0.6}} style={{transformStyle:'preserve-3d'}} className="w-full h-full absolute flex items-center justify-center">
                                       {i===0 ? '🥇' : i===1 ? '🥈' : '🥉'}
                                    </motion.div>
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm text-white truncate group-hover:text-[#FEC204] transition-colors">{b.title}</div>
                                    <div className="text-[10px] text-white/40 truncate">{b.author}</div>
                                 </div>
                                 <div className="text-[10px] font-black text-[#FEC204] bg-[#FEC204]/10 px-2 py-1 rounded-lg">{(10-i)*9} ta</div>
                              </motion.div>
                           ))}
                        </div>
                     </div>
                  </motion.div>
                )}

                {/* --- ARCHIVE TAB --- */}
                {adminTab === 'archive' && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-4">
                     <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl text-center">
                        <Archive className="mx-auto text-white/20 mb-3" size={32} />
                        <h2 className="text-xl font-black text-white">Arxivda <span className="text-[#FEC204]"><AnimatedCounter from={0} to={books.filter(b=>b.isArchived).length} /></span> ta kitob</h2>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Sotuvdan olingan asarlar</p>
                     </div>

                     <div className="space-y-3 pt-2">
                        <AnimatePresence>
                           {books.filter(b=>b.isArchived).map(b => (
                              <motion.div layout initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} key={b.id} className="bg-[#111111] p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                                 <img src={b.coverUrl} className="w-12 h-16 object-cover rounded shadow-md grayscale opacity-50" />
                                 <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm text-white/50 truncate">{b.title}</div>
                                    <div className="text-[10px] text-white/30 truncate">{b.author}</div>
                                 </div>
                                 <button onClick={()=>attemptArchiveBook(b.id, false)} className="px-3 py-1.5 bg-[#FEC204]/10 text-[#FEC204] text-xs font-bold rounded-lg active:scale-95 transition-transform">Qaytarish</button>
                              </motion.div>
                           ))}
                           {books.filter(b=>b.isArchived).length === 0 && (
                              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="py-10 text-center opacity-40">
                                 <Inbox size={48} className="mx-auto mb-4" />
                                 <p className="font-bold">Arxiv bo'sh</p>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  </motion.div>
                )}
             </div>
          )}
`;
code = code.replace(/\{activeTab === 'admin' && isAdmin && \([\s\S]*?<\/\s*div>\s*\)\}/, adminJSX);

const navJS = `
             {isAdmin ? (
                <>
                  {['dashboard', 'orders', 'add', 'books', 'report'].map((tab, i) => (
                    <button key={tab} onClick={() => setAdminTab(tab)} className="flex-1 flex flex-col items-center justify-center relative z-10 h-full group">
                       <div className="relative">
                          {tab === 'add' ? (
                             <div className={\`w-12 h-12 rounded-full border-4 border-[#111111] bg-[#FEC204] text-[#0A0A0A] flex items-center justify-center absolute -top-8 -left-6 shadow-[0_0_20px_rgba(254,194,4,0.3)] transition-transform duration-300 \${adminTab === tab ? 'rotate-45' : 'hover:scale-110'}\`}>
                                <Plus size={24} className="font-black" />
                             </div>
                          ) : (
                             <>
                               {tab === 'dashboard' && <Home size={22} className={\`transition-all \${adminTab === tab ? "text-[#FEC204] scale-110" : "text-white/40 group-hover:text-white/60"}\`} />}
                               {tab === 'orders' && <Package size={22} className={\`transition-all \${adminTab === tab ? "text-[#FEC204] scale-110" : "text-white/40 group-hover:text-white/60"}\`} />}
                               {tab === 'books' && <BookOpen size={22} className={\`transition-all \${adminTab === tab ? "text-[#FEC204] scale-110" : "text-white/40 group-hover:text-white/60"}\`} />}
                               {tab === 'report' && <BarChart3 size={22} className={\`transition-all \${adminTab === tab ? "text-[#FEC204] scale-110" : "text-white/40 group-hover:text-white/60"}\`} />}
                               
                               {tab === 'orders' && orders.some(o=>o.status==='new') && (
                                  <div className="absolute -top-1 -right-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#111111] animate-pulse"></div>
                               )}
                             </>
                          )}
                       </div>
                    </button>
                  ))}
                  <button onClick={() => setAdminTab('archive')} className="fixed bottom-24 right-6 w-12 h-12 bg-[#111111] border border-white/10 rounded-full shadow-2xl flex items-center justify-center text-white/50 hover:text-white transition-colors active:scale-95 z-50">
                     <Archive size={20} />
                  </button>
                </>
             ) : (
`;

code = code.replace(/\{isAdmin \? \(\s*<>\s*\{\['orders'.*?\)\s*:\s*\(/s, navJS);
code = code.replace(/isAdmin \?\s*\\[.*?\\]\\.indexOf\\(adminTab\\) \\* \\(100 \/ 5\\)/g, "isAdmin ? ['dashboard', 'orders', 'add', 'books', 'report'].indexOf(adminTab) * (100 / 5)");

const confirmModals = `
      {isAdmin && (
         <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none w-[90%] max-w-sm">
            <AnimatePresence>
               {toasts.map(t => (
                  <motion.div key={t.id} initial={{opacity:0, y:-20, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, y:-20, scale:0.95}} className={\`p-4 rounded-2xl border backdrop-blur-xl flex items-center gap-3 shadow-2xl pointer-events-auto \${t.type==='success'?'bg-green-500/20 border-green-500/30 text-green-100':t.type==='error'?'bg-red-500/20 border-red-500/30 text-red-100':'bg-blue-500/20 border-blue-500/30 text-blue-100'}\`}>
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
  );
}
`;

code = code.replace(/<\/AnimatePresence>\s*<\/div>\s*\);\s*}\s*$/, `</AnimatePresence>\${confirmModals}`);

const cssAnimation = `
<style>{\`
  .book-3d-anim { transform-style: preserve-3d; animation: float3d 3s ease-in-out infinite; }
  @keyframes float3d { 0%,100% { transform: translateY(0) rotateY(-15deg); } 50% { transform: translateY(-10px) rotateY(-15deg); } }
  @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); } 50% { box-shadow: 0 0 0 6px rgba(59,130,246,0.1); } }
  .transform-style-3d { transform-style: preserve-3d; backface-visibility: hidden; }
\`}</style>
`;
code = code.replace(/return \(\s*(<div.*?className="w-full)/s, `return (\n      <>\n${cssAnimation}\n$1`);
code = code.replace(/    <\/div>\s*  \);\s*}\s*$/, `    </div>\n      </>\n  );\n}\n`);


fs.writeFileSync('src/App.tsx', code);
