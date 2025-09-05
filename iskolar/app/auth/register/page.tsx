"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agree, setAgree] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // New fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [gender, setGender] = useState("");
    const [mobile, setMobile] = useState("");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#e3f0ff] via-[#f5f7fa] to-[#e3f0ff] py-16">
            {/* Top Spacer */}
            <div className="h-8" />
            {/* Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-1 text-gray-900">Welcome</h2>
                <p className="text-gray-500 mb-6">Create your account</p>
                <form className="w-full flex flex-col gap-4">
                    {/* First Name */}
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            placeholder="First Name"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                        />
                    </div>
                    {/* Last Name */}
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            placeholder="Last Name"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                        />
                    </div>
                    {/* Middle Name */}
                    <div>
                        <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-1">
                            Middle Name
                        </label>
                        <input
                            id="middleName"
                            type="text"
                            placeholder="Middle Name"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                            value={middleName}
                            onChange={e => setMiddleName(e.target.value)}
                        />
                    </div>
                    {/* Gender & Mobile Number in two columns */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Gender */}
                        <div className="relative">
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="gender"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 appearance-none"
                                value={gender}
                                onChange={e => setGender(e.target.value)}
                            >
                                <option value="">Select Gender</option>
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                                <option value="Other">Other</option>
                            </select>
                            {/* Custom down arrow icon */}
                            <span className="pointer-events-none absolute right-2 top-[55%] text-gray-400">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                    <path d="M7 10l5 5 5-5" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </span>
                        </div>
                        {/* Mobile Number */}
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="mobile"
                                type="tel"
                                placeholder="+639XXXXXXXXX"
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                                value={mobile}
                                onChange={e => setMobile(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#9ca3af" strokeWidth="2" d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z"/><path stroke="#9ca3af" strokeWidth="2" d="m4 7 8 6 8-6"/></svg>
                            </span>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="example@gmail.com"
                                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect width="16" height="10" x="4" y="10" stroke="#9ca3af" strokeWidth="2" rx="2"/><path stroke="#9ca3af" strokeWidth="2" d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>
                            </span>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    // Eye-off icon
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                        <path stroke="#9ca3af" strokeWidth="2" d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-6.5 0-10-8-10-8a17.6 17.6 0 0 1 3.07-4.36M6.12 6.12A9.98 9.98 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-4.07 5.36M1 1l22 22" />
                                        <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="2" />
                                    </svg>
                                ) : (
                                    // Eye icon
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="2" />
                                        <path stroke="#9ca3af" strokeWidth="2" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect width="16" height="10" x="4" y="10" stroke="#9ca3af" strokeWidth="2" rx="2"/><path stroke="#9ca3af" strokeWidth="2" d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>
                            </span>
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:border-[#2196F3] bg-gray-50 text-gray-900 placeholder-gray-400"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? (
                                    // Eye-off icon
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                        <path stroke="#9ca3af" strokeWidth="2" d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-6.5 0-10-8-10-8a17.6 17.6 0 0 1 3.07-4.36M6.12 6.12A9.98 9.98 0 0 1 12 4c6.5 0 10 8 10 8a17.6 17.6 0 0 1-4.07 5.36M1 1l22 22" />
                                        <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="2" />
                                    </svg>
                                ) : (
                                    // Eye icon
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="2" />
                                        <path stroke="#9ca3af" strokeWidth="2" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    {/* Terms and Conditions Checkbox */}
                    <div className="flex items-start mb-2">
                        <label className="flex gap-2 text-sm text-gray-700 items-start">
                            <span className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={agree}
                                    onChange={e => setAgree(e.target.checked)}
                                    className="peer appearance-none w-4 h-4 border border-gray-300 rounded-md bg-white checked:bg-[#2196F3] checked:border-[#2196F3] focus:outline-none transition-all cursor-pointer"
                                    style={{ outline: 'none' }}
                                />
                                <span className="pointer-events-none absolute left-0 top-0 w-4 h-4 flex items-center justify-center">
                                    {agree && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </span>
                            </span>
                            <span className="ml-1 leading-snug">
                                I agree to the{' '}
                                <button
                                    type="button"
                                    className="cursor-pointer text-[#1976D2] underline font-medium hover:opacity-80 focus:outline-none"
                                    onClick={() => setShowModal(true)}
                                >
                                    Data Privacy Act.
                                </button>
                            </span>
                        </label>
                    </div>
                    {/* Register Button */}
                    <button
                        type="submit"
                        className="cursor-pointer w-full py-2 rounded-lg bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white font-semibold text-lg shadow hover:opacity-90 transition"
                    >
                        Register
                    </button>
                </form>
                {/* Modal for Terms and Conditions */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity animate-fadeIn">
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-lg w-full px-8 py-7 relative animate-scaleIn">
                            <button
                                type="button"
                                className="absolute top-4 right-4 text-gray-400 hover:text-[#D32F2F] focus:outline-none cursor-pointer"
                                onClick={() => setShowModal(false)}
                                aria-label="Close"
                            >
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
                                </svg>
                            </button>
                            <h3 className="text-2xl font-extrabold mb-3 text-gray-900 text-center">Data Privacy Act</h3>
                            <div className="text-gray-700 text-base space-y-3 max-h-72 overflow-y-auto leading-relaxed">
                                <div className="border-l-4 border-[#1976D2] pl-4 mb-2">
                                    <p className="mb-2"><span className="font-semibold">Republic Act No. 10173</span> - The Data Privacy Act of 2012 protects the fundamental human right of privacy, of communication while ensuring free flow of information to promote innovation and growth.</p>
                                    <p className="mb-2">By registering, you consent to the collection, use, and processing of your personal data for legitimate and lawful purposes in accordance with this Act.</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><span className="font-semibold">Transparency:</span> You have the right to be informed about how your data is collected and used.</li>
                                        <li><span className="font-semibold">Security:</span> Your data will be protected with appropriate organizational, physical, and technical measures.</li>
                                        <li><span className="font-semibold">Access & Correction:</span> You may access and request correction of your personal data at any time.</li>
                                        <li><span className="font-semibold">Consent:</span> You may withdraw your consent to data processing, subject to legal and contractual restrictions.</li>
                                    </ul>
                                </div>
                                <div className="h-4" />
                                <p className="text-center text-gray-500">For more information, visit the <a href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener noreferrer" className="text-[#1976D2] underline">National Privacy Commission</a> website.</p>
                            </div>
                        </div>
                        <style jsx>{`
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                            .animate-fadeIn {
                                animation: fadeIn 0.2s ease;
                            }
                            @keyframes scaleIn {
                                from { opacity: 0; transform: scale(0.95); }
                                to { opacity: 1; transform: scale(1); }
                            }
                            .animate-scaleIn {
                                animation: scaleIn 0.25s cubic-bezier(0.4,0,0.2,1);
                            }
                        `}</style>
                    </div>
                )}
                <div className="mt-4 text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/auth/sign-in" className="text-[#2196F3] font-semibold hover:underline">Sign In</Link>
                </div>
            </div>
            {/* Copyright */}
            <div className="mt-8 text-xs text-gray-400">© 2025 IskoLAR</div>
            <div className="h-8" /> {/* Extra space at the bottom */}
        </div>
    );
}