"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface Slot {
  date: string;         // "yyyy-MM-dd"
  startTime: string;     // e.g. "8:00 AM"
  endTime: string;       // e.g. "9:30 AM"
  courtId: string;       // e.g. "Court A"
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  firstName: string;
  lastName: string;
  gcashNumber: string;
  selectedDates: Date[];        // kept for backward compatibility / sorting
  slots: Slot[];                // ← NEW: Full list of booked time slots
  totalAmount: number;
  title?: string;
  confirmLabel?: string;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  firstName,
  lastName,
  gcashNumber,
  selectedDates,
  slots,
  totalAmount,
  title = "Confirm Your Booking",
  confirmLabel = "Submit Booking",
}: ConfirmationDialogProps) {
  // Group slots by date for better readability
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  // Sort dates chronologically
  const sortedDates = Object.keys(slotsByDate).sort();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Please review your booking details before submitting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Personal Info */}
          <div>
            <strong>Name:</strong> {firstName} {lastName}
          </div>
          <div>
            <strong>GCash Number:</strong> {gcashNumber}
          </div>

          {/* Booking Details - Grouped by Date */}
          <div className="space-y-3">
            <strong>Booking Details:</strong>
            {sortedDates.map((dateStr) => {
              const date = new Date(dateStr);
              const dateSlots = slotsByDate[dateStr];

              return (
                <div key={dateStr} className="ml-4 mt-2 border-l-4 border-cyan-200 pl-4">
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
          <div className="text-lg font-bold">
            <strong>Total Amount:</strong> ₱{totalAmount.toFixed(2)}
          </div>

          <div className="text-xs text-muted-foreground pt-2">
            After submitting, you will receive a confirmation. Please send the exact amount via GCash to complete your booking.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}