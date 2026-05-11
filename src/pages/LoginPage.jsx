import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Notice } from '../components/Notice.jsx';
import { Button } from '../components/ui/button.jsx';
import { Checkbox } from '../components/ui/checkbox.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-section narrow-section">
      <div className="section-header">
        <p className="eyebrow">Account</p>
        <h2>Log in</h2>
      </div>

      <form className="entity-form" onSubmit={handleSubmit}>
        {error && <Notice error>{error}</Notice>}
        <div className="control-group">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="control-group">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <label className="toggle-row">
          <Checkbox checked={showPassword} onCheckedChange={(checked) => setShowPassword(Boolean(checked))} />
          <span>Show password</span>
        </label>
        <Button type="submit" disabled={busy}>
          {busy ? 'Logging in...' : 'Log in'}
        </Button>
        <p className="form-note">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
}
