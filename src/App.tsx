/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Home, Search, ShoppingBag, User, ChevronLeft, Minus, Plus, Star, BookOpen, Clock, Trash2, Heart, LogOut, Package, Edit3, PlusCircle, BarChart3, Archive } from 'lucide-react';
import { books as initialBooks, categories } from './data';
import { sendToTelegram } from './lib/telegram';
import { Book, CartItem, Order } from './types';

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
  const [adminTab, setAdminTab] = useState<'orders' | 'books' | 'add' | 'report' | 'archive'>('orders');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  
  // App view State
  const [viewMyOrders, setViewMyOrders] = useState(false);
  
  // Book Form State (Add / Edit)
  const [bfTitle, setBfTitle] = useState('');
  const [bfAuthor, setBfAuthor] = useState('');
  const [bfPrice, setBfPrice] = useState('');
  const [bfCover, setBfCover] = useState('');
  
  // Initialization
  useEffect(() => {
    const checkUser = () => {
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
         try {
           const user = JSON.parse(authUser);
           if(user.username === '@admin') {
              setIsAdmin(true);
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

  const handleAddOrEditBook = () => {
     if(!bfTitle || !bfAuthor || !bfPrice || !bfCover) {
        alert("Barcha ma'lumotlarni to'ldiring");
        return;
     }
     if (editingBookId) {
        const newBooks = books.map(b => b.id === editingBookId ? {
           ...b,
           title: bfTitle,
           author: bfAuthor,
           price: parseInt(bfPrice, 10),
           coverUrl: bfCover
        } : b);
        saveBooks(newBooks);
        setEditingBookId(null);
     } else {
        const newBook: Book = {
           id: 'BK-' + Math.floor(Math.random()*10000),
           title: bfTitle,
           author: bfAuthor,
           price: parseInt(bfPrice, 10),
           coverUrl: bfCover,
           description: 'Kiritilmadi',
           category: 'Barchasi',
           rating: 5,
           isArchived: false,
        };
        saveBooks([newBook, ...books]);
     }
     setBfTitle(''); setBfAuthor(''); setBfPrice(''); setBfCover('');
     setAdminTab('books');
  };

  const startEditBook = (b: Book) => {
     setEditingBookId(b.id);
     setBfTitle(b.title);
     setBfAuthor(b.author);
     setBfPrice(String(b.price));
     setBfCover(b.coverUrl);
     setAdminTab('add');
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

  // Read filtered books
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      if (book.isArchived) return false;
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Barchasi' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, books]);

  return (
    <div className="w-full max-w-[480px] mx-auto h-[100dvh] bg-[#F3F4F6] flex flex-col relative sm:border-[12px] sm:border-[#000000] overflow-hidden sm:rounded-[48px]">
      <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#000000] rounded-b-2xl z-50"></div>
      
      {!isAuthenticated ? (
        <div className="flex-1 overflow-y-auto w-full h-full bg-[#F3F4F6] flex flex-col justify-end p-6 animate-in fade-in duration-500 z-[100] relative">
           <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent z-10"></div>
             <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-30 grayscale" alt="Library Background" />
           </div>

           <div className="relative z-10 w-full pb-8">
             <div className="flex items-center gap-2 mb-4">
                 <BookOpen className="text-[#fec204]" size={28} />
                 <span className="text-[#fec204] font-bold tracking-widest text-lg">LIBRIS</span>
             </div>
             <div className="text-4xl font-bold tracking-tight text-[#000000] mb-4 leading-tight">
               NODIR KITOBLAR<br /> DO'KONI
             </div>
             <p className="text-[#6B7280] text-base mb-8 leading-relaxed font-medium">
                Bilim xazinasi va noyob asarlar olamiga xush kelibsiz. Eksklyuziv nashrlarni biz bilan kashf eting.
             </p>
             
             <div className="w-full bg-[#E5E7EB] rounded-[32px] p-6 shadow-xl space-y-4">
                {showAuthMode === 'main' ? (
                   <div className="space-y-4">
                      <button onClick={() => { setShowAuthMode('login'); setAuthError(''); }} className="w-full bg-[#fec204] text-[#000000] h-14 rounded-2xl font-bold text-lg flex items-center justify-center active:scale-95 transition-transform">
                         Kirish <ChevronLeft size={20} className="rotate-180 ml-2" />
                      </button>
                      <button onClick={() => { setShowAuthMode('register'); setAuthError(''); }} className="w-full bg-[#F3F4F6] text-[#000000] h-14 rounded-2xl font-bold text-lg flex items-center justify-center active:scale-95 transition-transform">
                         Ro'yxatdan o'tish
                      </button>
                      
                      <div className="flex items-center justify-center py-2">
                         <div className="h-px bg-[#F3F4F6]/10 flex-1"></div>
                         <span className="px-4 text-xs font-bold text-[#000000]/40 tracking-wider">YOKI</span>
                         <div className="h-px bg-[#F3F4F6]/10 flex-1"></div>
                      </div>

                      <button onClick={() => { setShowAuthMode('admin'); setAuthError(''); }} className="w-full bg-transparent border-2 border-[#F3F4F6]/10 text-[#000000]/60 h-14 rounded-2xl font-bold text-lg flex items-center justify-center hover:bg-[#F3F4F6]/5 active:scale-95 transition-all">
                         Admin sifatida kirish
                      </button>
                   </div>
                ) : (
                  <>
                    <div className="flex bg-white rounded-xl mb-6 p-1 border border-[#E5E7EB]">
                       {showAuthMode === 'admin' ? (
                         <div className="flex-1 py-3 text-sm font-bold rounded-lg text-center bg-[#fec204] text-[#000000] shadow-sm">Admin Tizimi</div>
                       ) : (
                         <>
                           <button onClick={() => { setShowAuthMode('login'); setAuthError(''); }} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${showAuthMode === 'login' ? 'bg-[#fec204] text-[#000000] shadow-sm' : 'text-[#6B7280]'}`}>Kirish</button>
                           <button onClick={() => { setShowAuthMode('register'); setAuthError(''); }} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${showAuthMode === 'register' ? 'bg-[#fec204] text-[#000000] shadow-sm' : 'text-[#6B7280]'}`}>Ro'yxatdan o'tish</button>
                         </>
                       )}
                    </div>
  
                    {authError && <div className="bg-red-100 text-red-600 text-sm font-medium p-3 rounded-xl mb-4 text-center">{authError}</div>}
  
                    <form onSubmit={showAuthMode === 'register' ? handleRegister : handleLogin} className="flex flex-col gap-4">
                       {showAuthMode === 'admin' && (
                         <div>
                            <label className="text-xs font-bold text-[#000000] uppercase tracking-wider mb-1 block">Maxfiy kod</label>
                            <input type="password" value={authAdminCode} onChange={e => setAuthAdminCode(e.target.value)} placeholder="••••••••" className="w-full h-12 bg-white rounded-xl px-4 border-2 border-transparent focus:border-[#fec204] outline-none font-medium text-[#000000]" />
                         </div>
                       )}
  
                       {showAuthMode === 'register' && (
                         <>
                           <div>
                              <label className="text-xs font-bold text-[#000000] uppercase tracking-wider mb-1 block">Ism va familiya</label>
                              <input type="text" value={authFullName} onChange={e => setAuthFullName(e.target.value)} placeholder="Toliq ismingiz" className="w-full h-12 bg-white rounded-xl px-4 border-2 border-transparent focus:border-[#fec204] outline-none font-medium text-[#000000]" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-[#000000] uppercase tracking-wider mb-1 block">Telefon raqam</label>
                              <input type="tel" value={authPhone} onChange={e => setAuthPhone(e.target.value)} placeholder="+998" className="w-full h-12 bg-white rounded-xl px-4 border-2 border-transparent focus:border-[#fec204] outline-none font-medium text-[#000000]" />
                           </div>
                         </>
                       )}
                       
                       {(showAuthMode === 'login' || showAuthMode === 'register') && (
                         <>
                           <div>
                              <label className="text-xs font-bold text-[#000000] uppercase tracking-wider mb-1 block">Username</label>
                              <input type="text" value={authUsername} onChange={e => setAuthUsername(e.target.value)} placeholder="hakimov" className="w-full h-12 bg-white rounded-xl px-4 border-2 border-transparent focus:border-[#fec204] outline-none font-medium text-[#000000]" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-[#000000] uppercase tracking-wider mb-1 block">Parol</label>
                              <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="••••••••" className="w-full h-12 bg-white rounded-xl px-4 border-2 border-transparent focus:border-[#fec204] outline-none font-medium text-[#000000]" />
                           </div>
                         </>
                       )}
                       
                       <div className="flex gap-2 mt-2">
                         <button type="button" onClick={() => setShowAuthMode('main')} className="w-14 bg-white text-[#6B7280] h-14 rounded-xl flex items-center justify-center active:scale-95 transition-transform">
                            <ChevronLeft size={24} />
                         </button>
                         <button disabled={authLoading} type="submit" className="flex-1 bg-[#F3F4F6] text-[#fec204] disabled:opacity-50 h-14 rounded-xl font-bold flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-95">
                            {authLoading ? 'Kuting...' : showAuthMode === 'login' ? 'Tizimga kirish' : showAuthMode === 'register' ? 'Tasdiqlash' : 'Kirish'}
                         </button>
                       </div>
                    </form>
                  </>
                )}
             </div>
             
             <div className="mt-8 text-center text-[#9CA3AF] text-xs font-medium flex justify-between px-2">
                <span>© 2024 LIBRIS PREMIUM</span>
                <span className="flex gap-3">
                   {/* icons */}
                </span>
             </div>
           </div>
        </div>
      ) : (
        <>
          {/* --- Main App Content --- */}
          {/* --- User App Content --- */}
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-8 custom-scrollbar">
        
        {/* HOME VIEW */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-300">
            {/* Header */}
            <div className="pt-12 px-6 pb-6 bg-gradient-to-br from-[#000000] via-[#111111] to-[#fec204] rounded-b-[48px] shadow-md relative overflow-hidden">
              {/* Decorative elements for the gradient background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="mb-6 mt-1 relative z-10">
                <div className="text-xl sm:text-2xl font-black tracking-tighter text-[#000000] uppercase">
                  NODIR KITOBLAR <span className="text-[#fec204]">DO'KONI</span>
                </div>
              </div>
              
              <div className="mb-2 relative z-10">
                <h1 className="text-2xl font-bold text-[#000000] leading-tight">Xush kelibsiz,</h1>
                <p className="text-[#4B5563] font-medium text-sm">Bugun qanday kitob o'qiymiz?</p>
              </div>
            </div>

            {/* Popular Section */}
            <div className="mt-8 px-6">
              <div className="w-full h-44 bg-gradient-to-bl from-[#fec204] via-[#000000] to-[#000000] rounded-3xl p-6 flex justify-between relative overflow-hidden cursor-pointer mb-8 shadow-2xl" onClick={() => setSelectedBook(books[1])}>
                {/* Decorative glow effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#fec204]/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>
                
                <div className="z-10 flex flex-col justify-center h-full space-y-2">
                  <span className="text-[#fec204] text-xs font-bold uppercase tracking-widest drop-shadow-md">Hafta Tanlovi</span>
                  <h2 className="text-[#000000] text-xl font-bold leading-tight drop-shadow-md">{books[1].title}<br/><span className="text-[#4B5563] font-medium text-sm">{books[1].author}</span></h2>
                  <button className="mt-4 bg-[#fec204] text-[#000000] px-4 py-2 rounded-xl text-xs font-black w-max shadow-lg active:scale-95 transition-transform">Hozir O'qish</button>
                </div>
                <div className="absolute right-[-10px] bottom-[-20px] w-32 h-48 bg-black/20 rounded-lg rotate-12 flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
                  <div className="w-24 h-36 bg-[#2C3E50] rounded shadow-2xl border-l-2 border-[#fec204] overflow-hidden transform group-hover:-translate-y-1 transition-transform">
                    <img src={books[1].coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-bold text-[#000000]">Mashhur kitoblar</h2>
                <button className="text-xs font-bold text-[#fec204] uppercase tracking-wider">Barchasi</button>
              </div>
              
              {/* Horizontal Scroll Area */}
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scroll">
                {books.slice(0, 4).map(book => (
                  <div 
                    key={book.id} 
                    onClick={() => setSelectedBook(book)}
                    className="flex-none w-40 snap-start active:scale-95 transition-transform"
                  >
                    <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-md mb-3 bg-[#E5E7EB] flex items-center justify-center">
                      <div className="w-[90%] h-[95%] shadow-lg rounded overflow-hidden">
                         <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <h3 className="font-bold text-[#000000] text-sm truncate">{book.title}</h3>
                    <p className="text-[10px] text-[#6B7280] truncate mt-0.5">{book.author}</p>
                    <p className="text-[#fec204] font-bold text-sm mt-1">{formatPrice(book.price)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Section (Yangi Kitoblar lookalike grid) */}
            <div className="mt-4 px-6 pb-6">
              <h3 className="text-lg font-bold text-[#000000] mb-4">Yangi Kitoblar</h3>
              <div className="grid grid-cols-2 gap-4">
                {books.slice(3).concat(books.slice(0,1)).slice(0,4).map((book, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedBook(book)}
                    className="space-y-2 active:scale-95 transition-transform cursor-pointer"
                  >
                    <div className="h-40 bg-[#E5E7EB] rounded-2xl relative overflow-hidden flex items-center justify-center">
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center text-xs font-bold text-[#000000] shadow-sm z-10">
                         <Star size={10} className="text-[#fec204] fill-[#fec204] mr-1" />
                         {book.rating}
                      </div>
                      <div className="w-20 h-28 bg-[#000000] rounded shadow-md overflow-hidden">
                         <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#000000] truncate">{book.title}</p>
                      <p className="text-[10px] text-[#6B7280] truncate">{book.author}</p>
                      <p className="text-[#fec204] font-bold text-xs mt-1">{formatPrice(book.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEARCH VIEW */}
        {activeTab === 'search' && (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
            <div className="pt-12 px-6 pb-4 bg-white shadow-sm sticky top-0 z-10">
              <h1 className="text-2xl font-bold text-[#000000] mb-4">Qidiruv</h1>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" size={20} />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Asar, muallif yoki janr..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 bg-[#F3F4F6] rounded-2xl pl-12 pr-4 border-2 border-transparent focus:border-[#000000] outline-none transition-all font-medium text-[#000000] placeholder:text-[#6B7280]"
                />
              </div>
              
              {/* Category Pills */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 hide-scroll pt-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      selectedCategory === cat 
                        ? 'bg-[#000000] text-white shadow-md' 
                        : 'bg-[#F3F4F6] text-[#6B7280] active:bg-[#E5E7EB]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 p-6">
              {filteredBooks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-70">
                  <BookOpen size={48} className="text-[#9CA3AF] mb-4" />
                  <p className="text-[#6B7280] font-medium">Bunday kitob topilmadi. Boshqa so'z bilan izlab ko'ring.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  {filteredBooks.map(book => (
                    <div 
                      key={book.id} 
                      onClick={() => setSelectedBook(book)}
                      className="flex flex-col active:scale-95 transition-transform"
                    >
                      <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-sm mb-3 bg-[#E5E7EB] relative flex items-center justify-center">
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center text-xs font-bold text-[#000000] shadow-sm z-10">
                           <Star size={10} className="text-[#fec204] fill-[#fec204] mr-1" />
                           {book.rating}
                        </div>
                        <div className="w-[90%] h-[95%] shadow-lg rounded overflow-hidden">
                          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <h3 className="font-bold text-[#000000] text-sm leading-tight line-clamp-2">{book.title}</h3>
                      <p className="text-xs font-medium text-[#6B7280] mt-1 line-clamp-1">{book.author}</p>
                      <p className="text-[#fec204] font-bold text-sm mt-1">{formatPrice(book.price)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CART VIEW */}
        {activeTab === 'cart' && (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
             <div className="pt-12 px-6 pb-4 bg-white shadow-sm sticky top-0 z-10 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-[#000000]">Xarid savati</h1>
              {cartItemsCount > 0 && (
                <span className="bg-[#000000] text-white font-bold px-3 py-1 rounded-full text-sm">
                  {cartItemsCount} ta kitob
                </span>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-40 h-40 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-6">
                  <ShoppingBag size={64} className="text-[#9CA3AF]" />
                </div>
                <h2 className="text-xl font-bold text-[#000000] mb-2">Savat bo'sh</h2>
                <p className="text-[#6B7280] font-medium mb-8">Hali hech qanday kitob tanlamadingiz. Do'konimizdagi ajoyib asarlarni ko'rib chiqing.</p>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="bg-[#000000] text-white font-bold h-14 px-8 rounded-2xl active:scale-95 transition-transform"
                >
                  Kitoblarni ko'rish
                </button>
              </div>
            ) : (
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex-1 flex flex-col gap-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex bg-white p-3 rounded-2xl shadow-sm border border-[#E5E7EB]">
                      <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 bg-[#E5E7EB] flex relative items-center justify-center">
                        <div className="w-[90%] h-[95%] shadow-md rounded overflow-hidden">
                          <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="ml-4 py-1 flex flex-col justify-between flex-1">
                         <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-[#000000] leading-tight line-clamp-2">{item.title}</h3>
                            <p className="text-xs font-medium text-[#6B7280] mt-1">{item.author}</p>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-[#9CA3AF] hover:text-[#9B2C2C] active:text-[#9B2C2C] p-1 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-[#fec204] font-bold">{formatPrice(item.price)}</p>
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-[#F3F4F6] rounded-lg p-1 border border-[#E5E7EB]">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-[#000000] active:scale-90 transition-transform"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center font-bold text-sm text-[#000000]">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-white shadow-sm text-[#000000] active:scale-90 transition-transform"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Summary - Pushed to bottom of scrollable area, just above nav */}
                <div className="mt-8 bg-[#000000] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#fec204]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between mb-3 text-[#6B7280] text-sm font-medium">
                      <span>Kitoblar narxi:</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between mb-4 text-[#6B7280] text-sm font-medium">
                      <span>Yetkazib berish:</span>
                      <span>Bepul</span>
                    </div>
                    <div className="h-px bg-[#E5E7EB] w-full mb-4"></div>
                    <div className="flex justify-between mb-6 text-lg font-bold">
                      <span>Jami:</span>
                      <span className="text-[#fec204]">{formatPrice(cartTotal)}</span>
                    </div>
                    <button 
                      onClick={() => setIsCheckout(true)}
                      className="w-full bg-[#fec204] text-[#000000] active:bg-[#eab308] h-14 rounded-2xl font-bold flex items-center justify-center transition-colors shadow-lg shadow-[#fec204]/20"
                    >
                      Sotib olish
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROFILE VIEW */}
        {activeTab === 'profile' && (
          <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
             <div className="pt-16 pb-8 px-6 bg-[#000000] text-white rounded-b-[48px] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#fec204]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-[#2C3E50] border-[6px] border-[#000000] mb-4 overflow-hidden flex items-center justify-center relative shadow-2xl">
                     <User size={40} className="text-[#6B7280]" />
                     <div className="absolute bottom-0 w-full h-8 bg-[#fec204]/80 flex items-center justify-center backdrop-blur-sm text-[10px] font-bold text-[#000000] uppercase tracking-wider">
                       Tahrir
                     </div>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">{userProfile?.fullName || 'Foydalanuvchi'}</h2>
                  <p className="text-[#6B7280] font-medium text-sm mt-1">@{userProfile?.username || 'user'}</p>
                  <p className="text-[#9CA3AF] text-xs mt-1">{userProfile?.phone}</p>
                </div>
             </div>
             
             <div className="p-6 flex flex-col gap-4">
               {isAdmin && (
                 <button onClick={() => setActiveTab('admin')} className="w-full bg-[#000000] text-[#fec204] p-4 rounded-2xl shadow-sm border border-[#000000] flex items-center justify-between active:scale-[0.98] transition-transform">
                   <div className="flex items-center">
                      <div className="w-12 h-12 rounded-xl bg-[#fec204]/10 flex items-center justify-center mr-4">
                        <Package size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold">Admin Panel</p>
                        <p className="text-[10px] text-[#fec204]/70 font-medium mt-0.5">Do'konni boshqarish</p>
                      </div>
                   </div>
                   <ChevronLeft size={20} className="rotate-180" />
                 </button>
               )}

               {!viewMyOrders ? (
                 <button onClick={() => setViewMyOrders(true)} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-[#E5E7EB] flex items-center justify-between active:scale-[0.98] transition-transform">
                   <div className="flex items-center">
                      <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#000000] mr-4">
                        <ShoppingBag size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-[#000000]">Mening buyurtmalarim</p>
                        <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">{orders.filter(o => o.userId === userProfile?.username).length} ta buyurtma</p>
                      </div>
                   </div>
                   <ChevronLeft size={20} className="text-[#9CA3AF] rotate-180" />
                 </button>
               ) : (
                 <div className="animate-in slide-in-from-right-2">
                    <button onClick={() => setViewMyOrders(false)} className="flex items-center text-[#6B7280] font-bold text-sm mb-4">
                       <ChevronLeft size={16} className="mr-1" /> Ortga
                    </button>
                    <h3 className="font-bold text-[#000000] mb-4">Mening Buyurtmalarim</h3>
                    <div className="space-y-4">
                       {orders.filter(o => o.userId === userProfile?.username).length === 0 && (
                          <div className="text-center text-[#9CA3AF] text-sm py-4">Sizda hali buyurtmalar yo'q</div>
                       )}
                       {orders.filter(o => o.userId === userProfile?.username).map(o => (
                          <div key={o.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E5E7EB]">
                             <div className="flex justify-between items-center mb-3">
                               <span className="font-bold text-sm text-[#000000]">#{o.id}</span>
                               <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${o.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                  {o.status === 'new' ? 'KUTILMOQDA' : 'QABUL QILINDI'}
                               </span>
                             </div>
                             <div className="space-y-2 mt-2">
                               {o.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-xs">
                                     <span className="text-[#6B7280]">{item.title} (x{item.quantity})</span>
                                     <span className="font-bold text-[#000000]">{formatPrice(item.price * item.quantity)}</span>
                                  </div>
                               ))}
                             </div>
                             <div className="h-px bg-[#E5E7EB] my-3"></div>
                             <div className="flex justify-between items-center">
                               <span className="text-xs font-bold text-[#6B7280] tracking-wider uppercase">Jami to'lov:</span>
                               <span className="font-black text-[#000000]">{formatPrice(o.totalAmount)}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               <button className="w-full bg-white p-4 rounded-2xl shadow-sm border border-[#E5E7EB] flex items-center justify-between active:scale-[0.98] transition-transform">
                 <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center text-[#000000] mr-4">
                      <Heart size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#000000]">Saqlanganlar</p>
                      <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">Yoqtirgan kitoblar</p>
                    </div>
                 </div>
                 <ChevronLeft size={20} className="text-[#9CA3AF] rotate-180" />
               </button>
               
               <button onClick={handleLogout} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-[#E5E7EB] flex items-center justify-between active:scale-[0.98] transition-transform mt-2">
                  <div className="flex items-center text-[#9B2C2C]">
                    <LogOut size={20} className="mr-3"/>
                    <span className="font-bold">Tizimdan chiqish</span>
                  </div>
               </button>
             </div>
          </div>
        )}

      </div>

      {/* ADMIN VIEW */}
      {isAdmin ? (
        <div className="absolute top-0 left-0 w-full h-[calc(100%-4rem-env(safe-area-inset-bottom))] bg-[#F3F4F6] z-30 flex flex-col animate-in slide-in-from-right-4 duration-300 overflow-hidden sm:rounded-[48px]">
          <div className="pt-12 px-6 pb-6 bg-[#000000] rounded-b-[48px] shadow-md relative overflow-hidden flex-shrink-0">
             <div className="flex justify-between items-center z-10 relative">
               <div className="w-10"></div>
               <h2 className="text-xl font-bold text-white uppercase tracking-wider text-center">Admin <span className="text-[#fec204]">Panel</span></h2>
               <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center text-red-500 rounded-full bg-white/5 active:scale-90 transition-transform">
                  <LogOut size={18} />
               </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 pb-8 custom-scrollbar">
             {adminTab === 'orders' && (
               <div className="space-y-4 animate-in fade-in">
                 <h3 className="font-bold text-[#000000] mb-4 uppercase tracking-wider text-sm flex items-center"><Package className="mr-2 text-[#fec204]" size={16}/> Buyurtmalar</h3>
                 {orders.length === 0 && <div className="text-center mt-8 text-[#9CA3AF] text-sm font-medium">Boshqa buyurtmalar yo'q</div>}
                 
                 {orders.map(order => (
                    <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-[#E5E7EB]">
                       <div className="flex justify-between items-center mb-3">
                         <span className="font-black text-[#000000]">#{order.id}</span>
                         {order.status === 'new' ? (
                            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full flex gap-1">
                               <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1 animate-pulse"></div> YANGI
                            </span>
                         ) : (
                            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">QABUL QILINDI</span>
                         )}
                       </div>
                       <div className="space-y-1 mb-4">
                         <p className="text-sm font-medium">Mijoz: <span className="text-[#6B7280]">{order.customerName}</span></p>
                         <p className="text-sm font-medium">Telefon: <span className="text-[#6B7280]">{order.customerPhone}</span></p>
                         <p className="text-sm font-medium mt-2">Jami: <span className="text-[#000000] font-bold text-lg inline-block pt-1">{formatPrice(order.totalAmount)}</span></p>
                       </div>
                       {order.status === 'new' && (
                          <div className="flex gap-3 pt-2">
                             <button onClick={() => acceptOrder(order.id, order.userId)} className="flex-1 bg-[#000000] text-[#fec204] py-3 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-transform">Qabul qilish</button>
                             <button onClick={() => rejectOrder(order.id)} className="flex-1 bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-transform">Bekor qilish</button>
                          </div>
                       )}
                    </div>
                 ))}
               </div>
             )}

             {adminTab === 'books' && (
               <div className="space-y-4 animate-in fade-in">
                 <h3 className="font-bold text-[#000000] mb-4 uppercase tracking-wider text-sm flex items-center"><BookOpen className="mr-2 text-[#fec204]" size={16}/> Baza (Kitoblar)</h3>
                 {books.filter(b => !b.isArchived).map(book => (
                   <div key={book.id} className="flex gap-4 p-4 bg-white rounded-3xl shadow-sm border border-[#E5E7EB] items-center">
                     <img src={book.coverUrl} className="w-14 h-20 object-cover rounded-lg shadow-sm" />
                     <div className="flex-1 min-w-0">
                       <h4 className="font-bold text-sm truncate text-[#000000]">{book.title}</h4>
                       <p className="text-xs font-medium text-[#6B7280] truncate mt-0.5">{book.author}</p>
                       <p className="text-sm font-black text-[#fec204] mt-2">{formatPrice(book.price)}</p>
                     </div>
                     <div className="flex flex-col gap-2">
                       <button onClick={() => startEditBook(book)} className="w-10 h-10 rounded-full bg-[#F3F4F6] text-[#000000] flex items-center justify-center active:scale-90 transition-transform">
                         <Edit3 size={16} />
                       </button>
                       <button onClick={() => archiveBookToggle(book.id)} className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center active:scale-90 transition-transform">
                         <Archive size={16} />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}

             {adminTab === 'add' && (
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E5E7EB] animate-in fade-in">
                 <h3 className="font-bold text-[#000000] mb-6 uppercase tracking-wider text-sm flex items-center"><PlusCircle className="mr-2 text-[#fec204]" size={16}/> {editingBookId ? 'Kitobni Tahrirlash' : "Yangi Kitob qo'shish"}</h3>
                 <div className="space-y-5">
                   <div>
                      <label className="text-xs font-bold text-[#000000] uppercase tracking-wider mb-2 block">Kitob nomi</label>
                      <input type="text" value={bfTitle} onChange={e => setBfTitle(e.target.value)} className="w-full h-12 bg-[#F3F4F6] rounded-xl px-4 border-2 border-transparent focus:border-[#000000] outline-none font-medium text-[#000000] transition-colors" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-[#000000] uppercase tracking-wider mb-2 block">Muallif</label>
                      <input type="text" value={bfAuthor} onChange={e => setBfAuthor(e.target.value)} className="w-full h-12 bg-[#F3F4F6] rounded-xl px-4 border-2 border-transparent focus:border-[#000000] outline-none font-medium text-[#000000] transition-colors" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-[#000000] uppercase tracking-wider mb-2 block">Narxi (so'm)</label>
                      <input type="number" value={bfPrice} onChange={e => setBfPrice(e.target.value)} className="w-full h-12 bg-[#F3F4F6] rounded-xl px-4 border-2 border-transparent focus:border-[#000000] outline-none font-medium text-[#000000] transition-colors" />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-[#000000] uppercase tracking-wider mb-2 block">Muqova URL</label>
                      <input type="url" value={bfCover} onChange={e => setBfCover(e.target.value)} className="w-full h-12 bg-[#F3F4F6] rounded-xl px-4 border-2 border-transparent focus:border-[#000000] outline-none font-medium text-[#000000] transition-colors" />
                   </div>
                   
                   {bfCover && (
                      <div className="my-2 border border-[#E5E7EB] p-2 rounded-xl flex justify-center">
                         <img src={bfCover} alt="Joriy rasm" className="h-[120px] rounded object-cover" />
                      </div>
                   )}
                   
                   <div className="flex gap-2 mt-2">
                       {editingBookId && (
                          <button onClick={() => { setEditingBookId(null); setBfTitle(''); setBfAuthor(''); setBfPrice(''); setBfCover(''); setAdminTab('books'); }} className="flex-1 bg-[#F3F4F6] text-[#6B7280] h-14 rounded-xl font-bold active:scale-95 transition-transform uppercase tracking-wider text-sm">Bekor qilsih</button>
                       )}
                       <button onClick={handleAddOrEditBook} className="flex-[2] bg-[#000000] text-[#fec204] h-14 rounded-xl font-bold shadow-lg shadow-black/20 active:scale-95 transition-transform uppercase tracking-wider text-sm">
                          {editingBookId ? 'Tahrirni Saqlash' : 'Yakunlash'}
                       </button>
                   </div>
                 </div>
               </div>
             )}

             {adminTab === 'report' && (
               <div className="space-y-4 animate-in fade-in">
                 <h3 className="font-bold text-[#000000] mb-4 uppercase tracking-wider text-sm flex items-center"><BarChart3 className="mr-2 text-[#fec204]" size={16}/> Moliyaviy Hisobot</h3>
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E5E7EB]">
                   <p className="text-sm font-bold text-[#6B7280] uppercase tracking-wider mb-2">Barcha Savdolar Jamlanmasi</p>
                   <p className="text-3xl font-black text-[#000000] mb-4">{formatPrice(orders.reduce((acc, o) => acc + o.totalAmount, 0))}</p>
                   
                   <div className="flex gap-4">
                      <div className="flex-1 bg-[#F3F4F6] p-4 rounded-xl">
                         <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Buyurtmalar soni</p>
                         <p className="text-xl font-black text-[#000000] mt-1">{orders.length} ta</p>
                      </div>
                      <div className="flex-1 bg-[#F3F4F6] p-4 rounded-xl">
                         <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Tugatilgan</p>
                         <p className="text-xl font-black text-[#000000] mt-1">{orders.filter(o => o.status === 'accepted').length} ta</p>
                      </div>
                   </div>
                 </div>
               </div>
             )}

             {adminTab === 'archive' && (
               <div className="space-y-4 animate-in fade-in">
                 <h3 className="font-bold text-[#000000] mb-4 uppercase tracking-wider text-sm flex items-center"><Archive className="mr-2 text-[#fec204]" size={16}/> Arxivlangan Kitoblar</h3>
                 
                 {books.filter(b => b.isArchived).length === 0 && (
                    <div className="text-center mt-8 text-[#9CA3AF] text-sm font-medium">Arxivda kitoblar mavjud emas</div>
                 )}

                 {books.filter(b => b.isArchived).map(book => (
                   <div key={book.id} className="flex gap-4 p-4 bg-white rounded-3xl shadow-sm border border-[#E5E7EB] items-center opacity-60">
                     <img src={book.coverUrl} className="w-14 h-20 object-cover rounded-lg shadow-sm grayscale" />
                     <div className="flex-1 min-w-0">
                       <h4 className="font-bold text-sm truncate text-[#000000]">{book.title}</h4>
                       <p className="text-xs font-medium text-[#6B7280] truncate mt-0.5">{book.author}</p>
                       <p className="text-[10px] bg-[#E5E7EB] text-[#6B7280] font-bold px-2 py-0.5 rounded mt-1 inline-block">ARXIVDA</p>
                     </div>
                     <button onClick={() => archiveBookToggle(book.id)} className="px-4 py-2 bg-[#000000] text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-transform">Chiqarish</button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      ) : null}

      {/* --- Bottom Navigation Menu --- */}
      <div className="absolute bottom-0 w-full bg-[#F3F4F6] border-t border-[#E5E7EB] pb-[env(safe-area-inset-bottom)] z-40 transition-transform shadow-[0_-10px_40px_rgba(0,0,0,0.2)] sm:rounded-b-[36px] overflow-hidden">
        <div className="flex h-16 items-center">
          {isAdmin ? (
             <>
               <NavButton icon={<Package size={20} />} label="Buyurtmalar" isActive={adminTab === 'orders'} onClick={() => setAdminTab('orders')} />
               <NavButton icon={<BookOpen size={20} />} label="Tovarlar" isActive={adminTab === 'books'} onClick={() => setAdminTab('books')} />
               <div className="flex-1 flex justify-center relative">
                 <button onClick={() => setAdminTab('add')} className="w-12 h-12 bg-[#fec204] rounded-full flex items-center justify-center text-[#000000] shadow-lg active:scale-95 transition-transform absolute -top-4 border-4 border-[#F3F4F6]">
                   <Plus size={24} />
                 </button>
               </div>
               <NavButton icon={<BarChart3 size={20} />} label="Hisobot" isActive={adminTab === 'report'} onClick={() => setAdminTab('report')} />
               <NavButton icon={<Archive size={20} />} label="Arxiv" isActive={adminTab === 'archive'} onClick={() => setAdminTab('archive')} />
             </>
          ) : (
             <>
               <NavButton icon={<Home size={24} className={activeTab === 'home' ? 'fill-current text-[#fec204]' : ''} />} label="Asosiy" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} activeColor="#fec204" />
               <NavButton icon={<Search size={24} className={activeTab === 'search' ? 'text-[#fec204]' : ''} />} label="Qidiruv" isActive={activeTab === 'search'} onClick={() => setActiveTab('search')} activeColor="#fec204" />
               <div className="flex-1 flex justify-center relative">
                 <button onClick={() => setActiveTab('cart')} className="relative w-full h-full flex flex-col items-center justify-center gap-1 active:scale-95 transition-all outline-none">
                   <div className="relative mt-1">
                     <ShoppingBag size={24} className={activeTab === 'cart' ? 'text-[#fec204]' : 'text-[#9CA3AF]'} />
                     {cartItemsCount > 0 && (
                       <div className="absolute -top-1.5 -right-2 bg-[#fec204] text-[#000000] text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 border-2 border-[#F3F4F6] animate-in zoom-in">
                         {cartItemsCount}
                       </div>
                     )}
                   </div>
                   <span className={`text-[10px] font-bold ${activeTab === 'cart' ? 'text-[#fec204]' : 'text-[#9CA3AF]'}`}>Savat</span>
                 </button>
               </div>
               <NavButton icon={<User size={24} className={activeTab === 'profile' ? 'text-[#fec204]' : ''} />} label="Profil" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} activeColor="#fec204" />
             </>
          )}
        </div>
      </div>

      {/* --- Book Detail Overlay (Modal) --- */}
      {selectedBook && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col animate-in slide-in-from-bottom-full duration-300 ease-out sm:rounded-[48px] overflow-hidden">
          {/* Transparent Header with Back button */}
          <div className="absolute top-0 w-full pt-12 px-4 pb-4 flex justify-between z-10 pointer-events-none">
            <button 
              onClick={() => setSelectedBook(null)}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto shadow-lg active:scale-90 transition-transform"
            >
              <ChevronLeft size={24} />
            </button>
            <button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto shadow-lg active:scale-90 transition-transform">
              <Heart size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] custom-scrollbar">
            {/* Big Cover Image */}
            <div className="w-full h-80 relative bg-[#000000]">
               <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover opacity-60" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent"></div>
               {/* Floating Book Cover for depth effect */}
               <div className="absolute -bottom-16 left-6 w-32 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border-4 border-[#000000]">
                 <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" />
               </div>
            </div>

            {/* Info Section */}
            <div className="pt-20 px-6 bg-white min-h-[50vh]">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h1 className="text-2xl font-bold text-[#000000] leading-tight mb-1">{selectedBook.title}</h1>
                  <p className="text-[#6B7280] font-semibold mb-4 tracking-wider text-sm uppercase">{selectedBook.author}</p>
                </div>
                <div className="bg-[#000000] px-2 py-1 rounded-lg flex items-center text-[#fec204] font-bold mt-1">
                  <Star size={14} className="fill-[#fec204] mr-1" />
                  {selectedBook.rating}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex justify-between border-y border-[#E5E7EB] py-4 my-6">
                <div className="flex flex-col items-center flex-1">
                  <BookOpen size={20} className="text-[#9CA3AF] mb-1" />
                  <span className="text-sm font-bold text-[#000000]">{selectedBook.pages || 'N/A'}</span>
                  <span className="text-[10px] text-[#6B7280] font-semibold uppercase">Sahifa</span>
                </div>
                <div className="w-px bg-[#E5E7EB]"></div>
                <div className="flex flex-col items-center flex-1">
                  <Clock size={20} className="text-[#9CA3AF] mb-1" />
                  <span className="text-sm font-bold text-[#000000]">{selectedBook.year || 'N/A'}</span>
                  <span className="text-[10px] text-[#6B7280] font-semibold uppercase">Yil</span>
                </div>
                <div className="w-px bg-[#E5E7EB]"></div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-xl font-bold text-[#000000] leading-[20px] mb-1">UZ</span>
                  <span className="text-[10px] text-[#6B7280] font-semibold uppercase">Til</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-bold text-[#000000] mb-2 tracking-wide uppercase text-sm">Asar haqida</h3>
                <p className="text-[#4B5563] text-sm leading-relaxed font-medium">
                  {selectedBook.description}
                </p>
              </div>
              
              <div className="h-8"></div> {/* Bottom padding spacer */}
            </div>
          </div>

          {/* Sticky Bottom Buy Area */}
          <div className="absolute bottom-0 w-full bg-white border-t border-[#E5E7EB] pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] px-6 flex justify-between items-center z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] sm:rounded-b-[48px]">
            <div className="flex flex-col">
               <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-0.5">Narx</span>
               <span className="text-2xl font-bold text-[#000000]">{formatPrice(selectedBook.price)}</span>
            </div>
            <button 
              onClick={() => {
                addToCart(selectedBook);
                setActiveTab('cart');
                setSelectedBook(null);
              }}
              className="bg-[#000000] active:bg-[#000000] text-white font-bold h-14 px-8 rounded-2xl flex items-center justify-center transition-colors shadow-lg active:scale-95 transform duration-150"
            >
              Savatga qo'shish
            </button>
          </div>
        </div>
      )}
      
      {/* --- Checkout Overlay (Modal) --- */}
      {isCheckout && (
        <div className="absolute inset-0 bg-white z-[60] flex flex-col animate-in slide-in-from-right-full duration-300 ease-out sm:rounded-[48px] overflow-hidden">
          <div className="pt-12 px-6 pb-4 flex justify-between items-center z-10 sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
            <button 
              onClick={() => {
                if (checkoutSuccess) {
                  setCheckoutSuccess(false);
                  setIsCheckout(false);
                  setCart([]);
                  setActiveTab('home');
                } else {
                  setIsCheckout(false);
                }
              }} 
              className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#000000] active:scale-90 transition-transform"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-[#000000]">Rasmiylashtirish</h2>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 pb-[calc(1rem+env(safe-area-inset-bottom))] custom-scrollbar">
            {checkoutSuccess ? (
                <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in duration-500">
                   <div className="w-24 h-24 rounded-full bg-[#fec204] text-[#000000] flex items-center justify-center mb-6 shadow-xl shadow-[#fec204]/30">
                      <ShoppingBag size={48} />
                   </div>
                   <h3 className="text-2xl font-bold text-[#000000] mb-2">Buyurtma qabul qilindi!</h3>
                   <p className="text-[#6B7280] font-medium px-4 mb-8">Tez orada operatorlarimiz siz bilan bog'lanishadi.</p>
                   <button
                      onClick={() => {
                          setCheckoutSuccess(false);
                          setIsCheckout(false);
                          setCart([]);
                          setActiveTab('home');
                      }}
                      className="bg-[#000000] text-white w-full max-w-[240px] h-14 rounded-2xl font-bold flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                   >
                      Asosiyga qaytish
                   </button>
                </div>
            ) : (
                <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                   {/* Form Fields */}
                   <div>
                      <label className="text-sm font-bold text-[#000000] mb-2 block tracking-wider uppercase">Ism va familiya</label>
                      <input type="text" value={checkoutName} onChange={e => setCheckoutName(e.target.value)} placeholder="Ismingizni kiriting" className="w-full h-14 bg-[#F3F4F6] rounded-2xl px-4 border-2 border-transparent focus:border-[#000000] outline-none font-medium text-[#000000] placeholder:text-[#9CA3AF] transition-colors" />
                   </div>
                   <div>
                      <label className="text-sm font-bold text-[#000000] mb-2 block tracking-wider uppercase">Telefon raqam</label>
                      <input type="tel" value={checkoutPhone} onChange={e => setCheckoutPhone(e.target.value)} placeholder="+998" className="w-full h-14 bg-[#F3F4F6] rounded-2xl px-4 border-2 border-transparent focus:border-[#000000] outline-none font-medium text-[#000000] placeholder:text-[#9CA3AF] transition-colors" />
                   </div>
                   <div>
                      <label className="text-sm font-bold text-[#000000] mb-2 block tracking-wider uppercase">Manzil</label>
                      <textarea value={checkoutAddress} onChange={e => setCheckoutAddress(e.target.value)} placeholder="To'liq manzilingizni kiriting" className="w-full h-28 bg-[#F3F4F6] rounded-2xl p-4 border-2 border-transparent focus:border-[#000000] outline-none font-medium text-[#000000] resize-none placeholder:text-[#9CA3AF] transition-colors"></textarea>
                   </div>
                   <div>
                      <label className="text-sm font-bold text-[#000000] mb-3 block tracking-wider uppercase">To'lov turi</label>
                      <div className="flex gap-4">
                         <button onClick={() => setCheckoutPaymentType('Naqd')} className={`flex-1 h-14 rounded-2xl border-2 font-bold flex items-center justify-center shadow-md active:scale-95 transition-transform ${checkoutPaymentType === 'Naqd' ? 'border-[#000000] bg-[#000000] text-[#fec204]' : 'border-[#E5E7EB] bg-white text-[#6B7280]'}`}>Naqd</button>
                         <button onClick={() => setCheckoutPaymentType('Karta')} className={`flex-1 h-14 rounded-2xl border-2 font-bold flex items-center justify-center shadow-md active:scale-95 transition-transform ${checkoutPaymentType === 'Karta' ? 'border-[#000000] bg-[#000000] text-[#fec204]' : 'border-[#E5E7EB] bg-white text-[#6B7280]'}`}>Karta</button>
                      </div>
                   </div>
                   <div className="h-px bg-[#E5E7EB] my-2"></div>
                   <div className="flex flex-col gap-2 bg-[#F3F4F6] p-4 rounded-2xl">
                      <div className="flex justify-between text-[#6B7280] font-medium text-sm">
                         <span>Kitoblar narxi:</span>
                         <span className="text-[#000000]">{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between text-[#6B7280] font-medium text-sm">
                         <span>Yetkazib berish:</span>
                         <span className="text-[#000000]">Bepul</span>
                      </div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-[#E5E7EB]">
                         <span className="text-[#000000] font-bold uppercase tracking-wider">Jami to'lov:</span>
                         <span className="text-[#000000] font-bold text-xl">{formatPrice(cartTotal)}</span>
                      </div>
                   </div>
                   <div className="pb-8">
                     <button
                        disabled={authLoading}
                        onClick={async () => {
                           if(!checkoutName || !checkoutPhone || !checkoutAddress) {
                              alert("Iltimos barcha ma'lumotlarni to'ldiring");
                              return;
                           }
                           
                           const itemsText = cart.map((c, i) => `${i+1}. ${c.title} (${c.quantity}x) = ${formatPrice(c.price * c.quantity)}`).join('\n');
                           let userNameTxt = checkoutName;
                           let userPhoneTxt = checkoutPhone;
                           let userUnameTxt = userProfile?.username ? `@${userProfile.username}` : '-';

                           const text = `📦 YANGI BUYURTMA\n\nXaridor: ${userNameTxt}\nTel: ${userPhoneTxt}\nManzil: ${checkoutAddress}\nTo'lov turi: ${checkoutPaymentType}\nUser: ${userUnameTxt}\n\nKitoblar:\n${itemsText}\n\nJAMI: ${formatPrice(cartTotal)}`;
                           
                           const newOrder: Order = {
                              id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
                              userId: userProfile?.username || 'Mehmon',
                              customerName: checkoutName,
                              customerPhone: checkoutPhone,
                              customerAddress: checkoutAddress,
                              paymentType: checkoutPaymentType,
                              totalAmount: cartTotal,
                              items: cart,
                              status: 'new',
                              date: new Date().toISOString()
                           };

                           setAuthLoading(true);
                           try {
                             await sendToTelegram(text);
                             
                             const updatedOrders = [newOrder, ...orders];
                             setOrders(updatedOrders);
                             localStorage.setItem('orders', JSON.stringify(updatedOrders));
                             
                             setCheckoutSuccess(true);
                           } catch (err) {
                             alert('Xatolik yuz berdi. Iltimos qayta urinib koring.');
                           } finally {
                             setAuthLoading(false);
                           }
                        }}
                        className="w-full bg-[#fec204] text-[#000000] disabled:opacity-50 active:bg-[#eab308] h-16 rounded-2xl font-bold flex items-center justify-center transition-transform shadow-xl shadow-[#fec204]/20 active:scale-95 mt-2"
                     >
                        {authLoading ? 'Yuborilmoqda...' : 'Buyurtmani tasdiqlash'}
                     </button>
                   </div>
                </div>
            )}
          </div>
        </div>
      )}

      {/* Global generic styling extensions specific to this app can go in index.css, like .hide-scroll */}
      <style>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        .hide-scroll {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 4px;
        }
      `}</style>
                </>
        )}
    </div>
  );
}

// Nav Button Component Helper
function NavButton({ icon, label, isActive, onClick, activeColor = '#fec204' }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, activeColor?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all outline-none`}
    >
      <div className={`${isActive ? `text-[${activeColor}]` : 'text-[#9CA3AF] mt-1'} transition-colors`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold transition-colors ${isActive ? `text-[${activeColor}]` : 'text-[#9CA3AF]'}`} style={isActive ? { color: activeColor } : {}}>
        {label}
      </span>
    </button>
  );
}
