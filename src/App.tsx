import { useState } from "react";
import { SearchBar } from "./components/SearchBar";
import { CharacterGrid } from "./components/CharacterGrid";
import { CharacterDetail } from "./components/CharacterDetail";
import { CardSkeleton } from "./components/Skeleton";
import { ComicVineCharacter, searchCharacters } from "./services/comicVine";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Hammer, Zap, AlertCircle } from "lucide-react";

type ViewState = {
  type: "home" | "detail";
  characterId?: string;
};

export default function App() {
  const [view, setView] = useState<ViewState>({ type: "home" });
  const [characters, setCharacters] = useState<ComicVineCharacter[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    try {
      setIsSearching(true);
      setError(null);
      setHasSearched(true);
      const results = await searchCharacters(query);
      setCharacters(results || []);
    } catch (err) {
      setError("Failed to fetch characters. Please verify your API key.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCharacter = (char: ComicVineCharacter) => {
    // Comic Vine characters have api_detail_url which contains the ID in the format 4005-XXXX
    const id = char.api_detail_url.split('/').filter(Boolean).pop(); // Get last part instead
    // Actually, searching for a more robust way as IDs are often at the end
    const match = char.api_detail_url.match(/4005-\d+/);
    const charId = match ? match[0] : char.id.toString();
    
    setView({ type: "detail", characterId: charId });
  };

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text selection:bg-editorial-accent selection:text-white font-sans">
      {/* Ambient Watermark */}
      <div className="fixed top-[-10%] right-[-5%] text-[#111111] font-black text-[30vw] leading-none z-0 pointer-events-none select-none">
        01
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-editorial-bg/90 backdrop-blur-xl z-40 border-b border-editorial-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex flex-col cursor-pointer group"
            onClick={() => setView({ type: "home" })}
          >
            <span className="text-editorial-accent font-mono text-[10px] tracking-[0.4em] uppercase mb-0.5 transition-colors group-hover:text-white">Database Entry // Character</span>
            <h1 className="text-2xl font-bold tracking-tighter uppercase italic group-hover:text-editorial-accent transition-colors">SuperheroPedia</h1>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-[#555]">
            <span className="hover:text-editorial-accent cursor-pointer transition-colors border-b border-transparent hover:border-editorial-accent pb-1">Characters</span>
            <span className="hover:text-editorial-accent cursor-pointer transition-colors border-b border-transparent hover:border-editorial-accent pb-1">Issues</span>
            <span className="hover:text-editorial-accent cursor-pointer transition-colors border-b border-transparent hover:border-editorial-accent pb-1">Volumes</span>
            <div className="w-8 h-8 border border-editorial-border flex items-center justify-center cursor-pointer hover:bg-editorial-accent hover:border-editorial-accent text-editorial-text transition-all">
              <span className="text-lg">+</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-20">
        <AnimatePresence mode="wait">
          {view.type === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4"
            >
              {/* Hero Hero Section */}
              <div className="text-center mb-24 space-y-4 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block px-4 py-1 border border-editorial-accent/30 rounded-full mb-4"
                >
                  <span className="text-editorial-accent font-mono text-[10px] tracking-[0.5em] uppercase font-bold">Protocol Alpha-02</span>
                </motion.div>
                <motion.h2 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-8 italic"
                >
                  Explore the <br /> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-editorial-text to-[#333]">Multiverse</span>
                </motion.h2>
                <p className="text-sm font-mono text-[#555] tracking-[0.2em] uppercase max-w-xl mx-auto">
                  Accessing restricted character database...
                </p>
              </div>

              <div className="mb-20 relative z-50">
                <SearchBar 
                  onSearch={handleSearch} 
                  onSelectResult={handleSelectCharacter}
                  isLoading={isSearching} 
                />
              </div>

              {error && (
                <div className="flex items-center justify-center gap-3 p-6 bg-[#0a0000] text-editorial-accent rounded-none border border-editorial-accent/30 max-w-lg mx-auto mb-12 font-mono text-xs uppercase tracking-widest">
                  <AlertCircle size={16} />
                  <p>{error}</p>
                </div>
              )}

              {isSearching ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <>
                  {characters.length > 0 ? (
                    <CharacterGrid
                      characters={characters}
                      onSelect={handleSelectCharacter}
                    />
                  ) : (
                    hasSearched && !isSearching && (
                      <div className="text-center py-32 border border-editorial-border bg-[#0d0d0d]/50">
                        <div className="inline-flex p-8 border border-editorial-accent/20 rounded-full mb-8">
                          <Zap size={48} className="text-editorial-accent opacity-20" />
                        </div>
                        <h3 className="text-2xl font-bold text-white uppercase tracking-tighter italic mb-4">No results in designated sector</h3>
                        <p className="text-[#555] font-mono text-xs uppercase tracking-[0.2em]">Recalibrate search parameters (Ex: "Superman", "Flash").</p>
                      </div>
                    )
                  )}
                  
                  {!hasSearched && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-32 relative z-10">
                      <div className="p-10 border-l border-editorial-border space-y-6 hover:bg-[#111] transition-colors group">
                        <div className="text-editorial-accent opacity-40 group-hover:opacity-100 transition-opacity"><Zap fill="currentColor" size={32} /></div>
                        <h4 className="text-xs uppercase tracking-[0.4em] font-bold text-editorial-accent">Vast Knowledge</h4>
                        <p className="text-[#888] text-sm leading-loose font-serif italic">Access stats, powers, and histories for every character in recorded comic history.</p>
                      </div>
                      <div className="p-10 border-l border-editorial-border space-y-6 hover:bg-[#111] transition-colors group">
                        <div className="text-editorial-accent opacity-40 group-hover:opacity-100 transition-opacity"><Hammer fill="currentColor" size={32} /></div>
                        <h4 className="text-xs uppercase tracking-[0.4em] font-bold text-editorial-accent">Issue Tracking</h4>
                        <p className="text-[#888] text-sm leading-loose font-serif italic">Deep dive into every single appearance and credit within the story arcs.</p>
                      </div>
                      <div className="p-10 border-l border-editorial-border space-y-6 hover:bg-[#111] transition-colors group">
                        <div className="text-xs font-mono tracking-[0.3em] font-bold text-editorial-accent">STATUS // ONLINE</div>
                        <h4 className="text-xs uppercase tracking-[0.4em] font-bold text-editorial-accent">Database Size</h4>
                        <p className="text-[#888] text-sm leading-loose font-serif italic">Backed by the Comic Vine API, providing 400K+ accurate metadata entries.</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CharacterDetail
                id={view.characterId!}
                onBack={() => setView({ type: "home" })}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-editorial-border bg-[#050505] relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-editorial-accent" />
              <span className="font-extrabold uppercase tracking-tighter text-xl italic">SuperheroPedia</span>
            </div>
            <span className="text-[10px] font-mono tracking-[0.5em] text-[#444] uppercase">Archive System v1.4.2</span>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#555]">
              Powered by Comic Vine API // All Data Protected
            </p>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-editorial-accent animate-pulse" />
                 <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#444]">System Online</span>
               </div>
               <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#444]">// Sector Red-Alpha</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
