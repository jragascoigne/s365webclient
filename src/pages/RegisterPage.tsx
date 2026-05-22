import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Notice } from '../components/Notice';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RequiredLabel } from '../components/RequiredLabel';
import { useAuth } from '../stores/auth';
import { validateImage } from '../utils/validation';

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

    if (!form.firstName.trim()) {
      setError('First name is required.');
      return;
    }
    if (!form.lastName.trim()) {
      setError('Last name is required.');
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
        <h2>Create account</h2>
      </div>

      <form className="entity-form" onSubmit={handleSubmit}>
        {error && <Notice error>{error}</Notice>}
        <div className="split-controls">
          <div className="control-group">
            <RequiredLabel htmlFor="first-name">First name</RequiredLabel>
            <Input id="first-name" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
          </div>
          <div className="control-group">
            <RequiredLabel htmlFor="last-name">Last name</RequiredLabel>
            <Input id="last-name" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
          </div>
        </div>
        <div className="control-group">
          <RequiredLabel htmlFor="register-email">Email</RequiredLabel>
          <Input
            id="register-email"
            inputMode="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
          />
        </div>
        <div className="control-group">
          <RequiredLabel htmlFor="register-password">Password</RequiredLabel>
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
          <div className="file-picker">
            <Input
              id="profile-image"
              className="file-picker-input"
              type="file"
              accept="image/png,image/jpeg,image/gif"
              onChange={(event) => setProfileImage(event.target.files?.[0] ?? null)}
            />
            <label className="file-picker-button" htmlFor="profile-image">
              Select image
            </label>
            <span className="file-picker-name">{profileImage?.name ?? 'No image selected'}</span>
          </div>
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
