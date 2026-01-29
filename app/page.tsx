'use client';
import React, { useState, useMemo } from 'react';

// --- TYPES & CONFIGURATION ---

// 1. Types de base
type Booking = {
  id: string;
  roomName: string;
  guestName: string;
  adults: number;
  children: number;
  arrival: Date;
  departure: Date;
  status: 'confirmed' | 'cancelled';
  email: string;
};

type Room = {
  id: string;
  name: string;
  capacity: number;
  price: number;
  tags: string[];
};

// 2. Types Recettes & Ingrédients (Basés sur tes CSV)
type Ingredient = {
  name: string;
  quantity: number; // Quantité pour le nombre de basePortions
  unit: string;
  supplier: 'Boucher' | 'Fruits & Légumes' | 'Crèmerie/Fromager' | 'Épicerie' | 'Boissons' | 'Poissonnerie' | 'Boulanger' | 'Charcutier';
};

type Recipe = {
  id: string;
  name: string;
  type: 'Entrée' | 'Plat' | 'Dessert' | 'Goûter' | 'Petit-déjeuner';
  basePortions: number; 
  isNormand: boolean; // Tag 🍎
  isVeggie: boolean;  // Tag 🥬
  ingredients: Ingredient[];
};

// --- DATA MOCK (Extraits fidèles de tes fichiers CSV) ---

const RECIPES_DB: Recipe[] = [
  // --- PLATS ---
  {
    id: '56', 
    name: 'Poulet Vallée d\'Auge', 
    type: 'Plat', 
    basePortions: 6, 
    isNormand: true, 
    isVeggie: false,
    ingredients: [
      { name: 'Poulet fermier', quantity: 1800, unit: 'g', supplier: 'Boucher' },
      { name: 'Cidre brut', quantity: 500, unit: 'ml', supplier: 'Boissons' },
      { name: 'Calvados', quantity: 50, unit: 'ml', supplier: 'Boissons' },
      { name: 'Crème fraîche épaisse', quantity: 400, unit: 'ml', supplier: 'Crèmerie/Fromager' },
      { name: 'Pommes (Boskoop)', quantity: 4, unit: 'pièces', supplier: 'Fruits & Légumes' },
      { name: 'Champignons de Paris', quantity: 250, unit: 'g', supplier: 'Fruits & Légumes' }
    ]
  },
  {
    id: '1', 
    name: 'Blanquette de veau', 
    type: 'Plat', 
    basePortions: 6, 
    isNormand: false, 
    isVeggie: false,
    ingredients: [
      { name: 'Veau (épaule)', quantity: 1500, unit: 'g', supplier: 'Boucher' },
      { name: 'Carottes', quantity: 3, unit: 'pièces', supplier: 'Fruits & Légumes' },
      { name: 'Oignons', quantity: 2, unit: 'pièces', supplier: 'Fruits & Légumes' },
      { name: 'Crème fraîche', quantity: 200, unit: 'ml', supplier: 'Crèmerie/Fromager' },
      { name: 'Champignons', quantity: 200, unit: 'g', supplier: 'Fruits & Légumes' },
      { name: 'Vin blanc', quantity: 200, unit: 'ml', supplier: 'Boissons' }
    ]
  },
  {
    id: '30', 
    name: 'Lasagnes végétariennes', 
    type: 'Plat', 
    basePortions: 6, 
    isNormand: false, 
    isVeggie: true,
    ingredients: [
      { name: 'Feuilles de lasagne', quantity: 500, unit: 'g', supplier: 'Épicerie' },
      { name: 'Courgettes', quantity: 3, unit: 'pièces', supplier: 'Fruits & Légumes' },
      { name: 'Aubergines', quantity: 2, unit: 'pièces', supplier: 'Fruits & Légumes' },
      { name: 'Coulis de tomate', quantity: 600, unit: 'ml', supplier: 'Épicerie' },
      { name: 'Mozzarella', quantity: 250, unit: 'g', supplier: 'Crèmerie/Fromager' }
    ]
  },
  {
    id: '58',
    name: 'Coquilles Saint-Jacques normande',
    type: 'Plat',
    basePortions: 6,
    isNormand: true,
    isVeggie: false,
    ingredients: [
      { name: 'Coquilles Saint-Jacques', quantity: 18, unit: 'pièces', supplier: 'Poissonnerie' },
      { name: 'Crème fraîche', quantity: 250, unit: 'ml', supplier: 'Crèmerie/Fromager' },
      { name: 'Cidre', quantity: 150, unit: 'ml', supplier: 'Boissons' },
      { name: 'Échalotes', quantity: 2, unit: 'pièces', supplier: 'Fruits & Légumes' }
    ]
  },

  // --- DESSERTS / GOÛTERS ---
  {
    id: '6', 
    name: 'Teurgoule (Riz au lait normand)', 
    type: 'Dessert', 
    basePortions: 8, 
    isNormand: true, 
    isVeggie: true,
    ingredients: [
      { name: 'Riz rond', quantity: 200, unit: 'g', supplier: 'Épicerie' },
      { name: 'Lait entier', quantity: 2000, unit: 'ml', supplier: 'Crèmerie/Fromager' },
      { name: 'Cannelle', quantity: 10, unit: 'g', supplier: 'Épicerie' },
      { name: 'Sucre', quantity: 150, unit: 'g', supplier: 'Épicerie' }
    ]
  },
  {
    id: '2', 
    name: 'Tarte aux pommes normande', 
    type: 'Dessert', 
    basePortions: 8, 
    isNormand: true, 
    isVeggie: true,
    ingredients: [
      { name: 'Pâte brisée', quantity: 1, unit: 'pièce', supplier: 'Boulanger' },
      { name: 'Pommes', quantity: 5, unit: 'pièces', supplier: 'Fruits & Légumes' },
      { name: 'Crème fraîche', quantity: 200, unit: 'ml', supplier: 'Crèmerie/Fromager' },
      { name: 'Calvados', quantity: 30, unit: 'ml', supplier: 'Boissons' },
      { name: 'Poudre d\'amandes', quantity: 50, unit: 'g', supplier: 'Épicerie' }
    ]
  },
  {
    id: '46', 
    name: 'Crêpes sucrées', 
    type: 'Goûter', 
    basePortions: 6, 
    isNormand: false, 
    isVeggie: true,
    ingredients: [
      { name: 'Farine', quantity: 250, unit: 'g', supplier: 'Épicerie' },
      { name: 'Œufs', quantity: 4, unit: 'pièces', supplier: 'Crèmerie/Fromager' },
      { name: 'Lait', quantity: 500, unit: 'ml', supplier: 'Crèmerie/Fromager' },
      { name: 'Beurre', quantity: 50, unit: 'g', supplier: 'Crèmerie/Fromager' }
    ]
  },
  
  // --- PETIT DÉJEUNER (Standard) ---
  {
    id: 'pdj', 
    name: 'Petit-déjeuner Continental', 
    type: 'Petit-déjeuner', 
    basePortions: 1, 
    isNormand: false, 
    isVeggie: true,
    ingredients: [
      { name: 'Croissant', quantity: 1, unit: 'pièce', supplier: 'Boulanger' },
      { name: 'Pain de campagne', quantity: 0.2, unit: 'baguette', supplier: 'Boulanger' },
      { name: 'Beurre', quantity: 15, unit: 'g', supplier: 'Crèmerie/Fromager' },
      { name: 'Confiture', quantity: 30, unit: 'g', supplier: 'Épicerie' },
      { name: 'Café/Thé', quantity: 1, unit: 'dose', supplier: 'Épicerie' },
      { name: 'Jus d\'orange', quantity: 200, unit: 'ml', supplier: 'Boissons' }
    ]
  }
];

const MEAL_WINDOWS = [
  { name: 'Petit-déj', start: 8, end: 10, key: 'breakfast', allowedTypes: ['Petit-déjeuner'] },
  { name: 'Déjeuner', start: 12, end: 14, key: 'lunch', allowedTypes: ['Entrée', 'Plat', 'Dessert'] },
  { name: 'Goûter', start: 16, end: 17, key: 'snack', allowedTypes: ['Goûter'] },
  { name: 'Dîner', start: 19, end: 21, key: 'dinner', allowedTypes: ['Entrée', 'Plat', 'Dessert'] },
];

const MOCK_ROOMS: Room[] = [
  { id: '1', name: 'Suite Parc (RDC)', capacity: 4, price: 140, tags: ['Vue Parc', 'Baignoire'] },
  { id: '2', name: 'Chambre du Duc', capacity: 2, price: 110, tags: ['Lit King', 'Douche'] },
  { id: '3', name: 'Le Grenier', capacity: 3, price: 95, tags: ['Atypique', '2e étage'] },
  { id: '4', name: 'Chambre Bleue', capacity: 2, price: 90, tags: ['Vue Forêt'] },
  { id: '5', name: 'Chambre 5', capacity: 2, price: 85, tags: ['Standard'] },
];

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    roomName: 'Suite Parc (RDC)',
    guestName: 'Famille Martin',
    adults: 6,
    children: 4,
    arrival: new Date(new Date().setHours(15, 0, 0, 0)),
    departure: new Date(new Date().setDate(new Date().getDate() + 2)),
    status: 'confirmed',
    email: 'martin@example.com'
  },
  {
    id: 'b2',
    roomName: 'Chambre du Duc',
    guestName: 'Groupe Amis',
    adults: 4,
    children: 0,
    arrival: new Date(new Date().setHours(11, 0, 0, 0)),
    departure: new Date(new Date().setDate(new Date().getDate() + 1)),
    status: 'confirmed',
    email: 'amis@paris.fr'
  }
];

// --- UTILS ---
const formatDate = (date: Date) => date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

/**
 * --- COMPOSANT PRINCIPAL ---
 */
export default function DomaineDemo() {
  const [viewMode, setViewMode] = useState<'guest' | 'admin'>('guest');
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);

  const addBooking = (newBooking: Booking) => {
    setBookings(prev => [...prev, newBooking]);
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-800 relative overflow-hidden">
      {/* SWITCHER (Pour la démo) */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2 bg-stone-900 p-2 rounded-full shadow-2xl border border-stone-700">
        <button 
          onClick={() => setViewMode('guest')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'guest' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'}`}
        >
          📱 Invité
        </button>
        <button 
          onClick={() => setViewMode('admin')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'admin' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'}`}
        >
          💻 Admin
        </button>
      </div>

      {viewMode === 'guest' ? (
        <GuestView onBook={addBooking} />
      ) : (
        <AdminView bookings={bookings} />
      )}
    </div>
  );
}

/**
 * --- VUE INVITÉ (Guest) ---
 */
function GuestView({ onBook }: { onBook: (b: Booking) => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    arrivalDate: new Date().toISOString().split('T')[0],
    arrivalTime: '15:00',
    departureDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
    departureTime: '11:00',
    adults: 2,
    children: 0,
    name: '',
    email: '',
    room: null as Room | null
  });
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 600);
  };

  const handleConfirm = () => {
    setLoading(true);
    const arrival = new Date(`${formData.arrivalDate}T${formData.arrivalTime}`);
    const departure = new Date(`${formData.departureDate}T${formData.departureTime}`);
    
    setTimeout(() => {
      onBook({
        id: Math.random().toString(36).substr(2, 9),
        roomName: formData.room?.name || 'Chambre',
        guestName: formData.name,
        email: formData.email,
        adults: formData.adults,
        children: formData.children,
        arrival,
        departure,
        status: 'confirmed'
      });
      setLoading(false);
      setStep(3);
    }, 1000);
  };

  return (
    <div className="max-w-md mx-auto bg-stone-50 min-h-screen shadow-2xl relative">
      <header className="bg-emerald-900 text-white p-6 rounded-b-3xl shadow-lg relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-serif tracking-wider">Val-Richer</h1>
            <p className="text-emerald-300 text-xs uppercase tracking-widest mt-1">Domaine Familial</p>
          </div>
          <span className="text-emerald-200 text-xl">☰</span>
        </div>
      </header>

      <main className="px-4 -mt-6 relative z-20 pb-20">
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-xl p-6 space-y-6 animate-in slide-in-from-bottom-8">
            <h2 className="text-xl font-serif text-stone-800">Votre séjour</h2>
            <div className="space-y-4">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Arrivée</label>
                <div className="flex gap-2">
                  <input type="date" className="bg-transparent font-medium w-full outline-none text-stone-700" 
                    value={formData.arrivalDate} onChange={e => setFormData({...formData, arrivalDate: e.target.value})} />
                  <select className="bg-white border-none text-sm outline-none font-bold text-emerald-800"
                    value={formData.arrivalTime} onChange={e => setFormData({...formData, arrivalTime: e.target.value})}>
                    <option>14:00</option><option>15:00</option><option>16:00</option><option>18:00</option>
                  </select>
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Départ</label>
                <div className="flex gap-2">
                  <input type="date" className="bg-transparent font-medium w-full outline-none text-stone-700"
                     value={formData.departureDate} onChange={e => setFormData({...formData, departureDate: e.target.value})} />
                  <select className="bg-white border-none text-sm outline-none font-bold text-emerald-800"
                    value={formData.departureTime} onChange={e => setFormData({...formData, departureTime: e.target.value})}>
                    <option>10:00</option><option>11:00</option><option>12:00</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 p-3 bg-stone-50 rounded-lg border border-stone-100">
                   <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Adultes</label>
                   <input type="number" min="1" className="bg-transparent font-bold w-full outline-none" 
                     value={formData.adults} onChange={e => setFormData({...formData, adults: parseInt(e.target.value)})} />
                </div>
                <div className="flex-1 p-3 bg-stone-50 rounded-lg border border-stone-100">
                   <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">Enfants</label>
                   <input type="number" min="0" className="bg-transparent font-bold w-full outline-none"
                     value={formData.children} onChange={e => setFormData({...formData, children: parseInt(e.target.value)})} />
                </div>
              </div>
            </div>
            <button onClick={handleSearch} className="w-full bg-emerald-900 text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
              {loading ? 'Recherche...' : <span>Voir les disponibilités ➔</span>}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-8">
            <button onClick={() => setStep(1)} className="text-sm text-stone-500 font-medium mb-2 flex items-center gap-1">← Modifier dates</button>
            {MOCK_ROOMS.map(room => (
              <div key={room.id} onClick={() => { setFormData({...formData, room}); setStep(2.5); }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif text-lg font-bold text-stone-800">{room.name}</h3>
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md text-xs font-bold">{room.price}€</span>
                </div>
                <div className="flex gap-2 mb-3">
                  {room.tags.map(tag => <span key={tag} className="text-[10px] uppercase bg-stone-100 text-stone-500 px-2 py-1 rounded">{tag}</span>)}
                </div>
                <div className="flex justify-between text-sm text-stone-500">
                  <span className="flex items-center gap-1">👥 Cap. {room.capacity}</span>
                  <span className="text-emerald-700 font-medium">Réserver</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2.5 && formData.room && (
           <div className="bg-white rounded-xl shadow-xl p-6 space-y-6 animate-in zoom-in-95">
             <div className="border-b border-stone-100 pb-4 mb-4">
               <h3 className="font-serif text-xl text-emerald-900 mb-1">Confirmer</h3>
               <p className="text-stone-500 text-sm">{formData.room.name} • {formData.arrivalDate}</p>
             </div>
             <input placeholder="Nom du groupe" className="w-full p-3 bg-stone-50 rounded-lg border-stone-200 border"
               value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
             <input placeholder="Email" className="w-full p-3 bg-stone-50 rounded-lg border-stone-200 border"
               value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
             <div className="pt-4 flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 text-stone-500 font-bold">Retour</button>
                <button onClick={handleConfirm} disabled={!formData.name || !formData.email} className="flex-[2] bg-amber-600 text-white py-3 rounded-xl font-bold shadow">
                  {loading ? '...' : 'Valider'}
                </button>
             </div>
           </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-in zoom-in-90 mt-10">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✅</div>
            <h2 className="font-serif text-2xl text-stone-800 mb-2">C'est réservé !</h2>
            <button onClick={() => setStep(1)} className="text-emerald-700 font-bold underline">Nouvelle réservation</button>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * --- VUE ADMIN (Desktop) ---
 */
function AdminView({ bookings }: { bookings: Booking[] }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'meals' | 'shopping'>('meals');
  // State pour stocker le menu planifié : { "date_mealKey": [recipeId, recipeId] }
  const [mealPlan, setMealPlan] = useState<Record<string, string[]>>({});

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <nav className="bg-white border-b border-stone-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-900 rounded-lg flex items-center justify-center text-white font-serif">V</div>
          <span className="font-serif text-xl font-bold text-stone-800">Val-Richer <span className="text-stone-400 font-sans text-xs font-normal ml-2">ADMIN</span></span>
        </div>
        <div className="flex gap-2 text-sm font-medium text-stone-500">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="📊 Vue d'ensemble" />
          <TabButton active={activeTab === 'meals'} onClick={() => setActiveTab('meals')} label="👨‍🍳 Menus & Plannings" />
          <TabButton active={activeTab === 'shopping'} onClick={() => setActiveTab('shopping')} label="🛒 Liste de courses" />
        </div>
      </nav>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'overview' && (
           <div className="grid grid-cols-3 gap-6">
              <StatCard label="Arrivées Aujourd'hui" value={bookings.filter(b => b.arrival.getDate() === new Date().getDate()).length.toString()} />
              <StatCard label="Invités Présents" value={bookings.reduce((acc, b) => acc + b.adults + b.children, 0).toString()} />
              <StatCard label="Taux d'occupation" value="68%" color="text-amber-600" />
           </div>
        )}

        {activeTab === 'meals' && (
          <MealPlanner bookings={bookings} mealPlan={mealPlan} setMealPlan={setMealPlan} />
        )}

        {activeTab === 'shopping' && (
          <ShoppingList bookings={bookings} mealPlan={mealPlan} />
        )}
      </main>
    </div>
  );
}

const TabButton = ({ active, onClick, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${active ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-stone-50'}`}>
    {label}
  </button>
);

const StatCard = ({ label, value, color = "text-emerald-900" }: any) => (
  <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
    <p className="text-xs font-bold text-stone-400 uppercase">{label}</p>
    <p className={`text-3xl font-serif mt-2 ${color}`}>{value}</p>
  </div>
);

/**
 * --- COMPOSANT: PLANIFICATEUR DE MENUS ---
 */
function MealPlanner({ bookings, mealPlan, setMealPlan }: any) {
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date, mealKey: string, mealName: string } | null>(null);
  
  // Générer les 7 prochains jours
  const dates = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  const getCountsForMeal = (date: Date, mealKey: string) => {
    let adults = 0;
    let children = 0;
    const window = MEAL_WINDOWS.find(m => m.key === mealKey)!;
    const mealStart = new Date(date); mealStart.setHours(window.start, 0, 0, 0);
    const mealEnd = new Date(date); mealEnd.setHours(window.end, 0, 0, 0);

    bookings.forEach((booking: Booking) => {
      if (booking.status === 'cancelled') return;
      if (booking.arrival < mealEnd && booking.departure > mealStart) {
        adults += booking.adults;
        children += booking.children;
      }
    });
    return { adults, children, total: adults + children };
  };

  const handleAddRecipe = (recipeId: string) => {
    if (!selectedSlot) return;
    const key = `${selectedSlot.date.toDateString()}_${selectedSlot.mealKey}`;
    const current = mealPlan[key] || [];
    // Empêcher doublons
    if (!current.includes(recipeId)) {
        setMealPlan({ ...mealPlan, [key]: [...current, recipeId] });
    }
  };

  const handleRemoveRecipe = (recipeId: string) => {
    if (!selectedSlot) return;
    const key = `${selectedSlot.date.toDateString()}_${selectedSlot.mealKey}`;
    const current = mealPlan[key] || [];
    setMealPlan({ ...mealPlan, [key]: current.filter((id: string) => id !== recipeId) });
  };

  return (
    <div className="space-y-6 animate-in fade-in flex gap-6">
      {/* TABLEAU PLANNING */}
      <div className="flex-1">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-serif text-stone-800">Semaine en cours</h2>
            <p className="text-stone-500 text-sm">Cliquez sur une case pour définir le menu.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-stone-200 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 text-stone-500 uppercase font-bold text-xs border-b border-stone-200">
                <tr>
                  <th className="px-4 py-4 w-32">Date</th>
                  {MEAL_WINDOWS.map(m => (
                    <th key={m.key} className="px-4 py-4 text-center border-l border-stone-100">{m.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {dates.map((date) => (
                  <tr key={date.toISOString()} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-4 font-bold text-stone-700 bg-white border-r border-stone-100">
                      {formatDate(date)}
                    </td>
                    {MEAL_WINDOWS.map(meal => {
                      const counts = getCountsForMeal(date, meal.key);
                      const planKey = `${date.toDateString()}_${meal.key}`;
                      const plannedRecipes = mealPlan[planKey] || [];
                      const isSelected = selectedSlot?.date.toDateString() === date.toDateString() && selectedSlot?.mealKey === meal.key;

                      return (
                        <td 
                          key={meal.key} 
                          onClick={() => setSelectedSlot({ date, mealKey: meal.key, mealName: meal.name })}
                          className={`px-2 py-2 border-l border-stone-100 cursor-pointer transition-all h-28 align-top
                            ${isSelected ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-500' : ''}
                            ${counts.total === 0 ? 'bg-stone-50/50' : ''}
                          `}
                        >
                          <div className="flex justify-between items-start mb-2">
                             <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${counts.total > 0 ? 'bg-stone-200 text-stone-700' : 'text-stone-300'}`}>
                               {counts.total} p.
                             </span>
                             {plannedRecipes.length > 0 && <span className="text-emerald-600">✅</span>}
                          </div>
                          
                          <div className="space-y-1 overflow-y-auto max-h-[60px]">
                            {plannedRecipes.map((rid: string, idx: number) => {
                              const r = RECIPES_DB.find(x => x.id === rid);
                              return (
                                <div key={idx} className="text-[10px] bg-white border border-stone-200 p-1 rounded shadow-sm truncate">
                                  {r?.isNormand && '🍎'} {r?.name}
                                </div>
                              );
                            })}
                            {plannedRecipes.length === 0 && counts.total > 0 && (
                              <div className="text-[10px] text-stone-400 italic text-center mt-2 opacity-50">+ Menu</div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SIDEBAR SELECTION RECETTES */}
      {selectedSlot && (
        <div className="w-96 bg-white border-l border-stone-200 p-6 shadow-2xl fixed right-0 top-0 bottom-0 z-40 overflow-y-auto animate-in slide-in-from-right">
          <div className="flex justify-between items-center mb-6">
            <div>
               <h3 className="font-serif text-xl text-emerald-900">{selectedSlot.mealName}</h3>
               <p className="text-stone-500 text-sm">{formatDate(selectedSlot.date)}</p>
            </div>
            <button onClick={() => setSelectedSlot(null)} className="p-2 hover:bg-stone-100 rounded-full">✕</button>
          </div>

          {/* Recettes sélectionnées pour ce créneau */}
          <div className="mb-8">
            <h4 className="text-xs font-bold text-stone-400 uppercase mb-3">Au menu ce jour</h4>
            <div className="space-y-2">
               {(mealPlan[`${selectedSlot.date.toDateString()}_${selectedSlot.mealKey}`] || []).map((rid: string) => {
                 const r = RECIPES_DB.find(x => x.id === rid)!;
                 return (
                   <div key={rid} className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100 shadow-sm">
                     <span className="text-sm font-medium text-emerald-900 truncate">{r.name}</span>
                     <button onClick={() => handleRemoveRecipe(rid)} className="text-emerald-700 hover:bg-emerald-100 rounded p-1">✕</button>
                   </div>
                 )
               })}
               {!(mealPlan[`${selectedSlot.date.toDateString()}_${selectedSlot.mealKey}`] || []).length && (
                 <p className="text-sm text-stone-400 italic border-2 border-dashed border-stone-100 p-4 rounded-lg text-center">Aucune recette sélectionnée.</p>
               )}
            </div>
          </div>

          {/* Liste Recettes */}
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase mb-3">Ajouter un plat</h4>
            <div className="space-y-3">
              {RECIPES_DB.map(recipe => (
                <button 
                  key={recipe.id}
                  onClick={() => handleAddRecipe(recipe.id)}
                  className="w-full text-left p-3 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group shadow-sm bg-white"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-stone-700 group-hover:text-emerald-900 text-sm">{recipe.name}</span>
                    <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-500 font-bold">{recipe.type}</span>
                  </div>
                  <div className="mt-2 flex gap-2 text-[10px]">
                    {recipe.isNormand && <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded flex items-center gap-1 border border-red-100">🍎 Normand</span>}
                    {recipe.isVeggie && <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1 border border-green-100">🥬 Végé</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * --- COMPOSANT: LISTE DE COURSES ---
 */
function ShoppingList({ bookings, mealPlan }: any) {
  // Calcul des ingrédients
  const shoppingList = useMemo(() => {
    const list: Record<string, { quantity: number, unit: string, supplier: string }> = {};

    Object.entries(mealPlan).forEach(([key, recipeIds]: [string, any]) => {
      const [dateStr, mealKey] = key.split('_');
      const date = new Date(dateStr);
      
      // 1. Obtenir le nombre de personnes pour ce repas
      let adults = 0;
      let children = 0;
      const window = MEAL_WINDOWS.find(m => m.key === mealKey)!;
      const mealStart = new Date(date); mealStart.setHours(window.start, 0, 0, 0);
      const mealEnd = new Date(date); mealEnd.setHours(window.end, 0, 0, 0);

      bookings.forEach((booking: Booking) => {
        if (booking.status === 'confirmed' && booking.arrival < mealEnd && booking.departure > mealStart) {
          adults += booking.adults;
          children += booking.children;
        }
      });

      // ⚠️ LOGIQUE COEFFICIENT ENFANT = 0.5 (Selon tes paramètres)
      const totalPortionsNeeded = adults + (children * 0.5);

      // 2. Pour chaque recette du menu
      recipeIds.forEach((rid: string) => {
        const recipe = RECIPES_DB.find(r => r.id === rid);
        if (recipe) {
          const ratio = totalPortionsNeeded / recipe.basePortions;

          recipe.ingredients.forEach(ing => {
            const currentQty = list[ing.name]?.quantity || 0;
            list[ing.name] = {
              quantity: currentQty + (ing.quantity * ratio),
              unit: ing.unit,
              supplier: ing.supplier
            };
          });
        }
      });
    });

    return list;
  }, [bookings, mealPlan]);

  // Groupement par Fournisseur
  const bySupplier = Object.entries(shoppingList).reduce((acc, [name, data]) => {
    if (!acc[data.supplier]) acc[data.supplier] = [];
    acc[data.supplier].push({ name, ...data });
    return acc;
  }, {} as Record<string, any[]>);

  // Icones selon tes catégories
  const getIcon = (supplier: string) => {
    if (supplier === 'Boucher') return '🥩';
    if (supplier === 'Fruits & Légumes') return '🥕';
    if (supplier === 'Crèmerie/Fromager') return '🧀';
    if (supplier === 'Boulanger') return '🥖';
    if (supplier === 'Poissonnerie') return '🐟';
    if (supplier === 'Boissons') return '🍾';
    return '🛒';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-12">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 text-center">
         <h2 className="font-serif text-2xl text-stone-800">Liste de Courses Estimative</h2>
         <p className="text-stone-500 mt-2">
           Calcul basé sur les menus planifiés et le coefficient enfant (0.5 portion).
         </p>
      </div>

      {Object.keys(shoppingList).length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <span className="text-4xl block mb-4 opacity-50">🛒</span>
          <p>Aucun menu planifié. Allez dans l'onglet "Menus" pour commencer.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 masonry">
          {Object.entries(bySupplier).map(([supplier, items]) => (
            <div key={supplier} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm h-fit">
              <div className="bg-stone-50 px-4 py-3 border-b border-stone-100 flex items-center gap-2 font-bold text-stone-700 uppercase text-xs tracking-wider">
                <span className="text-emerald-700 text-lg">{getIcon(supplier)}</span>
                {supplier}
              </div>
              <ul className="divide-y divide-stone-100">
                {items.sort((a,b) => a.name.localeCompare(b.name)).map((item: any) => (
                  <li key={item.name} className="px-4 py-3 flex justify-between items-center hover:bg-stone-50 transition-colors">
                    <span className="text-sm font-medium text-stone-700">{item.name}</span>
                    <span className="text-sm font-bold text-emerald-900 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                      {Math.ceil(item.quantity)} {item.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
