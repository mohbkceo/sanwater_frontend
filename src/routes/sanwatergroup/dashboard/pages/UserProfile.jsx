import React, { useState, useEffect } from "react";
import { User, Lock, Mail, Phone, Image, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  getUserProfile,
  updateBasicInfo,
  changePassword,
} from "@/services/user/userServices";

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [basicInfo, setBasicInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    profileImage: "",
  });

  const [securityInfo, setSecurityInfo] = useState({
    role: "",
    createdAt: "",
    updatedAt: "",
    hasPassword: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [basicInfoForm, setBasicInfoForm] = useState({
    fullName: "",
    phone: "",
    profileImage: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      const data = response.data;

      setBasicInfo(data.basicInfo);
      setSecurityInfo(data.securityInfo);
      setBasicInfoForm({
        fullName: data.basicInfo.fullName,
        phone: data.basicInfo.phone || "",
        profileImage: data.basicInfo.profileImage || "",
      });
    } catch (error) {
      toast.error("Failed to load user profile");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setBasicInfoForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateBasicInfo = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await updateBasicInfo(basicInfoForm);
      toast.success("Basic information updated successfully");
      setBasicInfo({
        ...basicInfo,
        ...basicInfoForm,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update basic info");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setUpdating(true);
      await changePassword(passwordForm);
      toast.success("Password changed successfully");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="h-64 bg-slate-200 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your account information and security settings.
          </p>
        </div>

        {/* Basic Information Section */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Basic Information</h2>
              <p className="text-sm text-slate-500">Update your profile details</p>
            </div>
          </div>

          <form onSubmit={handleUpdateBasicInfo} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={basicInfoForm.fullName}
                onChange={handleBasicInfoChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                <Mail size={18} className="mr-2" />
                <span>{basicInfo.email}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={basicInfoForm.phone}
                onChange={handleBasicInfoChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Profile Image URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Profile Image URL
              </label>
              <input
                type="url"
                name="profileImage"
                value={basicInfoForm.profileImage}
                onChange={handleBasicInfoChange}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Security Information Section */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Security Information</h2>
              <p className="text-sm text-slate-500">View and manage your security settings</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Role */}
            <div className="flex justify-between items-center p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-700">Account Role</p>
                <p className="text-xs text-slate-500 mt-1">Your account access level</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium capitalize">
                {securityInfo.role}
              </span>
            </div>

            {/* Created At */}
            <div className="flex justify-between items-center p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-700">Account Created</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(securityInfo.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex justify-between items-center p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-700">Last Updated</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(securityInfo.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Lock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Change Password</h2>
              <p className="text-sm text-slate-500">Update your password to keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="oldPassword"
                  value={passwordForm.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
