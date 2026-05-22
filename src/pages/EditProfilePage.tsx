import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Notice } from '../components/Notice';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RequiredLabel } from '../components/RequiredLabel';
import { deleteUserImage, updateUser, uploadUserImage } from '../api/users';
import { useAuth } from '../stores/auth';
import { validateImage } from '../utils/validation';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function EditProfilePage() {
  const { auth, currentUser, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    password: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      firstName: currentUser?.firstName ?? '',
      lastName: currentUser?.lastName ?? '',
      email: currentUser?.email ?? '',
    }));
  }, [currentUser]);

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
    if (form.password && form.password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (form.password && !form.currentPassword) {
      setError('Current password is required to change password.');
      return;
    }

    const imageError = validateImage(profileImage);
    if (imageError) {
      setError(imageError);
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      ...(form.password ? { currentPassword: form.currentPassword, password: form.password } : {}),
    };

    setBusy(true);
    try {
      await updateUser(auth.userId, payload, auth.token);
      if (removeImage) await deleteUserImage(auth.userId, auth.token);
      if (profileImage) await uploadUserImage(auth.userId, profileImage, auth.token);
      await refreshProfile();
      navigate(`/users/${auth.userId}`);
    } catch (err) {
      setError(err.message || 'Could not update profile.');
      setForm((current) => ({ ...current, currentPassword: '', password: '' }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page-section narrow-section">
      <Link className="text-link" to={`/users/${auth.userId}`}>
        Back to profile
      </Link>

      <div className="section-header">
        <h2>Edit profile</h2>
      </div>

      <form className="entity-form" onSubmit={handleSubmit}>
        {error && <Notice error>{error}</Notice>}

        <div className="split-controls">
          <div className="control-group">
            <RequiredLabel htmlFor="profile-first-name">First name</RequiredLabel>
            <Input
              id="profile-first-name"
              value={form.firstName}
              onChange={(event) => updateField('firstName', event.target.value)}
            />
          </div>
          <div className="control-group">
            <RequiredLabel htmlFor="profile-last-name">Last name</RequiredLabel>
            <Input
              id="profile-last-name"
              value={form.lastName}
              onChange={(event) => updateField('lastName', event.target.value)}
            />
          </div>
        </div>

        <div className="control-group">
          <RequiredLabel htmlFor="profile-email">Email</RequiredLabel>
          <Input
            id="profile-email"
            inputMode="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
          />
        </div>

        <label className="toggle-row">
          <Checkbox checked={showPasswords} onCheckedChange={(checked) => setShowPasswords(Boolean(checked))} />
          <span>Show passwords</span>
        </label>

        <div className="split-controls">
          <div className="control-group">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type={showPasswords ? 'text' : 'password'}
              value={form.currentPassword}
              onChange={(event) => updateField('currentPassword', event.target.value)}
            />
          </div>
          <div className="control-group">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type={showPasswords ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
            />
          </div>
        </div>

        <div className="control-group">
          <Label htmlFor="profile-picture">Profile picture</Label>
          <div className="file-picker">
            <Input
              id="profile-picture"
              className="file-picker-input"
              type="file"
              accept="image/png,image/jpeg,image/gif"
              onChange={(event) => setProfileImage(event.target.files?.[0] ?? null)}
            />
            <label className="file-picker-button" htmlFor="profile-picture">
              Select image
            </label>
            <span className="file-picker-name">{profileImage?.name ?? 'No image selected'}</span>
          </div>
        </div>

        <label className="toggle-row">
          <Checkbox checked={removeImage} onCheckedChange={(checked) => setRemoveImage(Boolean(checked))} />
          <span>Remove existing profile picture</span>
        </label>

        <Button type="submit" disabled={busy}>
          {busy ? 'Saving...' : 'Save profile'}
        </Button>
      </form>
    </section>
  );
}
