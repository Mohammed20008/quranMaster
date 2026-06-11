import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for Al-Adhan prayer times API.
 * Called from the client as:
 *   /api/prayer-times?lat=51.5&lng=-0.1          (by coordinates)
 *   /api/prayer-times?city=London&country=UK      (by city name)
 *
 * This avoids CORS and "Failed to fetch" issues that arise when the
 * browser calls the external API directly in some environments.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const city = searchParams.get("city");
  const country = searchParams.get("country") ?? "UK";
  const method = searchParams.get("method") ?? "2";

  let upstreamUrl: string;

  if (lat && lng) {
    upstreamUrl = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}`;
  } else if (city) {
    upstreamUrl = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
  } else {
    return NextResponse.json(
      { error: "Provide either lat+lng or city query params" },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 }, // cache for 5 minutes
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Upstream error: ${res.status}`, detail: text },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[prayer-times API] fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to reach Al-Adhan API", detail: err?.message },
      { status: 502 },
    );
  }
}
