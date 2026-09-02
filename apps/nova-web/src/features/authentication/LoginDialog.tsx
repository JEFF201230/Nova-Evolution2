import { useState, type FormEvent } from 'react';
import { Button } from '../../components/shared/Button';
import styles from './LoginDialog.module.css';

export interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export function LoginDialog({
  open,
  onClose,
  onAuthenticated,
}: LoginDialogProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const sessionResponse = await fetch('/session', {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!sessionResponse.ok) {
        throw new Error('SESSION_INITIALIZATION_FAILED');
      }

      const csrfToken = sessionResponse.headers.get('X-CSRF-Token');

      if (!csrfToken) {
        throw new Error('CSRF_TOKEN_MISSING');
      }

      const loginResponse = await fetch('/session/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('LOGIN_FAILED');
      }

      setPassword('');
      onAuthenticated();
      onClose();
    } catch {
      setError('Identifiant ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nova-login-title"
      >
        <div className={styles.header}>
          <h2
            id="nova-login-title"
            className={styles.title}
          >
            Connexion à NOVA
          </h2>

          <button
            type="button"
            className={styles.close}
            aria-label="Fermer"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <label className={styles.field}>
            Identifiant
            <input
              className={styles.input}
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            Mot de passe
            <input
              className={styles.input}
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? (
            <p
              className={styles.error}
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!username.trim() || !password}
            full
          >
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
}