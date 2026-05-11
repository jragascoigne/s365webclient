import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Notice } from '../components/Notice.jsx';
import { Button } from '../components/ui/button.jsx';
import { Checkbox } from '../components/ui/checkbox.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { validateImage } from '../utils/validation.js';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    if (!isValidEmail(form.email)) {
      setError('Email must include @ and a top-level domain.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const imageError = validateImage(profileImage);
    if (imageError) {
      setError(imageError);
      return;
    }

    setBusy(true);
    try {
      await register(
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
        },
        profileImage,
      );
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setForm((current) => ({ ...current, password: '' }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-section narrow-section">
      <div className="section-header">
        <p className="eyebrow">Account</p>
        <h2>Create account</h2>
      </div>

      <form className="entity-form" onSubmit={handleSubmit}>
        {error && <Notice error>{error}</Notice>}
        <div className="split-controls">
          <div className="control-group">
            <Label htmlFor="first-name">First name</Label>
            <Input id="first-name" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
          </div>
          <div className="control-group">
            <Label htmlFor="last-name">Last name</Label>
            <Input id="last-name" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
          </div>
        </div>
        <div className="control-group">
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
            inputMode="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
          />
        </div>
        <div className="control-group">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
          />
        </div>
        <label className="toggle-row">
          <Checkbox checked={showPassword} onCheckedChange={(checked) => setShowPassword(Boolean(checked))} />
          <span>Show password</span>
        </label>
        <div className="control-group">
          <Label htmlFor="profile-image">Profile image</Label>
          <Input
            id="profile-image"
            type="file"
            accept="image/png,image/jpeg,image/gif"
            onChange={(event) => setProfileImage(event.target.files?.[0] ?? null)}
          />
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? 'Creating...' : 'Register'}
        </Button>
        <p className="form-note">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}
