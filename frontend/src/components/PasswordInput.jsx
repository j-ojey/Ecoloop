import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

export default function PasswordInput({
  label,
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  showStrength = false,
  confirmValue = null,
  error = null,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (password) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    return { score, checks };
  };

  const { score, checks } = showStrength ? getPasswordStrength(value) : { score: 0, checks: {} };

  const getStrengthColor = () => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  // Check if passwords match (for confirm password field)
  const passwordsMatch = confirmValue !== null ? value === confirmValue : true;
  const showMatchError = confirmValue !== null && value && !passwordsMatch;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 pr-12 border rounded-lg transition-all duration-200
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${error || showMatchError
              ? 'border-red-300 dark:border-red-600 focus:ring-red-500/30 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-green-500/30 focus:border-green-500'
            }
            ${isFocused ? 'shadow-lg' : 'shadow-sm'}
          `}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md
                     text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                     hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Password Strength Indicator */}
      {showStrength && value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
            <span className={`font-medium ${
              score <= 2 ? 'text-red-600 dark:text-red-400' :
              score <= 3 ? 'text-yellow-600 dark:text-yellow-400' :
              score <= 4 ? 'text-blue-600 dark:text-blue-400' :
              'text-green-600 dark:text-green-400'
            }`}>
              {getStrengthText()}
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${(score / 5) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className={`flex items-center gap-1 ${checks.length ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
              {checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              8+ characters
            </div>
            <div className={`flex items-center gap-1 ${checks.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
              {checks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              Uppercase
            </div>
            <div className={`flex items-center gap-1 ${checks.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
              {checks.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              Lowercase
            </div>
            <div className={`flex items-center gap-1 ${checks.number ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
              {checks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              Number
            </div>
            <div className={`flex items-center gap-1 ${checks.special ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
              {checks.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              Special char
            </div>
          </div>
        </div>
      )}

      {/* Password Match Indicator */}
      {confirmValue !== null && value && (
        <div className={`flex items-center gap-1 text-xs ${
          passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}