import React, { useState } from "react";
import { Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

interface UserData {
  dateOfBirth: string;
  nic: string;
  education: string;
  verificationClaim: string;
}

interface DataInputStepProps {
  userData: UserData;
  onDataChange: (data: UserData) => void;
  onNext: () => void;
}

export function DataInputStep({
  userData,
  onDataChange,
  onNext,
}: DataInputStepProps) {
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const handleInputChange = (field: keyof UserData, value: string) => {
    onDataChange({ ...userData, [field]: value });
  };

  const isFormValid = userData.dateOfBirth && userData.nic;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 animate-fade-in-up transition-all duration-500 hover:bg-white/15 hover:border-white/30">
      <div className="mb-8 animate-fade-in-up animation-delay-200">
        <h3 className="text-2xl font-bold text-white mb-3 transition-all duration-300 hover:text-transparent hover:bg-gradient-to-r hover:from-purple-400 hover:to-blue-400 hover:bg-clip-text">
          Secure Data Input
        </h3>
        <div className="flex items-start space-x-3 bg-amber-600/20 rounded-xl p-4 border border-amber-600/30 transition-all duration-300 hover:bg-amber-600/25 hover:border-amber-600/40 animate-fade-in-up animation-delay-400">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0 animate-pulse-glow" />
          <div>
            <p className="text-amber-300 font-medium text-sm mb-1 transition-all duration-300 hover:text-amber-200">
              Privacy Guarantee
            </p>
            <p className="text-amber-200/80 text-sm transition-all duration-300 hover:text-amber-200">
              All data is processed locally on your device. Nothing is sent to
              our servers until converted to a zero-knowledge proof.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 animate-stagger-in">
        <div className="animate-fade-in-up animation-delay-600">
          <label className="block text-sm font-medium text-slate-300 mb-2 transition-all duration-300 hover:text-slate-200">
            Date of Birth *
          </label>
          <div className="relative">
            <input
              type={showSensitiveData ? "date" : "password"}
              value={userData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 hover:bg-slate-800/70 hover:border-slate-500 focus:scale-[1.02] transform"
              placeholder={showSensitiveData ? "" : "Enter your date of birth"}
            />
            <Lock className="absolute right-3 top-3.5 h-5 w-5 text-slate-500 transition-all duration-300 hover:text-slate-400" />
          </div>
        </div>

        <div className="animate-fade-in-up animation-delay-800">
          <label className="block text-sm font-medium text-slate-300 mb-2 transition-all duration-300 hover:text-slate-200">
            National ID Card (NIC) *
          </label>
          <div className="relative">
            <input
              type={showSensitiveData ? "text" : "password"}
              value={userData.nic}
              onChange={(e) => handleInputChange("nic", e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 hover:bg-slate-800/70 hover:border-slate-500 focus:scale-[1.02] transform"
              placeholder={
                showSensitiveData ? "e.g., 123456789V" : "Enter your NIC number"
              }
            />
            <Lock className="absolute right-3 top-3.5 h-5 w-5 text-slate-500 transition-all duration-300 hover:text-slate-400" />
          </div>
        </div>

        <div className="animate-fade-in-up animation-delay-1000">
          <label className="block text-sm font-medium text-slate-300 mb-2 transition-all duration-300 hover:text-slate-200">
            Education Level (Optional)
          </label>
          <select
            value={userData.education}
            onChange={(e) => handleInputChange("education", e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 hover:bg-slate-800/70 hover:border-slate-500 focus:scale-[1.02] transform"
          >
            <option value="">Select education level</option>
            <option value="high_school">High School</option>
            <option value="bachelor">Bachelor's Degree</option>
            <option value="master">Master's Degree</option>
            <option value="phd">PhD</option>
          </select>
        </div>

        <div className="animate-fade-in-up animation-delay-1200">
          <label className="block text-sm font-medium text-slate-300 mb-2 transition-all duration-300 hover:text-slate-200">
            Verification Claim
          </label>
          <select
            value={userData.verificationClaim}
            onChange={(e) =>
              handleInputChange("verificationClaim", e.target.value)
            }
            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 hover:bg-slate-800/70 hover:border-slate-500 focus:scale-[1.02] transform"
          >
            <option value="age_over_18">Prove I am over 18 years old</option>
            <option value="age_over_21">Prove I am over 21 years old</option>
            <option value="valid_nic">Prove I have a valid NIC</option>
            <option value="education_level">Prove my education level</option>
          </select>
        </div>

        <div className="flex items-center space-x-3 pt-4 animate-fade-in-up animation-delay-1400">
          <button
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-all duration-300 hover:scale-105 group"
          >
            {showSensitiveData ? (
              <EyeOff className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <Eye className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            )}
            <span>{showSensitiveData ? "Hide" : "Show"} sensitive data</span>
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-end animate-fade-in-up animation-delay-1600">
        <button
          onClick={onNext}
          disabled={!isFormValid}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl shadow-purple-500/25 disabled:hover:scale-100 disabled:hover:shadow-none relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
        >
          <span className="relative z-10">Continue to Contract Execution</span>
        </button>
      </div>
    </div>
  );
}
