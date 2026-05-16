import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, title }: ImageModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-editorial-bg/98 backdrop-blur-3xl overflow-hidden"
          onClick={onClose}
        >
          {/* Top-Right Fixed Close Button */}
          <div className="absolute top-24 right-6 md:top-28 md:right-12 z-[110]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex items-center gap-3 px-6 py-3 bg-editorial-accent text-white font-mono text-sm uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-[0_0_40px_rgba(230,57,70,0.4)] group cursor-pointer border-none"
            >
              Close <X size={24} className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div className="w-full flex justify-between items-end px-2">
              <div className="text-[11px] font-mono tracking-[0.5em] text-editorial-accent uppercase animate-pulse">
                Archive // Visual_Inspection // Decrypting_Data
              </div>
            </div>

            <div className="relative border border-editorial-border bg-[#000] overflow-hidden group shadow-[0_0_80px_rgba(0,0,0,1)]">
              <img
                src={imageUrl}
                alt={title || "Enlarged view"}
                className="max-w-full max-h-[75vh] object-contain transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                {title && (
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white border-l-4 border-editorial-accent pl-4">
                    {title}
                  </h3>
                )}
              </div>
            </div>
            {title && (
               <div className="text-[10px] font-mono tracking-[0.5em] uppercase text-[#333] border-t border-editorial-border/30 pt-4 w-full text-center">
                 Subject Integrity: Verified // Record_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
               </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
