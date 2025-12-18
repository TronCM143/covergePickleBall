"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-extrabold">Pickleball Court Reservation</h1>
      <p className="mt-4 text-slate-600">
        Book your court easily — single or recurring sessions.
      </p>
      <Button
        className="mt-8"
        onClick={() => router.push("/login")}
      >
        Get Started
      </Button>
    </main>
  );
}
