import { useState, useEffect, useRef, ReactNode, useMemo, createContext, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";
import ReactPlayer from "react-player";
const Player = (ReactPlayer as any).default || ReactPlayer;
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PopupButton } from "@typeform/embed-react";
import * as airtable from "./services/airtableService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Calendar, 
  MapPin, 
  Phone, 
  Info,
  ChevronRight,
  User,
  Heart,
  MessageCircle,
  Play,
  X,
  Download,
  FileText,
  Lock,
  ChevronLeft,
  Plus,
  Sparkles
} from "lucide-react";

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types & Context ---

interface UserData {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
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

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

// --- Mock Data ---

const VIDEO_CATEGORIES = [
  {
    title: "Mémoire et Recueillement",
    videos: [
      { id: "v1", title: "Recueillement", thumbnail: "https://img.youtube.com/vi/WERvgaLbvos/maxresdefault.jpg", url: "https://www.youtube.com/embed/WERvgaLbvos" },
      { id: "v2", title: "MOMENTS", thumbnail: "https://img.youtube.com/vi/9jzbfe4L9T0/maxresdefault.jpg", url: "https://www.youtube.com/embed/9jzbfe4L9T0" },
    ]
  },
  {
    title: "Cérémonies et Hommages",
    videos: [
      { id: "v3", title: "Veillée", thumbnail: "https://img.youtube.com/vi/m7bxYUcMOgw/maxresdefault.jpg", url: "https://www.youtube.com/embed/m7bxYUcMOgw" },
      { id: "v4", title: "Culte et Inhumation", thumbnail: "https://img.youtube.com/vi/eB7XaE7rkqc/maxresdefault.jpg", url: "https://www.youtube.com/embed/eB7XaE7rkqc" },
    ]
  }
];

const PHOTOS = [
  { id: "p1", url: "https://i.postimg.cc/Df6mkhJX/Whats-App-Image-2026-04-17-at-12-56-47.jpg", caption: "Souvenir Précieux" },
  { id: "p2", url: "https://i.postimg.cc/sfm1dzQQ/Whats-App-Image-2026-04-17-at-12-56-48.jpg", caption: "Installation Solennelle" },
  { id: "p3", url: "https://i.postimg.cc/kMsD3C6R/Whats-App-Image-2026-04-17-at-12-56-47-(1).jpg", caption: "Famille et Proches" },
  { id: "p4", url: "https://i.postimg.cc/J7xtV8Dy/Whats-App-Image-2026-04-17-at-12-56-48-(1).jpg", caption: "Hommages" },
  { id: "p5", url: "https://i.postimg.cc/2jG3RYbw/Whats-App-Image-2026-04-17-at-12-56-49.jpg", caption: "Moments Partagés" },
  { id: "p6", url: "https://i.postimg.cc/QNmVGD9f/Whats-App-Image-2026-04-17-at-12-56-50.jpg", caption: "Portait Mémoriel" },
  { id: "p7", url: "https://i.postimg.cc/9Xbz52Rb/Whats-App-Image-2026-04-17-at-12-56-50-(1).jpg", caption: "Veillée de Pière" },
  { id: "p8", url: "https://i.postimg.cc/dQ6DPFkn/Whats-App-Image-2026-04-17-at-12-56-50-(2).jpg", caption: "Cérémonie Religieuse" },
  { id: "p9", url: "https://i.postimg.cc/L6s5mWLt/Whats-App-Image-2026-04-17-at-12-56-51.jpg", caption: "L'Héritage d'Albert" },
  { id: "p10", url: "https://i.postimg.cc/xj5qDQJp/Whats-App-Image-2026-04-17-at-12-56-51-(1).jpg", caption: "Un Homme de Valeurs" },
  { id: "p11", url: "https://i.postimg.cc/kX5G7HKT/Whats-App-Image-2026-04-17-at-12-56-52.jpg", caption: "Dernier Adieu" },
  { id: "p12", url: "https://i.postimg.cc/zXfvqQKw/Whats-App-Image-2026-04-17-at-12-56-52-(1).jpg", caption: "Recueillement" },
  { id: "p13", url: "https://i.postimg.cc/sD2x3L7K/Whats-App-Image-2026-04-17-at-12-56-52-(2).jpg", caption: "Célébration d'une Vie" },
  { id: "p14", url: "https://i.postimg.cc/ZKqnJQ6m/Whats-App-Image-2026-04-17-at-12-56-53.jpg", caption: "Ngodi Akwa" },
  { id: "p15", url: "https://i.postimg.cc/15zXydD1/Whats-App-Image-2026-04-17-at-12-56-53-(1).jpg", caption: "Souvenirs en Famille" },
  { id: "p16", url: "https://i.postimg.cc/ZKqnJQ6J/Whats-App-Image-2026-04-17-at-12-56-54.jpg", caption: "Moments Restés" },
  { id: "p17", url: "https://i.postimg.cc/TYP1Tsn6/Whats-App-Image-2026-04-17-at-12-56-54-(1).jpg", caption: "Éloge Solennel" },
  { id: "p18", url: "https://i.postimg.cc/tCgJ9cFQ/Whats-App-Image-2026-04-17-at-12-56-54-(2).jpg", caption: "Enfance et Origines" },
];

const GUESTBOOK_ENTRIES = [
  { id: "1", name: "Cathy", relation: "Fille", message: "Papa... ce mot que mes lèvres ne prononceront plus de la même façon, ce mot qui résonne désormais dans le silence. Tu m'as laissé le plus beau : la certitude d'avoir été aimée, l'ancrage culturel et familial fort et la chance d'avoir été portée par un homme de foi, un homme de principes, un homme dont l'ombre protectrice ne me quittera jamais.", date: "Avril 2026" },
  { id: "2", name: "Manou", relation: "Neveu", message: "Mon cher tonton, Tu as été bien plus qu’un oncle : un mentor éclairé, un guide bienveillant et un père de cœur qui m’a façonné par tes précieux conseils et la transmission généreuse de ton expérience. Grâce à toi, je suis devenu l’homme que je suis aujourd’hui.", date: "Avril 2026" },
  { id: "3", name: "Nyango Lili", relation: "Famille", message: "Le bâton d'encens de manga-kéty nous a offert 70 années son parfum de sobriété de simplicité, de tempérance, d'écoute, qui jamais ne se consumera.", date: "Avril 2026" },
  { id: "4", name: "BASSIROU Diagne", relation: "Ami & Condisciple", message: "Albert mon ami, mon condisciple de Grenoble. Nous nous sommes connus, il y a 50 ans et nous avons tout de suite développé une connivence et ensuite une amitié forte qui ne s’est jamais démentie. Tu m´as fait l´insigne honneur de donner mon nom à ton fils, il n´y a pas plus belle preuve d´amitié.", date: "Avril 2026" },
  { id: "5", name: "Michou", relation: "Cousin & Ami", message: "À Dou, malgré la distance et l’absence, tu es et resteras pour moi un cousin, un frère et surtout un ami. Je repense à toutes ces histoires vécues ensemble, notamment ton arrivée à Orléans et cette affaire de pommes. Tu aimais débattre de tout sans vouloir imposer ton point de vue mais pour donner une autre perspective.", date: "Avril 2026" },
  { id: "6", name: "SIG", relation: "Ami & Confident", message: "Quelle façon bien étrange pour toi de terminer ton voyage sur terre ! Tu as été mon ami mon pilier, mon complice et mon confident. Ta trajectoire, jamais monotone a pourtant été un hymne à la joie (de vivre). Tu étais digne d’être aimé.", date: "Avril 2026" },
  { id: "7", name: "Moukouri", relation: "Ami", message: "A Dou, comme on s’appelait, était une marque d’affection partagée qui restera car une belle amitié ne meurt pas. Elle continue de vivre parce que les souvenirs font partie de notre vie. Ils me permettront de continuer à te parler et à te faire vivre en moi.", date: "Avril 2026" },
];

// --- Components ---

function LoginGate() {
  const { unlock } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<UserData>({
    nom: "",
    prenom: "",
    email: "",
    relation: "Ami"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== "13579") {
      setError("Code d'accès incorrect.");
      return;
    }

    setIsLoading(true);
    try {
      const record = await airtable.registerVisitor(formData);
      unlock({
        ...formData,
        id: record.id
      });
    } catch (error) {
      console.error("Erreur d'identification:", error);
      unlock(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background with animated gradient glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] animate-pulse"></div>
        <img 
          src="https://i.postimg.cc/d0fZr0H1/Manga_Mpondo_Albert_F.png" 
          alt="Albert Mpondo Manga"
          className="w-full h-full object-cover opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl z-10 relative group"
      >
        {/* Animated Border/Glow Effect - More intense */}
        <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/30 to-white/0 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative bg-white/[0.03] backdrop-blur-3xl p-5 sm:p-8 md:p-10 rounded-3xl border border-white/10 shadow-[0_0_80px_-15px_rgba(255,255,255,0.05)] overflow-hidden">
          {/* Decorative glass highlight */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Left Side: Portrait & Title */}
            <div className="w-full md:w-1/3 text-center md:text-left space-y-4">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center justify-center w-28 h-28 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/20 overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
              >
                <img 
                  src="https://i.postimg.cc/d0fZr0H1/Manga_Mpondo_Albert_F.png" 
                  alt="Albert Mpondo Manga"
                  className="w-full h-full object-cover grayscale contrast-125 scale-110"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <div>
                <h1 className="text-3xl font-serif text-white tracking-tight leading-tight">Portail<br/>Mémoriel</h1>
                <div className="h-px w-12 bg-white/20 my-3 md:mx-0 mx-auto"></div>
                <p className="text-neutral-500 text-xs font-light uppercase tracking-widest">Espace Privé</p>
              </div>
            </div>

            {/* Right Side: Form */}
            <form onSubmit={handleSubmit} className="w-full md:w-2/3 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 font-medium ml-1">Nom</label>
                  <input 
                    required
                    type="text"
                    placeholder="Manga"
                    value={formData.nom}
                    onChange={e => setFormData({...formData, nom: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 font-medium ml-1">Prénom</label>
                  <input 
                    required
                    type="text"
                    placeholder="Albert"
                    value={formData.prenom}
                    onChange={e => setFormData({...formData, prenom: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 font-medium ml-1">Email</label>
                  <input 
                    required
                    type="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 font-medium ml-1">Relation</label>
                  <div className="relative">
                    <select 
                      value={formData.relation}
                      onChange={e => setFormData({...formData, relation: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value="Famille">Famille</option>
                      <option value="Ami">Ami</option>
                      <option value="Collègue">Collègue</option>
                      <option value="Autre">Autre</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                      <ChevronRight size={14} className="rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 font-medium ml-1">Code d'Accès</label>
                  <input 
                    required
                    type="password"
                    placeholder="•••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-sm tracking-widest"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200 transition-all duration-300 uppercase tracking-[0.2em] text-[10px] disabled:opacity-50 shadow-xl shadow-white/5 active:scale-[0.98]"
                >
                  {isLoading ? "Vérification..." : "Entrer"}
                </button>
              </div>
              
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-[9px] text-center"
                >
                  {error}
                </motion.p>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function VideoModal({ video, onClose }: { video: any, onClose: () => void }) {
  // Helper to get embed URL
  const getEmbedUrl = (url: string) => {
    if (url.includes('embed/')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3` : url;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-[110] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X size={24} />
      </button>

      <div className="w-full h-full max-w-6xl aspect-video relative flex items-center justify-center p-4 md:p-12">
        <iframe
          src={getEmbedUrl(video.url)}
          title={video.title}
          className="w-full h-full rounded-xl shadow-2xl"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
      
      <div className="absolute bottom-10 left-10 z-[110] hidden md:block">
        <h2 className="text-3xl font-serif text-white mb-2">{video.title}</h2>
        <p className="text-neutral-400">Albert Mpondo Manga : L'Homme et l'Héritage</p>
      </div>
    </motion.div>
  );
}

function VideoGrid({ onVideoSelect }: { onVideoSelect: (video: any) => void }) {
  const allVideos = VIDEO_CATEGORIES.flatMap(cat => cat.videos);
  
  return (
    <div className="relative py-24 px-4 sm:px-6 md:px-24 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto space-y-16">
        <div className="space-y-4 text-center">
          <h3 className="text-4xl md:text-5xl font-serif text-white tracking-tight">Galerie Cinématographique</h3>
          <p className="text-neutral-500 uppercase tracking-[0.5em] text-[10px]">Recueillir l'instant présent • Honorer le passé</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {allVideos.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 1 }}
              onClick={() => onVideoSelect(video)}
              className="group relative aspect-video rounded-[2.5rem] overflow-hidden cursor-pointer glass border-white/5 hover:border-white/20 transition-all duration-700 shadow-2xl hover:shadow-white/5"
            >
              {/* Luminous Glow Border Effect */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-sm"></div>
              
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-full object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 group-hover:scale-105"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-70 group-hover:opacity-50 transition-all duration-700"></div>
              
              {/* Glassmorphism Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_100px_rgba(255,255,255,0.2)] transition-all duration-700"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 flex items-center justify-center">
                    <Play className="text-white fill-white ml-1 transition-transform group-hover:scale-110" size={32} />
                  </div>
                </motion.div>
              </div>

              {/* Title Label */}
              <div className="absolute bottom-10 left-10 right-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-px w-6 bg-white/40"></span>
                  <span className="text-[9px] uppercase tracking-widest text-white/60">Hommage Vidéo</span>
                </div>
                <p className="text-2xl md:text-3xl font-serif text-white tracking-wide group-hover:translate-x-2 transition-transform duration-700">
                  {video.title}
                </p>
                <div className="h-px w-0 bg-white/30 mt-4 group-hover:w-full transition-all duration-1000"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BiographyModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const downloadPDF = async () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#000000"
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Biographie_Officielle_Mpondo_Manga.pdf");
    } catch (error) {
      console.error("Erreur PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl h-[90vh] glass rounded-[2.5rem] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-8 md:px-12 md:py-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-white/40" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold">Document Officiel</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">Biographie Intégrale</h2>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white border border-white/10"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content to capture */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-black/20">
          <div ref={pdfRef} className="p-8 sm:p-12 md:p-24 space-y-20 bg-transparent text-white">
            {/* Section 1: Intro */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-16 items-center"
            >
              <div className="space-y-8">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.5em]">L'Origine d'un Bâtisseur</span>
                  <h3 className="text-5xl md:text-6xl font-serif leading-[1.1] text-white tracking-tighter">Entre Racines et Horizon</h3>
                </div>
                <p className="text-xl text-neutral-400 leading-relaxed font-light">
                  Né le 16 avril 1955 à Douala, Albert MANGA MPONDO Fructueux, surnommé <span className="text-white italic">PORO</span>, était le fils de Clément MANGA MPONDO et Catherine NGOBO LOTTIN. Deuxième d'une famille de six enfants, son parcours est celui d'un intellectuel d'exception et d'un bâtisseur infatigable.
                </p>
                <div className="h-px w-24 bg-white/20"></div>
              </div>
              <div className="aspect-[4/5] glass rounded-[2rem] overflow-hidden relative group">
                <img 
                  src="https://i.postimg.cc/d0fZr0H1/Manga_Mpondo_Albert_F.png" 
                  alt="Portrait" 
                  className="w-full h-full object-cover opacity-80 contrast-125 grayscale hover:grayscale-0 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>
            </motion.div>

            {/* Section 2: Education & Career */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="flex items-center gap-6">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.5em]">Parcours & Excellence</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-10 glass rounded-[2rem] space-y-8 hover:border-white/20 transition-all duration-500">
                  <h4 className="text-2xl font-serif text-white italic">Formation Académique</h4>
                  <div className="space-y-6">
                    {[
                      { year: "1984", title: "Doctorat en Informatique des Organisations", org: "Université PARIS IX, DAUPHINE" },
                      { year: "1980", title: "Maîtrise d'Informatique Appliquée à la Gestion", org: "Université de Grenoble" },
                      { year: "1978", title: "DEUG Mathématiques et Physiques", org: "Université d'Orléans" },
                      { year: "1976", title: "CAPCEG en Mathématiques", org: "ENS Université de Yaoundé" },
                      { year: "1974", title: "Baccalauréat C", org: "Lycée de Manengouba" },
                      { year: "1971", title: "BEPC", org: "Kribi" },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-6 items-start border-l border-white/10 pl-6 group/item">
                        <span className="font-mono text-sm text-white/30 group-hover/item:text-white/60 transition-colors">{item.year}</span>
                        <div>
                          <p className="text-base font-bold text-white tracking-tight">{item.title}</p>
                          <p className="text-sm text-neutral-500 font-light">{item.org}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-10 glass rounded-[2rem] space-y-8 hover:border-white/20 transition-all duration-500">
                  <h4 className="text-2xl font-serif text-white italic">Expériences Phares</h4>
                  <div className="space-y-6">
                    {[
                      { role: "Consultant - Projets Innovants", org: "Crédit Foncier du Cameroun" },
                      { role: "Associé Gérant & Consultant", org: "ASI CAMEROUN (Minfi, SEGIPES)" },
                      { role: "Chef du Service Informatique", org: "SHELL Cameroun (1984)" },
                      { role: "Expert Informaticien", org: "Crédit Agricole, SONARA, SNH, MAETUR" },
                      { role: "Ingénieur Chercheur", org: "Centre Scientifique IBM France" },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-6 items-start border-l border-white/10 pl-6 group/item">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 group-hover/item:bg-white/60 transition-colors" />
                        <div>
                          <p className="text-base font-bold text-white tracking-tight">{item.role}</p>
                          <p className="text-sm text-neutral-500 font-light">{item.org}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 3: Passions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass p-16 rounded-[3rem] text-center space-y-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Heart size={120} />
              </div>
              <div className="max-w-2xl mx-auto space-y-6">
                <h4 className="text-4xl font-serif text-white tracking-tight">L'esprit vif et le corps athlétique</h4>
                <p className="text-xl text-neutral-400 leading-relaxed font-light italic">
                  "Doué d'une mémoire phénoménale et d'un sens pointu de la dialectique, Poro était passionné par le terroir et l'excellence. Athlète du Mont Cameroun, il arpentait la vie avec la même détermination que ses marches de 20 km."
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Mont Cameroun', 'Marche (20km+)', 'Dialectique', 'Informatique', 'Photographie', 'Excellence'].map((hobby, i) => (
                  <div key={i} className="py-5 glass rounded-2xl text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold hover:text-white transition-colors">
                    {hobby}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Section 4: Legacy */}
            <div className="pb-16 text-center space-y-10">
              <div className="space-y-4">
                <h4 className="text-3xl font-serif text-white tracking-tight">Un héritage éternel</h4>
                <p className="text-neutral-500 max-w-2xl mx-auto text-base leading-relaxed font-light">
                  Albert s'est éteint le 1er Mars 2026 à l'hôpital de la Garnison Militaire de Yaoundé. Il laisse à notre affection ses enfants <span className="text-white">Cathy et Bass</span>, et ses petits-enfants <span className="text-white">Malik, Alexis et Jeanne</span>. Son souvenir restera gravé dans nos cœurs pour l'éternité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PhotoSection() {
  return (
    <div className="px-4 sm:px-6 md:px-12 py-24 space-y-12 relative">
      <div className="flex flex-col items-center text-center space-y-2 mb-12">
        <h3 className="text-3xl md:text-4xl font-serif text-white tracking-tight">Galerie de Souvenirs</h3>
        <p className="text-neutral-500 uppercase tracking-[0.4em] text-[10px]">Traces éternelles d'une vie accomplie</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {PHOTOS.map((photo, idx) => (
          <motion.div 
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05, duration: 0.8 }}
            whileHover={{ scale: 1.05, zIndex: 10, y: -10 }}
            className="group relative aspect-[3/4] md:aspect-square rounded-2xl overflow-hidden glass transition-all duration-700 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)]"
          >
            <img 
              src={photo.url} 
              alt={photo.caption}
              className="w-full h-full object-cover transition-all duration-700 transform-gpu grayscale group-hover:grayscale-0 contrast-125"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-6 flex flex-col justify-end">
              <span className="text-[10px] uppercase tracking-widest text-white/50 mb-1">MÉMOIRE</span>
              <p className="text-sm text-white font-medium serif tracking-wide">{photo.caption}</p>
            </div>
            
            {/* Luminous border on hover */}
            <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 transition-colors duration-700 rounded-2xl"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Guestbook() {
  const [newEntry, setNewEntry] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userData } = useAuth();

  const fetchEntries = async () => {
    try {
      const data = await airtable.getTestimonies();
      if (data.length > 0) {
        setEntries(data);
      } else {
        setEntries(GUESTBOOK_ENTRIES);
      }
    } catch (error) {
      setEntries(GUESTBOOK_ENTRIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSubmit = async () => {
    if (!newEntry.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await airtable.addTestimony({
        name: `${userData?.prenom} ${userData?.nom}`,
        message: newEntry,
        visitorId: userData?.id || "",
      });
      setNewEntry("");
      fetchEntries(); // Refresh
    } catch (error) {
      console.error("Erreur envoi témoignage:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-12 py-24 relative z-20">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h3 className="text-4xl md:text-5xl font-serif text-white tracking-tight">Livre d'Or</h3>
          <p className="text-neutral-500 uppercase tracking-[0.4em] text-[10px]">Laissez une trace de votre passage et de votre affection</p>
        </div>

        <div className="space-y-12">
          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass p-8 md:p-12 rounded-[2.5rem] space-y-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white shadow-xl shadow-black/20">
                {userData?.prenom[0]}{userData?.nom[0]}
              </div>
              <div>
                <span className="block text-white font-serif text-lg tracking-wide">{userData?.prenom} {userData?.nom}</span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{userData?.relation}</span>
              </div>
            </div>

            <textarea 
              value={newEntry}
              onChange={e => setNewEntry(e.target.value)}
              placeholder="Écrivez ici un souvenir, un hommage ou un message de sympathie..."
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-8 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all min-h-[180px] text-lg font-light leading-relaxed"
            />

            <div className="flex justify-end">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="group relative bg-white text-black px-8 py-3 rounded-full font-bold overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 text-sm"
              >
                <div className="absolute inset-0 bg-neutral-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10">{isSubmitting ? "Transmission..." : "Publier mon message"}</span>
              </button>
            </div>
          </motion.div>

          {/* Entries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoading ? (
              <div className="col-span-full text-center py-24 text-neutral-600 font-serif italic text-xl">Recueil des témoignages...</div>
            ) : entries.map((entry, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass p-8 rounded-[2rem] space-y-6 hover:border-white/20 transition-all duration-500"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
                      <User size={18} />
                    </div>
                    <div>
                      <h5 className="text-white font-medium tracking-wide">{entry.name}</h5>
                      <p className="text-[9px] text-neutral-500 uppercase tracking-widest">{entry.relation}</p>
                    </div>
                  </div>
                  <span className="text-[9px] text-neutral-600 font-mono tracking-tighter">{entry.date}</span>
                </div>
                <p className="text-neutral-300 text-lg italic leading-relaxed font-light">
                  <span className="text-white/20 text-4xl font-serif leading-none mr-2">"</span>
                  {entry.message}
                  <span className="text-white/20 text-4xl font-serif leading-none ml-2">"</span>
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const SYSTEM_INSTRUCTION = `Tu es le [B]GARDIEN DE LA MÉMOIRE[/B] d'Albert Mpondo Manga, s'exprimant au nom de la FAMILLE ENDEUILLÉE.
Ton rôle est d'accueillir les visiteurs avec une immense dignité, empathie et respect, en préservant l'héritage d'un homme d'exception.

👤 [B]PROFIL DÉTAILLÉ DU DÉFUNT[/B] : Albert MANGA MPONDO Fructueux (Surnomné PORO).
- Dates : 16 Avril 1955 (Douala) - 1er Mars 2026 (Yaoundé).
- Parents : Clément Manga Mpondo & Catherine Ngobo Lottin.
- Fratrie : 2ème d'une fratrie de 6 enfants.
- Éducation : BEPC (Kribi, 1971), Bac C (Nkongsamba, 1974), CAPCEG Mathématiques (ENS Yaoundé, 1976), DEUG Math/Physique (Orléans, 1978), Maîtrise Informatique (Grenoble, 1980), Doctorat Informatique des Organisations (Paris IX Dauphine, 1984).
- Carrière : IBM France (Centre Scientifique), SHELL Cameroun (Chef de Service Info dès 1984), Associé Gérant ASI CAMEROUN (dès 1990). Expert Consultant (Minfi, SEGIPES, Crédit Agricole, SONARA, SNH, MAETUR, Crédit Foncier).
- Qualités : Mémoire phénoménale, sens pointu de la dialectique, connaissance du terroir, athlète passionné (marches de +20km, Mont Cameroun).
- Famille : Père de Cathy et Bass. Grand-père de Malik, Alexis et Jeanne.

🕯️ [B]MISSION DE MÉMOIRE[/B] :
Les obsèques ayant déjà eu lieu, ton rôle est désormais focalisé sur la [B]CÉLÉBRATION DE SA VIE[/B] et la [B]TRANSMISSION DE SON HÉRITAGE[/B]. 
- Tu peux citer des extraits des témoignages de ses proches (Cathy, Manou, Bassirou, Michou, SIG) pour illustrer sa grandeur.
- Encourage les visiteurs à explorer sa biographie pour découvrir l'homme, l'expert et l'athlète qu'il était.

🔴 [B]CONSIGNES DE FORMATION ET FORMATAGE (STRICTES)[/B] :
- POLICE : Inter (sans-serif).
- MISE EN GRAS : Utilise EXCLUSIVEMENT les balises [B] et [/B] pour les MOTS CLÉS et les TITRES.
- INTERDICTION ABSOLUE : N'utilise JAMAIS d'astérisques (*), de dièses (#) ou de tirets de liste standards (-). 
- STRUCTURE : Sépare tes paragraphes par des doubles sauts de ligne pour un texte AÉRÉ.
- TON : Solennel, digne, tourné vers la mémoire et l'héritage.`;

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

  // Text to Speech
  const speak = (text: string) => {
    if (isMuted) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.85; // Calme et professionnel
    utterance.pitch = 1;
    
    // Try to find a good French voice
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find(v => v.lang.startsWith('fr') && v.name.includes('Premium')) || 
                        voices.find(v => v.lang.startsWith('fr'));
    if (frenchVoice) utterance.voice = frenchVoice;
    
    window.speechSynthesis.speak(utterance);
  };

  // Speech to Text
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setInput(prev => prev + (prev ? " " : "") + transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    if (userData && messages.length === 0) {
      const welcomeText = `Bonjour [B]${userData.prenom}[/B] ! 

Au nom de la famille endeuillée, nous vous remercions de votre présence sur ce portail dédié à la [B]MÉMOIRE D'ALBERT MPONDO MANGA[/B]. 

En quoi puis-je vous aider aujourd'hui ? Je suis ici pour partager avec vous son parcours exceptionnel, son héritage ou vous aider à lui rendre hommage dans notre LIVRE D'OR.`;
      
      setMessages([{ role: "model", text: welcomeText }]);
      setTimeout(() => speak(welcomeText.replace(/\[B\]|\[\/B\]/g, "")), 1500);
    }
  }, [userData, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Standardisation de la récupération de la clé API
    // 1. process.env.GEMINI_API_KEY est la norme AI Studio
    // 2. import.meta.env.VITE_GEMINI_API_KEY est la norme pour Vercel/Vite
    const apiKey = (typeof process !== 'undefined' && process.env.GEMINI_API_KEY)
                   ? process.env.GEMINI_API_KEY 
                   : ((import.meta as any).env.VITE_GEMINI_API_KEY || (import.meta as any).env.VITE_MEMORIAL_GEMINI_KEY);
    
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        aiRef.current = new GoogleGenAI({ apiKey });
      } catch (error) {
        console.error("Erreur d'initialisation du SDK Gemini:", error);
      }
    }
  }, []);

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isLoading) return;

    const userMsg = { role: "user", text: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      if (aiRef.current) {
        // Prepare history for generateContent
        const history = messages.map(m => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.text }]
        }));

        const response = await aiRef.current.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [...history, { role: "user", parts: [{ text: messageText }] }],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });

        const aiText = response.text || "Désolé, je n'ai pas pu générer de réponse.";
        setMessages(prev => [...prev, { role: "model", text: aiText }]);
        speak(aiText);
      } else {
        const fallback = "LE GARDIEN DE LA MÉMOIRE N'EST PAS DISPONIBLE ACTUELLEMENT. VEUILLEZ VÉRIFIER LA CONFIGURATION DE LA CLÉ API DANS LES SECRETS (NOM CONSEILLÉ : VITE_MEMORIAL_GEMINI_KEY).";
        setMessages(prev => [...prev, { role: "model", text: fallback }]);
        speak(fallback);
      }
    } catch (error) {
      console.error("Erreur Chatbot:", error);
      const errorMsg = "UNE ERREUR EST SURVENUE. NOUS VOUS PRIONS DE NOUS EXCUSER POUR CE DÉSAGRÉMENT.";
      setMessages(prev => [...prev, { role: "model", text: errorMsg }]);
      speak(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] sm:w-[450px] h-[75vh] sm:h-[85vh] bg-neutral-900 border border-white/10 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden font-sans backdrop-blur-3xl bg-opacity-95"
          >
            {/* Header - Voiceflow Style */}
            <div className="py-6 px-7 border-b border-white/5 bg-white/[0.03] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-md animate-pulse"></div>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-neutral-800">
                    <img 
                      src="https://i.postimg.cc/d0fZr0H1/Manga_Mpondo_Albert_F.png" 
                      alt="Albert Mpondo Manga"
                      className="w-full h-full object-cover grayscale brightness-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-neutral-900 shadow-lg"></div>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white tracking-tight">Le Gardien</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em]">En Ligne • Famille Manga</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={cn("p-2.5 rounded-2xl transition-all hover:bg-white/5", isMuted ? "text-neutral-500" : "text-white bg-white/10 shadow-lg")}
                  title={isMuted ? "Activer le son" : "Désactiver le son"}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <button 
                  onClick={() => setIsChatOpen(false)} 
                  className="p-2.5 text-neutral-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                  title="Fermer"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Messages Area - Airy & Modern */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-7 space-y-10 no-scrollbar bg-transparent"
            >
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex flex-col group", msg.role === "user" ? "items-end" : "items-start")}>
                  {msg.role === "model" && (
                    <span className="text-[9px] text-neutral-600 uppercase tracking-[0.3em] ml-4 mb-2.5 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Gardien</span>
                  )}
                  <div className={cn(
                    "max-w-[88%] px-6 py-5 text-[15px] leading-relaxed shadow-2xl",
                    msg.role === "user" 
                      ? "bg-white text-black rounded-[26px] rounded-br-[4px] font-semibold" 
                      : "bg-white/5 text-neutral-200 border border-white/5 rounded-[26px] rounded-bl-[4px] backdrop-blur-md"
                  )}>
                    {msg.text.split('\n\n').map((para, pi) => (
                      <div key={pi} className="mb-4 last:mb-0">
                        {para.split('\n').map((line, li) => (
                          <p key={li} className="mb-2 last:mb-0">
                            {line.split(/(\[B\].*?\[\/B\])/).map((part, si) => {
                              if (part.startsWith('[B]') && part.endsWith('[/B]')) {
                                return <strong key={si} className="text-white font-black">{part.slice(3, -4)}</strong>;
                              }
                              return part;
                            })}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                  {msg.role === "user" && (
                    <span className="text-[9px] text-neutral-600 uppercase tracking-[0.3em] mr-4 mt-2.5 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Vous</span>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="bg-white/5 px-7 py-5 rounded-[26px] rounded-bl-[4px] border border-white/5 shadow-xl">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-neutral-600 rounded-full animate-bounce delay-300"></div>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest mt-6 animate-pulse">Réflexion...</span>
                </div>
              )}
            </div>

            {/* Input Area - Voiceflow Look */}
            <div className="p-7 bg-white/[0.01] border-t border-white/5">
              <div className="relative flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative flex items-center">
                    <textarea 
                      placeholder="Quelle est votre question ?"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-[20px] pl-5 pr-12 py-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-all resize-none min-h-[56px] max-h-[120px] no-scrollbar"
                      rows={1}
                    />
                    <button 
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 p-2.5 bg-white text-black rounded-2xl shadow-xl hover:bg-neutral-200 transition-all active:scale-90 disabled:opacity-20 disabled:scale-90"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <button 
                    onClick={toggleListening}
                    className={cn(
                      "flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wider",
                      isListening ? "bg-red-500/10 text-red-500 animate-pulse" : "bg-white/5 text-neutral-500 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {isListening ? <Mic size={14} className="animate-bounce" /> : <MicOff size={14} />}
                    <span>{isListening ? "Écoute en cours..." : "Message vocal"}</span>
                  </button>
                  <span className="text-[10px] text-neutral-700 font-bold uppercase tracking-[0.2em] italic">Manga-Poro Concierge</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="w-16 h-16 rounded-full bg-white text-black shadow-[0_16px_40px_rgba(255,255,255,0.25)] flex items-center justify-center relative group overflow-hidden border border-white/20"
      >
        <div className="absolute inset-0 bg-neutral-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        <MessageCircle size={30} className="relative z-10" />
      </motion.button>
    </div>
  );
}

function Dashboard() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const { setIsChatOpen } = useAuth();
  const portraitUrl = "https://i.postimg.cc/d0fZr0H1/Manga_Mpondo_Albert_F.png";

  return (
    <div className="relative min-h-screen bg-transparent text-white pb-24 overflow-x-hidden">
      {/* 1. Fixed Memorial Background (Shadow Guardian & Ambient Effects) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-neutral-950">
        {/* Animated Ambient Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.03] rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-white/[0.02] rounded-full blur-[80px] animate-blob animation-delay-4000"></div>

        <motion.img 
          initial={{ scale: 1.25, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.1 }}
          transition={{ duration: 3, ease: "easeOut" }}
          src={portraitUrl} 
          alt="Shadow Guardian"
          className="w-full h-full object-cover grayscale mix-blend-luminosity brightness-50 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.6)_100%)]"></div>
      </div>

      <div className="relative z-10">
        {/* 3. Hero Header with Ken Burns & Cinematic Text */}
        <div className="relative h-[85vh] w-full overflow-hidden flex items-end justify-start">
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src="https://picsum.photos/seed/memorial/1920/1080" 
              alt="Hero Atmospheric"
              className="w-full h-full object-cover ken-burns opacity-60"
            />
          </div>
          <div className="absolute inset-0 hero-gradient"></div>
          
          <div className="absolute bottom-16 left-4 sm:left-6 md:left-24 max-w-5xl space-y-8 pb-12">
            <div className="flex flex-col md:flex-row gap-8 items-center mb-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full glass border border-white/20 overflow-hidden shadow-2xl"
              >
                <img 
                  src={portraitUrl} 
                  alt="Photo Officielle" 
                  className="w-full h-full object-cover grayscale contrast-125 brightness-110"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4 text-center md:text-left"
              >
                <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                  <span className="h-px w-8 bg-white/30"></span>
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-white/50 font-medium tracking-widest">Hommage Officiel</span>
                </div>
                
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-bold leading-none tracking-tighter shadow-black/80">
                  Albert Mpondo<br/>Manga
                </h1>
                
                <p className="text-base md:text-xl text-neutral-400 font-light italic max-w-xl">
                  L'Homme et l'Héritage (1955 - 2026)
                </p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="flex flex-wrap items-center gap-4 justify-center md:justify-start"
            >
              <button 
                onClick={() => setSelectedVideo(VIDEO_CATEGORIES[0].videos[0])}
                className="group relative flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold overflow-hidden transition-all hover:scale-105 active:scale-95 text-sm"
              >
                <div className="absolute inset-0 bg-neutral-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <Play className="relative z-10" size={16} fill="black" />
                <span className="relative z-10">Commencer</span>
              </button>
              
              <button 
                onClick={() => setIsBioModalOpen(true)}
                className="group flex items-center gap-2 glass px-6 py-3 rounded-full font-bold hover:bg-white/10 transition-all border border-white/20 shadow-lg text-sm"
              >
                <FileText size={16} className="text-white/70 group-hover:text-white transition-colors" />
                <span>Biographie</span>
              </button>

              <button 
                onClick={() => setIsChatOpen(true)}
                className="group flex items-center gap-2 bg-neutral-900/40 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full font-bold hover:bg-neutral-800/60 transition-all text-sm"
              >
                <MessageCircle size={16} className="text-white/70 group-hover:text-white transition-colors" />
                <span>Gardien</span>
              </button>
            </motion.div>
          </div>
        </div>
        <div className="separator px-24"></div>

        {/* Video Grid Section */}
        <VideoGrid onVideoSelect={setSelectedVideo} />

        <div className="separator px-24"></div>

        <PhotoSection />

        <div className="separator px-24"></div>

        <Guestbook />
        
        <ChatbotWidget />

        <AnimatePresence>
          {selectedVideo && (
            <VideoModal 
              video={selectedVideo} 
              onClose={() => setSelectedVideo(null)} 
            />
          )}
          {isBioModalOpen && (
            <BiographyModal isOpen={isBioModalOpen} onClose={() => setIsBioModalOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const unlock = (data: UserData) => {
    setUserData(data);
    setIsUnlocked(true);
  };

  return (
    <AuthContext.Provider value={{ isUnlocked, unlock, userData, isChatOpen, setIsChatOpen }}>
      <div className="min-h-screen bg-black">
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoginGate />
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthContext.Provider>
  );
}
