import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/app/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
}

export function Card({ children, className, delay = 0, hoverEffect = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={hoverEffect ? { y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)" } : {}}
      className={cn(
        "bg-card/90 backdrop-blur-sm border-2 border-card-border rounded-xl p-6 shadow-xl relative overflow-hidden",
        "before:absolute before:inset-0 before:bg-[url('/images/texture-noise.png')] before:opacity-5 before:pointer-events-none", // Subtle texture suggestion
        className
      )}
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-accent/50 rounded-tl-sm" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-accent/50 rounded-tr-sm" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-accent/50 rounded-bl-sm" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-accent/50 rounded-br-sm" />
      
      {children}
    </motion.div>
  );
}
