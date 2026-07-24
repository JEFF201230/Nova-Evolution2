import { useRef, useState } from 'react';
import { homeFixture } from './homeFixture';
import styles from './HomePage.module.css';

export interface ObjectiveComposerProps {
  onContinue: (objective: string) => void;
}

export function ObjectiveComposer({ onContinue }: ObjectiveComposerProps) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function openComposer(nextValue?: string) {
    setComposerOpen(true);
    if (nextValue !== undefined) {
      setValue(nextValue);
    }
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function continueToClarify() {
    const objective = value.trim();
    if (objective) {
      onContinue(objective);
    }
  }

  return (
    <div className={styles.composerBlock}>
      {composerOpen ? (
        <div className={styles.composer}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              continueToClarify();
            }}
          >
            <label htmlFor="work-objective">What would you like to achieve?</label>
            <textarea
              ref={textareaRef}
              id="work-objective"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault();
                  continueToClarify();
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                setComposerOpen(false);
                setValue('');
              }}
            >
              Cancel
            </button>
            <button disabled={!value.trim()} type="submit">Continue</button>
          </form>
        </div>
      ) : (
        <button className={styles.composer} type="button" onClick={() => openComposer()}>
          <div className={styles.composerTrigger}>
            <div className={styles.composerMark} aria-hidden="true">
              ✦
            </div>
            <div className={styles.composerCopy}>
              <p className={styles.composerTitle}>{homeFixture.composer.title}</p>
              <p className={styles.composerDescription}>{homeFixture.composer.description}</p>
            </div>
          </div>
        </button>
      )}

      <div className={styles.composerFooter}>
        <p className={styles.composerLabel}>Try:</p>
        <div className={styles.suggestions}>
          {homeFixture.composer.suggestions.map((suggestion) => (
            <button
              className={styles.suggestion}
              key={suggestion}
              type="button"
              onClick={() => openComposer(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
