"use client";

import React, { createContext, useContext, useState } from "react";
import { DateRange } from "react-day-picker";

interface BookingContextType {
    /* User details */
    firstName: string;
    setFirstName: (v: string) => void;
    lastName: string;
    setLastName: (v: string) => void;
    gcash: string;
    setGcash: (v: string) => void;

    /* Calendar */
    baseRange: DateRange | undefined;
    setBaseRange: (v: DateRange | undefined) => void;
    selectedDates: Date[];
    setSelectedDates: (v: Date[]) => void;

    repeatCount: number;
    setRepeatCount: (v: number) => void;

    /* Time */
    startTime: string;
    setStartTime: (v: string) => void;
    endTime: string;
    setEndTime: (v: string) => void;

    /* Pricing */
    totalAmount: number;
    setTotalAmount: (v: number) => void;

    /* Reset */
    resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [gcash, setGcash] = useState("");

    const [baseRange, setBaseRange] = useState<DateRange | undefined>();
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    const [repeatCount, setRepeatCount] = useState(1);

    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [totalAmount, setTotalAmount] = useState(0);

    const resetBooking = () => {
        setFirstName("");
        setLastName("");
        setGcash("");
        setBaseRange(undefined);
        setSelectedDates([]);
        setRepeatCount(1);
        setStartTime("");
        setEndTime("");
        setTotalAmount(0);
    };

    return (
        <BookingContext.Provider
            value={{
                firstName,
                setFirstName,
                lastName,
                setLastName,
                gcash,
                setGcash,

                baseRange,
                setBaseRange,
                selectedDates,
                setSelectedDates,
                
                repeatCount,
                setRepeatCount,

                startTime,
                setStartTime,
                endTime,
                setEndTime,

                totalAmount,
                setTotalAmount,

                resetBooking,
            }}
        >
            {children}
        </BookingContext.Provider>
    );
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error("useBooking must be used within BookingProvider");
    }
    return context;
}
