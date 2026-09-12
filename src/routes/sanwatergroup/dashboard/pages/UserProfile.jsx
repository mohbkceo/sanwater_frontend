import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

import {
  getUserProfile,
  updateBasicInfo,
  changePassword,
} from "@/services/user/userServices";

/* -------------------------------------------------------------------------- */
/*                                   UTILS                                    */
/* -------------------------------------------------------------------------- */

const cn = (...classes) => classes.filter(Boolean).join(" ");

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/* -------------------------------------------------------------------------- */
/*                              GLASS SECTION                                 */
/* -------------------------------------------------------------------------- */

function Section({ title, description, action, children, className = "" }) {
  return (
    <section
      className={cn(
        `
          overflow-hidden
          rounded-[26px]
          border
          border-blue-100/80
          bg-white/70
          backdrop-blur-xl
        `,
        className,
      )}
    >
      <div
        className="
          flex
          flex-col
          gap-3
          border-b
          border-blue-100/70
          px-5
          py-5
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
        "
      >
        <div>
          <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-slate-900">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              INPUT WRAPPER                                 */
/* -------------------------------------------------------------------------- */

function Field({ label, hint, error, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[12px] font-semibold text-slate-800">
          {label}
        </label>

        {hint && (
          <span className="text-[10px] font-medium text-slate-400">{hint}</span>
        )}
      </div>

      {children}

      {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                TEXT INPUT                                  */
/* -------------------------------------------------------------------------- */

function TextInput({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={cn(
        `
          h-11
          w-full
          rounded-2xl
          border
          px-3.5
          text-sm
          font-medium
          text-slate-800
          outline-none
          transition
          duration-200
          placeholder:text-slate-300
          ${
            error
              ? "border-red-200 bg-red-50/30"
              : "border-blue-100/80 bg-white/65"
          }
          focus:border-blue-300
          focus:bg-white/85
          focus:ring-4
          focus:ring-blue-500/10
          disabled:cursor-not-allowed
          disabled:bg-slate-100/60
          disabled:text-slate-400
        `,
        className,
      )}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                              PASSWORD INPUT                                */
/* -------------------------------------------------------------------------- */

function PasswordInput({ name, value, onChange, placeholder, error }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          `
            h-11
            w-full
            rounded-2xl
            border
            bg-white/65
            px-3.5
            pr-11
            text-sm
            font-medium
            text-slate-800
            outline-none
            transition
            duration-200
            placeholder:text-slate-300
            ${error ? "border-red-200 bg-red-50/30" : "border-blue-100/80"}
            focus:border-blue-300
            focus:bg-white/85
            focus:ring-4
            focus:ring-blue-500/10
          `,
        )}
      />

      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        className="
          absolute
          right-2
          top-1/2
          flex
          h-8
          w-8
          -translate-y-1/2
          items-center
          justify-center
          rounded-xl
          text-slate-400
          transition
          hover:bg-blue-50
          hover:text-blue-600
        "
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            PASSWORD STRENGTH                               */
/* -------------------------------------------------------------------------- */

function PasswordStrength({ password }) {
  const checks = [
    {
      label: "8+ characters",
      valid: password.length >= 8,
    },
    {
      label: "Uppercase",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Lowercase",
      valid: /[a-z]/.test(password),
    },
    {
      label: "Number",
      valid: /\d/.test(password),
    },
    {
      label: "Special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const strength = checks.filter((item) => item.valid).length;

  const percentage = (strength / checks.length) * 100;

  let label = "Weak";

  if (strength >= 4) label = "Strong";
  else if (strength >= 3) label = "Good";
  else if (strength >= 2) label = "Fair";

  return (
    <div
      className="
        rounded-2xl
        border
        border-blue-100/80
        bg-blue-50/35
        p-4
      "
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-700">
          Password strength
        </span>

        <span
          className={cn(
            "text-[11px] font-semibold",
            strength >= 3 ? "text-blue-600" : "text-slate-400",
          )}
        >
          {password ? `${label} · ${strength}/5` : "Not started"}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-blue-100">
        <div
          className="
            h-full
            rounded-full
            bg-blue-500
            transition-all
            duration-300
          "
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {checks.map((check) => (
          <div
            key={check.label}
            className={cn(
              `
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-2.5
                py-1
                text-[10px]
                font-medium
              `,
              check.valid
                ? "border-blue-100 bg-white/70 text-blue-600"
                : "border-slate-100 bg-white/40 text-slate-400",
            )}
          >
            {check.valid && <Check size={11} />}
            {check.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              INFO ROW                                      */
/* -------------------------------------------------------------------------- */

function InfoRow({ label, value }) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        border-b
        border-blue-100/70
        py-3.5
        last:border-b-0
      "
    >
      <span className="text-xs text-slate-400">{label}</span>

      <span className="max-w-[60%] truncate text-right text-sm font-medium text-slate-700">
        {value || "—"}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               MAIN                                         */
/* -------------------------------------------------------------------------- */

export default function UserProfile() {
  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);

  const [savingPassword, setSavingPassword] = useState(false);

  const [copiedEmail, setCopiedEmail] = useState(false);

  const [imageError, setImageError] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  const [security, setSecurity] = useState({
    role: "",
    createdAt: "",
    updatedAt: "",
    hasPassword: false,
  });

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    profileImage: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  /* ---------------------------------------------------------------------- */
  /*                               LOAD PROFILE                             */
  /* ---------------------------------------------------------------------- */

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
        console.error(error);

        toast.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                           DERIVED VALUES                               */
  /* ---------------------------------------------------------------------- */

  const profileCompletion = useMemo(() => {
    const values = [
      profile.fullName,
      profile.email,
      profile.phone,
      profile.profileImage,
    ];

    const filled = values.filter(Boolean).length;

    return Math.round((filled / values.length) * 100);
  }, [profile]);

  const memberSince = formatDate(security.createdAt);

  const lastUpdated = formatDate(security.updatedAt);

  const avatarSrc =
    !imageError && (profileForm.profileImage || profile.profileImage);

  const avatarInitial = (profile.fullName || "U")[0].toUpperCase();

  /* ---------------------------------------------------------------------- */
  /*                              PROFILE CHANGE                            */
  /* ---------------------------------------------------------------------- */

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (name === "profileImage") {
      setImageError(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                             PASSWORD CHANGE                             */
  /* ---------------------------------------------------------------------- */

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* ---------------------------------------------------------------------- */
  /*                             SAVE PROFILE                                */
  /* ---------------------------------------------------------------------- */

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const newErrors = {
      fullName: profileForm.fullName.trim() ? "" : "Full name is required",

      phone:
        profileForm.phone && profileForm.phone.trim().length < 6
          ? "Enter a valid phone number"
          : "",

      profileImage:
        profileForm.profileImage &&
        !/^https?:\/\//i.test(profileForm.profileImage)
          ? "Use a valid image URL"
          : "",
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    try {
      setSavingProfile(true);

      await updateBasicInfo({
        fullName: profileForm.fullName.trim(),

        phone: profileForm.phone.trim(),

        profileImage: profileForm.profileImage.trim(),
      });

      setProfile((prev) => ({
        ...prev,
        ...profileForm,
      }));

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                            SAVE PASSWORD                               */
  /* ---------------------------------------------------------------------- */

  const handleSavePassword = async (e) => {
    e.preventDefault();

    const newErrors = {
      oldPassword: passwordForm.oldPassword
        ? ""
        : "Current password is required",

      newPassword:
        passwordForm.newPassword.length >= 8
          ? ""
          : "Password must be at least 8 characters",

      confirmPassword:
        passwordForm.newPassword === passwordForm.confirmPassword
          ? ""
          : "Passwords do not match",
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    try {
      setSavingPassword(true);

      await changePassword(passwordForm);

      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password changed successfully");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                              COPY EMAIL                                */
  /* ---------------------------------------------------------------------- */

  const copyEmail = async () => {
    if (!profile.email) return;

    try {
      await navigator.clipboard.writeText(profile.email);

      setCopiedEmail(true);

      toast.success("Email copied");

      window.setTimeout(() => {
        setCopiedEmail(false);
      }, 2000);
    } catch (error) {
      console.error(error);

      toast.error("Failed to copy email");
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                               LOADING                                  */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7faff] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5">
          <div className="h-32 rounded-[26px] bg-white/70" />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="h-[520px] rounded-[26px] bg-white/70" />
            <div className="space-y-5">
              <div className="h-64 rounded-[26px] bg-white/70" />
              <div className="h-40 rounded-[26px] bg-white/70" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                               RENDER                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#f7faff]">
      {/* subtle content color, not decorative UI chrome */}
      <div
        className="
          pointer-events-none
          fixed
          left-0
          top-0
          h-80
          w-80
          rounded-full
          bg-blue-200/15
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          fixed
          bottom-0
          right-0
          h-96
          w-96
          rounded-full
          bg-sky-200/10
          blur-3xl
        "
      />

      <main className="relative mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        {/* ---------------------------------------------------------------- */}
        {/* PROFILE HEADER                                                   */}
        {/* ---------------------------------------------------------------- */}

        <header
          className="
            mb-5
            overflow-hidden
            rounded-[28px]
            border
            border-blue-100/80
            bg-white/65
            backdrop-blur-2xl
            shadow-xs
          "
        >
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="
                    relative
                    flex
                    h-16
                    w-16
                    shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-[20px]
                    border
                    border-blue-100
                    bg-blue-50
                  "
                >
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-xl font-semibold text-blue-600">
                      {avatarInitial}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-500">
                    Account
                  </p>

                  <h1 className="mt-1 truncate text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-3xl">
                    {profile.fullName || "My Profile"}
                  </h1>

                  <p className="mt-1 truncate text-sm text-slate-400">
                    {profile.email || "Manage your account"}
                  </p>
                </div>
              </div>

              {/* compact summary */}
              <div
                className="
                  flex
                  divide-x
                  divide-blue-100/80
                  overflow-hidden
                  rounded-2xl
                  border
                  border-blue-100/80
                  bg-white/55
                "
              >
                <div className="min-w-[88px] px-4 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Complete
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {profileCompletion}%
                  </p>
                </div>

                <div className="min-w-[88px] px-4 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Role
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                    {security.role || "—"}
                  </p>
                </div>

                <div className="min-w-[88px] px-4 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Security
                  </p>

                  <p className="mt-1 text-sm font-semibold text-blue-600">
                    {security.hasPassword ? "Protected" : "Setup needed"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* CONTENT                                                          */}
        {/* ---------------------------------------------------------------- */}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* ============================================================= */}
          {/* LEFT                                                           */}
          {/* ============================================================= */}

          <div className="space-y-5">
            {/* ----------------------------------------------------------- */}
            {/* BASIC INFORMATION                                           */}
            {/* ----------------------------------------------------------- */}

            <Section
              title="Basic information"
              description="Update the information associated with your account."
            >
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    hint="Required"
                    error={errors.fullName}
                  >
                    <TextInput
                      type="text"
                      name="fullName"
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                      error={errors.fullName}
                    />
                  </Field>

                  <Field
                    label="Phone number"
                    hint="Optional"
                    error={errors.phone}
                  >
                    <TextInput
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter phone number"
                      error={errors.phone}
                    />
                  </Field>
                </div>

                <Field label="Email address" hint="Read only">
                  <div
                    className="
                      flex
                      min-h-11
                      items-center
                      justify-between
                      gap-3
                      rounded-2xl
                      border
                      border-blue-100/80
                      bg-blue-50/35
                      px-3.5
                    "
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Mail size={15} className="shrink-0 text-blue-400" />

                      <span className="truncate text-sm font-medium text-slate-700">
                        {profile.email || "—"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={copyEmail}
                      disabled={!profile.email}
                      className="
                        flex
                        h-8
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-xl
                        border
                        border-blue-100
                        bg-white/70
                        px-2.5
                        text-[11px]
                        font-semibold
                        text-blue-600
                        transition
                        hover:bg-blue-50
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      {copiedEmail ? <Check size={13} /> : <Copy size={13} />}

                      {copiedEmail ? "Copied" : "Copy"}
                    </button>
                  </div>
                </Field>

                <Field
                  label="Profile image URL"
                  hint="Optional"
                  error={errors.profileImage}
                >
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_64px]">
                    <TextInput
                      type="url"
                      name="profileImage"
                      value={profileForm.profileImage}
                      onChange={handleProfileChange}
                      placeholder="https://example.com/photo.jpg"
                      error={errors.profileImage}
                    />

                    <div
                      className="
                        h-16
                        w-16
                        overflow-hidden
                        rounded-2xl
                        border
                        border-blue-100
                        bg-blue-50
                      "
                    >
                      {profileForm.profileImage && !imageError ? (
                        <img
                          src={profileForm.profileImage}
                          alt="Preview"
                          className="h-full w-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-blue-400">
                          {avatarInitial}
                        </div>
                      )}
                    </div>
                  </div>
                </Field>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="
                      inline-flex
                      h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-blue-600
                      px-5
                      text-sm
                      font-semibold
                      text-white
                      shadow-xs
                      transition
                      hover:bg-blue-700
                      active:scale-[0.99]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {savingProfile ? "Saving..." : "Save changes"}

                    {!savingProfile && <ChevronRight size={15} />}
                  </button>
                </div>
              </form>
            </Section>

            {/* ----------------------------------------------------------- */}
            {/* PASSWORD                                                     */}
            {/* ----------------------------------------------------------- */}

            <Section
              title="Password & security"
              description="Keep your account protected with a strong password."
            >
              <form onSubmit={handleSavePassword} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Current password"
                    hint="Required"
                    error={errors.oldPassword}
                  >
                    <PasswordInput
                      name="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      placeholder="Current password"
                      error={errors.oldPassword}
                    />
                  </Field>

                  <Field
                    label="New password"
                    hint="Required"
                    error={errors.newPassword}
                  >
                    <PasswordInput
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="New password"
                      error={errors.newPassword}
                    />
                  </Field>
                </div>

                <Field
                  label="Confirm new password"
                  hint="Required"
                  error={errors.confirmPassword}
                >
                  <PasswordInput
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Repeat new password"
                    error={errors.confirmPassword}
                  />
                </Field>

                <PasswordStrength password={passwordForm.newPassword} />

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="
                      inline-flex
                      h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-blue-600
                      px-5
                      text-sm
                      font-semibold
                      text-white
                      shadow-xs
                      transition
                      hover:bg-blue-700
                      active:scale-[0.99]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <Lock size={15} />

                    {savingPassword ? "Updating..." : "Change password"}
                  </button>
                </div>
              </form>
            </Section>
          </div>

          {/* ============================================================= */}
          {/* RIGHT                                                          */}
          {/* ============================================================= */}

          <aside className="space-y-5">
            {/* ----------------------------------------------------------- */}
            {/* SECURITY                                                     */}
            {/* ----------------------------------------------------------- */}

            <Section
              title="Account details"
              description="Current account information."
            >
              <div>
                <InfoRow label="Role" value={security.role} />

                <InfoRow label="Member since" value={memberSince} />

                <InfoRow label="Last updated" value={lastUpdated} />

                <InfoRow
                  label="Password"
                  value={security.hasPassword ? "Protected" : "Not configured"}
                />
              </div>
            </Section>

            {/* ----------------------------------------------------------- */}
            {/* QUICK GUIDANCE                                               */}
            {/* ----------------------------------------------------------- */}

            <div
              className="
                overflow-hidden
                rounded-[26px]
                border
                border-blue-100/80
                bg-blue-600
                text-white
              "
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-white/15
                    "
                  >
                    <Shield size={17} className="text-white" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">Account security</h3>

                    <p className="mt-1 text-[11px] leading-5 text-blue-100">
                      Use a unique password and keep your recovery information
                      up to date.
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {[
                    "Use a unique password",
                    "Keep your phone number current",
                    "Use a valid profile image URL",
                  ].map((item) => (
                    <div
                      key={item}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-white/10
                        px-3
                        py-2.5
                        text-[11px]
                        text-blue-50
                      "
                    >
                      <Check size={13} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
