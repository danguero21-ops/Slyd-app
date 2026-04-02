import { db } from '@/api/apiClient';

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, Ban } from "lucide-react";
import { toast } from "sonner";

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "harassment", label: "Harassment" },
  { value: "fake_profile", label: "Fake profile" },
  { value: "underage", label: "Underage user" },
  { value: "other", label: "Other" },
];

export default function ReportBlockModal({ open, onClose, targetEmail, targetName, currentEmail }) {
  const [mode, setMode] = useState(null); // "report" | "block"
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    setLoading(true);
    await db.entities.Block.create({
      blocker_email: currentEmail,
      blocked_email: targetEmail,
    });
    toast.success(`${targetName} has been blocked`);
    setLoading(false);
    onClose();
  };

  const handleReport = async () => {
    if (!reason) return toast.error("Please select a reason");
    setLoading(true);
    await db.entities.Report.create({
      reporter_email: currentEmail,
      reported_email: targetEmail,
      reason,
      details,
    });
    toast.success("Report submitted. We'll review it shortly.");
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1C1C1E] border-[#2C2C2E] text-white max-w-sm mx-auto">
        {!mode ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-white">{targetName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <button
                onClick={() => setMode("report")}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#2C2C2E] hover:bg-[#3C3C3E] transition-colors text-left"
              >
                <AlertTriangle className="w-5 h-5 text-[#3B9EFF]" />
                <p className="font-medium text-sm">Report</p>
              </button>
              <button
                onClick={() => setMode("block")}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#2C2C2E] hover:bg-[#3C3C3E] transition-colors text-left"
              >
                <Ban className="w-5 h-5 text-[#3B9EFF]" />
                <p className="font-medium text-sm">Block</p>
              </button>
            </div>
          </>
        ) : mode === "block" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-white">Block {targetName}?</DialogTitle>
            </DialogHeader>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={() => setMode(null)} className="flex-1 border-[#2C2C2E] text-white hover:bg-[#2C2C2E]">
                Back
              </Button>
              <Button onClick={handleBlock} disabled={loading} className="flex-1 bg-[#3B9EFF] hover:bg-[#3B9EFF]/80">
                {loading ? "..." : "Block"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-white">Report {targetName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Select onValueChange={setReason}>
                <SelectTrigger className="bg-[#2C2C2E] border-[#3C3C3E] text-white">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent className="bg-[#2C2C2E] border-[#3C3C3E]">
                  {REPORT_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value} className="text-white">
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Any additional details..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="bg-[#2C2C2E] border-[#3C3C3E] text-white placeholder:text-[#8E8E93] resize-none"
                rows={3}
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setMode(null)} className="flex-1 border-[#2C2C2E] text-white hover:bg-[#2C2C2E]">
                  Back
                </Button>
                <Button onClick={handleReport} disabled={loading} className="flex-1 bg-[#3B9EFF] hover:bg-[#3B9EFF]/80">
                  {loading ? "..." : "Submit"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}