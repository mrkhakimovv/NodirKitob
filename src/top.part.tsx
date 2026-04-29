/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';

import { animate } from 'motion';
import { Home, Search, ShoppingBag, User, ChevronLeft, Minus, Plus, Star, BookOpen, Clock, Trash2, Heart, LogOut, Package, Edit3, PlusCircle, BarChart3, Archive } from 'lucide-react';
import { books as initialBooks, categories } from './data';
import { sendToTelegram } from './lib/telegram';
import { Book, CartItem, Order } from './types';


import { motion, AnimatePresence, useSpring, useTransform, useMotionValue, useAnimationFrame, useInView } from 'motion/react';
import { ShoppingCart, LogIn, Key, HelpCircle, CheckCircle2, Navigation2 } from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';

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
    reqId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(reqId);
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
  const [adminTab, setAdminTab] = useState<'orders' | 'books' | 'add' | 'report' | 'archive'>('orders');
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
