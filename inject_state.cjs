const fs = require('fs');

const additions = `
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
`;

let code = fs.readFileSync('src/App.tsx', 'utf8');

// I will find "const filteredBooks =" block and insert right after it
const splitStr = '}, [searchQuery, selectedCategory, books]);';
const parts = code.split(splitStr);
if (parts.length > 1) {
    code = parts[0] + splitStr + '\n' + additions + '\n' + parts[1];
    fs.writeFileSync('src/App.tsx', code);
    console.log('State injected');
} else {
    console.log('Failed to find insertion point');
}
