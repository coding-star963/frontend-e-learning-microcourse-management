const toneStyles = {
  danger: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
  warning: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
  primary: 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20',
};

/**
 * Asks before an action runs: what it does, what follows from it, and
 * Confirm / Cancel buttons. Render it only while a confirmation is pending.
 */
export default function ConfirmModal({
  title,
  description,
  consequences = [],
  confirmLabel = 'Confirm',
  tone = 'primary',
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => !busy && onCancel()} />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10">
        <h3 id="confirm-modal-title" className="text-lg font-bold text-slate-900">{title}</h3>
        {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
        {consequences.length > 0 && (
          <ul className="mt-4 space-y-1.5 rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
            {consequences.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-slate-400">&bull;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            autoFocus
            className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition disabled:opacity-50 ${toneStyles[tone] || toneStyles.primary}`}
          >
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
