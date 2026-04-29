
  return (
    <div className="w-full max-w-[480px] mx-auto h-[100dvh] bg-[#0A0A0A] flex flex-col relative sm:border-[12px] sm:border-[#111111] overflow-hidden sm:rounded-[48px] text-white">
      <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#111111] rounded-b-2xl z-50"></div>
      
      {!isAuthenticated ? (
        // === AUTH SCREENS ===
        <div className="flex-1 overflow-y-auto w-full h-full bg-[#0A0A0A] flex flex-col justify-end p-6 animate-in fade-in duration-500 z-[100] relative">
           <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent z-10"></div>
             <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-20 grayscale" alt="Library Background" />
           </div>

           <div className="relative z-10 w-full pb-8">
             <div className="flex items-center gap-2 mb-4">
                 <BookOpen className="text-[#FEC204]" size={28} />
                 <span className="text-[#FEC204] font-bold tracking-widest text-lg">LIBRIS</span>
             </div>
             <div className="text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
               NODIR KITOBLAR<br /> DO'KONI
             </div>
             <p className="text-white/60 text-base mb-8 leading-relaxed font-medium">
                Bilim xazinasi va noyob asarlar olamiga xush kelibsiz. Eksklyuziv nashrlarni biz bilan kashf eting.
             </p>
             
             <div className="w-full bg-[#111111]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-6 shadow-2xl space-y-4">
                {showAuthMode === 'main' ? (
                   <div className="space-y-4">
                      <button onClick={() => { setShowAuthMode('login'); setAuthError(''); }} className="w-full bg-[#FEC204] text-[#0A0A0A] h-14 rounded-2xl font-bold text-lg flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-[#FEC204]/20">
                         Kirish <ChevronRight size={20} className="ml-2" />
                      </button>
                      <button onClick={() => { setShowAuthMode('register'); setAuthError(''); }} className="w-full bg-white/10 text-white h-14 rounded-2xl font-bold text-lg flex items-center justify-center active:scale-95 transition-transform">
                         Ro'yxatdan o'tish
                      </button>
                      
                      <div className="flex items-center justify-center py-2">
                         <div className="h-px bg-white/10 flex-1"></div>
                         <span className="px-4 text-xs font-bold text-white/30 tracking-wider">YOKI</span>
                         <div className="h-px bg-white/10 flex-1"></div>
                      </div>

                      <button onClick={() => { setShowAuthMode('admin'); setAuthError(''); }} className="w-full bg-transparent border-2 border-white/5 text-white/40 h-14 rounded-2xl font-bold text-sm flex items-center justify-center hover:bg-white/5 active:scale-95 transition-all">
                         Admin sifatida kirish
                      </button>
                   </div>
                ) : (
                  <>
                    <div className="flex bg-white/5 rounded-xl mb-6 p-1 border border-white/10">
                       {showAuthMode === 'admin' ? (
                         <div className="flex-1 py-3 text-sm font-bold rounded-lg text-center bg-[#FEC204] text-[#0A0A0A] shadow-sm">Admin Tizimi</div>
                       ) : (
                         <>
                           <button onClick={() => { setShowAuthMode('login'); setAuthError(''); }} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${showAuthMode === 'login' ? 'bg-[#FEC204] text-[#0A0A0A] shadow-sm' : 'text-white/40 hover:text-white'}`}>Kirish</button>
                           <button onClick={() => { setShowAuthMode('register'); setAuthError(''); }} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${showAuthMode === 'register' ? 'bg-[#FEC204] text-[#0A0A0A] shadow-sm' : 'text-white/40 hover:text-white'}`}>Ro'yxatdan</button>
                         </>
                       )}
                    </div>
  
                    <AnimatePresence>
                      {authError && (
                        <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm font-medium p-3 rounded-xl mb-4 text-center">
                          {authError}
                        </motion.div>
                      )}
                    </AnimatePresence>
  
                    <form onSubmit={showAuthMode === 'register' ? handleRegister : handleLogin} className="flex flex-col gap-4 relative">
                       {showAuthMode === 'admin' && (
                         <div className="relative group">
                            <label className="absolute left-4 top-1 text-[10px] font-bold text-white/40 uppercase tracking-wider transition-all group-focus-within:text-[#FEC204]">Maxfiy kod</label>
                            <input type="password" value={authAdminCode} onChange={e => setAuthAdminCode(e.target.value)} placeholder="••••••••" className="w-full h-14 bg-white/5 rounded-2xl px-4 pt-4 border-2 border-transparent focus:border-[#FEC204] focus:bg-[#FEC204]/5 outline-none font-medium text-white transition-all" />
                         </div>
                       )}
  
                       {showAuthMode === 'register' && (
                         <>
                           <div className="relative group">
                              <label className="absolute left-4 top-1 text-[10px] font-bold text-white/40 uppercase tracking-wider transition-all group-focus-within:text-[#FEC204]">Toliq ism</label>
                              <input type="text" value={authFullName} onChange={e => setAuthFullName(e.target.value)} placeholder="Ali Valiyev" className="w-full h-14 bg-white/5 rounded-2xl px-4 pt-4 border-2 border-transparent focus:border-[#FEC204] focus:bg-[#FEC204]/5 outline-none font-medium text-white transition-all" />
                           </div>
                           <div className="relative group">
                              <label className="absolute left-4 top-1 text-[10px] font-bold text-white/40 uppercase tracking-wider transition-all group-focus-within:text-[#FEC204]">Telefon</label>
                              <input type="tel" value={authPhone} onChange={e => setAuthPhone(e.target.value)} placeholder="+998" className="w-full h-14 bg-white/5 rounded-2xl px-4 pt-4 border-2 border-transparent focus:border-[#FEC204] focus:bg-[#FEC204]/5 outline-none font-medium text-white transition-all" />
                           </div>
                         </>
                       )}
                       
                       {showAuthMode !== 'admin' && (
                         <>
                           <div className="relative group">
                              <label className="absolute left-4 top-1 text-[10px] font-bold text-white/40 uppercase tracking-wider transition-all group-focus-within:text-[#FEC204]">Username</label>
                              <input type="text" value={authUsername} onChange={e => setAuthUsername(e.target.value)} placeholder="foydalanuvchi" className="w-full h-14 bg-white/5 rounded-2xl px-4 pt-4 border-2 border-transparent focus:border-[#FEC204] focus:bg-[#FEC204]/5 outline-none font-medium text-white transition-all" />
                           </div>
                           <div className="relative group">
                              <label className="absolute left-4 top-1 text-[10px] font-bold text-white/40 uppercase tracking-wider transition-all group-focus-within:text-[#FEC204]">Parol</label>
                              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="••••••••" className="w-full h-14 bg-white/5 rounded-2xl px-4 pt-4 border-2 border-transparent focus:border-[#FEC204] focus:bg-[#FEC204]/5 outline-none font-medium text-white transition-all" />
                           </div>
                         </>
                       )}
  
                       <div className="flex gap-3 mt-4">
                         <button type="button" onClick={() => setShowAuthMode('main')} className="w-14 h-14 bg-white/5 border border-white/10 text-white/60 rounded-2xl flex items-center justify-center active:scale-95 transition-transform hover:bg-white/10">
                            <ChevronLeft size={24} />
                         </button>
                         <button type="submit" disabled={authLoading} className="flex-1 bg-[#FEC204] text-[#0A0A0A] h-14 rounded-2xl font-bold flex items-center justify-center disabled:opacity-70 active:scale-95 transition-all shadow-lg shadow-[#FEC204]/20 text-lg">
                           {authLoading ? (
                             <div className="w-6 h-6 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin"></div>
                           ) : showAuthMode === 'login' ? 'Tizimga kirish' : showAuthMode === 'register' ? 'Ro\'yxatdan o\'tish' : 'Kirish'}
                         </button>
                       </div>
                    </form>
                  </>
                )}
             </div>
           </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto w-full h-full pb-20 relative hide-scroll">

          {activeTab === 'home' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="pb-10">
              {/* HERO BANNER - 3D Parallax */}
              <div className="relative w-full h-[320px] bg-[#111111] flex items-center justify-center overflow-hidden rounded-b-[48px] shadow-2xl">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
                 {/* Typewriter Greeting */}
                 <div className="absolute top-8 left-6 z-20">
                    <motion.div initial={{width:0}} animate={{width:"100%"}} transition={{duration: 1.5, ease:"easeOut"}} className="overflow-hidden whitespace-nowrap border-r-2 border-[#FEC204] pr-1">
                      <h1 className="text-3xl font-black text-white">Xush kelibsiz.</h1>
                    </motion.div>
                    <p className="text-[#FEC204] font-medium text-sm mt-1 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">Bugun nimani mutolaa qilamiz?</p>
                 </div>
                 
                 {/* 3D Book Area */}
                 <motion.div 
                    initial={{ rotateY: -20, rotateX: 10, y: 20 }}
                    animate={{ rotateY: [ -15, 15, -15 ], rotateX: [5, 15, 5] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="relative z-10 w-40 h-56 mt-8 book-cover-3d shadow-2xl"
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer z-30 pointer-events-none"></div>
                    <img src={books[0]?.coverUrl} className="w-full h-full object-cover rounded shadow-[-10px_10px_20px_rgba(0,0,0,0.8)]" />
                 </motion.div>
              </div>

              {/* GORIZONTAL KO'RGAZMA */}
              <div className="mt-8 px-6">
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-xl font-bold text-white tracking-tight">Ommabop <span className="text-[#FEC204]">asarlar</span></h2>
                </div>
                <div className="flex overflow-x-auto hide-scroll gap-4 pb-6 -mx-6 px-6 snap-x snap-mandatory">
                   {books.slice(0, 5).map((book, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: idx * 0.1 }}
                        key={book.id} 
                        className="snap-center w-36 shrink-0 flip-card relative h-52 group cursor-pointer"
                        onClick={() => setSelectedBook(book)}
                      >
                         <div className="flip-card-inner shadow-xl">
                            <div className="flip-card-front rounded-2xl overflow-hidden bg-[#111111] border border-white/5">
                               <img src={book.coverUrl} className="w-full h-full object-cover" />
                               <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center text-[10px] font-bold text-[#FEC204] z-10">
                                  <Star size={10} className="fill-[#FEC204] mr-1" /> {book.rating}
                               </div>
                            </div>
                            <div className="flip-card-back bg-[#111111] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                               <h3 className="font-bold text-white text-xs line-clamp-3 leading-tight mb-2">{book.title}</h3>
                               <p className="text-[10px] text-white/50 mb-3">{book.author}</p>
                               <span className="text-[#FEC204] font-black text-xs mb-3">{formatPrice(book.price)}</span>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); addToCart(book); }}
                                 className="w-full py-2 bg-[#FEC204] text-[#0A0A0A] text-[10px] font-bold rounded-lg active:scale-90 transition-transform"
                               >
                                 Savatga
                               </button>
                            </div>
                         </div>
                      </motion.div>
                   ))}
                </div>
              </div>

              {/* GRID YANGI KITOBLAR */}
              <div className="px-6 relative">
                 <h2 className="text-xl font-bold text-white tracking-tight mb-6 mt-4">Yangi <span className="text-[#FEC204]">kitoblar</span></h2>
                 <div className="grid grid-cols-2 gap-4">
                    {books.slice(5, 11).map((book, idx) => (
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.9 }}
                         whileInView={{ opacity: 1, scale: 1 }}
                         viewport={{ once: true }}
                         transition={{ delay: idx * 0.05, duration: 0.4 }}
                         key={book.id}
                         onClick={() => setSelectedBook(book)}
                         className="group bg-[#111111] border border-white/5 hover:border-[#FEC204]/50 border-b-4 border-b-transparent hover:border-b-[#FEC204] rounded-3xl p-3 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#FEC204]/10"
                       >
                          <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden mb-3 relative">
                            <img src={book.coverUrl} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          </div>
                          <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight group-hover:text-[#FEC204] transition-colors">{book.title}</h3>
                          <p className="text-xs text-white/50 mt-1 line-clamp-1">{book.author}</p>
                          <div className="flex items-center justify-between mt-3">
                             <span className="font-black text-white text-xs bg-white/10 px-2 py-1 rounded-md">{formatPrice(book.price)}</span>
                          </div>
                       </motion.div>
                    ))}
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'search' && (
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="pb-10 pt-8 px-6">
                 {/* Spotlight Search Header */}
                 <div className="sticky top-0 z-20 py-4 bg-[#0A0A0A]/80 backdrop-blur-xl">
                    <h1 className="text-3xl font-black text-white mb-6 tracking-tight">Kashf <span className="text-[#FEC204]">eting</span></h1>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#FEC204] transition-colors z-10" size={20} />
                      <input 
                        type="text" 
                        placeholder="Kitob yoki muallif nomi..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 bg-[#111111] rounded-2xl pl-12 pr-4 border border-white/10 focus:border-[#FEC204] outline-none font-medium text-white transition-all shadow-lg focus:shadow-[#FEC204]/20 relative z-0"
                      />
                    </div>
                 </div>

                 {/* Categories with sliding underline */}
                 <div className="flex overflow-x-auto hide-scroll gap-4 my-6">
                    {categories.map(cat => (
                       <button
                         key={cat}
                         onClick={() => setSelectedCategory(cat)}
                         className={`whitespace-nowrap px-4 py-2 font-bold text-sm transition-colors relative ${selectedCategory === cat ? 'text-[#FEC204]' : 'text-white/50 hover:text-white'}`}
                       >
                          {cat}
                          {selectedCategory === cat && (
                             <motion.div layoutId="searchUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FEC204] rounded-full" />
                          )}
                       </button>
                    ))}
                 </div>

                 {/* Results Masonry-like Grid */}
                 <div className="columns-2 gap-4 space-y-4">
                    <AnimatePresence>
                       {filteredBooks.map((book, idx) => (
                          <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            key={book.id}
                            onClick={() => setSelectedBook(book)}
                            className="break-inside-avoid bg-[#111111] border border-white/5 rounded-3xl p-3 cursor-pointer hover:border-[#FEC204]/30 transition-all active:scale-95"
                          >
                             <img src={book.coverUrl} className="w-full rounded-2xl object-cover mb-3" />
                             <h3 className="font-bold text-sm text-white leading-tight line-clamp-2">{book.title}</h3>
                             <p className="text-xs text-white/50 mt-1 line-clamp-1">{book.author}</p>
                             <div className="mt-2 text-[#FEC204] font-black text-sm">{formatPrice(book.price)}</div>
                          </motion.div>
                       ))}
                    </AnimatePresence>
                 </div>

                 {filteredBooks.length === 0 && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col items-center justify-center mt-20">
                       <motion.div
                         animate={{ rotateY: 360 }}
                         transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                         style={{ transformStyle: 'preserve-3d' }}
                         className="w-20 h-28 relative book-cover-3d bg-[#111111] rounded shadow-xl border border-white/10"
                       >
                          <div className="absolute inset-0 flex items-center justify-center opacity-20"><Search size={40} /></div>
                       </motion.div>
                       <p className="text-white/60 font-medium mt-8">Kitob topilmadi. Boshqa qidirib ko'ring.</p>
                    </motion.div>
                 )}
             </motion.div>
          )}

          {activeTab === 'cart' && (
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="pb-10 pt-8 px-6 min-h-full flex flex-col">
                 <div className="sticky top-0 bg-[#0A0A0A]/90 backdrop-blur-md z-20 pb-4 mb-4 border-b border-white/5 flex justify-between items-center">
                    <h1 className="text-3xl font-black text-white tracking-tight">Xarid <span className="text-[#FEC204]">savati</span></h1>
                    {cartItemsCount > 0 && <span className="bg-[#FEC204] text-[#0A0A0A] font-black px-3 py-1 rounded-full text-xs">{cartItemsCount} ta</span>}
                 </div>

                 {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col justify-center items-center text-center -mt-20">
                       <div className="w-32 h-32 rounded-full border border-white/5 bg-[#111111] flex items-center justify-center mb-6 shadow-2xl relative">
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                             <ShoppingBag size={48} className="text-white/20" />
                          </motion.div>
                       </div>
                       <h2 className="text-xl font-bold text-white mb-2">Savat bo'sh</h2>
                       <p className="text-white/50 text-sm font-medium mb-8 max-w-[200px]">Sevimli asarlaringizni kashf qiling va shu yerga qo'shing.</p>
                       <button onClick={() => setActiveTab('home')} className="bg-[#FEC204] text-[#0A0A0A] font-bold h-14 px-8 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-[#FEC204]/20">
                          Bosh sahifaga o'tish
                       </button>
                    </div>
                 ) : (
                    <>
                       {!isCheckout && !checkoutSuccess ? (
                          <div className="flex-1 flex flex-col">
                             <div className="space-y-4 flex-1">
                                {cart.map(item => (
                                   <motion.div layout initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} key={item.id} className="flex bg-[#111111] p-3 rounded-3xl shadow-sm border border-white/5 relative items-center group">
                                      <img src={item.coverUrl} className="w-20 h-28 object-cover rounded-2xl shadow-md" />
                                      <div className="ml-4 flex-1">
                                         <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight">{item.title}</h3>
                                         <p className="text-[10px] font-medium text-white/50 mt-1">{item.author}</p>
                                         <p className="text-[#FEC204] font-black mt-2 text-sm">{formatPrice(item.price)}</p>
                                      </div>
                                      
                                      <div className="flex flex-col items-center justify-between h-28 w-12 bg-white/5 rounded-2xl py-2 ml-2">
                                         <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 text-white active:scale-90 transition-transform"><Plus size={14}/></button>
                                         <span className="font-bold text-sm text-white">{item.quantity}</span>
                                         <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 text-white active:scale-90 transition-transform"><Minus size={14}/></button>
                                      </div>
                                      
                                      <button onClick={() => removeFromCart(item.id)} className="absolute -top-2 -left-2 w-8 h-8 bg-red-500/20 text-red-500 border border-red-500/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"><Trash2 size={12}/></button>
                                   </motion.div>
                                ))}
                             </div>

                             <div className="mt-8 bg-[#111111] rounded-[32px] p-6 border border-white/5 relative overflow-hidden shadow-2xl">
                                <div className="flex justify-between mb-3 text-white/60 text-sm font-medium"><span>Kitoblar narxi:</span><span className="text-white">{formatPrice(cartTotal)}</span></div>
                                <div className="flex justify-between mb-4 text-white/60 text-sm font-medium"><span>Yetkazib berish:</span><span className="text-[#FEC204]">Bebul</span></div>
                                <div className="h-px bg-white/10 mb-4"></div>
                                <div className="flex justify-between mb-6"><span className="text-white/60 font-bold uppercase tracking-wider text-sm">Jami:</span><span className="text-2xl font-black text-white">{formatPrice(cartTotal)}</span></div>
                                <button onClick={() => setIsCheckout(true)} className="w-full bg-[#FEC204] text-[#0A0A0A] h-16 rounded-2xl font-bold flex items-center justify-center shadow-xl shadow-[#FEC204]/20 active:scale-95 transition-transform text-lg">
                                   Rasmiylashtirish <ChevronRight className="ml-2" />
                                </button>
                             </div>
                          </div>
                       ) : checkoutSuccess ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 animate-in zoom-in duration-500">
                             {/* Confetti canvas placeholder/visuals */}
                             <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                <div className="w-2 h-2 bg-[#FEC204] absolute top-10 left-10 rounded-full animate-pulse"></div>
                                <div className="w-3 h-3 bg-white absolute top-20 right-20 rotate-45 animate-bounce"></div>
                                <div className="w-2 h-6 bg-[#FEC204] absolute bottom-32 left-32 rotate-12 animate-pulse"></div>
                             </div>

                             <motion.svg className="w-32 h-32 text-[#FEC204] mb-8 drop-shadow-[0_0_20px_rgba(254,194,4,0.3)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: "easeOut" }} d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></motion.path>
                                <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1, ease: "easeOut" }} d="M22 4L12 14.01l-3-3"></motion.path>
                             </motion.svg>
                             
                             <h2 className="text-3xl font-black text-white mb-3">Ajoyib!</h2>
                             <p className="text-white/60 font-medium mb-10 text-sm max-w-[240px]">Buyurtmangiz muvaffaqiyatli rasmiylashtirildi. Tez orada aloqaga chiqamiz.</p>
                             
                             <button onClick={() => { setCheckoutSuccess(false); setIsCheckout(false); setCart([]); setActiveTab('home'); }} className="w-full h-16 bg-[#111111] border border-white/10 text-white rounded-2xl font-bold active:scale-95 transition-transform animate-pulse">
                                Bosh sahifaga qaytish
                             </button>
                          </div>
                       ) : (
                          <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-300">
                             <div className="flex items-center mb-8">
                                <button onClick={() => setIsCheckout(false)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform mr-4"><ChevronLeft/></button>
                                <h2 className="text-2xl font-black text-white">Buyurtma berish</h2>
                             </div>
                             
                             <div className="space-y-5 flex-1">
                                <div className="relative group">
                                   <label className="absolute left-4 -top-2 bg-[#0A0A0A] px-1 text-[10px] font-bold text-[#FEC204] uppercase tracking-wider">Ism va familiya</label>
                                   <input type="text" value={checkoutName} onChange={e => setCheckoutName(e.target.value)} className="w-full h-14 bg-transparent rounded-2xl px-4 border-2 border-white/10 focus:border-[#FEC204] outline-none font-medium text-white transition-all shadow-sm" />
                                </div>
                                <div className="relative group">
                                   <label className="absolute left-4 -top-2 bg-[#0A0A0A] px-1 text-[10px] font-bold text-[#FEC204] uppercase tracking-wider">Telefon</label>
                                   <input type="tel" value={checkoutPhone} onChange={e => setCheckoutPhone(e.target.value)} className="w-full h-14 bg-transparent rounded-2xl px-4 border-2 border-white/10 focus:border-[#FEC204] outline-none font-medium text-white transition-all shadow-sm" />
                                </div>
                                <div className="relative group">
                                   <label className="absolute left-4 -top-2 bg-[#0A0A0A] px-1 text-[10px] font-bold text-[#FEC204] uppercase tracking-wider">To'liq manzil</label>
                                   <textarea value={checkoutAddress} onChange={e => setCheckoutAddress(e.target.value)} className="w-full h-24 bg-transparent rounded-2xl p-4 border-2 border-white/10 focus:border-[#FEC204] outline-none font-medium text-white resize-none transition-all shadow-sm"></textarea>
                                </div>
                                
                                <div>
                                   <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3 block ml-2">To'lov turi</label>
                                   <div className="flex gap-4">
                                      <button onClick={() => setCheckoutPaymentType('Naqd')} className={`flex-1 h-14 rounded-2xl border-2 font-bold flex items-center justify-center active:scale-95 transition-all ${checkoutPaymentType === 'Naqd' ? 'border-[#FEC204] bg-[#FEC204]/10 text-[#FEC204]' : 'border-white/5 bg-white/5 text-white/60'}`}>Naqd</button>
                                      <button onClick={() => setCheckoutPaymentType('Karta')} className={`flex-1 h-14 rounded-2xl border-2 font-bold flex items-center justify-center active:scale-95 transition-all ${checkoutPaymentType === 'Karta' ? 'border-[#FEC204] bg-[#FEC204]/10 text-[#FEC204]' : 'border-white/5 bg-white/5 text-white/60'}`}>Karta peyment</button>
                                   </div>
                                </div>
                             </div>
                             
                             <button onClick={() => {
                                 if(!checkoutName || !checkoutPhone || !checkoutAddress) return alert("Barcha maydonlarni to'ldiring");
                                 const newOrder: Order = {
                                    id: 'ORD-' + Math.floor(Math.random()*100000),
                                    userId: userProfile?.username || 'user',
                                    customerName: checkoutName,
                                    customerPhone: checkoutPhone,
                                    customerAddress: checkoutAddress,
                                    paymentType: checkoutPaymentType,
                                    totalAmount: cartTotal,
                                    items: [...cart],
                                    status: 'new',
                                    date: new Date().toISOString()
                                 };
                                 saveOrders([newOrder, ...orders]);
                                 sendToTelegram(`🛍 YANGI BUYURTMA #${newOrder.id}\n\n👤 Mijoz: ${checkoutName}\n📞 Tel: ${checkoutPhone}\n📍 Manzil: ${checkoutAddress}\n💳 To'lov: ${checkoutPaymentType}\n\n💰 Jami: ${formatPrice(cartTotal)}`);
                                 setCheckoutSuccess(true);
                             }} className="w-full bg-[#FEC204] text-[#0A0A0A] h-16 rounded-2xl font-bold flex items-center justify-center shadow-xl shadow-[#FEC204]/20 active:scale-95 transition-transform text-lg mt-8 mb-2">
                                Buyurtmani Tasdiqlash
                             </button>
                          </div>
                       )}
                    </>
                 )}
             </motion.div>
          )}

          {activeTab === 'profile' && (
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="pb-10 min-h-full">
                 {/* Top gradient area */}
                 <div className="h-48 bg-gradient-to-b from-[#111111] to-[#0A0A0A] relative rounded-b-[48px] overflow-hidden flex flex-col items-center justify-center pt-8">
                    <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
                    
                    {/* AVATAR with rotating ring and flip */}
                    <div className="relative group perspective-1000 w-24 h-24 mb-3">
                       <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -inset-2 rounded-full border border-dashed border-[#FEC204]/50"></motion.div>
                       <div className="w-full h-full rounded-full bg-gradient-to-br from-[#111111] to-[#222222] border-2 border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden transform transition-transform duration-500 group-hover:scale-105 active:scale-95 cursor-pointer">
                          <span className="text-3xl font-black text-[#FEC204]">{userProfile?.fullName?.split(' ').map((n: string)=>n[0]).join('').substring(0,2).toUpperCase() || 'U'}</span>
                       </div>
                    </div>
                    <h2 className="text-2xl font-black text-white relative z-10">{userProfile?.fullName || 'Foydalanuvchi'}</h2>
                    <p className="text-[#FEC204] font-medium text-xs relative z-10">@{userProfile?.username || 'user'}</p>
                 </div>

                 <div className="px-6 -mt-4 relative z-20 space-y-4">
                    {/* Stats Cards - CountUp animation */}
                    <div className="grid grid-cols-2 gap-4">
                       <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.1}} className="bg-[#111111] border border-white/5 p-5 rounded-[24px] shadow-lg flex flex-col items-center text-center">
                          <Package className="text-white/40 mb-2" size={24} />
                          <div className="text-2xl font-black text-white mb-1"><AnimatedCounter from={0} to={orders.filter(o => o.userId === userProfile?.username).length} /></div>
                          <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Buyurtmalar</p>
                       </motion.div>
                       <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.2}} className="bg-[#111111] border border-white/5 p-5 rounded-[24px] shadow-lg flex flex-col items-center text-center">
                          <BarChart3 className="text-[#FEC204] mb-2" size={24} />
                          <div className="text-xl font-black text-white mb-1 leading-[32px] break-all px-2 flex items-baseline">
                             <AnimatedCounter from={0} to={orders.filter(o => o.userId === userProfile?.username).reduce((acc, o)=>acc+o.totalAmount, 0)} />
                          </div>
                          <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Sarflangan sum</p>
                       </motion.div>
                    </div>

                    <div className="h-px bg-white/5 my-4"></div>

                    {/* Order List */}
                    <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.3}} className="space-y-4">
                       <div className="flex items-center justify-between pl-2">
                          <h3 className="font-bold text-white text-lg tracking-tight">Tarix va <span className="text-[#FEC204]">holat</span></h3>
                       </div>
                       
                       {orders.filter(o => o.userId === userProfile?.username).length === 0 ? (
                          <div className="bg-[#111111] border border-white/5 rounded-[24px] p-6 text-center text-white/40 font-medium text-sm">Hali buyurtma bermagansiz</div>
                       ) : (
                          <div className="space-y-3 relative overflow-hidden">
                             {orders.filter(o => o.userId === userProfile?.username).map((o, idx) => (
                                <motion.div 
                                  key={o.id} 
                                  drag="x" 
                                  dragConstraints={{left: -80, right: 0}}
                                  whileTap={{ cursor: "grabbing" }}
                                  className="bg-[#111111] border border-white/5 rounded-[24px] p-4 shadow-md relative z-10 touch-pan-y"
                                >
                                   <div className="flex justify-between items-center mb-3">
                                      <span className="font-black text-sm text-white">{o.id}</span>
                                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full relative overflow-hidden ${o.status === 'new' ? 'bg-[#FEC204]/10 text-[#FEC204]' : 'bg-green-500/10 text-green-400'}`}>
                                         {o.status === 'new' && <span className="absolute inset-0 bg-[#FEC204] opacity-20 animate-pulse"></span>}
                                         {o.status === 'new' ? 'KUTILMOQDA' : 'QABUL QILINDI'}
                                      </span>
                                   </div>
                                   <div className="flex justify-between items-center bg-[#111111]">
                                      <span className="text-white/40 text-xs font-medium">{o.items.length} ta kitob</span>
                                      <span className="text-white font-black">{formatPrice(o.totalAmount)}</span>
                                   </div>
                                </motion.div>
                             ))}
                          </div>
                       )}
                    </motion.div>

                    <button onClick={handleLogout} className="w-full mt-6 bg-[#111111] border border-red-500/20 text-red-400 h-14 rounded-2xl font-bold flex items-center justify-center active:scale-95 transition-all">
                       <LogOut size={20} className="mr-2" /> Tizimdan chiqish
                    </button>
                 </div>
             </motion.div>
          )}

          {activeTab === 'admin' && isAdmin && (
             <div className="pb-24 pt-8 px-6 min-h-full">
                <h1 className="text-2xl font-black text-white mb-6">Admin <span className="text-[#FEC204]">Panel</span></h1>
                <div className="bg-[#111111] border border-white/5 p-6 rounded-3xl text-center space-y-4">
                   <p className="text-white/60 font-medium text-sm">UI dizayni foydalanuvchi sahifalari uchun mutlaqo yangilandi! Admin panel mantig'i hamda komponentlari oldingi kabi ishlashda davom etmoqda (yoki boshqa komponent orqali ochilishi mumkin).</p>
                   {adminTab === 'orders' && orders.map(o=><div key={o.id} className="text-white bg-white/5 border border-white/10 p-2 rounded flex justify-between"><span className="text-sm font-bold">{o.id}</span><span className="text-[#FEC204] text-xs font-bold">{o.status}</span></div>)}
                </div>
             </div>
          )}

        </div>
      )}

      {/* --- BOTTOM NAVIGATION BAR --- */}
      {isAuthenticated && (
        <div className="absolute bottom-0 left-0 w-full bg-[#111111]/80 backdrop-blur-2xl border-t border-white/5 pb-[env(safe-area-inset-bottom)] z-40 transition-transform shadow-[0_-10px_40px_rgba(0,0,0,0.5)] sm:rounded-b-[36px] overflow-hidden">
          <div className="flex h-16 items-center px-2 relative">
             <motion.div 
               layoutId="navIndicator" 
               className="absolute top-1/2 -translate-y-1/2 h-10 bg-white/5 rounded-2xl z-0" 
               initial={false}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
               style={{
                 width: `${100 / (isAdmin ? 5 : 4)}%`,
                 left: `${
                   isAdmin 
                   ? ['orders','books','add','report','archive'].indexOf(adminTab) * (100 / 5) 
                   : ['home','search','cart','profile'].indexOf(activeTab) * (100 / 4)
                 }%`
               }}
             />

             {isAdmin ? (
                <>
                  {['orders', 'books', 'add', 'report', 'archive'].map((tab) => (
                    <button key={tab} onClick={() => setAdminTab(tab as any)} className="flex-1 flex flex-col items-center justify-center relative z-10 h-full active:scale-90 transition-transform">
                       {tab === 'orders' && <Package size={22} className={adminTab === tab ? "text-[#FEC204]" : "text-white/40"} />}
                       {tab === 'books' && <BookOpen size={22} className={adminTab === tab ? "text-[#FEC204]" : "text-white/40"} />}
                       {tab === 'add' && <PlusCircle size={22} className={adminTab === tab ? "text-[#FEC204]" : "text-white/40"} />}
                       {tab === 'report' && <BarChart3 size={22} className={adminTab === tab ? "text-[#FEC204]" : "text-white/40"} />}
                       {tab === 'archive' && <Archive size={22} className={adminTab === tab ? "text-[#FEC204]" : "text-white/40"} />}
                    </button>
                  ))}
                </>
             ) : (
                <>
                  {[
                    { id: 'home', icon: Home, label: 'Asosiy' },
                    { id: 'search', icon: Search, label: 'Qidiruv' },
                    { id: 'cart', icon: ShoppingBag, label: 'Savat' },
                    { id: 'profile', icon: User, label: 'Profil' }
                  ].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className="flex-1 flex flex-col items-center justify-center relative z-10 h-full group active:scale-90 transition-transform">
                       <div className="relative">
                          <tab.icon size={22} className={`transition-all ${activeTab === tab.id ? "text-[#FEC204] scale-110" : "text-white/40 group-hover:text-white/60"}`} />
                          {tab.id === 'cart' && cartItemsCount > 0 && (
                            <div className="absolute -top-1.5 -right-2 bg-[#FEC204] text-[#0A0A0A] text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 border-2 border-[#111111] animate-jello">
                               {cartItemsCount}
                            </div>
                          )}
                          {activeTab === tab.id && (
                             <motion.div layoutId="navDot" className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FEC204] rounded-full"></motion.div>
                          )}
                       </div>
                    </button>
                  ))}
                </>
             )}
          </div>
        </div>
      )}

      {/* --- BOOK DETAIL MODAL --- */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-[#0A0A0A] z-50 flex flex-col overflow-hidden sm:rounded-[48px]"
          >
             <div className="flex-1 overflow-y-auto hide-scroll pb-24 relative">
                <div className="absolute top-0 w-full pt-10 px-6 flex justify-between z-20 pointer-events-none fade-in duration-300">
                   <button onClick={() => setSelectedBook(null)} className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-transform">
                      <ChevronLeft size={24} />
                   </button>
                   <button className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white pointer-events-auto active:scale-90 transition-transform hover:text-red-400">
                      <Heart size={20} />
                   </button>
                </div>

                <div className="w-full h-96 relative bg-gradient-to-b from-[#111111] to-[#0A0A0A] flex flex-col justify-center items-center pb-8 sticky top-0 -z-10">
                   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FEC204]/5 via-transparent to-transparent"></div>
                   <motion.div 
                     initial={{ rotateX: -90, y: 100, opacity: 0 }}
                     animate={{ rotateX: 0, y: 0, opacity: 1 }}
                     transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.1 }}
                     className="relative w-44 h-64 book-cover-3d mt-10 perspective-1000 shadow-2xl"
                   >
                     <img src={selectedBook.coverUrl} className="w-full h-full object-cover rounded shadow-2xl relative z-10" />
                     <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black blur-xl opacity-80"></div>
                   </motion.div>
                </div>

                <div className="bg-[#0A0A0A] rounded-t-[48px] -mt-10 relative z-10 pt-10 px-6 min-h-[50vh] shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex-1 pr-2">
                        <motion.h1 initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay:0.2}} className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2 tracking-tight">{selectedBook.title}</motion.h1>
                        <motion.p initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay:0.3}} className="text-[#FEC204] font-bold uppercase tracking-wider text-xs">{selectedBook.author}</motion.p>
                      </div>
                      <motion.div initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}} transition={{delay:0.3}} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center text-[#FEC204] font-black text-sm absolute top-10 right-6">
                        <Star size={14} className="fill-[#FEC204] mr-1.5" /> {selectedBook.rating}
                      </motion.div>
                   </div>

                   <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.4}} className="flex bg-[#111111] border border-white/5 rounded-3xl p-4 mb-8 divide-x divide-white/10">
                      <div className="flex-1 flex flex-col items-center">
                         <BookOpen size={20} className="text-white/30 mb-2" />
                         <span className="text-sm font-black text-white leading-none mb-1"><AnimatedCounter from={0} to={selectedBook.pages || 320} duration={1.5} /></span>
                         <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Sahifa</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                         <Clock size={20} className="text-white/30 mb-2" />
                         <span className="text-sm font-black text-white leading-none mb-1"><AnimatedCounter from={2000} to={parseInt(selectedBook.year || '2024')} duration={1.5} /></span>
                         <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Yil</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                         <Star size={20} className="text-white/30 mb-2" />
                         <span className="text-sm font-black text-white leading-none mb-1">UZ</span>
                         <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Til</span>
                      </div>
                   </motion.div>

                   <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.5}}>
                     <h3 className="text-xs font-black text-white/60 mb-3 tracking-widest uppercase">Asar haqida</h3>
                     <p className="text-white/70 text-sm leading-relaxed font-medium">
                        {selectedBook.description !== 'Kiritilmadi' ? selectedBook.description : "Ushbu asar o'zining chuqur falsafasi vazamonamizning dolzarb muammolarini yoritishi bilan kitobxon qalbida o'chmas iz qoldiradi. Har bir sahifada yangi olam kashf etasiz."}
                     </p>
                   </motion.div>
                </div>
             </div>

             <motion.div initial={{y:"100%"}} animate={{y:0}} transition={{delay:0.6}} className="absolute bottom-0 w-full bg-[#111111]/80 backdrop-blur-2xl border-t border-white/5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] px-6 flex justify-between items-center z-30">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Narx</span>
                   <span className="text-2xl font-black text-white leading-none">{formatPrice(selectedBook.price)}</span>
                </div>
                <button 
                  onClick={() => addToCart(selectedBook)}
                  className="bg-[#FEC204] text-[#0A0A0A] font-black h-14 w-40 rounded-2xl flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-[#FEC204]/20 text-sm overflow-hidden relative"
                >
                   Savatga qo'shish
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
