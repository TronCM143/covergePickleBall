"use client";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, addWeeks, addMonths, eachDayOfInterval, isAfter } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ConfirmationDialog from "../payment/confimation/page";
import { motion, AnimatePresence } from 'framer-motion';

export default function Page() {
  const [baseRange, setBaseRange] = useState<DateRange | undefined>();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [repeatType, setRepeatType] = useState<"none" | "weekly" | "monthly">("none");
  const [repeatCount, setRepeatCount] = useState(1); // Number of repetitions (e.g., for 5 weeks/months)
  const [startTime, setStartTime] = useState("8:00 AM");
  const [endTime, setEndTime] = useState("9:00 AM");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
               
  type RepeatType = "none" | "weekly" | "monthly";
  // Form fields
  const [fullName, setFullName] = useState("");
  const [gcash, setGcash] = useState("");

  // Step management for separation and animation
  const [step, setStep] = useState<'home' | 'details' | 'calendar' | 'success'>('home');

  const times = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
    "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
    "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM",
  ];

  const timeToMinutes = (time: string): number => {
    const [t, period] = time.split(" ");
    let [hours, minutes] = t.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins.toString().padStart(2, "0")} ${period}`;
  };

  // Compute selected dates based on base range and repeat
  useEffect(() => {
    if (!baseRange?.from) {
      setSelectedDates([]);
      return;
    }

    let baseDates: Date[] = [];

    if (baseRange.to) {
      baseDates = eachDayOfInterval({
        start: baseRange.from,
        end: baseRange.to,
      });
    } else {
      baseDates = [baseRange.from];
    }

    let allDates = [...baseDates];

    if (repeatType !== "none") {
      for (let i = 1; i < repeatCount; i++) {
        baseDates.forEach((d) => {
          let newDate: Date;

          if (repeatType === "weekly") {
            newDate = addWeeks(d, i);
          } else {
            newDate = addMonths(d, i);
          }

          if (isAfter(newDate, new Date())) {
            allDates.push(newDate);
          }
        });
      }
    }

    // Sort & unique
    allDates = Array.from(new Set(allDates)).sort(
      (a, b) => a.getTime() - b.getTime()
    );

    setSelectedDates(allDates);
  }, [baseRange, repeatType, repeatCount]);


  // Calculate total amount in real-time
  useEffect(() => {
    const hoursPerDay = Math.max(0, (timeToMinutes(endTime) - timeToMinutes(startTime)) / 60);
    const totalHours = selectedDates.length * hoursPerDay;
    setTotalAmount(totalHours * 200);
  }, [selectedDates, startTime, endTime]);

  const handleBooking = () => {
    if (selectedDates.length === 0) return alert("Please select at least one date");
    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      return alert("End time must be after start time");
    }
    setIsConfirmOpen(true);
  };

  const handleFinalConfirm = () => {
    setIsConfirmOpen(false);
    setStep('success');
  };

  // Animation variants for creative slide transition
  const variants = {
    enter: { x: '100vw', opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: '-100vw', opacity: 0 }
  };

  return (
    <main className="min-h-screen text-slate-900">
      <AnimatePresence mode="wait">
        {step === 'home' && (
          <motion.section
            key="home"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="container mx-auto px-4 py-16"
          >
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                Pickleball Court Reservation System
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Book your court easily — single days, multiple sessions, or recurring weekly slots.
              </p>
              <div className="mt-8">
                <Button onClick={() => setStep('details')}>Get Started</Button>
              </div>
            </div>
          </motion.section>
        )}

        {step === 'details' && (
          <motion.section
            key="details"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="container mx-auto px-4 py-16"
          >
            <div className="max-w-md mx-auto rounded-lg border p-6 shadow-sm bg-white">
              <h3 className="text-xl font-semibold text-center mb-4">Your Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Full Name</label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 w-full"
                    placeholder="Jane Doe"
                  />
                </div>
              
                <div>
                  <label className="block text-sm font-medium">GCash Number</label>
                  <Input
                    type="text"
                    value={gcash}
                    onChange={(e) => setGcash(e.target.value)}
                    className="mt-1 w-full"
                    placeholder="09123456789"
                  />
                </div>
                <div className="pt-4 flex justify-center">
                  <Button 
                    onClick={() => {
                      if (!fullName.trim()) return alert("Full name is required");
                      if (!gcash.trim()) return alert("GCash number is required");
                      setStep('calendar');
                    }}
                  >
                    Next: Select Dates & Time
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {step === 'calendar' && (
          <motion.section
            key="calendar"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="container mx-auto px-4 py-16"
          >
            <div className="max-w-xl mx-auto rounded-lg border p-6 shadow-sm bg-white">
              <h3 className="text-xl font-semibold text-center mb-4">Select Dates & Time Slot</h3>

              {/* Repeat Options */}
              <div className="flex justify-center gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Repeat</label>
                  <Select
                    value={repeatType}
                    onValueChange={(value) => setRepeatType(value as RepeatType)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {repeatType !== "none" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">For # {repeatType === "weekly" ? "Weeks" : "Months"}</label>
                    <Input
                      type="number"
                      value={repeatCount}
                      onChange={(e) => setRepeatCount(Math.max(1, Number(e.target.value)))}
                      className="w-24"
                      min="1"
                    />
                  </div>
                )}
              </div>

              {/* Calendar and Time Range Side-by-Side */}
              <div className="flex justify-center mb-6">
                <Calendar
                  mode="range"
                  selected={baseRange}
                  onSelect={(range) => setBaseRange(range ?? { from: undefined, to: undefined })}
                  disabled={{ before: new Date() }}
                  className="rounded-md border"
                />
                <div className="ml-6 w-32">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Time</label>
                      <Select value={startTime} onValueChange={setStartTime}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {times.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Time</label>
                      <Select value={endTime} onValueChange={setEndTime}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {times.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Counter and Payment */}
              <div className="text-center mb-4">
                <p className="text-sm font-medium">Selected Days: {selectedDates.length}</p>
                <p className="text-lg font-bold mt-2">Total Payment: {totalAmount.toFixed(2)} PHP</p>
              </div>

              <div className="flex justify-center gap-3">
                <Button onClick={handleBooking}>Review & Confirm</Button>
                <Button variant="outline" onClick={() => setStep('details')}>
                  Back
                </Button>
              </div>
            </div>
          </motion.section>
        )}

        {step === 'success' && (
          <motion.section
            key="success"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="container mx-auto px-4 py-12 text-center"
          >
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-green-600 mb-4">Booking Confirmed! 🎉</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Reservation Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-left space-y-2">
                  <p><strong>Name:</strong> {fullName}</p>
                  <p><strong>GCash:</strong> {gcash}</p>
                  <p><strong>Dates:</strong> {selectedDates.map((d) => format(d, "MMM d, yyyy")).join(", ")}</p>
                  <p><strong>Time Slot:</strong> {startTime} – {endTime}</p>
                  <p><strong>Total Hours:</strong> {(selectedDates.length * ((timeToMinutes(endTime) - timeToMinutes(startTime)) / 60)).toFixed(1)} hrs</p>
                  <p><strong>Total Payment:</strong> {totalAmount.toFixed(2)} PHP</p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-slate-600">
                    You will receive a confirmation via SMS. Please pay via GCash before your session.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleFinalConfirm}
        fullName={fullName}
        gcashNumber={gcash}
        selectedDates={selectedDates}
        timeFrom={startTime}
        timeTo={endTime}
        totalAmount={totalAmount}
        title="Confirm Your Reservation"
        confirmLabel="Book Now"
      />

      {/* Rest of your page (Features, Footer) */}
      <section id="features" className="container mx-auto px-4 py-12">
        {/* ... your existing features section ... */}
      </section>

      {/* <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-600">
          © {new Date().getFullYear()} Pickleball Reservation System
        </div>
      </footer> */}
    </main>
  );
}