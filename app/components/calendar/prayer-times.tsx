"use client";

import { useState, useEffect } from "react";
import styles from "@/app/calendar/calendar.module.css";

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export default function PrayerTimesCard() {
  const [timings, setTimings] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch via our server-side proxy to avoid CORS / Failed-to-fetch errors
    async function fetchByCoords(lat: number, lng: number) {
      const res = await fetch(
        `/api/prayer-times?lat=${lat}&lng=${lng}&method=2`,
      );
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      setTimings(data.data.timings);
      setLocationName(data.data.meta.timezone);
    }

    async function fetchByCity(cityName: string, country = "UK") {
      const res = await fetch(
        `/api/prayer-times?city=${encodeURIComponent(cityName)}&country=${encodeURIComponent(country)}&method=2`,
      );
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      setTimings(data.data.timings);
      setLocationName(`${cityName}, ${country}`);
    }

    async function init() {
      try {
        setLoading(true);
        setError(null);

        // Try geolocation first
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
            }),
        );
        await fetchByCoords(
          position.coords.latitude,
          position.coords.longitude,
        );
      } catch (geoErr) {
        // Geolocation failed – fall back to London
        try {
          await fetchByCity("London");
        } catch (cityErr: any) {
          console.error("Prayer times fetch failed:", cityErr);
          setError("Could not load prayer times.");
        }
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  if (loading) {
    return (
      <div className={styles.prayerTimesCard}>
        <p className={styles.loadingText}>Loading prayer times…</p>
      </div>
    );
  }

  if (error || !timings) {
    return (
      <div className={styles.prayerTimesCard}>
        <p className={styles.errorText}>
          {error ?? "Prayer times unavailable."}
        </p>
      </div>
    );
  }

  const prayers = [
    { name: "Fajr", time: timings.Fajr },
    { name: "Sunrise", time: timings.Sunrise },
    { name: "Dhuhr", time: timings.Dhuhr },
    { name: "Asr", time: timings.Asr },
    { name: "Maghrib", time: timings.Maghrib },
    { name: "Isha", time: timings.Isha },
  ];

  // Determine the next upcoming prayer
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  let nextPrayerIndex = -1;
  for (let i = 0; i < prayers.length; i++) {
    const [h, m] = prayers[i].time.split(":").map(Number);
    if (h * 60 + m > nowMinutes) {
      nextPrayerIndex = i;
      break;
    }
  }

  return (
    <div className={styles.prayerTimesCard}>
      {locationName && <p className={styles.prayerLocation}>{locationName}</p>}
      <ul className={styles.prayerList}>
        {prayers.map((p, i) => (
          <li
            key={p.name}
            className={`${styles.prayerItem} ${i === nextPrayerIndex ? styles.nextPrayer : ""}`}
          >
            <span className={styles.prayerName}>{p.name}</span>
            <span className={styles.prayerTime}>{p.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
