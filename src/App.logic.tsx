/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { animate } from 'motion';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue, useAnimationFrame, useInView } from 'motion/react';



import { Home, Search, ShoppingBag, User, ChevronLeft, ChevronRight, Minus, Plus, Star, BookOpen, Clock, Trash2, Heart, LogOut, Package, Edit3, PlusCircle, BarChart3, Archive, ShoppingCart, LogIn, Key, HelpCircle, CheckCircle2, Navigation2 } from 'lucide-react';
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
    reqId = window.requestAnimationFrame(step);
    