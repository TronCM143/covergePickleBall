"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/landingPage"); // replace = no back button
  }, [router]);

  return null; // or a loading spinner
}
