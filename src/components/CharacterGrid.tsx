import React from "react";
import { motion } from "motion/react";
import { ComicVineCharacter } from "../services/comicVine";

interface CharacterCardProps {
  character: ComicVineCharacter;
  onClick: (character: ComicVineCharacter) => void;
  key?: React.Key;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  return (
    <motion.div
      layoutId={`card-${character.id}`}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(character)}
      className="group cursor-pointer bg-[#0D0D0D] overflow-hidden border border-editorial-border transition-all duration-500 hover:border-editorial-accent/50"
    >
      <div className="aspect-[3/4] overflow-hidden bg-[#111] relative">
        <motion.img
          layoutId={`img-${character.id}`}
          referrerPolicy="no-referrer"
          src={character.image.medium_url || character.image.thumb_url}
          alt={character.name}
          className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105"
        />
        <div className="absolute inset-0 border-[1px] border-inset border-white/5 pointer-events-none" />
      </div>
      <div className="p-5 border-t border-editorial-border relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-editorial-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
        
        <div className="flex flex-col gap-1">
          <span className="text-editorial-accent font-mono text-[9px] tracking-[0.4em] uppercase opacity-50 group-hover:opacity-100 transition-opacity">Record // {character.id}</span>
          <h3 className="text-xl font-bold text-editorial-text uppercase italic tracking-tighter group-hover:text-white transition-colors truncate">
            {character.name}
          </h3>
          {character.deck && (
            <p className="mt-2 text-[10px] text-[#555] font-mono uppercase tracking-widest line-clamp-2 leading-relaxed group-hover:text-[#888] transition-colors">
              {character.deck}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface CharacterGridProps {
  characters: ComicVineCharacter[];
  onSelect: (character: ComicVineCharacter) => void;
}

export function CharacterGrid({ characters, onSelect }: CharacterGridProps) {
  if (characters.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {characters.map((char) => (
        <CharacterCard key={char.id} character={char} onClick={onSelect} />
      ))}
    </div>
  );
}
