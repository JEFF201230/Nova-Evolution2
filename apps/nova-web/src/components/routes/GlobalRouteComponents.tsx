import { useId, useState } from 'react';
import styles from './GlobalRoutes.module.css';

export interface FilterOption<T extends string> {
  id: T;
  label: string;
  count: number;
}

interface FilterTabsProps<T extends string> {
  label: string;
  options: readonly FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterTabs<T extends string>({ label, options, value, onChange }: FilterTabsProps<T>) {
  return (
    <div aria-label={label} className={styles.filters} role="group">
      {options.map((option) => (
        <button
          aria-pressed={value === option.id}
          className={styles.filter}
          key={option.id}
          onClick={() => onChange(option.id)}
          type="button"
        >
          <span>{option.label}</span>
          <span className={styles.filterCount}>{option.count}</span>
        </button>
      ))}
    </div>
  );
}

export function ConfidenceChip({ confidence }: { confidence: number }) {
  const [open, setOpen] = useState(false);
  const popoverId = useId();

  return (
    <span className={styles.confidenceWrap}>
      <button
        aria-controls={popoverId}
        aria-expanded={open}
        aria-label={`Confidence ${confidence}%`}
        className={styles.confidenceChip}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => event.stopPropagation()}
        type="button"
      >
        {confidence}%
      </button>
      {open ? (
        <span className={styles.confidencePopover} id={popoverId} role="status">
          Confidence is based on the evidence currently available.
        </span>
      ) : null}
    </span>
  );
}

export function FileIcon() {
  return (
    <svg aria-hidden="true" className={styles.fileIcon} focusable="false" viewBox="0 0 24 24">
      <path d="M6 2.75h7.5L18 7.25v14H6z" />
      <path d="M13.5 2.75v4.5H18M8.75 12h6.5M8.75 15.5h6.5" />
    </svg>
  );
}

export function EyeIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M2.75 12s3.25-5.25 9.25-5.25S21.25 12 21.25 12 18 17.25 12 17.25 2.75 12 2.75 12Z" />
      <circle cx="12" cy="12" r="2.25" />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M12 3v11M8 10l4 4 4-4M5 19.5h14" />
    </svg>
  );
}
