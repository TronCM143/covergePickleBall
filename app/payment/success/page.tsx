"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface Slot {
  date: string;          // "yyyy-MM-dd"
  startTime: string;
  endTime: string;
  courtId: string;
}

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fullName: string;
  gcashNumber: string;
  selectedDates: Date[];     // kept for sorting/grouping if needed
  slots: Slot[];             // ← NEW: Full list of booked slots
  totalAmount: number;
  title?: string;
}

export default function SuccessDialog({
  isOpen,
  onClose,
  fullName,
  gcashNumber,
  selectedDates,
  slots,
  totalAmount,
  title = "Booking Received Successfully!",
}: SuccessDialogProps) {
  // Group slots by date for clean display
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  const sortedDates = Object.keys(slotsByDate).sort();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Thank you! Your booking has been recorded. Please complete payment via GCash to confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm mt-4">
          {/* Personal Info */}
          <div>
            <strong>Name:</strong> {fullName}
          </div>
          <div>
            <strong>GCash Number:</strong> {gcashNumber}
          </div>

          {/* Booking Details */}
          <div className="space-y-3">
            <strong>Booking Details:</strong>
            {sortedDates.map((dateStr) => {
              const date = new Date(dateStr);
              const dateSlots = slotsByDate[dateStr];

              return (
                <div key={dateStr} className="ml-4 mt-2 border-l-4 border-green-300 pl-4">
                  <div className="font-medium text-base">
                    {format(date, "MMMM d, yyyy (EEE)")}
                  </div>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-sm">
                    {dateSlots.map((slot, idx) => (
                      <li key={idx}>
                        {slot.startTime} – {slot.endTime} • {slot.courtId}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div>
            <strong>Total Sessions:</strong> {slots.length} time slot(s)
          </div>
          <div className="text-lg font-bold text-green-700">
            <strong>Total Amount Due:</strong> ₱{totalAmount.toFixed(2)}
          </div>

          {/* Payment Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-xs text-amber-900">
            <strong>Next Step:</strong> Please send exactly <strong>₱{totalAmount.toFixed(2)}</strong> via GCash 
            to the number provided during booking. We will confirm your slots once payment is received.
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={onClose} size="lg">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}