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
                    <header className="sticky top-0 z-50 border-b bg-white">
                        <div className="container mx-auto lg:px-18 lg:py-5 px-10 py-4 flex justify-between items-center">
                            <h1 className="text-lg font-semibold">
                                Pickleball Court Reservation
                            </h1>
                        </div>
                    </header>

                    {/* Content (padding-top prevents overlap) */}
                    <main className="flex-1 flex items-start justify-center lg:py-10 py-8 px-4">
                        {children}
                    </main>

                    <footer className="border-t bg-white">
                        <div className="container mx-auto px-4 py-3 text-center text-xs text-muted-foreground">
                            © {new Date().getFullYear()} Pickleball Reservation System
                        </div>
                    </footer>
                </motion.div>
            </AnimatePresence>
        </BookingProvider>
    );
}
