"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface SuccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    fullName: string;
    gcashNumber: string;    
    selectedDates: Date[];
    timeFrom: string;
    timeTo: string;
    totalAmount: number;
    title?: string;
}

export default function SuccessDialog({
    isOpen,
    onClose,
    fullName,
    gcashNumber,
    selectedDates,
    timeFrom,
    timeTo,
    totalAmount,
    title = "Booking Confirmed!",
}: SuccessDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Your booking has been successfully completed.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 text-sm mt-2">
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
                    <div><strong>Total Payment:</strong> {totalAmount.toFixed(2)} PHP</div>
                </div>

                <DialogFooter className="mt-4">
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
