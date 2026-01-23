'use client';

import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/app/lib/utils";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-primary text-white border-b-4 border-primary/50 hover:bg-primary/90 hover:border-primary/60",
      secondary: "bg-secondary text-secondary-foreground border-b-4 border-black/20 hover:bg-secondary/80",
      accent: "bg-accent text-accent-foreground border-b-4 border-yellow-600 hover:bg-accent/90",
      ghost: "bg-transparent text-white hover:bg-white/10 border-none shadow-none",
    };

    const sizes = {
      sm: "px-3 py-1 text-sm rounded-lg",
      md: "px-6 py-3 text-base rounded-xl",
      lg: "px-8 py-4 text-lg font-bold rounded-2xl",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95, y: 1 }}
        className={cn(
          "font-display uppercase tracking-wider relative transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed shadow-lg cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
