import { AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  questionLabel: string;
}

export default function DeleteConfirmDialog({ open, onClose, onConfirm, questionLabel }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Question</DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-3 py-2">
          <div className="flex-shrink-0">
            <AlertCircle className="w-12 h-12 text-[#D0AC61]" />
          </div>

          <div className="flex-1">
            <p className="text-sm text-[#1C2A52]">
              Are you sure you want to delete this question?
            </p>
            <p className="text-xs text-[#6b7280] mt-2 font-medium">
              {questionLabel}
            </p>
            <p className="text-xs text-[#6b7280] mt-1">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} className="bg-[#dc2626] hover:bg-[#b8964f]">
            Delete Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
