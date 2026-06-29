import React, { useEffect, useMemo, useState } from "react";
import {
  User, Lock, Mail, Phone, Image as ImageIcon,
  Eye, EyeOff, BadgeCheck, Shield, CalendarDays,
  Sparkles, Settings2, Camera, Copy, Check,
} from "lucide-react";
import { toast } from "sonner";
import { getUserProfile, updateBasicInfo, changePassword } from "@/services/user/userServices";

// Utility function for class names
const cn = (...classes) => classes.filter(Boolean).join(" ");

// Reusable Card Component
function Card({ title, description, icon: Icon, accent = "blue", children }) {
  const accents = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-5">
        <div className="flex items-center gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents[accent]}`}>
            <Icon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

// Stat Card Component
function StatCard({ label, value, sublabel, icon: Icon }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
          {sublabel && <p className="mt-1 text-sm text-gray-500">{sublabel}</p>}
        </div>
        <div className="rounded-lg bg-white p-2 text-gray-500 shadow-sm">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

// Input Field Component
function InputField({ label, hint, error, children }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// Password Input Component
function PasswordInput({ value, onChange, placeholder, error }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-12 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// Password Strength Indicator
function PasswordStrength({ password }) {
  const checks = [
    { test: () => password.length >= 8, label: "At least 8 characters" },
    { test: () => /[A-Z]/.test(password), label: "One uppercase letter" },
    { test: () => /[a-z]/.test(password), label: "One lowercase letter" },
    { test: () => /\d/.test(password), label: "One number" },
    { test: () => /[^A-Za-z0-9]/.test(password), label: "One special character" },
  ];

  const strength = checks.filter(c => c.test()).length;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
        <Shield size={16} />
        Password strength: {strength}/5
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {checks.map((check, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 text-sm ${check.test() ? "text-emerald-600" : "text-gray-500"}`}
          >
            <Check size={14} />
            {check.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Profile Component
export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "", email: "", phone: "", profileImage: ""
  });

  const [security, setSecurity] = useState({
    role: "", createdAt: "", updatedAt: "", hasPassword: false
  });

  const [profileForm, setProfileForm] = useState({
    fullName: "", phone: "", profileImage: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "", newPassword: "", confirmPassword: ""
  });

  const [errors, setErrors] = useState({});

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        const data = response.data;
        setProfile(data.basicInfo);
        setSecurity(data.securityInfo);
        setProfileForm(data.basicInfo);
      } catch (error) {
        toast.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Profile completion percentage
  const profileCompletion = useMemo(() => {
    const values = [profile.fullName, profile.email, profile.phone, profile.profileImage];
    const filled = values.filter(Boolean).length;
    return Math.round((filled / values.length) * 100);
  }, [profile]);

  // Format dates
  const memberSince = security.createdAt ? new Date(security.createdAt).toLocaleDateString() : "—";
  const lastUpdated = security.updatedAt ? new Date(security.updatedAt).toLocaleDateString() : "—";

  // Avatar
  const avatarSrc = !imageError && (profileForm.profileImage || profile.profileImage);
  const avatarInitial = (profile.fullName || "U")[0].toUpperCase();

  // Input handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    const newErrors = {
      fullName: profileForm.fullName.trim() ? "" : "Full name is required",
      phone: profileForm.phone && profileForm.phone.trim().length < 6 ? "Enter a valid phone number" : "",
      profileImage: profileForm.profileImage && !/^https?:\/\//i.test(profileForm.profileImage) ? "Use a valid image URL" : "",
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    try {
      setSavingProfile(true);
      await updateBasicInfo({
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        profileImage: profileForm.profileImage.trim(),
      });
      setProfile(prev => ({ ...prev, ...profileForm }));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Save password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    
    const newErrors = {
      oldPassword: passwordForm.oldPassword ? "" : "Current password is required",
      newPassword: passwordForm.newPassword.length >= 8 ? "" : "Password must be at least 8 characters",
      confirmPassword: passwordForm.newPassword === passwordForm.confirmPassword ? "" : "Passwords do not match",
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    try {
      setSavingPassword(true);
      await changePassword(passwordForm);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  // Copy email
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopiedEmail(true);
      toast.success("Email copied");
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      toast.error("Failed to copy email");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-40 animate-pulse rounded-2xl bg-white" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-2xl bg-white lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Banner */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span className="text-2xl font-bold">{avatarInitial}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1">
                    <BadgeCheck size={14} className="text-white" />
                  </div>
                </div>
                <div>
                  <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs">
                    <Sparkles size={12} /> Account Center
                  </div>
                  <h1 className="text-2xl font-bold md:text-3xl">
                    {profile.fullName || "My Profile"}
                  </h1>
                  <p className="mt-1 text-sm text-gray-300">
                    Manage your identity, security, and profile details
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  label="Completion"
                  value={`${profileCompletion}%`}
                  icon={Settings2}
                />
                <StatCard
                  label="Member since"
                  value={memberSince}
                  icon={CalendarDays}
                />
                <StatCard
                  label="Security"
                  value={security.hasPassword ? "Protected" : "Missing"}
                  icon={Shield}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Forms */}
          <div className="space-y-6 lg:col-span-2">
            {/* Profile Form */}
            <Card title="Basic Information" description="Edit your account details" icon={User} accent="blue">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Full Name" hint="Required" error={errors.fullName}>
                    <input
                      type="text"
                      name="fullName"
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Enter your full name"
                    />
                  </InputField>

                  <InputField label="Phone Number" hint="Optional" error={errors.phone}>
                    <div className="flex items-center rounded-xl border border-gray-200 px-4 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                      <Phone size={18} className="mr-2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        className="w-full outline-none"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </InputField>
                </div>

                <InputField label="Email Address" hint="Read only">
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-gray-400" />
                      <span className="text-gray-900">{profile.email || "—"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={copyEmail}
                      disabled={!profile.email}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                      {copiedEmail ? "Copied" : "Copy"}
                    </button>
                  </div>
                </InputField>

                <InputField label="Profile Image URL" hint="Optional" error={errors.profileImage}>
                  <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <div className="flex items-center rounded-xl border border-gray-200 px-4 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                      <ImageIcon size={18} className="mr-2 text-gray-400" />
                      <input
                        type="url"
                        name="profileImage"
                        value={profileForm.profileImage}
                        onChange={handleProfileChange}
                        className="w-full outline-none"
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                      {profileForm.profileImage && !imageError ? (
                        <img
                          src={profileForm.profileImage}
                          alt="Preview"
                          className="h-full w-full rounded-xl object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <Camera size={24} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </InputField>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </Card>

            {/* Password Form */}
            <Card title="Change Password" description="Update your password to stay secure" icon={Lock} accent="red">
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Current Password" hint="Required" error={errors.oldPassword}>
                    <PasswordInput
                      name="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                    />
                  </InputField>

                  <InputField label="New Password" hint="Required" error={errors.newPassword}>
                    <PasswordInput
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                    />
                  </InputField>
                </div>

                <InputField label="Confirm New Password" hint="Required" error={errors.confirmPassword}>
                  <PasswordInput
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />
                </InputField>

                <PasswordStrength password={passwordForm.newPassword} />

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {savingPassword ? "Updating..." : "Change Password"}
                  </button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            <Card title="Security Overview" description="Account metadata and status" icon={Shield} accent="emerald">
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-500">Role</p>
                  <p className="mt-1 font-medium text-gray-900">{security.role || "—"}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-500">Account Created</p>
                  <p className="mt-1 font-medium text-gray-900">{memberSince}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-500">Last Updated</p>
                  <p className="mt-1 font-medium text-gray-900">{lastUpdated}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase text-gray-500">Password Status</p>
                  <p className={`mt-1 font-medium ${security.hasPassword ? "text-emerald-600" : "text-amber-600"}`}>
                    {security.hasPassword ? "Configured" : "Not set"}
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Quick Tips" description="Best practices for your account" icon={Sparkles} accent="amber">
              <div className="space-y-3 text-sm text-gray-600">
                <p className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  Use a strong, unique password with mixed characters
                </p>
                <p className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  Keep your phone number current for account recovery
                </p>
                <p className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  Use a valid, publicly accessible image URL
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}