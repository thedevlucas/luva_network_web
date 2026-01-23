import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@/app/shared/routes";

export function usePlayer(username: string) {
  return useQuery({
    queryKey: [api.players.get.path, username],
    queryFn: async () => {
      if (!username) return null;
      const url = buildUrl(api.players.get.path, { username });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch player");
      return api.players.get.responses[200].parse(await res.json());
    },
    enabled: !!username,
  });
}
