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
  Heart
} from 'lucide-react';
import { GoogleGenAI } from '@google/generative-ai';

// --- Types & Context ---

interface UserData {
  nom: string;
  prenom: string;
  relation: string;
}

interface AuthContextType {
  isUnlocked: boolean;
  unlock: (data: UserData) => void;
  userData: UserData | null;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Utils ---

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

// --- Data ---

const VIDEO_CATEGORIES = [
  {
    title: "Cérémonies et Hommages",
    videos: [
      { id: "v1", title: "Le Recueillement", duration: "12:45", thumbnail: "https://picsum.photos/seed/v1/800/450" },
      { id: "v2", title: "La Mini Veillée", duration: "45:20", thumbnail: "https://picsum.photos/seed/v2/800/450" },
      { id: "v3", title: "Levée de Corps", duration: "32:10", thumbnail: "https://picsum.photos/seed/v3/800/450" },
    ]
  },
  {
    title: "Dernier Voyage",
    videos: [
      { id: "v4", title: "La Grande Veillée", duration: "1:20:00", thumbnail: "https://picsum.photos/seed/v4/800/450" },
      { id: "v5", title: "Le Culte d'Adieu", duration: "55:30", thumbnail: "https://picsum.photos/seed/v5/800/450" },
      { id: "v6", title: "L'Inhumation", duration: "15:10", thumbnail: "https://picsum.photos/seed/v6/800/450" },
    ]
  }
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
  const [formData, setFormData] = useState({ nom: '', prenom: '', relation: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nom && formData.prenom) unlock(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-neutral-900 border border-white/10 p-8 rounded-2xl space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white/20 mb-4 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <img 
              src="https://i.postimg.cc/d0fZr0H1/Manga_Mpondo_Albert_F.png" 
              alt="Albert Mpondo Manga"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">Espace Mémoriel Privé</h2>
          <p className="text-neutral-500 text-sm italic">"À la mémoire d'Albert Mpondo Manga"</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input 
              placeholder="Prénom"
              className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30"
              value={formData.prenom}
              onChange={e => setFormData({...formData, prenom: e.target.value})}
              required
            />
            <input 
              placeholder="Nom"
              className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30"
              value={formData.nom}
              onChange={e => setFormData({...formData, nom: e.target.value})}
              required
            />
          </div>
          <select 
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 appearance-none"
            value={formData.relation}
            onChange={e => setFormData({...formData, relation: e.target.value})}
            required
          >
            <option value="">Votre lien avec Albert...</option>
            <option value="Famille">Famille</option>
            <option value="Ami">Ami</option>
            <option value="Collègue">Collègue</option>
            <option value="Connaissance">Connaissance</option>
          </select>
          <button className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-neutral-200 transition-colors uppercase tracking-widest text-xs">
            Entrer dans le recueillement
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function VideoRow({ title, videos, onVideoSelect }: any) {
  return (
    <div className="px-4 sm:px-6 md:px-12 space-y-4">
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-serif text-white/90">{title}</h3>
        <div className="h-px flex-1 bg-white/5" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {videos.map((v: any) => (
          <motion.div 
            key={v.id}
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0 w-72 group cursor-pointer"
            onClick={() => onVideoSelect(v)}
          >
            <div className="relative aspect-video rounded-xl overflow-hidden mb-2 border border-white/5 group-hover:border-white/20 transition-all duration-500 shadow-xl">
              <img src={v.thumbnail} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                  <Play size={20} fill="white" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-[10px] rounded font-mono border border-white/10">{v.duration}</span>
            </div>
            <h4 className="text-sm font-medium text-neutral-400 group-hover:text-white transition-colors tracking-wide">{v.title}</h4>
          </motion.div>
        ))}
      </div>
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
            className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-neutral-900 border border-white/5 shadow-2xl"
          >
            <img 
              src={photo.url} 
              alt="Souvenir"
              loading="lazy"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
               <div className="w-8 h-px bg-white/40 mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500" />
               <p className="text-[10px] text-white/70 uppercase tracking-widest transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                 Mémoriel HD
               </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Guestbook() {
  const { userData } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setEntries([
        { id: 1, name: "Jean Mpondo", relation: "Famille", message: "Un grand homme qui restera à jamais dans nos cœurs.", date: "02 Mars 2026" },
        { id: 2, name: "Dr. Sandrine Atangana", relation: "Collègue", message: "Ton expertise et ta sagesse vont nous manquer énormément.", date: "03 Mars 2026" }
      ]);
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleSubmit = () => {
    if (!newEntry.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const entry = {
        id: Date.now(),
        name: `${userData?.prenom} ${userData?.nom}`,
        relation: userData?.relation,
        message: newEntry,
        date: "Aujourd'hui"
      };
      setEntries([entry, ...entries]);
      setNewEntry("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="px-4 sm:px-6 md:px-12 py-24 bg-neutral-950/50 backdrop-blur-3xl">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-serif text-white">Livre d'Or</h2>
          <p className="text-neutral-500">Laissez un message de sympathie ou un souvenir pour la famille.</p>
        </div>

        <div className="bg-neutral-900/50 p-8 rounded-2xl border border-white/10 space-y-6 backdrop-blur-xl">
          <textarea 
            value={newEntry}
            onChange={e => setNewEntry(e.target.value)}
            placeholder="Votre message..."
            className="w-full bg-transparent border-none text-white focus:ring-0 resize-none min-h-[100px] text-lg italic"
          />
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white uppercase">
                {userData?.prenom[0]}{userData?.nom[0]}
              </div>
              <span className="text-sm text-neutral-400">{userData?.prenom} {userData?.nom}</span>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-all shadow-lg"
            >
              {isSubmitting ? "Envoi..." : "Publier"}
            </button>
          </div>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } }, hidden: {} }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-neutral-500 animate-pulse">Ouverture du registre...</div>
          ) : entries.map((entry) => (
            <motion.div 
              key={entry.id} 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              className="bg-neutral-900/40 p-8 rounded-2xl border border-white/5 hover:border-white/15 hover:bg-neutral-900/60 transition-all duration-500 space-y-6 shadow-xl backdrop-blur-sm group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-neutral-400">
                    <User size={20} />
                  </div>
                  <div>
                    <h5 className="text-white font-serif text-lg">{entry.name}</h5>
                    <p className="text-[9px] text-neutral-500 uppercase tracking-widest">{entry.relation}</p>
                  </div>
                </div>
                <span className="text-[10px] text-neutral-600 font-mono">{entry.date}</span>
              </div>
              <p className="text-neutral-300 text-sm italic leading-relaxed font-light">"{entry.message}"</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// --- Modals & Widgets ---

const SYSTEM_INSTRUCTION = `Tu es le GARDIEN DE LA MÉMOIRE d'Albert Mpondo Manga.
Ton rôle est d'accueillir les visiteurs avec dignité et empathie.

👤 PROFIL : Albert MANGA MPONDO (Surnommé PORO ou SAMMY).
- Dates : 16 Avril 1955 - 1er Mars 2026.
- Carrière : Consultant Senior, Associé ASI-CAMEROUN. Expert informatique.
- Famille : Père de Yves Michel, Laurent, Marco, Lili.

🗓️ OBSÈQUES : 
- Levée de corps : 3 Avril 2026 à Laquintinie (Douala).
- Inhumation : 4 Avril 2026 au Caveau familial à Ngodi Akwa.

FORMATAGE : 
- MAJUSCULES pour les titres importants.
- Bulles unicode (➊, ➋) pour les listes.
- Sobriété absolue.`;

function ChatbotWidget() {
  const { userData, isChatOpen, setIsChatOpen } = useAuth();
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const aiRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const speak = (text: string) => {
    if (isMuted) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    if (userData && messages.length === 0) {
      const welcome = `Bonjour ${userData.prenom}. AU NOM DE LA FAMILLE ENDEUILLÉE, nous vous accueillons sur ce portail dédié à la MÉMOIRE D'ALBERT MPONDO MANGA. 

Comment puis-je vous assister dans votre recueillement ?`;
      setMessages([{ role: "model", text: welcome }]);
      setTimeout(() => speak(welcome), 1500);
    }
  }, [userData]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulation ou appel API réel si configuré
      const aiText = "JE VOUS REMERCIE DE VOTRE MESSAGE. Albert aurait été très touché par votre attention.";
      setMessages(prev => [...prev, { role: "model", text: aiText }]);
      speak(aiText);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[calc(100vw-2rem)] sm:w-[420px] h-[600px] bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            <div className="p-4 bg-neutral-800 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                  <img src="https://i.postimg.cc/d0fZr0H1/Manga_Mpondo_Albert_F.png" alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-serif">Le Gardien</h4>
                  <p className="text-[9px] text-neutral-500 uppercase">Famille Mpondo Manga</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-neutral-400 hover:text-white">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <button onClick={() => setIsChatOpen(false)} className="p-2 text-neutral-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user" ? "bg-white text-black" : "bg-neutral-800 text-neutral-200 border border-white/5"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-neutral-800/50 border-t border-white/10">
              <div className="flex gap-2">
                <button onClick={toggleListening} className={cn("p-3 rounded-xl transition-all", isListening ? "bg-red-500 text-white" : "bg-white/5 text-neutral-400")}>
                  <Mic size={20} />
                </button>
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Écrivez ici..."
                  className="flex-1 bg-black/40 border-none rounded-xl px-4 text-sm text-white focus:ring-1 focus:ring-white/20"
                />
                <button onClick={handleSend} className="p-3 bg-white text-black rounded-xl hover:scale-105 transition-transform">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-neutral-800 to-black border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] flex items-center justify-center relative group z-50 overflow-hidden"
      >
        <div className="absolute inset-0 rounded-full bg-white animate-pulse opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-full"></div>
        <Sparkles size={24} className="text-white/80 group-hover:text-white transition-colors z-10" />
      </motion.button>
    </div>
  );
}

function VideoModal({ video, onClose }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl"
    >
      <div className="w-full max-w-5xl aspect-video relative bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-black">
          <X size={24} />
        </button>
        <div className="w-full h-full flex items-center justify-center">
          <Play size={64} className="text-white/20" />
          <p className="absolute mt-24 text-neutral-500 uppercase tracking-widest text-xs">Lecteur en cours de chargement...</p>
        </div>
      </div>
    </motion.div>
  );
}

function BiographyModal({ isOpen, onClose }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4 backdrop-blur-2xl"
    >
      <div className="max-w-3xl w-full bg-neutral-900 border border-white/10 p-8 rounded-3xl max-h-[80vh] overflow-y-auto space-y-8 no-scrollbar">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-serif text-white">L'Héritage d'Albert</h2>
          <button onClick={onClose} className="p-2 text-neutral-500 hover:text-white"><X size={24}/></button>
        </div>
        <div className="space-y-6 text-neutral-300 leading-relaxed font-light">
          <p className="text-xl italic text-white/80">"Informaticien de génie, visionnaire et père dévoué."</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-4">
              <h4 className="text-white font-bold border-b border-white/10 pb-2 uppercase tracking-tighter">Éducation & Carrière</h4>
              <p>➋ Maîtrise Informatique - Grenoble (1980)</p>
              <p>➋ Doctorate Informatique - Paris IX Dauphine (1984)</p>
              <p>➋ Consultant Senior & Gérant ASI-CAMEROUN</p>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-bold border-b border-white/10 pb-2 uppercase tracking-tighter">Passions</h4>
              <p>➋ Basketball & Tennis</p>
              <p>➋ Photographie & Art</p>
              <p>➋ La Gastronomie raffinée</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Dashboard() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const { setIsChatOpen } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans selection:bg-white/30">
      <div className="relative h-[85vh] w-full overflow-hidden">
        <motion.img 
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 25, ease: "easeOut" }}
          src="https://i.postimg.cc/d0fZr0H1/Manga_Mpondo_Albert_F.png" 
          alt="Albert Mpondo Manga"
          className="w-full h-full object-cover object-top opacity-40 grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-20 left-4 sm:left-8 md:left-16 max-w-3xl space-y-8 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="space-y-4"
          >
            <div className="w-16 h-px bg-white/50 mb-6" />
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-bold leading-none tracking-tight">Albert Mpondo<br/>Manga</h1>
            <p className="text-xl md:text-3xl text-neutral-400 font-light italic">1955 - 2026</p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="flex flex-wrap gap-4">
            <button onClick={() => setSelectedVideo(VIDEO_CATEGORIES[0].videos[0])} className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              <Play size={18} fill="black" /> Recueillement
            </button>
            <button onClick={() => setIsBioModalOpen(true)} className="flex items-center gap-3 bg-white/5 text-white px-8 py-4 rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-md border border-white/10">
              <FileText size={18} /> Biographie
            </button>
            <button onClick={() => setIsChatOpen(true)} className="group flex items-center gap-3 bg-white/5 text-white px-8 py-4 rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-md border border-white/10 relative overflow-hidden">
              <Sparkles size={18} className="text-yellow-500/70" /> Gardien de la Mémoire
            </button>
          </motion.div>
        </div>
      </div>

      <div className="relative z-20 -mt-8 space-y-20 pt-8">
        {VIDEO_CATEGORIES.map((cat, i) => (
          <VideoRow key={i} title={cat.title} videos={cat.videos} onVideoSelect={setSelectedVideo} />
        ))}
      </div>

      <PhotoSection />
      <Guestbook />
      <ChatbotWidget />

      <AnimatePresence>
        {selectedVideo && <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
        {isBioModalOpen && <BiographyModal isOpen={isBioModalOpen} onClose={() => setIsBioModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <AuthContext.Provider value={{ 
      isUnlocked, 
      unlock: (data) => { setUserData(data); setIsUnlocked(true); }, 
      userData, 
      isChatOpen, 
      setIsChatOpen 
    }}>
      <div className="min-h-screen bg-black">
        <AnimatePresence mode="wait">
          {!isUnlocked ? <LoginGate key="login" /> : <Dashboard key="dashboard" />}
        </AnimatePresence>
      </div>
    </AuthContext.Provider>
  );
}