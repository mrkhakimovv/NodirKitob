/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { animate } from 'motion';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue, useAnimationFrame, useInView } from 'motion/react';



import { Home, Inbox, Search, ShoppingBag, User, ChevronLeft, ChevronRight, Minus, Plus, Star, BookOpen, Clock, Trash2, Heart, LogOut, Package, Edit3, PlusCircle, BarChart3, Archive, ShoppingCart, LogIn, Key, HelpCircle, CheckCircle2, Navigation2 } from 'lucide-react';
import { books as initialBooks, categories } from './data';
import { sendToTelegram } from './lib/telegram';
import { Book, CartItem, Order } from './types';







// Animated Counter implementation
const AnimatedCounter = ({ from, to, duration = 1.5 }: { from: number, to: number, duration?: number }) => {
  const [value, setValue] = useState(from);
  
  useEffect(() => {
    let startTimestamp: number | null = null;
    let reqId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.floor(easeProgress * (to - from) + from));
      if (progress < 1) {
         reqId = window.requestAnimationFrame(step);
      }
    };
    reqId = window.requestAnimationFrame(step);return (
) => window.cancelAnimationFrame(reqId);
  }, [from, to, duration]);

  return <span>{value}</span>;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'cart' | 'profile' | 'admin'>('home');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [isCheckout, setIsCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // App Data State
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Checkout Form State
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutPaymentType, setCheckoutPaymentType] = useState('Naqd');

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<{ fullName: string; username: string; phone: string } | null>(null);
  const [showAuthMode, setShowAuthMode] = useState<'main' | 'login' | 'register' | 'admin'>('main');
  
  // Auth Form State
  const [authFullName, setAuthFullName] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authAdminCode, setAuthAdminCode] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Admin Panel State
  const [adminTab, setAdminTab] = useState<'dashboard' | 'orders' | 'books' | 'add' | 'report' | 'archive'>('dashboard');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  
  // App view State
  const [viewMyOrders, setViewMyOrders] = useState(false);
  
  // Book Form State (Add / Edit)
  const [bfTitle, setBfTitle] = useState('');
  const [bfAuthor, setBfAuthor] = useState('');
  const [bfPrice, setBfPrice] = useState('');
  const [bfCover, setBfCover] = useState('');
  const [bfDescription, setBfDescription] = useState('');
  const [bfCategory, setBfCategory] = useState('');
  const [bfPages, setBfPages] = useState('');
  const [bfYear, setBfYear] = useState('');
  const [bfError, setBfError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialization
  useEffect(() => {
    const checkUser = () => {
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
         try {
           const user = JSON.parse(authUser);
           if(user.username === '@admin') {
              setIsAdmin(true);
              setActiveTab('admin');
           }
           setUserProfile(user);
           setIsAuthenticated(true);
         } catch(e) {}
      }
    };

    const fetchBooks = () => {
      const storedBooks = localStorage.getItem('books');
      if (storedBooks) {
        try {
          setBooks(JSON.parse(storedBooks));
        } catch(e) {}
      }
    };

    const fetchOrders = () => {
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        try {
          setOrders(JSON.parse(storedOrders));
        } catch(e) {}
      }
    };

    checkUser();
    fetchBooks();
    fetchOrders();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     setAuthLoading(true); setAuthError('');
     
     // Handle Admin login exclusively
     if (showAuthMode === 'admin') {
         if (authAdminCode === '777888') {
             const adminUser = { fullName: 'Administrator', username: '@admin', phone: '' };
             setIsAdmin(true);
             setIsAuthenticated(true);
             setActiveTab('admin');
             setUserProfile(adminUser);
             localStorage.setItem('authUser', JSON.stringify(adminUser));
             setAuthLoading(false);
             return;
         } else {
             setAuthError("Maxfiy kod noto'g'ri.");
             setAuthLoading(false);
             return;
         }
     }

     try {
       const usersInfo = localStorage.getItem('users');
       const users = usersInfo ? JSON.parse(usersInfo) : [];
       const user = users.find((u: any) => u.username === authUsername && u.password === authPassword);
       
       if (user) {
         setUserProfile(user);
         setIsAuthenticated(true);
         localStorage.setItem('authUser', JSON.stringify(user));
       } else {
         setAuthError("Login yoki parol noto'g'ri.");
       }
     } catch (err: any) {
       setAuthError("Tizimda xatolik yuz berdi.");
     } finally {
       setAuthLoading(false);
     }
  };

  const handleRegister = async (e: React.FormEvent) => {
     e.preventDefault();
     setAuthLoading(true); setAuthError('');
     try {
       if (!authUsername || !authPassword || !authFullName || !authPhone) {
          throw new Error("Barcha maydonlarni to'ldiring.");
       }
       if (authUsername.includes(' ')) throw new Error("Username da probel bo'lmasligi kerak.");
       
       const usersInfo = localStorage.getItem('users');
       const users = usersInfo ? JSON.parse(usersInfo) : [];
       
       if (users.find((u: any) => u.username === authUsername)) {
          throw new Error("Bu username band. Boshqa tanlang.");
       }
       
       const newUser = { fullName: authFullName, username: authUsername, phone: authPhone, password: authPassword };
       users.push(newUser);
       localStorage.setItem('users', JSON.stringify(users));
       localStorage.setItem('authUser', JSON.stringify(newUser));
       setUserProfile(newUser);
       setIsAuthenticated(true);
       
       // Send notification to telegram about new user
       await sendToTelegram(`YANGI FOYDALANUVCHI 👥\n\nIsm: ${authFullName}\nUsername: @${authUsername}\nTelefon: ${authPhone}`);

     } catch (err: any) {
       setAuthError(err.message);
     } finally {
       setAuthLoading(false);
     }
  };

  const handleLogout = async () => {
    localStorage.removeItem('authUser');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserProfile(null);
    setCart([]);
    setActiveTab('home');
    setAuthUsername('');
    setAuthPassword('');
  };

  // Generic Methods
  const saveBooks = (newBooks: Book[]) => {
     setBooks(newBooks);
     localStorage.setItem('books', JSON.stringify(newBooks));
  };
  
  const saveOrders = (newOrders: Order[]) => {
     setOrders(newOrders);
     localStorage.setItem('orders', JSON.stringify(newOrders));
  };

  const handleAddOrEditBook = async () => {
     setIsSaving(true);
     await new Promise(r => setTimeout(r, 600)); // simulated loading
     setIsSaving(false);
     setBfError('');
     if(!bfTitle || !bfAuthor || !bfPrice || !bfCover) {
        setBfError("Barcha asosiy ma'lumotlarni to'ldiring");
        return;
     }
     
     const priceNum = parseInt(bfPrice, 10);
     if (priceNum <= 0 || isNaN(priceNum)) {
        setBfError("Narx 0 dan katta bo'lishi kerak");
        return;
     }

     if (editingBookId) {
        const newBooks = books.map(b => b.id === editingBookId ? {
           ...b,
           title: bfTitle,
           author: bfAuthor,
           price: priceNum,
           coverUrl: bfCover,
           description: bfDescription || 'Kiritilmadi',
           category: bfCategory || 'Barchasi',
           pages: bfPages ? parseInt(bfPages, 10) : undefined,
           year: bfYear || undefined
        } : b);
        saveBooks(newBooks);
        setEditingBookId(null);
     } else {
        const newBook: Book = {
           id: 'BK-' + Date.now(),
           title: bfTitle,
           author: bfAuthor,
           price: priceNum,
           coverUrl: bfCover,
           description: bfDescription || 'Kiritilmadi',
           category: bfCategory || 'Barchasi',
           pages: bfPages ? parseInt(bfPages, 10) : undefined,
           year: bfYear || undefined,
           rating: 5,
           isArchived: false,
        };
        saveBooks([newBook, ...books]);
     }
     setBfTitle(''); setBfAuthor(''); setBfPrice(''); setBfCover('');
     setBfDescription(''); setBfCategory(''); setBfPages(''); setBfYear('');
     setAdminTab('books');
  };

  const startEditBook = (b: Book) => {
     setEditingBookId(b.id);
     setBfTitle(b.title);
     setBfAuthor(b.author);
     setBfPrice(String(b.price));
     setBfCover(b.coverUrl);
     setBfDescription(b.description || '');
     setBfCategory(b.category && b.category !== 'Barchasi' ? b.category : '');
     setBfPages(b.pages ? String(b.pages) : '');
     setBfYear(b.year ? String(b.year) : '');
     setAdminTab('add');
     setBfError('');
  };

  const archiveBookToggle = (id: string) => {
     const newBooks = books.map(b => b.id === id ? { ...b, isArchived: !b.isArchived } : b);
     saveBooks(newBooks);
  };

  const acceptOrder = async (id: string, userId: string) => {
     const newOrders = orders.map(o => o.id === id ? { ...o, status: 'accepted' as const } : o);
     saveOrders(newOrders);
     await sendToTelegram(`✅ BUYURTMA QABUL QILINDI:\n\nBuyurtma raqami: ${id}\n\nMijozga "Buyurtmangiz qabul qilindi, tez orada yuboramiz" deb xabar chiqadi.`);
  };

  const rejectOrder = async (id: string) => {
     const newOrders = orders.filter(o => o.id !== id);
     saveOrders(newOrders);
     await sendToTelegram(`🚫 BUYURTMA BEKOR QILINDI:\n\nBuyurtma raqami: ${id}`);
  };

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  // Cart Logic
  const addToCart = (book: Book) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === book.id);
      if (existing) {
        return prev.map(item => item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...book, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = useMemo(() => cart.reduce((total, item) => total + (item.price * item.quantity), 0), [cart]);
  const cartItemsCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);

  const visibleBooks = useMemo(() => books.filter(b => !b.isArchived), [books]);

  // Read filtered books
  const filteredBooks = useMemo(() => {
    return visibleBooks.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Barchasi' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, visibleBooks]);

  // --- ADMIN PANEL NEW STATES ---
  const [toasts, setToasts] = React.useState<{id: number, type: 'success'|'error'|'info', msg: string}[]>([]);
  const showToast = (msg: string, type: 'success'|'error'|'info' = 'info') => {
     const id = Date.now();
     setToasts(prev => [...prev, { id, type, msg }]);
     setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const [booksViewMode, setBooksViewMode] = React.useState<'list'|'grid'>('list');
  const [ordersFilter, setOrdersFilter] = React.useState<'all'|'new'|'accepted'>('all');
  const [ordersSort, setOrdersSort] = React.useState<'desc'|'asc'>('desc');
  const [confirmModal, setConfirmModal] = React.useState<{isOpen: boolean, config: null|{title: string, onConfirm: ()=>void}}>({isOpen: false, config: null});

  const [adminBookSearch, setAdminBookSearch] = React.useState('');
  const [adminBookCat, setAdminBookCat] = React.useState('Barchasi');

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
      <>

<style>{`
  .book-3d-anim { transform-style: preserve-3d; animation: float3d 3s ease-in-out infinite; }
  @keyframes float3d { 0%,100% { transform: translateY(0) rotateY(-15deg); } 50% { transform: translateY(-10px) rotateY(-15deg); } }
  @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); } 50% { box-shadow: 0 0 0 6px rgba(59,130,246,0.1); } }
  .transform-style-3d { transform-style: preserve-3d; backface-visibility: hidden; }
`}</style>

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
             <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="text-[42px] font-black tracking-tight text-center text-white mb-6 leading-tight uppercase relative"
             >
                <motion.span
                   animate={{ 
                      textShadow: ["0px 0px 10px rgba(254, 194, 4, 0)", "0px 0px 30px rgba(254, 194, 4, 0.4)", "0px 0px 10px rgba(254, 194, 4, 0)"],
                      y: [0, -5, 0]
                   }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="inline-block relative"
                >
                   NODIR KITOBLAR<br /> DO'KONI
                </motion.span>
             </motion.div>
             <p className="text-white/60 text-base text-center mb-8 leading-relaxed font-medium">
                Bilim — eng qimmatli boylik.<br />
                Uni hech kim tortib ola olmaydi.
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
              {/* HERO BANNER - Modern Glassmorphic */}
              <div className="relative w-full pt-12 pb-8 px-6 bg-gradient-to-b from-[#151515] to-[#111111] overflow-hidden rounded-b-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-b border-white/5">
                 {/* Decorative Blobs */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#FEC204]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
                 <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2"></div>
                 
                 <div className="relative z-10 flex flex-col">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                       <h1 className="text-[34px] font-black text-white leading-tight tracking-tight">
                         Xush kelibsiz<span className="text-[#FEC204]">.</span>
                       </h1>
                       <p className="text-white/50 text-sm font-medium mt-1">
                         Bugun nimani mutolaa qilamiz?
                       </p>
                    </motion.div>

                    <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.2 }}
                       className="relative w-full rounded-[24px] overflow-hidden group cursor-pointer border border-white/10 bg-black/20"
                       onClick={() => setSelectedBook(visibleBooks[0])}
                    >
                       <div className="absolute inset-0">
                          <img src={visibleBooks[0]?.coverUrl} className="w-full h-full object-cover opacity-50 scale-105 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700 blur-[2px]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent"></div>
                       </div>
                       
                       <div className="relative z-10 p-5 flex items-end gap-4">
                          <div className="relative w-20 h-28 shrink-0 shadow-2xl rounded-lg overflow-hidden border border-white/20 transform group-hover:-translate-y-1 group-hover:rotate-2 transition-transform duration-300">
                             <img src={visibleBooks[0]?.coverUrl} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                             <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-md rounded-md mb-2 border border-white/5">
                                <Star size={10} className="fill-[#FEC204] text-[#FEC204]" /> 
                                <span className="text-white text-[10px] font-bold leading-none">{visibleBooks[0]?.rating}</span>
                             </div>
                             <h3 className="font-bold text-white text-lg leading-tight mb-1 truncate">{visibleBooks[0]?.title}</h3>
                             <p className="text-white/60 text-xs truncate">{visibleBooks[0]?.author}</p>
                          </div>
                          
                          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:bg-[#FEC204] group-hover:text-black group-hover:scale-110 transition-all">
                             <ChevronRight size={20} />
                          </div>
                       </div>
                    </motion.div>
                 </div>
              </div>

              {/* GORIZONTAL KO'RGAZMA */}
              <div className="mt-8 px-6">
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-xl font-bold text-white tracking-tight">Ommabop <span className="text-[#FEC204]">asarlar</span></h2>
                </div>
                <div className="flex overflow-x-auto hide-scroll gap-4 pb-6 -mx-6 px-6 snap-x snap-mandatory">
                   {visibleBooks.slice(0, 5).map((book, idx) => (
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
                    {visibleBooks.slice(5, 11).map((book, idx) => (
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
                 <div className="pt-12 pb-16 bg-gradient-to-b from-[#111111] to-[#0A0A0A] relative rounded-b-[48px] overflow-hidden flex flex-col items-center justify-center shadow-xl">
                    <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
                    
                    {/* AVATAR with rotating ring and flip */}
                    <div className="relative group perspective-1000 w-24 h-24 mb-4 z-10 shrink-0">
                       <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -inset-2 rounded-full border border-dashed border-[#FEC204]/50"></motion.div>
                       <div className="w-full h-full rounded-full bg-gradient-to-br from-[#111111] to-[#222222] border-2 border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden transform transition-transform duration-500 group-hover:scale-105 active:scale-95 cursor-pointer">
                          <span className="text-3xl font-black text-[#FEC204]">{userProfile?.fullName?.split(' ').map((n: string)=>n[0]).join('').substring(0,2).toUpperCase() || 'U'}</span>
                       </div>
                    </div>
                    <h2 className="text-2xl font-black text-white relative z-10 text-center px-4 leading-tight">{userProfile?.fullName || 'Foydalanuvchi'}</h2>
                    <p className="text-[#FEC204] font-medium text-xs relative z-10 mt-1">@{userProfile?.username || 'user'}</p>
                 </div>

                 <div className="px-6 -mt-6 relative z-20 space-y-4">
                    {/* Stats Cards - CountUp animation */}
                    <div className="grid grid-cols-1 gap-4">
                       <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.1}} className="bg-[#111111] border border-white/5 p-5 rounded-[24px] shadow-lg flex flex-col items-center text-center">
                          <Package className="text-[#FEC204] mb-2" size={24} />
                          <div className="text-3xl font-black text-white mb-1"><AnimatedCounter from={0} to={orders.filter(o => o.userId === userProfile?.username).length} /></div>
                          <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Buyurtmalar</p>
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
             <div className="pb-24 flex-1 overflow-y-auto hide-scroll px-4 relative min-h-full">
                {/* 3D Header - Mouse Tilt */}
                <motion.div 
                   className="mt-6 mb-8 w-full p-6 rounded-3xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 shadow-2xl relative overflow-hidden"
                   onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left - rect.width / 2;
                      const y = e.clientY - rect.top - rect.height / 2;
                      e.currentTarget.style.transform = `perspective(1000px) rotateX(${-y/20}deg) rotateY(${x/20}deg)`;
                   }}
                   onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
                   }}
                   style={{ transition: 'transform 0.1s ease-out', transformStyle: 'preserve-3d' }}
                >
                   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none"></div>
                   <div className="flex items-start justify-between relative z-10">
                      <div>
                         <h1 className="text-2xl font-black text-white" style={{ transform: 'translateZ(30px)' }}>
                            Xush kelibsiz, <span className="text-[#FEC204]">Admin</span>
                         </h1>
                         <p className="text-white/50 text-sm font-medium mt-1" style={{ transform: 'translateZ(20px)' }}>
                            {(() => {
                               const d = new Date();
                               const m = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
                               return `${d.getDate()}-${m[d.getMonth()]} ${d.getFullYear()} `;
                            })()}
                         </p>
                      </div>
                      <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors active:scale-90" style={{ transform: 'translateZ(30px)' }}>
                         <LogOut size={16} />
                      </button>
                   </div>
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
                                       animate={{ height: `${height}%` }}
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
                                 <span className={`relative z-10 ${ordersFilter===f ? 'text-[#FEC204]' : 'text-white/40'}`}>
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
                              className={`bg-[#111111] p-4 rounded-3xl border transition-colors ${o.status === 'accepted' ? 'border-green-500/30 bg-green-500/5' : 'border-white/5'}`}
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
                        {['Barchasi', 'Arxivlangan', ...categories.filter(c => c !== 'Barchasi')].map(cat => (
                           <button key={cat} onClick={()=>setAdminBookCat(cat)} className={`whitespace-nowrap px-3 py-1 font-bold text-xs rounded-full border ${adminBookCat===cat ? 'bg-white/10 border-white/20 text-[#FEC204]' : 'bg-transparent border-white/5 text-white/40'}`}>
                              {cat}
                           </button>
                        ))}
                     </div>

                     <div className={booksViewMode === 'grid' ? "grid grid-cols-2 gap-4" : "space-y-3"}>
                        <AnimatePresence>
                           {books
                              .filter(b => adminBookCat === 'Arxivlangan' ? b.isArchived : !b.isArchived)
                              .filter(b => (adminBookCat === 'Barchasi' || adminBookCat === 'Arxivlangan') || b.category === adminBookCat)
                              .filter(b => b.title.toLowerCase().includes(adminBookSearch.toLowerCase()) || b.author.toLowerCase().includes(adminBookSearch.toLowerCase()))
                              .map(b => (
                                 <motion.div 
                                    layout
                                    initial={{opacity:0, scale:0.95}}
                                    animate={{opacity:1, scale:1}}
                                    exit={{opacity:0, scale:0.95}}
                                    key={b.id} 
                                    className={`group bg-[#111111] border border-white/5 rounded-2xl overflow-hidden relative ${booksViewMode === 'list' ? 'flex p-2 items-center gap-3' : 'p-3'}`}
                                 >
                                    <div className={`relative perspective-600 ${booksViewMode === 'list' ? 'w-16 h-20 shrink-0' : 'w-full aspect-[2/3] mb-3'}`}>
                                       <motion.img 
                                          whileHover={{ rotateY: 10, rotateX: -5 }}
                                          src={b.coverUrl} 
                                          className="w-full h-full object-cover rounded-lg shadow-md transform-style-3d transition-transform duration-300" 
                                       />
                                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                                          <button onClick={()=>startEditBook(b)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 hover:bg-[#FEC204] hover:text-black transition-colors"><Edit3 size={14}/></button>
                                          <button onClick={()=>attemptArchiveBook(b.id, !b.isArchived)} className={`w-8 h-8 rounded-full flex items-center justify-center text-white active:scale-90 transition-colors ${b.isArchived ? 'bg-green-500/50 hover:bg-green-500' : 'bg-red-500/50 hover:bg-red-500'}`}>
                                             {b.isArchived ? <Inbox size={14} /> : <Archive size={14}/>}
                                          </button>
                                       </div>
                                    </div>
                                    <div className={`flex-1 ${booksViewMode === 'grid' ? '' : 'min-w-0'}`}>
                                       <div className="font-bold text-sm text-white truncate">{b.title}</div>
                                       <div className="text-[10px] text-white/50 truncate mb-1">{b.author}</div>
                                       <div className="text-[#FEC204] font-black text-xs">{formatPrice(b.price)}</div>
                                    </div>
                                    {booksViewMode === 'list' && (
                                       <button onClick={()=>attemptArchiveBook(b.id, !b.isArchived)} className={`w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform shrink-0 ${b.isArchived ? 'bg-[#FEC204]/10 text-[#FEC204]' : 'bg-red-500/10 text-red-400'}`}>
                                          {b.isArchived ? <Inbox size={14} /> : <Archive size={14}/>}
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

                        )}
                     </div>

                     <div className="space-y-4">
                        {[
                          { label: 'Sarlavha', val: bfTitle, set: setBfTitle, type: 'text' },
                          { label: 'Muallif', val: bfAuthor, set: setBfAuthor, type: 'text' },
                          { label: 'Narxi (so\'m)', val: bfPrice, set: setBfPrice, type: 'number' },
                          { label: 'Muqova URL', val: bfCover, set: setBfCover, type: 'text' },
                        ].map((field, i) => (
                           <div key={i} className="relative group">
                              <label className={`absolute left-3 transition-all duration-200 pointer-events-none ${field.val ? '-top-2 text-[10px] bg-[#0A0A0A] px-1 text-[#FEC204]' : 'top-3.5 text-sm text-white/40 group-focus-within:-top-2 group-focus-within:text-[10px] group-focus-within:bg-[#0A0A0A] group-focus-within:px-1 group-focus-within:text-[#FEC204]'}`}>
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
                              <label className={`absolute left-3 transition-all duration-200 pointer-events-none ${bfPages ? '-top-2 text-[10px] bg-[#0A0A0A] px-1 text-[#FEC204]' : 'top-3.5 text-sm text-white/40 group-focus-within:-top-2 group-focus-within:text-[10px] group-focus-within:bg-[#0A0A0A] group-focus-within:px-1 group-focus-within:text-[#FEC204]'}`}>Sahifalar</label>
                              <input type="number" value={bfPages} onChange={e=>setBfPages(e.target.value)} className="w-full h-12 bg-transparent border-2 border-white/10 focus:border-[#FEC204] rounded-xl px-4 outline-none text-white font-medium transition-all" />
                           </div>
                           <div className="relative group flex-1">
                              <label className={`absolute left-3 transition-all duration-200 pointer-events-none ${bfYear ? '-top-2 text-[10px] bg-[#0A0A0A] px-1 text-[#FEC204]' : 'top-3.5 text-sm text-white/40 group-focus-within:-top-2 group-focus-within:text-[10px] group-focus-within:bg-[#0A0A0A] group-focus-within:px-1 group-focus-within:text-[#FEC204]'}`}>Yil</label>
                              <input type="number" value={bfYear} onChange={e=>setBfYear(e.target.value)} className="w-full h-12 bg-transparent border-2 border-white/10 focus:border-[#FEC204] rounded-xl px-4 outline-none text-white font-medium transition-all" />
                           </div>
                        </div>

                        <div>
                           <label className="text-xs font-bold text-white/50 uppercase tracking-widest pl-1 mb-2 block">Kategoriya</label>
                           <div className="flex flex-wrap gap-2">
                              {categories.filter(c => c !== 'Barchasi').map(cat => (
                                 <button key={cat} onClick={()=>setBfCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${bfCategory === cat ? 'bg-[#FEC204]/20 border-[#FEC204] text-[#FEC204]' : 'bg-transparent border-white/10 text-white/50'}`}>{cat}</button>
                              ))}
                           </div>
                        </div>

                        <div className="relative group">
                           <label className={`absolute left-3 transition-all duration-200 pointer-events-none ${bfDescription ? '-top-2 text-[10px] bg-[#0A0A0A] px-1 text-[#FEC204]' : 'top-3.5 text-sm text-white/40 group-focus-within:-top-2 group-focus-within:text-[10px] group-focus-within:bg-[#0A0A0A] group-focus-within:px-1 group-focus-within:text-[#FEC204]'}`}>Tavsif</label>
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
                           <button disabled={isSaving} onClick={async () => { await handleAddOrEditBook(); showToast('Muvaffaqiyatli saqlandi', 'success'); }} className="flex-1 h-14 bg-[#FEC204] text-[#0A0A0A] rounded-xl font-black text-lg disabled:opacity-50 active:scale-95 transition-transform shadow-lg shadow-[#FEC204]/20 flex justify-center items-center gap-2 group">
                               {isSaving ? <div className="w-5 h-5 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin"></div> : <><CheckCircle2 size={20} className="group-active:scale-125 transition-transform" /> Saqlash</>}
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
                           {visibleBooks.slice(0,3).map((b, i) => (
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
                   ? ['dashboard','orders','add','books','report'].indexOf(adminTab) * (100 / 5) 
                   : ['home','search','cart','profile'].indexOf(activeTab) * (100 / 4)
                 }%`
               }}
             />

             
             {isAdmin ? (
                <>
                  {['dashboard', 'orders', 'add', 'books', 'report'].map((tab, i) => (
                    <button key={tab} onClick={() => setAdminTab(tab)} className="flex-1 flex flex-col items-center justify-center relative z-10 h-full group">
                       <div className="relative">
                          {tab === 'add' ? (
                             <div className={`w-12 h-12 rounded-full border-4 border-[#111111] bg-[#FEC204] text-[#0A0A0A] flex items-center justify-center absolute -top-8 -left-6 shadow-[0_0_20px_rgba(254,194,4,0.3)] transition-transform duration-300 ${adminTab === tab ? 'rotate-45' : 'hover:scale-110'}`}>
                                <Plus size={24} className="font-black" />
                             </div>
                          ) : (
                             <>
                               {tab === 'dashboard' && <Home size={22} className={`transition-all ${adminTab === tab ? "text-[#FEC204] scale-110" : "text-white/40 group-hover:text-white/60"}`} />}
                               {tab === 'orders' && <Package size={22} className={`transition-all ${adminTab === tab ? "text-[#FEC204] scale-110" : "text-white/40 group-hover:text-white/60"}`} />}
                               {tab === 'books' && <BookOpen size={22} className={`transition-all ${adminTab === tab ? "text-[#FEC204] scale-110" : "text-white/40 group-hover:text-white/60"}`} />}
                               {tab === 'report' && <BarChart3 size={22} className={`transition-all ${adminTab === tab ? "text-[#FEC204] scale-110" : "text-white/40 group-hover:text-white/60"}`} />}
                               
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
      {isAdmin && (
         <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none w-[90%] max-w-sm">
            <AnimatePresence>
               {toasts.map(t => (
                  <motion.div key={t.id} initial={{opacity:0, y:-20, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, y:-20, scale:0.95}} className={`p-4 rounded-2xl border backdrop-blur-xl flex items-center gap-3 shadow-2xl pointer-events-auto ${t.type==='success'?'bg-green-500/20 border-green-500/30 text-green-100':t.type==='error'?'bg-red-500/20 border-red-500/30 text-red-100':'bg-blue-500/20 border-blue-500/30 text-blue-100'}`}>
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
