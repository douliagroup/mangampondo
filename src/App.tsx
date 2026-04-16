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
    title: "1- Recueillement",
    videos: [
      { id: "v1", title: "Recueillement", thumbnail: "https://img.youtube.com/vi/WERvgaLbvos/maxresdefault.jpg", url: "https://www.youtube.com/embed/WERvgaLbvos" },
      { id: "v2", title: "MOMENTS", thumbnail: "https://img.youtube.com/vi/9jzbfe4L9T0/maxresdefault.jpg", url: "https://www.youtube.com/embed/9jzbfe4L9T0" },
    ]
  },
  {
    title: "2- Mini Veillée",
    videos: [
      { id: "v3", title: "Chants et Souvenirs", thumbnail: "https://picsum.photos/seed/evening/800/450", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      { id: "v4", title: "Paroles de Proches", thumbnail: "https://picsum.photos/seed/words/800/450", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    ]
  },
  {
    title: "3- Levée de Corps",
    videos: [
      { id: "v5", title: "Cérémonie à Laquintinie", thumbnail: "https://picsum.photos/seed/hospital/800/450", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      { id: "v6", title: "Départ Solennel", thumbnail: "https://picsum.photos/seed/departure/800/450", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    ]
  },
  {
    title: "4- Grande Veillée",
    videos: [
      { id: "v7", title: "Veillée Communautaire", thumbnail: "https://picsum.photos/seed/community/800/450", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      { id: "v8", title: "Éloge Funèbre", thumbnail: "https://picsum.photos/seed/eulogy/800/450", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    ]
  },
  {
    title: "5- Culte et Inhumation",
    videos: [
      { id: "v9", title: "Service Religieux", thumbnail: "https://picsum.photos/seed/church_service/800/450", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      { id: "v10", title: "Dernier Adieu à Ngodi Akwa", thumbnail: "https://picsum.photos/seed/farewell/800/450", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    ]
  }
];

const PHOTOS = [
  { id: "p1", url: "https://picsum.photos/seed/albert1/800/1000", caption: "Albert Mpondo Manga - Portrait" },
  { id: "p2", url: "https://picsum.photos/seed/albert2/1000/800", caption: "Moments en Famille" },
  { id: "p3", url: "https://picsum.photos/seed/albert3/800/800", caption: "Engagement Communautaire" },
  { id: "p4", url: "https://picsum.photos/seed/albert4/1000/1000", caption: "Souvenirs de Jeunesse" },
  { id: "p5", url: "https://picsum.photos/seed/albert5/800/1200", caption: "Cérémonie Officielle" },
  { id: "p6", url: "https://picsum.photos/seed/albert6/1200/800", caption: "Ngodi Akwa" },
];

const GUESTBOOK_ENTRIES = [
  { id: "1", name: "Jean Dupont", relation: "Ami", message: "Un grand homme qui restera dans nos mémoires.", date: "12 Avril 2026" },
  { id: "2", name: "Marie Manga", relation: "Famille", message: "Repose en paix, oncle Albert. Ton héritage vit en nous.", date: "11 Avril 2026" },
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
        
        <div className="relative bg-white/[0.03] backdrop-blur-3xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-[0_0_80px_-15px_rgba(255,255,255,0.05)] overflow-hidden">
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

function VideoRow({ title, videos, onVideoSelect }: { title: string, videos: any[], onVideoSelect: (v: any) => void }) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-4 relative group">
      <h3 className="text-xl font-serif text-neutral-200 px-6 md:px-12">{title}</h3>
      
      <div className="relative">
        <button 
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
        >
          <ChevronLeft size={32} />
        </button>

        <div 
          ref={rowRef}
          className="flex gap-4 overflow-x-auto px-6 md:px-12 no-scrollbar scroll-smooth"
        >
          {videos.map((video) => (
            <motion.div 
              key={video.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => onVideoSelect(video)}
              className="flex-none w-64 md:w-80 aspect-video bg-neutral-900 rounded-lg overflow-hidden cursor-pointer relative group/card"
            >
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Play className="text-white fill-white" size={20} />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                <p className="text-sm font-medium text-white">{video.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
        >
          <ChevronRight size={32} />
        </button>
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
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-5xl h-[90vh] bg-neutral-950 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-neutral-900/50">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Biographie Officielle</h2>
            <p className="text-sm text-neutral-500 uppercase tracking-widest mt-1">Albert Manga Mpondo (1955 - 2026)</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={downloadPDF}
              disabled={isGenerating}
              className="hidden md:flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isGenerating ? "Génération..." : "Télécharger PDF"}
              <Download size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content to capture */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div ref={pdfRef} className="p-8 md:p-16 space-y-16 bg-black text-white">
            {/* Section 1: Intro */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-[0.3em]">L'Homme et ses Origines</span>
                <h3 className="text-4xl md:text-5xl font-serif leading-tight text-white">Un destin tracé entre Douala et l'Europe</h3>
                <p className="text-lg text-neutral-400 leading-relaxed font-light">
                  Né le 16 avril 1955 à Douala, Albert MANGA MPONDO, surnommé PORO, était le fils de Clément MANGA MPONDO et Catherine NGOBO LOTTIN. Son parcours est celui d'un bâtisseur, d'un intellectuel brillant qui a su marier ses racines camerounaises à une expertise internationale de haut vol.
                </p>
              </div>
              <div className="aspect-[4/5] bg-neutral-900 rounded-2xl overflow-hidden border border-white/5 relative group">
                <img 
                  src="https://i.postimg.cc/d0fZr0H1/Manga_Mpondo_Albert_F.png" 
                  alt="Portrait" 
                  className="w-full h-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>
            </div>

            {/* Section 2: Education & Career */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-[0.3em]">Parcours & Expertise</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 bg-neutral-900 rounded-2xl border border-white/5 space-y-6">
                  <h4 className="text-xl font-serif text-white italic">Formation Académique</h4>
                  <div className="space-y-4">
                    {[
                      { year: "1984", title: "Doctorat en Informatique", org: "Paris IX - Dauphine" },
                      { year: "1980", title: "Maîtrise Informatique", org: "ENSIMAG Grenoble" },
                      { year: "1978", title: "DEUG Math/Physique", org: "Université d'Orléans" },
                      { year: "1974", title: "Baccalauréat C", org: "Lycée de Maningouba" },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 items-start border-l border-white/10 pl-4">
                        <span className="font-mono text-sm text-white/40">{item.year}</span>
                        <div>
                          <p className="text-sm font-bold text-white">{item.title}</p>
                          <p className="text-xs text-neutral-500">{item.org}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-neutral-900 rounded-2xl border border-white/5 space-y-6">
                  <h4 className="text-xl font-serif text-white italic">Expériences Phares</h4>
                  <div className="space-y-4">
                    {[
                      { role: "Associé & Gérant", org: "ASI - CAMEROUN" },
                      { role: "Chef de Service Info", org: "SHELL Cameroun" },
                      { role: "Ingénieur Chercheur", org: "IBM France" },
                      { role: "Consultant Senior", org: "Missions PAD, SONARA, SNH" },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 items-start border-l border-white/10 pl-4">
                        <div className="w-2 h-2 rounded-full bg-white/20 mt-1.5" />
                        <div>
                          <p className="text-sm font-bold text-white">{item.role}</p>
                          <p className="text-xs text-neutral-500">{item.org}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Passions */}
            <div className="bg-neutral-900 p-12 rounded-3xl border border-white/5 text-center space-y-8">
              <div className="max-w-2xl mx-auto space-y-4">
                <h4 className="text-3xl font-serif text-white">L'amour de la vie et de l'excellence</h4>
                <p className="text-neutral-400 leading-relaxed font-light italic">
                  "Sammy n'oubliera jamais son amour de la vie, son appétit pour la bonne chère, son raffinement vestimentaire, et l'intensité qu'il mettait à consommer chaque instant partagé."
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Basketball', 'Handball', 'Tennis', 'Photographie'].map((hobby, i) => (
                  <div key={i} className="py-4 border border-white/10 rounded-xl text-xs uppercase tracking-widest text-neutral-500 font-bold">
                    {hobby}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Legacy */}
            <div className="pb-16 text-center space-y-6">
              <h4 className="text-2xl font-serif text-white">Un héritage éternel</h4>
              <p className="text-neutral-500 max-w-xl mx-auto text-sm leading-relaxed">
                Albert nous a quittés le 1er mars 2026 à Yaoundé. Il laisse à notre affection ses enfants Yves Michel, Laurent, Marco, Lili... et Jacky, sa compagne de toujours. Son souvenir restera gravé dans nos cœurs comme un modèle de dignité et de réussite.
              </p>
              <div className="pt-8 print:hidden">
                <button 
                  onClick={downloadPDF}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 bg-white text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50"
                >
                  <Download size={20} />
                  {isGenerating ? "Génération du PDF..." : "Télécharger la biographie officielle"}
                </button>
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
    <div className="px-6 md:px-12 py-12 space-y-8">
      <h3 className="text-2xl font-serif text-white">Galerie de Souvenirs</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {PHOTOS.map((photo) => (
          <motion.div 
            key={photo.id}
            whileHover={{ scale: 1.02 }}
            className="relative aspect-[3/4] md:aspect-square rounded-lg overflow-hidden group cursor-zoom-in bg-neutral-900"
          >
            <img 
              src={photo.url} 
              alt={photo.caption}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
              <p className="text-xs text-white font-medium">{photo.caption}</p>
            </div>
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
    <div className="px-6 md:px-12 py-12 bg-neutral-950/50 border-t border-white/5">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-serif text-white">Livre d'Or</h3>
          <p className="text-neutral-400">Partagez un souvenir ou un message de sympathie.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-2xl space-y-4">
            <textarea 
              value={newEntry}
              onChange={e => setNewEntry(e.target.value)}
              placeholder="Votre message..."
              className="w-full bg-transparent border-none text-white focus:ring-0 resize-none min-h-[100px]"
            />
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {userData?.prenom[0]}{userData?.nom[0]}
                </div>
                <span className="text-sm text-neutral-400">{userData?.prenom} {userData?.nom}</span>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Envoi..." : "Publier"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12 text-neutral-500">Chargement des témoignages...</div>
            ) : entries.map((entry) => (
              <div key={entry.id} className="bg-neutral-900/30 p-6 rounded-xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-500">
                      <User size={20} />
                    </div>
                    <div>
                      <h5 className="text-white font-medium">{entry.name}</h5>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{entry.relation}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-600">{entry.date}</span>
                </div>
                <p className="text-neutral-300 text-sm italic leading-relaxed">"{entry.message}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const SYSTEM_INSTRUCTION = `Tu es le GARDIEN DE LA MÉMOIRE d'Albert Mpondo Manga, s'exprimant au nom de la FAMILLE ENDEUILLÉE.
Ton rôle est d'accueillir les visiteurs, de les guider dans ce portail mémoriel et de répondre à leurs questions avec une grande dignité, empathie et respect.

CONTEXTE DE L'APPLICATION :
Cette plateforme est un hommage privé et premium à Albert Mpondo Manga. Elle permet aux proches de :
➊ Visionner les vidéos des obsèques (Recueillement, Mini Veillée, Levée de Corps, Grande Veillée, Culte et Inhumation).
➋ Parcourir une galerie de photos souvenirs.
➌ Consulter et télécharger des documents d'héritage (biographie, faire-part, etc.).
➍ Laisser un message de condoléances dans le "Livre d'Or".

👤 PROFIL DÉTAILLÉ DU DÉFUNT : Albert MANGA MPONDO (Surnommé PORO ou SAMMY).
- Dates : 16 Avril 1955 (Douala) - 1er Mars 2026 (Yaoundé, Cameroun).
- Parents : Clément Manga Mpondo (Fonctionnaire des TP) et Catherine Ngobo Lottin.
- Fratrie : Malili, Poro, Dickson, Etah, Délobé. Frères adoptifs : Thomas Bagnack et S.M. Dibie Nfon.
- Éducation : Bac C (Nkongsamba, 1974), Maîtrise Informatique (Grenoble, 1980), DEA Économie (Sorbonne), Doctorate Informatique des Organisations (Paris IX Dauphine, 1984).
- Carrière : Consultant Senior, Associé & Gérant ASI-CAMEROUN. Expériences chez Shell Cameroun, IBM France, SCB. Expert en systèmes bancaires et schémas directeurs informatiques.
- Passions : Basketball, Handball, Tennis, Photographie. Un homme raffiné, aimant la vie et la bonne chère.
- Famille : Père de Yves Michel, Laurent, Marco, Lili. Compagne : Jacky.

🗓️ CALENDRIER DES OBSÈQUES (Douala 2026) :
- Vendredi 3 Avril : Levée de corps à la morgue de l'Hôpital Laquintinie de Douala, suivie de la veillée (lieu à Ngodi Akwa).
- Samedi 4 Avril : Cérémonie d'adieu et service religieux.
- Lieu de l'Inhumation : Caveau familial situé à Ngodi Akwa, Douala.

🕯️ CIRCONSTANCES DU DÉCÈS :
Albert nous a quittés le 1er mars 2026 à Yaoundé, suite à un accident de circulation survenu alors qu'il revenait de l'église. Arrivé à l'Hôpital Militaire de Yaoundé à 15h, il n'a malheureusement pas pu bénéficier d'une prise en charge optimale par des spécialistes qualifiés. Il s'est éteint à 21h.

🏠 RECUEILLEMENTS :
Les recueillements se font tous les soirs à la maison familiale de Ngodi-Akwa (juste après le cimetière).

CONSIGNES DE RÉPONSE ET FORMATAGE (STRICT) :
- Réponds toujours en français par défaut, mais adapte-toi à la langue du visiteur s'il s'exprime autrement.
- Sois solennel et exprime la gratitude de la famille.
- Invite chaleureusement le visiteur à laisser un message dans le "Livre d'Or".
- FORMATAGE : 
  - Sépare tes paragraphes par des doubles sauts de ligne.
  - N'utilise JAMAIS de balises HTML.
  - N'utilise JAMAIS de symboles Markdown.
  - Pour mettre en gras un mot ou un titre, écris le simplement en MAJUSCULES.
  - Pour les listes, utilise EXCLUSIVEMENT les bulles numériques unicode : ➊, ➋, ➌, ➍, ➎, ➏, ➐, ➑, ➒, ➓.
  - Reste sobre et épuré.`;

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
      const welcomeText = `Bonjour ${userData.prenom}. AU NOM DE LA FAMILLE ENDEUILLÉE, nous vous remercions de votre présence sur ce portail dédié à la MÉMOIRE D'ALBERT MPONDO MANGA. 

Cet espace a été conçu pour partager son héritage, ses souvenirs et les moments forts de ses obsèques (2026). 

Nous vous invitons à parcourir les différentes sections et, si vous le souhaitez, à laisser un message de sympathie dans notre LIVRE D'OR.`;
      
      setMessages([{ role: "model", text: welcomeText }]);
      setTimeout(() => speak(welcomeText), 1500);
    }
  }, [userData, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Robust API Key retrieval per Skill guidelines
    const apiKey = (import.meta as any).env?.VITE_MEMORIAL_GEMINI_KEY || 
                   (import.meta as any).env?.VITE_GEMINI_API_KEY || 
                   (window as any).GEMINI_API_KEY || 
                   (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : "");
    
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
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
            className="absolute bottom-12 right-0 w-[calc(100vw-2rem)] sm:w-[400px] h-[600px] sm:h-[700px] max-h-[75vh] sm:max-h-[80vh] bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="py-2 px-4 border-b border-white/5 bg-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-neutral-700">
                  <img 
                    src="https://i.postimg.cc/d0fZr0H1/Manga_Mpondo_Albert_F.png" 
                    alt="Albert Mpondo Manga"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <span className="text-xs font-serif text-white block">Gardien de la Mémoire</span>
                  <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Famille Mpondo Manga</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={cn("p-2 rounded-lg transition-colors", isMuted ? "text-neutral-500" : "text-white bg-white/10")}
                  title={isMuted ? "Activer le son" : "Désactiver le son"}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <button 
                  onClick={() => setIsChatOpen(false)} 
                  className="p-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  title="Fermer"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar bg-black/40"
            >
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-lg",
                    msg.role === "user" 
                      ? "bg-white text-black rounded-tr-none font-medium" 
                      : "bg-neutral-800 text-neutral-200 rounded-tl-none border border-white/5"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-neutral-600 mt-1 uppercase tracking-widest font-bold">
                    {msg.role === "user" ? "Vous" : "Le Gardien"}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-3 text-neutral-500 text-[10px] animate-pulse ml-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-neutral-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-[9px] lowercase opacity-70">Patientez quelques secondes.......</span>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-neutral-800/80 backdrop-blur-xl">
              <div className="flex items-end gap-2">
                <button 
                  onClick={toggleListening}
                  className={cn(
                    "p-3 rounded-xl transition-all shadow-inner mb-1",
                    isListening ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                  )}
                  title={isListening ? "Arrêter l'enregistrement" : "Message vocal"}
                >
                  <Mic size={22} />
                </button>
                <div className="flex-1 relative">
                  <textarea 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Écrivez votre message..."
                    rows={2}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-all resize-none min-h-[80px] max-h-[150px]"
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 bottom-2 p-2 bg-white text-black rounded-lg disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="w-14 h-14 rounded-full bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center justify-center relative group"
      >
        <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-10 group-hover:opacity-20"></div>
        <MessageCircle size={26} />
      </motion.button>
    </div>
  );
}

function Dashboard() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const { setIsChatOpen } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Hero Section */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        <img 
          src="https://picsum.photos/seed/memorial/1920/1080" 
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient"></div>
        
        <div className="absolute bottom-20 left-6 md:left-12 max-w-2xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight">
              Albert Mpondo Manga
            </h1>
            <p className="text-xl md:text-2xl text-neutral-300 font-light italic">
              L'Homme et l'Héritage (1955 - 2026)
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center gap-6">
            <button 
              onClick={() => setSelectedVideo(VIDEO_CATEGORIES[0].videos[0])}
              className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-md font-bold hover:bg-neutral-200 transition-colors"
            >
              <Play size={20} fill="black" />
              Commencer le recueillement
            </button>
            <button 
              onClick={() => setIsBioModalOpen(true)}
              className="flex items-center gap-2 bg-neutral-800/50 text-white px-8 py-3 rounded-md font-bold hover:bg-neutral-700 transition-colors backdrop-blur-md border border-white/10"
            >
              <FileText size={20} />
              Biographie
            </button>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 bg-neutral-600/50 text-white px-8 py-3 rounded-md font-bold hover:bg-neutral-600/80 transition-colors backdrop-blur-md"
            >
              <Info size={20} />
              Plus d'infos
            </button>
          </div>
        </div>
      </div>

      {/* Video Rows */}
      <div className="relative z-20 mt-12 space-y-16">
        {VIDEO_CATEGORIES.map((cat, i) => (
          <VideoRow 
            key={i} 
            title={cat.title} 
            videos={cat.videos} 
            onVideoSelect={setSelectedVideo} 
          />
        ))}
      </div>

      <PhotoSection />
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
