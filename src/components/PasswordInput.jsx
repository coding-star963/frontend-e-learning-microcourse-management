import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from './Icons';

export default function PasswordInput({ style, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} style={{ ...style, paddingRight: '2.75rem' }} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400 hover:text-teal-400 transition-colors"
      >
        {visible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
