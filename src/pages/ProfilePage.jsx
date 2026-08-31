import { useState } from 'react';
import Alert from '../components/Alert';
import AppShell from '../components/AppShell';
import { useAuth } from '../hooks/useAuth';

const inputClass =
  'mt-2 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100';

export default function ProfilePage() {
  const { user, updateProfile, updatePassword, updatePhoto } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [photo, setPhoto] = useState(null);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [photoMessage, setPhotoMessage] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileMessage('');
    setLoading(true);

    try {
      await updateProfile({ name, email });
      setProfileMessage('Profile updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    setLoading(true);

    try {
      await updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      });
      setPasswordMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirmation('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpdate = async (e) => {
    e.preventDefault();
    setPhotoError('');
    setPhotoMessage('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('photo', photo);
      await updatePhoto(formData);
      setPhotoMessage('Profile photo updated successfully.');
      setPhoto(null);
    } catch (err) {
      setPhotoError(err.response?.data?.message || 'Failed to update photo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Profile settings" eyebrow="Account">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            {user?.profile_photo ? (
              <img className="h-20 w-20 rounded-lg object-cover" src={user.profile_photo} alt={user.name} />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-950 text-2xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-950">{user?.name}</h2>
              <p className="break-words text-sm text-slate-500">{user?.email}</p>
              <p className="mt-2 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold capitalize text-teal-700">
                {user?.role}
              </p>
            </div>
          </div>

          <form onSubmit={handlePhotoUpdate} className="mt-6 space-y-4">
            {photoMessage && <Alert type="success">{photoMessage}</Alert>}
            {photoError && <Alert>{photoError}</Alert>}
            <div>
              <label htmlFor="photo" className="block text-sm font-semibold text-slate-700">
                Profile photo
              </label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !photo}
              className="w-full rounded-lg bg-teal-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Uploading...' : 'Upload photo'}
            </button>
          </form>
        </aside>

        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-lg font-bold text-slate-950">Profile information</h2>
              <p className="mt-1 text-sm text-slate-600">Keep your visible account details accurate.</p>
            </div>

            <form onSubmit={handleProfileUpdate} className="mt-6 space-y-5">
              {profileMessage && <Alert type="success">{profileMessage}</Alert>}
              {profileError && <Alert>{profileError}</Alert>}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-teal-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-lg font-bold text-slate-950">Password</h2>
              <p className="mt-1 text-sm text-slate-600">Use a strong password to protect your account.</p>
            </div>

            <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-5">
              {passwordMessage && <Alert type="success">{passwordMessage}</Alert>}
              {passwordError && <Alert>{passwordError}</Alert>}
              <div>
                <label htmlFor="current_password" className="block text-sm font-semibold text-slate-700">
                  Current password
                </label>
                <input
                  type="password"
                  name="current_password"
                  id="current_password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="new_password" className="block text-sm font-semibold text-slate-700">
                    New password
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    id="new_password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="new_password_confirmation" className="block text-sm font-semibold text-slate-700">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    name="new_password_confirmation"
                    id="new_password_confirmation"
                    value={newPasswordConfirmation}
                    onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
