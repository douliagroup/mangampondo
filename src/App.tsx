import { useState, useEffect, useRef, ReactNode, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";
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
  Sparkles
} from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

const SYSTEM_INSTRUCTION = `Tu es l'assistant officiel de la famille Manga Mpondo pour les obsèques de Manga Mpondo Albert Fructueux.

TON RÔLE : Informer, rassurer et accompagner les proches avec une extrême douceur, empathie, patience et amour. Ton ton doit être solennel, réconfortant et respectueux. Tu dois pouvoir répondre en français et en anglais selon la langue de l'utilisateur.

L'ambiance visuelle de l'application est basée sur le NOIR et l'OR pour symboliser le recueillement et la dignité.

TU DOIS TOUJOURS RÉPONDRE de manière constructive. Si une question est hors sujet, ramène doucement l'utilisateur vers les obsèques.

INFORMATIONS DISPONIBLES :

👤 Profil du Défunt et Famille
Identité : Manga Mpondo Albert Fructueux.
Fratrie :
- Pr. Manga Dika : Premier petit frère. Universitaire, ancien Vice-Recteur de l'Université de Douala.
- Jacques Manga Lobe : Deuxième petit frère (benjamin). Directeur de PAA (Procure and Advisory).
- Irène : Sœur du défunt.
- Lilie : Sœur du défunt.

🕯️ Circonstances du Décès
Le défunt a été percuté par une moto (conduite par un jeune de 17 ans) à Yaoundé le 1er Mars 2026 vers 15h. Touché à la tête, il a été conduit à l'hôpital de la garnison militaire de Yaoundé. Malheureusement, les conditions de suivi médical n'ayant pas été optimales, il nous a quittés environ 5 heures après l'accident.

🏠 Recueillements et Veillées
Les recueillements se font tous les soirs à la maison familiale de Ngodi-Akwa (située juste après le cimetière).

🗓️ Calendrier des Obsèques (Douala 2026)
- Vendredi 3 Avril : Levée de corps à la morgue de l'Hôpital Laquintinie de Douala, suivie de la veillée (lieu pas encore choisi).
- Samedi 4 Avril : Cérémonie d'adieu et service religieux.
- Lieu de l'Inhumation : Caveau familial situé à Ngodi Akwa, Douala.

Contacts utiles de la famille : 6 95 52 12 22 / 6 77 94 38 38 OU 6 99 91 99 72 / 6 79 52 68 76.

CE QUE TU PEUX FAIRE POUR LES UTILISATEURS :
1️⃣ Donner les dates et le lieu des obsèques.
2️⃣ Informer sur les lieux de recueillement quotidiens.
3️⃣ Fournir des informations sur la famille du défunt.
4️⃣ Répondre avec tact aux questions sur les circonstances du décès.
5️⃣ Fournir les contacts de la famille pour les condoléances ou assistances.
6️⃣ Expliquer que certains détails (comme le lieu précis de la veillée du 3 avril) sont en cours de finalisation.
7️⃣ Recevoir et transmettre (symboliquement) les messages de sympathie.

RÈGLES DE COMPORTEMENT :
Si on te demande des détails non encore fixés (comme le lieu précis de la veillée du 3 avril) : dis avec beaucoup de tact qu'il n'y a pas encore assez d'informations pour le moment. Demande-leur d'être patients et rassure-les en disant que tu seras en mesure de leur donner tous les détails dans les tout prochains jours.
Si un utilisateur présente ses condoléances, remercie-le chaleureusement au nom de la famille et dis-lui que son message a été pris en compte.
Concernant les circonstances du décès, reste sobre et digne, en mettant l'accent sur le recueillement plutôt que sur les détails tragiques, tout en répondant honnêtement si la question est posée.

RÈGLES DE FORMATAGE (TRÈS STRICTES) :
N'UTILISE JAMAIS D'ASTÉRISQUES pour mettre en gras.
N'UTILISE JAMAIS DE BALISES HTML.
Aère beaucoup ton texte. Fais des paragraphes courts et séparés par des sauts de ligne.
Utilise des bulles numériques (1️⃣, 2️⃣, 3️⃣) ou des émojis sobres (🕊️, 🕯️, 📅, 📞) pour lister les informations.

Parle toujours au nom de la famille Manga Mpondo.`;

function GoldParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gold/30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            boxShadow: "0 0 8px rgba(212,175,55,0.6)",
          }}
          animate={{
            y: [0, -150, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0, 0.6, 0],
            scale: [1, 2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function GoldIllustration() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-10 z-0 flex items-center justify-center">
      <div className="relative w-full h-full">
        <svg width="300" height="300" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-bronze absolute top-10 left-10 animate-pulse">
          <path d="M100 20C100 20 80 60 40 60C40 60 20 60 20 80C20 100 40 120 40 120C40 120 60 160 100 160C140 160 160 120 160 120C160 120 180 100 180 80C180 60 160 60 160 60C120 60 100 20 100 20Z" stroke="currentColor" strokeWidth="0.2" />
        </svg>
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-bronze absolute bottom-20 right-10 opacity-50">
          <path d="M100 40V160M60 80H140" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" />
          <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.2" strokeDasharray="4 4" />
        </svg>
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "model", 
      text: "Bienvenue. Au nom de la famille Manga Mpondo, nous vous remercions de votre présence et de votre soutien.\n\nJe suis là pour vous accompagner. Vous pouvez me poser des questions sur :\n\n1️⃣ Les dates et le lieu des obsèques.\n2️⃣ Les contacts de la famille.\n3️⃣ L'état d'avancement du programme.\n\nVous pouvez également me laisser un message de condoléances que je transmettrai à la famille." 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "chat">("info");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);
  
  // Speech Recognition Setup
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize Chat
    const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      chatRef.current = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: [
          {
            role: "model",
            parts: [{ text: messages[0].text }]
          }
        ]
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "fr-FR";

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        rec.onerror = () => {
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
    if (!isTtsEnabled) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    
    // Strictly prioritize French female voices
    const voices = window.speechSynthesis.getVoices();
    
    // 1. Try to find a French female voice specifically
    let voice = voices.find(v => 
      v.lang.startsWith("fr") && 
      (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("amélie") || v.name.toLowerCase().includes("marie") || v.name.toLowerCase().includes("hortense"))
    );

    // 2. Fallback to any French voice
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith("fr"));
    }

    // 3. Fallback to any female voice
    if (!voice) {
      voice = voices.find(v => v.name.toLowerCase().includes("female"));
    }
    
    if (voice) utterance.voice = voice;
    utterance.pitch = 1.0;
    utterance.rate = 0.95;
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (overrideMessage?: string) => {
    const messageToSend = (typeof overrideMessage === "string" ? overrideMessage : "") || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text: messageToSend };
    setMessages(prev => [...prev, userMessage]);
    if (typeof overrideMessage !== "string") setInput("");
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        // Re-initialize if missing
        const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
        if (apiKey) {
          const ai = new GoogleGenAI({ apiKey });
          chatRef.current = ai.chats.create({
            model: "gemini-3-flash-preview",
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
            },
            history: messages.map(m => ({
              role: m.role,
              parts: [{ text: m.text }]
            }))
          });
        }
      }

      if (chatRef.current) {
        const result = await chatRef.current.sendMessage({ message: messageToSend });
        const modelMessage: Message = { role: "model", text: result.text };
        setMessages(prev => [...prev, modelMessage]);
        speak(result.text);
      } else {
        throw new Error("Assistant non initialisé");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = { 
        role: "model", 
        text: "Désolé, j'ai rencontré une difficulté technique. Veuillez réessayer dans quelques instants." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (title: string) => {
    let query = "";
    switch (title) {
      case "DATES": query = "Quelles sont les dates des obsèques ?"; break;
      case "LIEU": query = "Où se déroulent les obsèques ?"; break;
      case "CONTACTS": query = "Quels sont les contacts de la famille ?"; break;
      case "PROGRAMME DÉTAILLÉ": query = "Quel est le programme détaillé ?"; break;
      default: query = `Informations sur ${title}`;
    }
    handleSend(query);
    if (window.innerWidth < 768) {
      setActiveTab("chat");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-950 overflow-hidden relative">
      <GoldParticles />
      <GoldIllustration />
      {/* Background Texture/Gradient */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-bronze/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-bronze-light/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-bronze-dark/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,115,85,0.1),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.9))]"></div>
      </div>
      
      {/* Left Panel: Fixed Info */}
      <div className={`w-full md:w-1/2 lg:w-2/5 h-screen overflow-y-auto border-r border-bronze/20 bg-neutral-950/40 backdrop-blur-sm p-6 md:p-10 pb-24 md:pb-10 space-y-12 z-10 relative ${activeTab === "info" ? "block" : "hidden md:block"}`}>
        {/* Header/Photo */}
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
            <div className="absolute -inset-1 gold-gradient rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-2 border-gold/50 overflow-hidden shadow-2xl shadow-gold/10">
              <img 
                src="https://i.postimg.cc/d0fZr0H1/Manga_Mpondo_Albert_F.png" 
                alt="Manga Mpondo Albert Fructueux"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gold tracking-wider uppercase">
              Manga Mpondo
            </h1>
            <h2 className="text-xl md:text-2xl font-light text-neutral-400 italic">
              Albert Fructueux
            </h2>
          </div>
        </div>

        {/* Notice Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl overflow-hidden border border-bronze/20 shadow-xl group cursor-zoom-in"
        >
          <img 
            src="https://i.postimg.cc/vmKxfmqm/Faire_part_Deces_Manga_Mpondo_A.jpg" 
            alt="Faire-part"
            className="w-full h-auto hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Info Sections */}
        <div className="grid grid-cols-1 gap-6">
          <InfoCard 
            icon={<Calendar className="text-gold" />} 
            title="DATES" 
            content="Les 3 et 4 Avril 2026" 
            onClick={() => handleCardClick("DATES")}
          />
          <InfoCard 
            icon={<MapPin className="text-gold" />} 
            title="LIEU" 
            content="Douala, Cameroun" 
            onClick={() => handleCardClick("LIEU")}
          />
          <InfoCard 
            icon={<Phone className="text-gold" />} 
            title="CONTACTS" 
            content={
              <div className="space-y-1">
                <p>6 95 52 12 22 / 6 77 94 38 38</p>
                <p>6 99 91 99 72 / 6 79 52 68 76</p>
              </div>
            } 
            onClick={() => handleCardClick("CONTACTS")}
          />
          <InfoCard 
            icon={<Info className="text-gold" />} 
            title="PROGRAMME DÉTAILLÉ" 
            content="En attente d'informations complémentaires" 
            isPending
            onClick={() => handleCardClick("PROGRAMME DÉTAILLÉ")}
          />
        </div>

        <div className="pt-10 text-center">
          <p className="text-xs text-neutral-600 uppercase tracking-[0.2em]">
            © 2026 Famille Manga Mpondo
          </p>
        </div>
      </div>

      {/* Right Panel: Chatbot */}
      <div className={`flex-1 h-screen flex flex-col bg-neutral-900/30 relative ${activeTab === "chat" ? "flex" : "hidden md:flex"}`}>
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between glass-panel z-10">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ 
                boxShadow: ["0 0 0px rgba(139,115,85,0)", "0 0 15px rgba(139,115,85,0.4)", "0 0 0px rgba(139,115,85,0)"] 
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 rounded-full border border-bronze/30 overflow-hidden"
            >
              <img 
                src="https://i.postimg.cc/vmKxfmqm/Faire_part_Deces_Manga_Mpondo_A.jpg" 
                alt="Assistant" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div>
              <h3 className="text-sm font-bold text-neutral-200 tracking-widest uppercase">Assistant Familial</h3>
              <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">En ligne • Famille Manga Mpondo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const newState = !isTtsEnabled;
                setIsTtsEnabled(newState);
                if (!newState) window.speechSynthesis.cancel();
              }}
              className={`p-2 rounded-full transition-all ${isTtsEnabled ? "bg-bronze/20 text-bronze" : "text-neutral-500 hover:bg-white/5"}`}
              title={isTtsEnabled ? "Désactiver la voix" : "Activer la voix"}
            >
              {isTtsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl transition-all duration-300 ${
                  msg.role === "user" 
                    ? "bg-bronze text-white rounded-tr-none shadow-lg shadow-bronze/10" 
                    : "glass-panel text-neutral-200 rounded-tl-none border-bronze/10 hover:border-bronze/30"
                }`}>
                  <div className="flex items-center gap-2 mb-2 opacity-60">
                    {msg.role === "user" ? <User size={12} /> : (
                      <div className="w-4 h-4 rounded-full overflow-hidden border border-bronze/30">
                        <img 
                          src="https://i.postimg.cc/vmKxfmqm/Faire_part_Deces_Manga_Mpondo_A.jpg" 
                          alt="Bot" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <span className="text-[10px] uppercase font-bold tracking-widest">
                      {msg.role === "user" ? "Vous" : "Famille Manga Mpondo"}
                    </span>
                  </div>
                  <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap markdown-content">
                    <Markdown
                      components={{
                        p: ({ children }) => {
                          if (typeof children === 'string') {
                            const parts = children.split(/([1-9]️⃣)/g);
                            return (
                              <p className="mb-4 last:mb-0">
                                {parts.map((part, i) => {
                                  if (part.match(/[1-9]️⃣/)) {
                                    const num = part[0];
                                    return (
                                      <span key={i} className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold text-neutral-950 text-[10px] font-bold mx-1 align-middle shadow-[0_0_12px_rgba(212,175,55,0.8)] border border-gold-light/50">
                                        {num}
                                      </span>
                                    );
                                  }
                                  return part;
                                })}
                              </p>
                            );
                          }
                          return <p className="mb-4 last:mb-0">{children}</p>;
                        }
                      }}
                    >
                      {msg.text}
                    </Markdown>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex justify-start">
              <div className="glass-panel p-4 rounded-2xl rounded-tl-none border-bronze/10 flex gap-1">
                <span className="w-1.5 h-1.5 bg-bronze/50 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-bronze/50 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-bronze/50 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 border-t border-white/5 glass-panel pb-24 md:pb-6">
          <div className="max-w-4xl mx-auto relative flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-all ${isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-white/5 text-neutral-400 hover:text-bronze hover:bg-white/10"}`}
            >
              {isListening ? <MicOff size={22} /> : <Mic size={22} />}
            </motion.button>
            
            <div className="flex-1 relative group">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Écrivez votre message ici..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-bronze/50 focus:bg-white/10 transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-xl border border-bronze/0 group-focus-within:border-bronze/20 pointer-events-none transition-all duration-500"></div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-bronze hover:bg-bronze-light text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-bronze/20"
            >
              <Send size={22} />
            </motion.button>
          </div>
          <div className="flex flex-col items-center mt-4 gap-2">
            <p className="text-center text-[10px] text-neutral-600 uppercase tracking-widest">
              Soutien et Recueillement • Famille Manga Mpondo
            </p>
            <p className="text-center text-[9px] text-neutral-700 font-medium tracking-widest">
              PROPULSÉ PAR DOULIA.
            </p>
          </div>
        </div>
      </div>
      {/* Mobile Navigation Tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 flex items-center justify-around p-2 pb-6">
        <button 
          onClick={() => setActiveTab("info")}
          className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === "info" ? "text-gold" : "text-neutral-500"}`}
        >
          <Info size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Infos</span>
          {activeTab === "info" && <motion.div layoutId="activeTab" className="w-1 h-1 bg-gold rounded-full mt-1" />}
        </button>
        <button 
          onClick={() => setActiveTab("chat")}
          className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === "chat" ? "text-gold" : "text-neutral-500"}`}
        >
          <MessageCircle size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Assistant</span>
          {activeTab === "chat" && <motion.div layoutId="activeTab" className="w-1 h-1 bg-gold rounded-full mt-1" />}
        </button>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, content, isPending = false, onClick }: { icon: ReactNode, title: string, content: ReactNode, isPending?: boolean, onClick?: () => void }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-5 rounded-xl border transition-all duration-500 group relative overflow-hidden hover-glow ${isPending ? "border-bronze/10 bg-bronze/5" : "border-white/5 bg-white/5 hover:border-bronze/40"}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-bronze/0 via-bronze/5 to-bronze/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-10 h-10 rounded-lg bg-neutral-900 flex items-center justify-center border border-white/5 group-hover:border-gold/50 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-[10px] font-bold text-neutral-500 tracking-[0.2em] uppercase mb-1 group-hover:text-gold transition-colors">{title}</h4>
          <div className="text-sm md:text-base text-neutral-200 font-medium group-hover:text-white transition-colors">
            {content}
          </div>
        </div>
        {!isPending && <ChevronRight size={16} className="text-neutral-700 group-hover:text-gold group-hover:translate-x-1 transition-all" />}
      </div>
    </motion.button>
  );
}
