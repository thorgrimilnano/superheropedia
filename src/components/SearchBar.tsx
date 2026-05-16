import { Search, Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ComicVineCharacter, searchCharacters } from "../services/comicVine";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSelectResult: (character: ComicVineCharacter) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, onSelectResult, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ComicVineCharacter[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsTyping(true);
        try {
          const results = await searchCharacters(query);
          setSuggestions(results?.slice(0, 6) || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Suggestion error:", error);
        } finally {
          setIsTyping(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto z-50" ref={dropdownRef}>
      <motion.form
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onSubmit={handleSubmit}
        className="relative group"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder="SEARCH DATABASE..."
          className="w-full px-6 py-4 pl-14 text-sm bg-[#050505] border border-editorial-border focus:outline-none focus:border-editorial-accent placeholder:text-[#333] uppercase tracking-[0.3em] font-mono transition-all duration-300 group-hover:border-[#444] text-editorial-text"
        />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-editorial-accent transition-colors">
          {isTyping ? <Loader2 size={18} className="animate-spin text-editorial-accent" /> : <Search size={20} />}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-2 h-10 w-10 border border-editorial-border flex items-center justify-center cursor-pointer hover:bg-editorial-accent hover:border-editorial-accent text-editorial-text transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <span className={isLoading ? "animate-spin" : "font-bold"}>
            {isLoading ? "•" : "+"}
          </span>
        </button>
      </motion.form>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d0d] border border-editorial-border shadow-2xl overflow-hidden"
          >
            {suggestions.map((char) => (
              <div
                key={char.id}
                onClick={() => {
                  onSelectResult(char);
                  setShowSuggestions(false);
                  setQuery(char.name);
                }}
                className="group flex items-center gap-4 p-4 hover:bg-[#151515] cursor-pointer border-b border-editorial-border/30 last:border-none transition-colors"
              >
                <div className="w-10 h-10 shrink-0 bg-[#111] overflow-hidden border border-white/5">
                  <img
                    referrerPolicy="no-referrer"
                    src={char.image.thumb_url}
                    alt={char.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-editorial-accent tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 italic">Character Selection</span>
                  <span className="text-sm font-bold uppercase tracking-tight text-editorial-text group-hover:text-white">{char.name}</span>
                </div>
              </div>
            ))}
            <div className="p-3 bg-[#0a0a0a] border-t border-editorial-border text-center">
               <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-[#333]">Query Results // Limited to 6</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
