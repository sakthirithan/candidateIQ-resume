import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this operation?',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 select-none">
      <div className="saas-card p-6 bg-white border border-slate-200 w-full max-w-sm space-y-5 shadow-2xl relative">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
            isDanger ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold font-outfit text-slate-900 leading-snug">{title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all text-white ${
              isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
