'use client';

import { motion } from "framer-motion";
import { Crown, Medal, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";

interface LeaderboardEntry {
  username: string;
  avatarUrl: string;
  rank: string;
  value: number;
}

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  isLoading: boolean;
  metricLabel: string;
}

export function LeaderboardTable({ data, isLoading, metricLabel }: LeaderboardTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-[#1a1a24] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="text-center py-12 bg-[#1a1a24]/50 rounded-xl border border-dashed border-white/10">
        <p className="text-gray-400 font-mono">No se encontraron jugadores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5">
        <div className="col-span-1 text-center">Pos</div>
        <div className="col-span-7">Jugador</div>
        <div className="col-span-4 text-right">{metricLabel}</div>
      </div>

      {data.map((entry, index) => {
        const position = index + 1;
        let PositionIcon = null;
        let positionColor = "text-gray-400";
        let bgClass = "bg-[#1a1a24]";

        if (position === 1) {
          PositionIcon = Crown;
          positionColor = "text-yellow-400";
          bgClass = "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20";
        } else if (position === 2) {
          PositionIcon = Medal;
          positionColor = "text-gray-300";
          bgClass = "bg-gradient-to-r from-gray-400/5 to-transparent";
        } else if (position === 3) {
          PositionIcon = Medal;
          positionColor = "text-amber-600";
          bgClass = "bg-gradient-to-r from-amber-600/5 to-transparent";
        }

        return (
          <motion.div
            key={entry.username}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              grid grid-cols-12 gap-4 items-center p-4 rounded-xl
              ${bgClass} hover:bg-white/5 transition-colors border border-white/5
            `}
          >
            <div className={`col-span-1 flex justify-center font-display text-xl ${positionColor}`}>
              {PositionIcon ? <PositionIcon className="w-6 h-6" /> : <span>#{position}</span>}
            </div>

            <div className="col-span-7 flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white/10">
                <AvatarImage src={entry.avatarUrl || "/placeholder.svg"} alt={entry.username} />
                <AvatarFallback className="bg-[#FFC107]/20 text-[#FFC107]">
                  {entry.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-white text-lg leading-none">{entry.username}</div>
                <div className="text-xs text-gray-500 font-mono mt-1 px-2 py-0.5 rounded bg-black/30 inline-block">
                  {entry.rank}
                </div>
              </div>
            </div>

            <div className="col-span-4 text-right font-mono text-xl text-[#FFC107] font-bold">
              {entry.value.toLocaleString()}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
