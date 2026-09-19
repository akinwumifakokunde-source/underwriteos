import React, { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const canConfirm = confirmText === "DELETE";

  const reset = () => {
    setConfirmText("");
    setError(null);
    setDone(false);
  };

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      await base44.functions.invoke("apiDeleteAccount", { confirm: true });
      setDone(true);
      setTimeout(() => {
        base44.auth.logout("/login");
      }, 1500);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Deletion failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50/50 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-rose-900">Delete account and data</h4>
          <p className="text-[13px] text-rose-700/80 mt-1">
            Permanently delete your user account and all organization data — applications, borrowers,
            documents, policies, decisions and audit logs. This action cannot be undone.
          </p>
          <Button variant="destructive" className="mt-3" onClick={() => { reset(); setOpen(true); }}>
            <Trash2 className="w-4 h-4" /> Delete account and data
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm permanent deletion</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all organization data. There is no recovery.
            </DialogDescription>
          </DialogHeader>

          {done ? (
            <div className="py-4 text-sm text-emerald-700">Account and data deleted. Signing you out…</div>
          ) : (
            <>
              <div className="space-y-3 py-2">
                <p className="text-sm text-slate-600">
                  Type <span className="font-mono font-semibold text-slate-900">DELETE</span> to confirm.
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="select-text"
                  autoFocus
                />
                {error && <p className="text-sm text-rose-600">{error}</p>}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" disabled={busy}>Cancel</Button>
                </DialogClose>
                <Button variant="destructive" disabled={!canConfirm || busy} onClick={run}>
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete forever
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}