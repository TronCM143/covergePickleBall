"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ConfirmationDialog from "@/app/payment/confimation/page";
import SuccessDialog from "@/app/payment/success/page";
import { useBooking } from "@/app/context/bookingContext";
import { SelectViewport } from "@radix-ui/react-select";
import { CircleX, X } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import AutoScroll from "embla-carousel-auto-scroll";

export default function BookingPage() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const courtImages = [
        "/courts/pickleball1.jpg",
        "/courts/pickleball2.jpg",
        "/courts/pickleball3.jpg",
        "/courts/pickleball4.jpg",
        "/courts/pickleball5.jpg",
        "/courts/pickleball6.jpg",
        "/courts/pickleball7.jpg",
    ];

    const {
        firstName,
        setFirstName,
        lastName,
        setLastName,
        gcash,
        setGcash,
        selectedDates,
        setSelectedDates,
        totalAmount,
        setTotalAmount,
    } = useBooking();

    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrImageUrl, setQrImageUrl] = useState<string>("");
    const [transactionId, setTransactionId] = useState<string>("");
    const [conflictDates, setConflictDates] = useState<Date[]>([]);

    const times = [
        "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM",
        "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
        "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
        "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
        "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
        "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
        "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM",
        "10:00 PM",
    ];

    const dummySchedules: Record<string, { start: string; end: string; courtid: string }[]> = {
        "2025-12-18": [
            { start: "8:00 AM", end: "9:00 AM", courtid: "Court A" },
            { start: "10:00 AM", end: "11:00 AM", courtid: "Court B" },
        ],
        "2025-12-19": [
            { start: "9:30 AM", end: "10:30 AM", courtid: "Court C" },
            { start: "1:00 PM", end: "3:00 PM", courtid: "Court A" },
        ],
    };

    const dummyCourts = ["Court A", "Court B", "Court C"];
    const [activeDateIndex, setActiveDateIndex] = useState(0);
    const [dateTimes, setDateTimes] = useState<Record<string, DateTimeInfo[]>>({});
    const sortedSelectedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    const activeKey = sortedSelectedDates[activeDateIndex]
        ? format(sortedSelectedDates[activeDateIndex], "yyyy-MM-dd")
        : "";

    interface DateTimeInfo {
        start: string;
        end: string;
        court: string;
    }

    const buildSlotsPayload = () => {
        const slots: {
            date: string;
            startTime: string;
            endTime: string;
            courtId: string;
        }[] = [];

        Object.entries(dateTimes).forEach(([date, ranges]) => {
            ranges.forEach((r) => {
                slots.push({
                    date,
                    startTime: r.start,
                    endTime: r.end,
                    courtId: r.court,
                });
            });
        });

        return slots;
    };

    useEffect(() => {
        const times: Record<string, DateTimeInfo[]> = {};
        selectedDates.forEach((d) => {
            const key = format(d, "yyyy-MM-dd");
            times[key] = dateTimes[key] || [{ start: "", end: "", court: "Court A" }];
        });
        setDateTimes(times);

        if (activeDateIndex >= selectedDates.length && selectedDates.length > 0) {
            setActiveDateIndex(0);
        }
    }, [selectedDates]);

    const timeToMinutes = (time: string) => {
        const [t, p] = time.split(" ");
        let [h, m] = t.split(":").map(Number);
        if (p === "PM" && h !== 12) h += 12;
        if (p === "AM" && h === 12) h = 0;
        return h * 60 + m;
    };

    const hasOverlap = (date: string, start: string, end: string, court: string) => {
        const bookings = dummySchedules[date] || [];
        return bookings.some(
            (b) =>
                b.courtid === court &&
                Math.max(timeToMinutes(b.start), timeToMinutes(start)) <
                Math.min(timeToMinutes(b.end), timeToMinutes(end))
        );
    };

    const timeOverlapsWithBooking = (date: string, time: string, court: string) => {
        const bookings = dummySchedules[date] || [];
        const timeMin = timeToMinutes(time);

        return bookings.some((b) => {
            if (b.courtid !== court) return false;
            const bookingStart = timeToMinutes(b.start);
            const bookingEnd = timeToMinutes(b.end);
            return timeMin >= bookingStart && timeMin < bookingEnd;
        });
    };

    const isStartTimeDisabled = (date: string, time: string, rangeIdx: number) => {
        const court = dateTimes[date]?.[0]?.court;
        if (!court) return false;

        const timeMin = timeToMinutes(time);

        if (timeOverlapsWithBooking(date, time, court)) return true;

        const ranges = dateTimes[date] || [];
        const isConflictingWithOtherRange = ranges.some((range, idx) => {
            if (idx === rangeIdx) return false;
            if (!range.start || !range.end) return false;
            const otherStart = timeToMinutes(range.start);
            const otherEnd = timeToMinutes(range.end);
            return timeMin >= otherStart && timeMin < otherEnd;
        });

        if (isConflictingWithOtherRange) return true;

        return false;
    };

    const isEndTimeDisabled = (date: string, time: string, rangeIdx: number, currentStartTime: string) => {
        const court = dateTimes[date]?.[0]?.court;
        if (!court) return false;

        const timeMin = timeToMinutes(time);
        const startMin = timeToMinutes(currentStartTime);

        if (timeMin <= startMin) return true;

        const bookings = dummySchedules[date] || [];
        const isConflictingWithBooking = bookings.some((b) => {
            if (b.courtid !== court) return false;
            const bookingStart = timeToMinutes(b.start);
            const bookingEnd = timeToMinutes(b.end);
            return startMin < bookingEnd && timeMin > bookingStart;
        });

        if (isConflictingWithBooking) return true;

        const ranges = dateTimes[date] || [];
        const isConflictingWithOtherRange = ranges.some((range, idx) => {
            if (idx === rangeIdx) return false;
            if (!range.start || !range.end) return false;
            const otherStart = timeToMinutes(range.start);
            const otherEnd = timeToMinutes(range.end);
            return startMin < otherEnd && timeMin > otherStart;
        });

        if (isConflictingWithOtherRange) return true;

        return false;
    };

    const hasConflictOnDate = (date: Date) => {
        const key = format(date, "yyyy-MM-dd");
        const ranges = dateTimes[key] || [];

        for (const r of ranges) {
            if (!r.start || !r.end) continue;
            if (hasOverlap(key, r.start, r.end, r.court)) {
                return true;
            }
        }
        return false;
    };

    useEffect(() => {
        let total = 0;
        Object.values(dateTimes).forEach((ranges) =>
            ranges.forEach((r) => {
                const hours = Math.max(0, timeToMinutes(r.end) - timeToMinutes(r.start)) / 60;
                total += hours * 200;
            })
        );
        setTotalAmount(total);
    }, [dateTimes, setTotalAmount]);

    useEffect(() => {
        const conflicts = selectedDates.filter(date => hasConflictOnDate(date));
        setConflictDates(conflicts);
    }, [dateTimes, selectedDates]);

    const applyToAllDates = () => {
        if (!activeKey) return;
        const currentRanges = dateTimes[activeKey];
        if (!currentRanges || currentRanges.length === 0) return;

        const updatedDateTimes = { ...dateTimes };
        selectedDates.forEach((date) => {
            const key = format(date, "yyyy-MM-dd");
            updatedDateTimes[key] = JSON.parse(JSON.stringify(currentRanges));
        });

        setDateTimes(updatedDateTimes);
    };

    const handleBooking = () => {
        if (!firstName.trim()) return alert("First name is required");
        if (!lastName.trim()) return alert("Last name is required");
        if (!gcash.trim()) return alert("GCash number is required");
        if (!selectedDates.length) return alert("Please select a date");

        for (const date of selectedDates) {
            const key = format(date, "yyyy-MM-dd");
            const ranges = dateTimes[key] || [];
            if (ranges.length === 0) {
                return alert(`No time range selected for ${format(date, "MMM dd, yyyy")}`);
            }
            for (const r of ranges) {
                if (!r.start || !r.end) {
                    return alert(`Incomplete time range for ${format(date, "MMM dd, yyyy")}`);
                }
                if (timeToMinutes(r.start) >= timeToMinutes(r.end)) {
                    return alert(`End time must be after start time for ${format(date, "MMM dd, yyyy")}`);
                }
                if (hasOverlap(key, r.start, r.end, r.court)) {
                    return alert(`Selected time overlaps with an existing booking on ${format(date, "MMM dd, yyyy")} for ${r.court}`);
                }
            }
        }

        if (conflictDates.length > 0) {
            const newSelectedDates = selectedDates.filter(
                date => !conflictDates.some(cd => cd.getTime() === date.getTime())
            );
            setSelectedDates(newSelectedDates);
            return alert(
                `${conflictDates.length} date(s) with conflicts have been removed. Please review and try again.`
            );
        }

        setIsConfirmOpen(true);
    };

    const submitBooking = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`${apiBaseUrl}/api/payments/create/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    gcashNumber: gcash,
                    slots: buildSlotsPayload(),
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Payment initialization failed");
            }

            const data = await res.json();

            setQrImageUrl(data.qrImageUrl);
            setTransactionId(data.transactionId);
            setShowQrModal(true);
            setIsConfirmOpen(false);

        } catch (error: any) {
            alert(error.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Poll for payment status every 3 seconds
    useEffect(() => {
        if (!showQrModal || !transactionId) return;

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`${apiBaseUrl}/api/payments/status/${transactionId}/`);
                const data = await res.json();

                if (data.status === "paid") {
                    setShowQrModal(false);
                    setIsSuccessOpen(true);
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error("Error checking payment status:", error);
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [showQrModal, transactionId, apiBaseUrl]);

    useEffect(() => {
        const status = searchParams.get("status");
        if (status === "success") {
            setIsSuccessOpen(true);
        }
    }, [searchParams]);

    return (
        <main className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto rounded-lg shadow-sm bg-white">
                <div className="relative overflow-hidden rounded-t-lg">
                    <Carousel
                        opts={{
                            loop: true,
                        }}
                        plugins={[
                            AutoScroll({
                                speed: 0.5
                            }),
                        ]}
                        className="w-full h-[260px]"
                    >
                        <CarouselContent>
                            {courtImages.map((img, idx) => (
                                <CarouselItem key={idx}>
                                    <div className="h-[260px] w-full">
                                        <img
                                            src={img}
                                            alt={`Pickleball court ${idx + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    <div className="absolute inset-0 bg-cyan-900/75" />

                    <div className="absolute inset-0 flex items-center">
                        <div className="px-6 sm:px-10 max-w-xl text-white">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-wide">
                                PICKLEBALL COURT
                                <br />
                                BOOKING FORM
                            </h1>
                            <p className="mt-2 text-sm sm:text-base text-emerald-100">
                                Reserve your preferred court and time slot below
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto rounded-b-lg border p-6 shadow-sm bg-white">
                    <div className="grid gap-4 sm:grid-cols-3 mb-6">
                        <div>
                            <label className="text-sm font-medium">First Name</label>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Jane"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Last Name</label>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">GCash Number</label>
                            <Input
                                type="number"
                                value={gcash}
                                onChange={(e) => setGcash(e.target.value)}
                                placeholder="+63XX-XXXX-XXXX"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 items-stretch">
                        <div className="flex items-stretch sm:col-span-1">
                            <div className="w-full flex flex-col gap-3">
                                <Calendar
                                    mode="multiple"
                                    required
                                    selected={selectedDates}
                                    onSelect={setSelectedDates}
                                    disabled={{ before: new Date() }}
                                    className="h-full w-full rounded-md border"
                                    modifiers={{
                                        conflict: conflictDates,
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:col-span-2 border p-4 rounded-md bg-white min-h-full">
                            {sortedSelectedDates.length > 0 && sortedSelectedDates[activeDateIndex] ? (
                                <>
                                    <div className="flex justify-between mb-4 items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={activeDateIndex === 0}
                                            onClick={() => setActiveDateIndex(activeDateIndex - 1)}
                                        >
                                            Prev
                                        </Button>
                                        <span className="text-sm font-medium text-center flex-1">
                                            {format(sortedSelectedDates[activeDateIndex], "MMM dd, yyyy")}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={activeDateIndex === sortedSelectedDates.length - 1}
                                            onClick={() => setActiveDateIndex(activeDateIndex + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                                        <div className="pt-2 pl-2">
                                            <div className="mb-2">
                                                <label className="text-sm font-medium">Court</label>
                                                <Select
                                                    value={dateTimes[activeKey]?.[0]?.court || dummyCourts[0]}
                                                    onValueChange={(v) =>
                                                        setDateTimes({
                                                            ...dateTimes,
                                                            [activeKey]: (dateTimes[activeKey] ?? [{ start: "8:00 AM", end: "9:00 AM", court: v }]).map(r => ({ ...r, court: v })),
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger className="my-2 py-2">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper" side="bottom" sideOffset={4} avoidCollisions={false}>
                                                        <SelectViewport className="max-h-60 overflow-y-auto">
                                                            {dummyCourts.map((c) => (
                                                                <SelectItem key={c} value={c} className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground">
                                                                    {c}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectViewport>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="mb-2">
                                                    <label className="text-sm font-medium">Pick Time Range</label>
                                                </div>

                                                {dateTimes[format(sortedSelectedDates[activeDateIndex], "yyyy-MM-dd")]?.map((range, idx) => (
                                                    <div key={idx} className="flex items-center w-full space-x-2">
                                                        <div className="flex flex-1 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm overflow-hidden bg-white dark:bg-gray-800">
                                                            <div className="flex-1">
                                                                <Select
                                                                    value={range.start}
                                                                    onValueChange={(v) => {
                                                                        const currentKey = format(sortedSelectedDates[activeDateIndex], "yyyy-MM-dd");
                                                                        const newRanges = [...dateTimes[currentKey]];
                                                                        newRanges[idx].start = v;
                                                                        setDateTimes({
                                                                            ...dateTimes,
                                                                            [currentKey]: newRanges,
                                                                        });
                                                                    }}
                                                                >
                                                                    <SelectTrigger id={`time-range-start-${idx}`} className="h-10 w-full rounded-none border-0 px-3 py-2 [&>svg]:hidden justify-center text-sm">
                                                                        <SelectValue placeholder="Start" />
                                                                    </SelectTrigger>
                                                                    <SelectContent
                                                                        position="popper"
                                                                        side="bottom"
                                                                        sideOffset={4}
                                                                        avoidCollisions={false}
                                                                    >
                                                                        <SelectViewport className="max-h-60 overflow-y-auto">
                                                                            {times.map((t) => {
                                                                                const disabled = isStartTimeDisabled(activeKey, t, idx);
                                                                                if (disabled) return null;
                                                                                return (
                                                                                    <SelectItem
                                                                                        key={t}
                                                                                        value={t}
                                                                                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                                                    >
                                                                                        {t}
                                                                                    </SelectItem>
                                                                                );
                                                                            })}
                                                                        </SelectViewport>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="w-px bg-gray-300 dark:bg-gray-600 my-1"></div>

                                                            <div className="flex-1">
                                                                <Select
                                                                    value={range.end}
                                                                    onValueChange={(v) => {
                                                                        const currentKey = format(sortedSelectedDates[activeDateIndex], "yyyy-MM-dd");
                                                                        const newRanges = [...dateTimes[currentKey]];
                                                                        newRanges[idx].end = v;
                                                                        setDateTimes({
                                                                            ...dateTimes,
                                                                            [currentKey]: newRanges,
                                                                        });
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="h-10 w-full rounded-none border-0 px-3 py-2 [&>svg]:hidden justify-center text-sm">
                                                                        <SelectValue placeholder="End" />
                                                                    </SelectTrigger>
                                                                    <SelectContent
                                                                        position="popper"
                                                                        side="bottom"
                                                                        sideOffset={4}
                                                                        avoidCollisions={false}
                                                                    >
                                                                        <SelectViewport className="max-h-60 overflow-y-auto">
                                                                            {times.map((t) => {
                                                                                const disabled = isEndTimeDisabled(activeKey, t, idx, range.start);
                                                                                if (disabled) return null;
                                                                                return (
                                                                                    <SelectItem
                                                                                        key={t}
                                                                                        value={t}
                                                                                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                                                    >
                                                                                        {t}
                                                                                    </SelectItem>
                                                                                );
                                                                            })}
                                                                        </SelectViewport>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        {idx > 0 ? (
                                                            <button
                                                                type="button"
                                                                className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded-full"
                                                                onClick={() => {
                                                                    const currentKey = format(sortedSelectedDates[activeDateIndex], "yyyy-MM-dd");
                                                                    const newRanges = [...dateTimes[currentKey]];
                                                                    newRanges.splice(idx, 1);
                                                                    setDateTimes({
                                                                        ...dateTimes,
                                                                        [currentKey]: newRanges,
                                                                    });
                                                                }}
                                                            >
                                                                <CircleX className="h-4 w-4" />
                                                            </button>
                                                        ) : (
                                                            <div className="flex-shrink-0 p-2 w-[32px] h-[32px]" />
                                                        )}
                                                    </div>
                                                ))}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => {
                                                        const key = format(sortedSelectedDates[activeDateIndex], "yyyy-MM-dd");
                                                        const newRanges = [...dateTimes[key], { start: "", end: "", court: dateTimes[key][0].court }];
                                                        setDateTimes({
                                                            ...dateTimes,
                                                            [key]: newRanges,
                                                        });
                                                    }}
                                                >
                                                    + Add Time
                                                </Button>

                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="mt-2 w-full"
                                                    onClick={applyToAllDates}
                                                >
                                                    Apply to All Dates
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex-1 overflow-y-auto pl-2">
                                            <p className="text-sm font-medium mb-3">Existing Bookings</p>
                                            <div className="space-y-2">
                                                {(
                                                    (dummySchedules[activeKey] || []).filter(
                                                        (s) =>
                                                            s.courtid === dateTimes[activeKey]?.[0]?.court
                                                    )
                                                ).map((s, i) => (
                                                    <div
                                                        key={i}
                                                        className="mb-4 px-2 py-2 bg-slate-50 rounded-md text-sm border"
                                                    >
                                                        {s.start} - {s.end}
                                                    </div>
                                                ))}

                                                {(
                                                    (dummySchedules[activeKey] || []).filter(
                                                        (s) =>
                                                            s.courtid === dateTimes[activeKey]?.[0]?.court
                                                    ).length === 0
                                                ) && (
                                                        <p className="text-sm text-muted-foreground text-center py-4">
                                                            No existing bookings
                                                        </p>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center flex-1 text-sm text-muted-foreground">
                                    Select a date to set times
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        <p className="text-sm">Selected Days: {selectedDates.length}</p>
                        <p className="text-lg font-bold">
                            Total Payment: {totalAmount ? totalAmount.toFixed(2) : "0.00"} PHP
                        </p>
                    </div>

                    <div className="flex justify-center my-4">
                        <Button size="lg" onClick={handleBooking}>
                            Review & Confirm
                        </Button>
                    </div>
                </div>
            </div>

            {/* DIALOGS */}
            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={submitBooking}
                isSubmitting={isSubmitting}
                firstName={firstName}
                lastName={lastName}
                gcashNumber={gcash}
                selectedDates={sortedSelectedDates}
                slots={buildSlotsPayload()}
                totalAmount={totalAmount}
                title="Confirm Your Booking"
                confirmLabel="Submit Booking"
            />

            {/* QR Code Modal */}
            {showQrModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Scan to Pay</h2>
                            <button
                                onClick={() => setShowQrModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="text-center mb-6">
                            <p className="text-gray-600 mb-4">Use your phone to scan this QR code to complete payment</p>
                            {qrImageUrl && (
                                <img
                                    src={qrImageUrl}
                                    alt="QR Code"
                                    className="w-full max-w-xs mx-auto border-4 border-gray-200 rounded-lg"
                                />
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                <strong>⏱️ QR Code Expires in 30 minutes</strong>
                                <br />
                                This code is valid for a single transaction only.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="text-sm">
                                <p className="text-gray-700">
                                    <strong>Amount:</strong> ₱{totalAmount.toFixed(2)}
                                </p>
                                <p className="text-gray-700 mt-2">
                                    <strong>Transaction ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{transactionId}</code>
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full mt-6"
                            onClick={() => setShowQrModal(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <SuccessDialog
                isOpen={isSuccessOpen}
                onClose={() => {
                    setIsSuccessOpen(false);
                    router.replace("/booking")
                }}
                fullName={`${firstName} ${lastName}`}
                gcashNumber={gcash}
                selectedDates={sortedSelectedDates}
                slots={buildSlotsPayload()}
                totalAmount={totalAmount}
            />
        </main>
    );
}