import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  X, 
  MessageCircle, 
  Send, 
  Mic, 
  User, 
  Calendar, 
  MapPin, 
  Download, 
  ChevronRight, 
  Info, 
  FileText,
  Sparkles,
  Heart,
  Mail,
  Lock
} from 'lucide-react';

// --- Types & Context ---

interface AuthContextType {
  isUnlocked: boolean;
  userPrenom: string;
  unlock: (prenom: string) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Data ---

const VIDEOS = [
  { id: "v1", title: "Le Recueillement - Cérémonie", duration: "12:45", thumbnail: "https://picsum.photos/seed/v1/800/450" },
  { id: "v2", title: "Hommage de la Famille", duration: "45:20", thumbnail: "https://picsum.photos/seed/v2/800/450" },
  { id: "v3", title: "Parcours Professionnel", duration: "32:10", thumbnail: "https://picsum.photos/seed/v3/800/450" },
  { id: "v4", title: "Dernier Voyage", duration: "15:10", thumbnail: "https://picsum.photos/seed/v4/800/450" },
];

const PHOTOS = [
  { id: "p1", url: "https://i.postimg.cc/Df6mkhJX/Whats-App-Image-2026-04-17-at-12-56-47.jpg" },
  { id: "p2", url: "https://i.postimg.cc/sfm1dzQQ/Whats-App-Image-2026-04-17-at-12-56-48.jpg" },
  { id: "p3", url: "https://i.postimg.cc/kMsD3C6R/Whats-App-Image-2026-04-17-at-12-56-47-1.jpg" },
  { id: "p4", url: "https://i.postimg.cc/J7xtV8Dy/Whats-App-Image-2026-04-17-at-12-56-48-1.jpg" },
  { id: "p5", url: "https://i.postimg.cc/2jG3RYbw/Whats-App-Image-2026-04-17-at-12-56-49.jpg" },
  { id: "p6", url: "https://i.postimg.cc/QNmVGD9f/Whats-App-Image-2026-04-17-at-12-56-50.jpg" },
  { id: "p7", url: "https://i.postimg.cc/9Xbz52Rb/Whats-App-Image-2026-04-17-at-12-56-50-1.jpg" },
  { id: "p8", url: "https://i.postimg.cc/dQ6DPFkn/Whats-App-Image-2026-04-17-at-12-56-50-2.jpg" },
  { id: "p9", url: "https://i.postimg.cc/L6s5mWLt/Whats-App-Image-2026-04-17-at-12-56-51.jpg" },
  { id: "p10", url: "https://i.postimg.cc/xj5qDQJp/Whats-App-Image-2026-04-17-at-12-56-51-1.jpg" },
  { id: "p11", url: "https://i.postimg.cc/kX5G7HKT/Whats-App-Image-2026-04-17-at-12-56-52.jpg" },
  { id: "p12", url: "https://i.postimg.cc/zXfvqQKw/Whats-App-Image-2026-04-17-at-12-56-52-1.jpg" },
  { id: "p13", url: "https://i.postimg.cc/sD2x3L7K/Whats-App-Image-2026-04-17-at-12-56-52-2.jpg" },
  { id: "p14", url: "https://i.postimg.cc/ZKqnJQ6m/Whats-App-Image-2026-04-17-at-12-56-53.jpg" },
  { id: "p15", url: "https://i.postimg.cc/15zXydD1/Whats-App-Image-2026-04-17-at-12-56-53-1.jpg" },
  { id: "p16", url: "https://i.postimg.cc/ZKqnJQ6J/Whats-App-Image-2026-04-17-at-12-56-54.jpg" },
  { id: "p17", url: "https://i.postimg.cc/TYP1Tsn6/Whats-App-Image-2026-04-17-at-12-56-54-1.jpg" },
  { id: "p18", url: "https://i.postimg.cc/tCgJ9cFQ/Whats-App-Image-2026-04-17-at-12-56-54-2.jpg" },
];

// --- Components ---

function LoginGate() {
  const { unlock } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [prenom, setPrenom] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '13579' && prenom.trim() !== '') {
      unlock(prenom);
    } else {
      setError('Mot de passe incorrect ou prénom manquant.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-neutral-900 border border-white/10 p-8 rounded-3xl space-y-8 shadow-2xl"
      >
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-white/20 mb-4">
            <img src="https://i.postimg.cc/d0fZr0H1/Manga_Mpondo_Albert_F.png" alt="Albert" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-white">Espace Privé</h2>
          <p className="text-neutral-500 text-sm">Veuillez vous identifier pour accéder aux souvenirs.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input 
              type="text" placeholder="Votre Prénom"
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-white/30 transition-all outline-none"
              value={prenom} onChange={e => setPrenom(e.target.value)} required
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input 
              type="email" placeholder="Adresse Email"
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-white/30 transition-all outline-none"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input 
              type="password" placeholder="Mot de passe (13579)"
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-white/30 transition-all outline-none"
              value={password} onChange={e => setPassword(e.target.value)} required
            />
          </div>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-neutral-200 transition-all uppercase tracking-widest text-xs shadow-lg">
            Accéder au Mémorial
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function PhotoSection() {
  return (
    <div className="px-4 sm:px-6 md:px-12 py-12 space-y-8">
      <div className="flex items-center gap-4">
        <h3 className="text-2xl font-serif text-white">Galerie de Souvenirs</h3>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {PHOTOS.map((photo) => (
          <motion.div 
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-neutral-900 border border-white/5"
          >
            <img src={photo.url} alt="Souvenir" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ChatbotWidget() {
  const { userPrenom, isChatOpen, setIsChatOpen } = useAuth();
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Le chatbot utilise le prénom pour accueillir l'utilisateur
  useEffect(() => {
    if (userPrenom && messages.length === 0) {
      const welcome = `Cher(e) ${userPrenom}, je suis le Gardien de la Mémoire d'Albert Mpondo Manga. Je suis là pour vous accompagner dans ce moment de recueillement. 

Puis-je vous renseigner sur le programme des obsèques ou vous partager un aspect de la vie de "Poro" ?`;
      setMessages([{ role: "model", text: welcome }]);
    }
  }, [userPrenom]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", text: input }]);
    
    // Logique simplifiée du Gardien avec les connaissances du document
    setTimeout(() => {
      let response = "Je vous remercie pour ce message, ${userPrenom}. La famille est très touchée par votre présence.";
      if (input.toLowerCase().includes("levée")) response = "La levée de corps aura lieu le VENDREDI 3 AVRIL 2026 à 13H à l'Hôpital Laquintinie[cite: 102].";
      if (input.toLowerCase().includes("inhumation")) response = "L'inhumation est prévue le SAMEDI 4 AVRIL à 13H au caveau familial[cite: 109].";
      setMessages(prev => [...prev, { role: "model", text: response }]);
    }, 1000);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[calc(100vw-2rem)] sm:w-[420px] h-[600px] bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            <div className="p-4 bg-neutral-800 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                  <img src="https://i.postimg.cc/d0fZr0H1/Manga_Mpondo_Albert_F.png" alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-white text-sm font-serif">Le Gardien</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-neutral-400 hover:text-white"><X size={20}/></button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.role === "user" ? "bg-white text-black" : "bg-neutral-800 text-neutral-200 border border-white/5"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-neutral-800/50 border-t border-white/5">
              <div className="flex gap-2">
                <input 
                  value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Posez votre question..." className="flex-1 bg-black/40 border-none rounded-xl px-4 text-sm text-white focus:ring-1 focus:ring-white/20"
                />
                <button onClick={handleSend} className="p-3 bg-white text-black rounded-xl"><Send size={18} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-16 h-16 rounded-full bg-white text-black shadow-2xl flex items-center justify-center hover:scale-110 transition-all">
        <MessageCircle size={24} />
      </button>
    </div>
  );
}

function BiographyModal({ onClose }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl">
      <div className="max-w-4xl w-full bg-neutral-900 border border-white/10 p-10 rounded-3xl max-h-[85vh] overflow-y-auto space-y-10 no-scrollbar relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-neutral-500 hover:text-white"><X size={28}/></button>
        
        <div className="space-y-6">
          <h2 className="text-4xl font-serif text-white border-b border-white/10 pb-4">Albert Mpondo Manga (Poro)</h2>
          <p className="text-neutral-400 italic text-lg leading-relaxed">"Un homme de foi, de principes, et un expert visionnaire." [cite: 129]</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs opacity-50">Parcours Académique d'Excellence</h4>
            <ul className="space-y-4 text-neutral-300 text-sm">
              <li>➊ Maîtrise d'Informatique Appliquée - Université de Grenoble (1980) [cite: 116]</li>
              <li>➊ Doctorat en Informatique des Organisations - Paris IX Dauphine (1984) [cite: 118]</li>
              <li>➊ Athlète émérite : Ascension du Mont Cameroun et marcheur de fond </li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs opacity-50">Carrière & Impact</h4>
            <ul className="space-y-4 text-neutral-300 text-sm">
              <li>➊ Chef du Service Informatique - SHELL Cameroun (1984) [cite: 119]</li>
              <li>➊ Associé Gérant - ASI CAMEROUN (1990) [cite: 120]</li>
              <li>➊ Consultant stratégique pour le Ministère des Finances et le Crédit Foncier [cite: 120, 122]</li>
            </ul>
          </div>
        </div>

        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
          <h4 className="text-white font-bold mb-4">L'Héritage Familial</h4>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Père dévoué de Cathy et Bass, grand-père de Malik, Alexis et Jeanne[cite: 125]. 
            Albert restera gravé dans les mémoires pour sa dialectique pointue et sa connaissance profonde du terroir[cite: 124].
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Dashboard() {
  const [isBioOpen, setIsBioOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10 }}
          src="https://i.postimg.cc/d0fZr0H1/Manga_Mpondo_Albert_F.png" alt="Albert" className="w-full h-full object-cover opacity-50 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute bottom-16 left-8 md:left-20 space-y-6">
          <h1 className="text-6xl md:text-8xl font-serif font-bold">Albert Mpondo Manga</h1>
          <p className="text-2xl text-neutral-400 font-light italic">1955 — 2026</p>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setIsBioOpen(true)} className="bg-white text-black px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all">
              Découvrir sa vie
            </button>
            <button onClick={() => document.getElementById('videos')?.scrollIntoView({behavior: 'smooth'})} className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/20 transition-all">
              Vidéos
            </button>
          </div>
        </div>
      </div>

      {/* Videos Section - 4 Vidéos Restaurées */}
      <div id="videos" className="px-8 md:px-20 py-24 space-y-12">
        <h3 className="text-3xl font-serif">Mémorial Vidéo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {VIDEOS.map((v) => (
            <motion.div key={v.id} whileHover={{ y: -10 }} className="group cursor-pointer" onClick={() => setSelectedVideo(v)}>
              <div className="aspect-video bg-neutral-900 rounded-2xl overflow-hidden relative border border-white/5 group-hover:border-white/20 transition-all">
                <img src={v.thumbnail} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute inset-0 flex items-center justify-center"><Play fill="white" size={32} /></div>
              </div>
              <h4 className="mt-4 text-sm font-medium text-neutral-400 group-hover:text-white transition-colors">{v.title}</h4>
            </motion.div>
          ))}
        </div>
      </div>

      <PhotoSection />
      <ChatbotWidget />

      <AnimatePresence>
        {isBioOpen && <BiographyModal onClose={() => setIsBioOpen(false)} />}
        {selectedVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-black flex items-center justify-center p-4 backdrop-blur-2xl">
            <button onClick={() => setSelectedVideo(null)} className="absolute top-8 right-8 text-white"><X size={32}/></button>
            <div className="w-full max-w-5xl aspect-video bg-neutral-900 rounded-3xl flex items-center justify-center border border-white/10">
              <p className="text-neutral-500 italic">Chargement de la vidéo mémorielle...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userPrenom, setUserPrenom] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <AuthContext.Provider value={{ 
      isUnlocked, userPrenom, unlock: (p) => { setUserPrenom(p); setIsUnlocked(true); }, 
      isChatOpen, setIsChatOpen 
    }}>
      <div className="min-h-screen bg-black select-none">
        <AnimatePresence mode="wait">
          {!isUnlocked ? <LoginGate key="login" /> : <Dashboard key="dashboard" />}
        </AnimatePresence>
      </div>
    </AuthContext.Provider>
  );
}