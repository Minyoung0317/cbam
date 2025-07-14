"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File, target: { itemType: 'material' | 'fuel', index: number } | null) => void;
  target: { itemType: 'material' | 'fuel', index: number } | null;
}

export default function EvidenceUploadModal({ isOpen, onOpenChange, onUpload, target }: EvidenceUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile && target) {
      onUpload(selectedFile, target);
      setSelectedFile(null); // Reset file input after upload
      onOpenChange(false); // Close modal after upload
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>증빙자료 업로드</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="evidence-file" className="text-right">
              파일 선택
            </Label>
            <Input
              id="evidence-file"
              type="file"
              onChange={handleFileChange}
              className="col-span-3"
            />
          </div>
          {selectedFile && (
            <div className="text-sm text-gray-500 col-span-4">
              선택된 파일: {selectedFile.name}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>닫기</Button>
          <Button type="button" onClick={handleUploadClick} disabled={!selectedFile}>업로드</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 