import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@/app/shared/routes";

interface ArenaStats {
  username: string;
  uuid: string;
  avatarUrl: string;
  rank: string;
  informalKills: number;
  informalWins: number;
  competitiveKills: number;
  competitiveWins: number;
  totalKills: number;
  totalWins: number;
}

export function useArenaLeaderboard() {
  return useQuery({
    queryKey: ["/api/arena/leaderboard"],
    queryFn: async () => {
      const url = buildUrl("/api/arena/leaderboard", {});
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch arena leaderboard");
      return res.json() as Promise<ArenaStats[]>;
    },
    staleTime: 30_000,
  });
}

export function useLeaderboard(gameMode: string, metric: string) {
  return useQuery({
    queryKey: [api.leaderboard.list.path, gameMode, metric],
    queryFn: async () => {
      const url = buildUrl(api.leaderboard.list.path, { gameMode, metric });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return api.leaderboard.list.responses[200].parse(await res.json());
    },
  });
}

export function usePlayersCount() {
  return useQuery({
    queryKey: ["/api/players/count"],
    queryFn: async () => {
      const url = buildUrl("/api/players/count", {});
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch players count");

      const data = await res.json();

      if (data && typeof data.total === "number") return data.total;

      throw new Error("Unexpected players count response shape");
    },
    staleTime: 30_000,
  });
}



export function usePlayersCountHours() {
  return useQuery({
    queryKey: ["/api/players/hours_count"],
    queryFn: async () => {
      const url = buildUrl("/api/players/hours_count", {});
      const res = await fetch(url, { credentials: "include" });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed hours_count (${res.status}): ${text}`);
      }

      const data = await res.json();

      if (typeof data?.totalHours === "number") return data.totalHours;
      if (typeof data?.totalSeconds === "number") {
        return Math.round((data.totalSeconds / 3600) * 100) / 100;
      }

      throw new Error("Unexpected hours_count response shape");
    },

    retry: 0,

    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}