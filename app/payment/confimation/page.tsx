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

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fullName: string;
  gcashNumber: string;
  selectedDates: Date[];
  timeFrom: string;
  timeTo: string;
  totalAmount: number;
  title?: string;
  confirmLabel?: string;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  fullName,
  gcashNumber,
  selectedDates,
  timeFrom,
  timeTo,
  totalAmount,
  title = "Confirm Reservation",
  confirmLabel = "Book Now",
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Please review your booking details before confirming.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div><strong>Name:</strong> {fullName}</div>
          <div><strong>GCash:</strong> {gcashNumber}</div>
          <div>
            <strong>Dates:</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              {selectedDates.map((date, i) => (
                <li key={i}>{format(date, "MMMM d, yyyy (EEE)")}</li>
              ))}
            </ul>
          </div>
          <div><strong>Time Slot:</strong> {timeFrom} – {timeTo}</div>
          <div><strong>Sessions:</strong> {selectedDates.length} day(s)</div>
          <div><strong>Total Amount:</strong> {totalAmount.toFixed(2)} PHP</div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}