"use client";

import { BookingProvider } from "@/app/context/bookingContext";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <BookingProvider>
            <AnimatePresence mode="wait">
                <motion.div
                    key="booking-layout"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="min-h-screen bg-slate-50 flex flex-col"
                >
                    {/* Sticky Header */}
                    <header className="sticky top-0 z-50 border-b bg-cyan-50">
                        <div className="container mx-auto lg:px-18 lg:py-5 px-10 py-4 flex justify-between items-center">
                            <h1 className="text-lg font-semibold">
                                Pickleball Court Reservation
                            </h1>
                        </div>
                    </header>

                <div
                        className="flex-1 flex items-start justify-center"
                        style={{
                            backgroundImage:
                                "url('https://images.alphacoders.com/115/1153879.jpg')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                        {/* Optional dark overlay */}
                        <div className="flex-1 w-full bg-black/40">
                            <main className="flex items-start justify-center lg:py-10 py-8 px-4">
                                {children}
                            </main>
                        </div>
                    </div>

                    {/* <footer className="border-t bg-transparent">
                        <div className="container mx-auto px-4 py-3 text-center text-xs text-muted-foreground">
                            © {new Date().getFullYear()} Pickleball Reservation System
                        </div>
                    </footer> */}
                </motion.div>
            </AnimatePresence>
        </BookingProvider>
    );
}
