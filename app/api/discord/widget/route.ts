import { NextResponse } from "next/server";

const GUILD_ID = 1093811354147762206; // no NEXT_PUBLIC

export async function GET() {
  if (!GUILD_ID) {
    return NextResponse.json(
      { presence_count: 0, members: [] },
      { status: 200 }
    );
  }

  const url = `https://discord.com/api/guilds/1093811354147762206/widget.json`;

  const res = await fetch(url, {
    // cache control del lado server (evita rate-limit y estabiliza el UI)
    next: { revalidate: 15 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { presence_count: 0, members: [] },
      { status: 200 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data, { status: 200 });
}
