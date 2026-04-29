import { Book } from './types';

export const books: Book[] = [
  {
    id: '1',
    title: "O'tkan kunlar",
    author: "Abdulla Qodiriy",
    price: 45000,
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
    description: "O'zbek adabiyotidagi ilk roman. Asarda xalqimizning o'tmishdagi hayoti, urf-odatlari, sevgi va sadoqat mavzulari chuqur va teran yoritilgan.",
    category: "Tarixiy",
    rating: 4.9,
    pages: 400,
    year: "1926"
  },
  {
    id: '2',
    title: "Ikki eshik orasi",
    author: "O'tkir Hoshimov",
    price: 55000,
    coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop",
    description: "Hayot va o'lim, urushning asl qiyofasi, inson taqdiri kabi murakkab mavzular ustiga qurilgan o'zbek adabiyotidagi durdona asar.",
    category: "Badiiy",
    rating: 4.8,
    pages: 620,
    year: "1986"
  },
  {
    id: '3',
    title: "Alkimyogar",
    author: "Paulo Koelyo",
    price: 35000,
    coverUrl: "https://images.unsplash.com/photo-1476275466078-4007374efac9?q=80&w=800&auto=format&fit=crop",
    description: "Insonning o'z taqdiri, orzulari va hayotning asl mazmuni haqidagi jahonga mashhur falsafiy asar.",
    category: "Falsafiy",
    rating: 4.7,
    pages: 208,
    year: "1988"
  },
  {
    id: '4',
    title: "1984",
    author: "Jorj Oruell",
    price: 42000,
    coverUrl: "https://images.unsplash.com/photo-1555448248-2571daf6344b?q=80&w=800&auto=format&fit=crop",
    description: "Totalitar tuzum va uning insoniyatga yetkazadigan mudhish xavf-xatarlari haqida yozilgan kuchli antiutopik roman.",
    category: "Jahon adabiyoti",
    rating: 4.9,
    pages: 328,
    year: "1949"
  },
  {
    id: '5',
    title: "Shum bola",
    author: "G'afur G'ulom",
    price: 28000,
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop",
    description: "O'tgan asr boshlaridagi Toshkent hayoti, odamlari va yosh qoravoyning qiziqarli, kulgili va sarguzashtli kunlari.",
    category: "Badiiy",
    rating: 4.6,
    pages: 240,
    year: "1936"
  },
  {
    id: '6',
    title: "Raqamli qal'a",
    author: "Den Braun",
    price: 65000,
    coverUrl: "https://images.unsplash.com/photo-1614544048536-0d28caf77f41?q=80&w=800&auto=format&fit=crop",
    description: "Axborot xavfsizligi va raqamli sirlar, kriptografiya sirlariga bag'ishlangan aqlni shoshiruvchi detektiv va triller.",
    category: "Detektiv",
    rating: 4.5,
    pages: 512,
    year: "1998"
  }
];

export const categories = ["Barchasi", "Badiiy", "Tarixiy", "Falsafiy", "Jahon adabiyoti", "Detektiv"];
