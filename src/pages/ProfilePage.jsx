import { useState } from 'react';
import Alert from '../components/Alert';
import AppShell from '../components/AppShell';
import { useAuth } from '../hooks/useAuth';
import { getStorageUrl } from '../utils/imageUrl';

const inputClass =
  'mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20';

export default function ProfilePage() {
  const { user, updateProfile, updatePassword, updatePhoto, deletePhoto } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [photoMessage, setPhotoMessage] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);

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
    if (!photo) return;
    setPhotoError('');
    setPhotoMessage('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('photo', photo);
      await updatePhoto(formData);
      setPhotoMessage('Profile photo uploaded and saved successfully.');
      setPhoto(null);
      setPreview(null);
    } catch (err) {
      setPhotoError(err.response?.data?.message || 'Failed to update photo. Ensure file is JPG/PNG under 2MB.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!window.confirm('Remove your profile photo? Your avatar will display your name initial in a circle.')) return;
    setRemovingPhoto(true);
    setPhotoError('');
    setPhotoMessage('');

    try {
      await deletePhoto();
      setPhoto(null);
      setPreview(null);
      setPhotoMessage('Profile photo removed. Initial circle restored.');
    } catch (err) {
      setPhotoError(err.response?.data?.message || 'Failed to remove profile photo.');
    } finally {
      setRemovingPhoto(false);
    }
  };

  const currentPhotoUrl = preview || getStorageUrl(user?.profile_photo);

  return (
    <AppShell title="Account Settings" eyebrow="Preferences">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[340px_1fr] pb-12">
        {/* Profile Card Side */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              {/* Circular Avatar */}
              <div className="relative">
                {currentPhotoUrl ? (
                  <img
                    key={currentPhotoUrl}
                    className="h-28 w-28 rounded-full object-cover ring-4 ring-teal-500/20 shadow-xl"
                    src={currentPhotoUrl}
                    alt={user?.name || 'Profile'}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 text-4xl font-black text-white shadow-xl shadow-teal-500/20 ring-4 ring-slate-100">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                {preview && (
                  <span className="absolute top-0 right-0 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500 border-2 border-white"></span>
                  </span>
                )}
              </div>

              {preview && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full ring-1 ring-teal-500/20">
                    Ready to upload
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      setPreview(null);
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-rose-600 transition underline"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Remove Photo Action */}
              {user?.profile_photo && !preview && (
                <button
                  type="button"
                  onClick={handlePhotoDelete}
                  disabled={removingPhoto}
                  className="mt-3 inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
                >
                  {removingPhoto ? 'Removing...' : 'Remove Photo'}
                </button>
              )}

              <h2 className="mt-4 text-lg font-bold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-500 break-all">{user?.email}</p>
              <div className="mt-3">
                <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold capitalize text-teal-700 ring-1 ring-teal-600/20">
                  {user?.role === 'administrator' ? 'Admin' : user?.role === 'teacher' ? 'Teacher' : 'Student'}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <form onSubmit={handlePhotoUpdate} className="space-y-4">
                {photoMessage && <Alert type="success">{photoMessage}</Alert>}
                {photoError && <Alert>{photoError}</Alert>}
                <div>
                  <label htmlFor="photo" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Upload Profile Photo
                  </label>
                  <p className="mt-0.5 text-[11px] text-slate-400">Select an image to see an instant preview.</p>
                  <input
                    id="photo"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPhoto(file);
                        setPreview(URL.createObjectURL(file));
                        setPhotoError('');
                        setPhotoMessage('');
                      }
                    }}
                    className="mt-2.5 block w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !photo}
                  className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Uploading photo...' : photo ? 'Save New Photo' : 'Choose Photo Above'}
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Edit Details & Security Side */}
        <div className="space-y-6">
          {/* Information Section */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
              <p className="mt-1 text-xs text-slate-500">Update your public staff identity and communication address.</p>
            </div>

            <form onSubmit={handleProfileUpdate} className="mt-6 space-y-5">
              {profileMessage && <Alert type="success">{profileMessage}</Alert>}
              {profileError && <Alert>{profileError}</Alert>}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Full Name
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
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Official Email
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
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-500/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          {/* Password Security Section */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-lg font-bold text-slate-900">Security & Password</h2>
              <p className="mt-1 text-xs text-slate-500">Ensure your administrative account is protected with a secure password.</p>
            </div>

            <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-5">
              {passwordMessage && <Alert type="success">{passwordMessage}</Alert>}
              {passwordError && <Alert>{passwordError}</Alert>}
              <div>
                <label htmlFor="current_password" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current_password"
                  id="current_password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Enter current password"
                />
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="new_password" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    id="new_password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Minimum 8 characters"
                  />
                </div>
                <div>
                  <label htmlFor="new_password_confirmation" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="new_password_confirmation"
                    id="new_password_confirmation"
                    value={newPasswordConfirmation}
                    onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                    className={inputClass}
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
