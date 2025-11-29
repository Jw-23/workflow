import React, { useRef } from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  height?: string;
  language?: 'json' | 'js';
}

export const CodeEditor: React.FC<Props> = ({ value, onChange, placeholder, height = "h-48", language = 'js' }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (text: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newVal = value.substring(0, start) + text + value.substring(end);
    onChange(newVal);
    setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + text.length;
        el.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  ');
    }
  };

  const snippets = language === 'js' ? [
    { label: 'input', code: 'input' },
    { label: 'log', code: 'console.log(input)' },
    { label: 'return', code: 'return { val: 1 };' },
    { label: 'fetch', code: 'await fetch("url")' }
  ] : [
    { label: '{}', code: '{}' },
    { label: '[]', code: '[]' },
    { label: 'key:val', code: '"key": "value"' }
  ];

  return (
    <div className="border border-slate-700 rounded bg-slate-900 overflow-hidden flex flex-col">
      <div className="flex gap-2 p-1 bg-slate-800 border-b border-slate-700 text-[10px] overflow-x-auto">
        {snippets.map(s => (
            <button key={s.label} onClick={() => insertText(s.code)} className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-blue-300 whitespace-nowrap">
                {s.label}
            </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`w-full bg-slate-950 p-2 text-xs font-mono text-slate-300 outline-none resize-none ${height}`}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  );
};