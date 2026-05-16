import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Zap, BookOpen, Layers, AlertCircle } from "lucide-react";
import {
  DetailedCharacter,
  getCharacterDetail,
  getIssueDetail,
  IssueInfo,
  extractIdFromUrl,
} from "../services/comicVine";
import { Skeleton } from "./Skeleton";
import { ImageModal } from "./ImageModal";

interface CharacterDetailProps {
  id: string; // The full ID like "4005-NNN"
  onBack: () => void;
}

export function CharacterDetail({ id, onBack }: CharacterDetailProps) {
  const [character, setCharacter] = useState<DetailedCharacter | null>(null);
  const [issues, setIssues] = useState<IssueInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const bioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getCharacterDetail(id);
        setCharacter(data);

        // Load first 20 issues
        const issueCredits = data.issue_credits.slice(0, 20);
        const issuePromises = issueCredits.map((issue) =>
          getIssueDetail(extractIdFromUrl(issue.api_detail_url))
        );
        const issueResults = await Promise.all(issuePromises);
        setIssues(issueResults);
      } catch (err: any) {
        setError("Failed to load character data. Encryption error.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Handle clicks on images within the biography (dangerouslySetInnerHTML)
  const handleBioClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      e.preventDefault();
      const imgSrc = (target as HTMLImageElement).src;
      const imgAlt = (target as HTMLImageElement).alt || character?.name || "";
      setModalImage(imgSrc);
      setModalTitle(imgAlt);
      setModalOpen(true);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 font-mono text-center px-4">
        <div className="p-4 border border-editorial-accent text-editorial-accent">
          <AlertCircle size={48} strokeWidth={1} />
        </div>
        <div>
          <h3 className="text-xl font-bold uppercase tracking-widest text-editorial-accent mb-2">Access Denied // {error}</h3>
          <p className="text-[#555] text-xs uppercase tracking-[0.2em]">Contact SysAdmin or retry search.</p>
        </div>
        <button 
          onClick={onBack} 
          className="px-8 py-3 bg-editorial-accent text-white font-bold uppercase tracking-[0.3em] text-xs hover:bg-white hover:text-black transition-all"
        >
          Return to Entry Point
        </button>
      </div>
    );
  }

  if (isLoading || !character) {
    return <DetailSkeleton onBack={onBack} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-6 py-12 relative z-10"
    >
      <ImageModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        imageUrl={modalImage} 
        title={modalTitle} 
      />

      <button
        onClick={onBack}
        className="group mb-12 inline-flex items-center gap-4 text-[#555] hover:text-editorial-accent transition-colors font-mono text-[10px] uppercase tracking-[0.4em]"
      >
        <span className="p-2 border border-editorial-border transition-colors group-hover:border-editorial-accent">
          <ChevronLeft size={14} />
        </span>
        Return to Selection
      </button>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Column 1: Hero Image & Vertical Identity */}
        <div className="lg:col-span-4 h-full border-l border-editorial-border pl-6">
          <motion.div
            layoutId={`img-${character.id}`}
            className="w-full aspect-[3/4] bg-[#050505] border border-white/5 overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] cursor-zoom-in relative group"
            onClick={() => {
              setModalImage(character.image.super_url || character.image.screen_url || character.image.medium_url);
              setModalTitle(character.name);
              setModalOpen(true);
            }}
          >
            <img
              referrerPolicy="no-referrer"
              src={character.image.super_url || character.image.screen_url || character.image.medium_url}
              alt={character.name}
              className="absolute inset-0 w-full h-full object-contain p-2"
            />
          </motion.div>
          <div className="mt-8 flex flex-col gap-2">
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-6xl md:text-7xl font-black italic uppercase leading-[0.85] tracking-tighter text-editorial-accent"
            >
              {character.name.split(' ').map((part, i) => (
                <span key={i} className="block">{part}</span>
              ))}
            </motion.h1>
            <div className="text-[10px] mt-4 uppercase tracking-[0.3em] font-mono text-[#444] border-t border-editorial-border pt-4">
              Database UID: {character.id} // SEC-A
            </div>
          </div>
        </div>

        {/* Column 2: Biography & Abilities */}
        <div className="lg:col-span-5 flex flex-col gap-12">
          {character.deck && (
            <div className="border-b border-editorial-border pb-8">
              <h2 className="text-[10px] uppercase tracking-[0.5em] text-editorial-accent mb-6 font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-editorial-accent rounded-full" />
                Summary
              </h2>
              <p className="text-xl font-bold italic text-white leading-tight tracking-tight uppercase border-l-2 border-editorial-accent pl-4">
                {character.deck}
              </p>
            </div>
          )}
          
          <div className="border-b border-editorial-border pb-8">
            <h2 className="text-[10px] uppercase tracking-[0.5em] text-editorial-accent mb-6 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-editorial-accent rounded-full animate-pulse" />
              Biography
            </h2>
            <div 
              ref={bioRef}
              onClick={handleBioClick}
              className="text-lg text-[#AAA] leading-relaxed font-serif italic selection:text-white selection:bg-editorial-accent/30 pr-6 custom-scrollbar max-h-[450px] overflow-y-auto overflow-x-hidden scroll-smooth [&_img]:cursor-zoom-in [&_img]:border [&_img]:border-editorial-border [&_img]:my-6 [&_img]:max-w-full [&_img]:h-auto"
            >
              {character.description ? (
                <div 
                  className="editorial-rich-text prose prose-invert prose-sm max-w-none break-words" 
                  dangerouslySetInnerHTML={{ __html: character.description }} 
                />
              ) : (
                <p>Biographical records for this subject are currently classified or unavailable.</p>
              )}
            </div>
          </div>

          <div>
             <h2 className="text-[10px] uppercase tracking-[0.5em] text-editorial-accent mb-6 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-editorial-accent rounded-full" />
              Manifested Abilities
            </h2>
            <div className="flex flex-wrap gap-2">
              {character.powers?.length > 0 ? (
                character.powers.map((power) => (
                  <span
                    key={power.id}
                    className="px-3 py-1.5 border border-editorial-border text-[10px] uppercase tracking-widest font-bold bg-[#111] hover:bg-editorial-accent hover:border-editorial-accent hover:text-white transition-all cursor-default"
                  >
                    {power.name}
                  </span>
                ))
              ) : (
                <span className="text-[#444] font-mono text-[9px] uppercase tracking-widest">No spectral data detected.</span>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Logistics & Arcs */}
        <div className="lg:col-span-3 border-l border-editorial-border pl-8 flex flex-col gap-12">
           <div>
            <h2 className="text-[10px] uppercase tracking-[0.5em] text-editorial-accent mb-6 font-bold">Logistics</h2>
            <div className="text-[10px] text-[#555] font-mono leading-loose tracking-widest uppercase">
              Field List: Expanded<br />
              Sync Status: 100%<br />
              Credits: {character.issue_credits.length}<br />
              Arcs: {character.story_arc_credits.length}
            </div>
          </div>

          <div>
            <h2 className="text-[10px] uppercase tracking-[0.5em] text-editorial-accent mb-6 font-bold">Story Arc Credits</h2>
            <ul className="space-y-4">
              {character.story_arc_credits?.slice(0, 10).map((arc) => (
                <li key={arc.id} className="flex items-start gap-3 group transition-transform hover:translate-x-1">
                  <span className="mt-1.5 w-1 h-1 bg-editorial-accent opacity-30 group-hover:opacity-100 shrink-0" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#888] group-hover:text-editorial-text transition-colors">
                    {arc.name}
                  </span>
                </li>
              ))}
              {character.story_arc_credits.length > 10 && (
                <li className="text-[9px] font-mono text-[#444] uppercase tracking-widest pt-4 italic">
                  + {character.story_arc_credits.length - 10} additional entries
                </li>
              )}
              {character.story_arc_credits.length === 0 && (
                <p className="text-[#444] font-mono text-[9px] uppercase tracking-widest italic">No archival arc data found.</p>
              )}
            </ul>
          </div>
        </div>
      </main>

      {/* Gallery Section */}
      <section className="mt-20 pt-16 border-t border-editorial-border relative">
        <div className="absolute top-[-1px] left-0 w-32 h-[2px] bg-editorial-accent" />
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Issue Cover Archive</h2>
            <div className="text-[10px] font-mono text-[#444] tracking-[0.3em] uppercase">
              Syncing latest 20 units
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-4">
          <AnimatePresence>
            {issues.map((issue, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="group relative flex flex-col bg-[#0d0d0d] border border-editorial-border hover:border-editorial-accent/50 transition-all duration-500 cursor-zoom-in"
                onClick={() => {
                  setModalImage(issue.image.medium_url || issue.image.thumb_url);
                  setModalTitle(`${issue.volume.name} #${issue.issue_number}`);
                  setModalOpen(true);
                }}
              >
                <div className="aspect-[2/3] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                  <img
                    referrerPolicy="no-referrer"
                    src={issue.image.medium_url || issue.image.thumb_url}
                    alt={issue.volume.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                {/* Visual Accent */}
                <div className="h-1 w-full bg-editorial-border group-hover:bg-editorial-accent transition-colors origin-left scale-x-0 group-hover:scale-x-100 duration-500" />
                <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 absolute bottom-0 left-0 right-0 bg-editorial-bg/90 backdrop-blur-sm border-t border-editorial-border translate-y-2 group-hover:translate-y-0 duration-300">
                   <p className="text-[8px] font-bold text-editorial-accent uppercase truncate tracking-tighter">{issue.volume.name}</p>
                   <p className="text-[10px] font-black text-white italic truncate tracking-widest">#{issue.issue_number}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && issues.length === 0 && (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1 border border-editorial-border p-1">
                <Skeleton className="aspect-[2/3] w-full bg-[#111]" />
                <Skeleton className="h-1 w-full bg-[#111]" />
              </div>
            ))
          )}
        </div>
        
        <div className="flex justify-between items-center mt-8 border-t border-editorial-border/30 pt-4">
          <span className="text-[9px] uppercase tracking-widest text-[#333] font-mono">Archive // Query_Complete</span>
          <span className="text-[9px] uppercase tracking-widest text-[#333] font-mono">Protocol Editorial-02</span>
        </div>
      </section>
    </motion.div>
  );
}

function DetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse relative min-h-[80vh]">
      {/* Central High-Visibility Loading Indicator */}
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-editorial-bg/40 backdrop-blur-[2px]">
        <div className="relative flex flex-col items-center gap-10">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 border-[8px] border-editorial-accent border-t-transparent rounded-full shadow-[0_0_100px_rgba(230,57,70,0.4)]" 
          />
          <div className="flex flex-col items-center gap-4 text-center">
            <h3 className="text-5xl font-black uppercase tracking-[0.4em] italic text-editorial-accent drop-shadow-[0_0_20px_rgba(230,57,70,0.5)]">
              LOADING...
            </h3>
            <div className="space-y-2">
              <div className="h-1 w-64 bg-editorial-accent/20 overflow-hidden">
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full bg-editorial-accent"
                />
              </div>
              <span className="block text-[10px] font-mono tracking-[0.8em] text-[#666] uppercase">SYNCHRONIZING_MULTIVERSAL_ARCHIVE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <Skeleton className="h-8 w-48 bg-[#111]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 opacity-10">
        <div className="lg:col-span-4 border-l border-editorial-border pl-6">
           <Skeleton className="w-full aspect-[3/4] bg-[#111]" />
           <div className="mt-8 space-y-4">
              <Skeleton className="h-16 w-full bg-[#111]" />
              <Skeleton className="h-16 w-3/4 bg-[#111]" />
           </div>
        </div>
        <div className="lg:col-span-8 flex flex-col gap-12">
           <Skeleton className="h-32 w-full bg-[#111]" />
           <Skeleton className="h-64 w-full bg-[#111]" />
           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                 <Skeleton className="h-8 w-full bg-[#111]" />
                 <Skeleton className="h-20 w-full bg-[#111]" />
              </div>
              <div className="space-y-4">
                 <Skeleton className="h-8 w-full bg-[#111]" />
                 <Skeleton className="h-20 w-full bg-[#111]" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
