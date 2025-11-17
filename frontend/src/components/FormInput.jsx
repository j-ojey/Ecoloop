import React, { useState } from 'react';
import { Check, X, Mail, User } from 'lucide-react';

export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error = null,
  icon = null,
  validation = null,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  // Validation logic
  const getValidationResult = () => {
    if (!validation || !value) return null;

    switch (validation.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: emailRegex.test(value),
          message: emailRegex.test(value) ? 'Valid email' : 'Please enter a valid email address'
        };
      case 'name':
        return {
          isValid: value.length >= 2,
          message: value.length >= 2 ? 'Looks good!' : 'Name must be at least 2 characters'
        };
      case 'minLength':
        return {
          isValid: value.length >= validation.value,
          message: value.length >= validation.value ? 'Good length' : `Must be at least ${validation.value} characters`
        };
      default:
        return null;
    }
  };

  const validationResult = getValidationResult();
  const showValidation = touched && validationResult && value;

  // Auto-select icon based on type
  const getIcon = () => {
    if (icon) return icon;
    if (type === 'email') return <Mail className="w-5 h-5" />;
    if (type === 'text' && label?.toLowerCase().includes('name')) return <User className="w-5 h-5" />;
    return null;
  };

  const inputIcon = getIcon();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {inputIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {inputIcon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setTouched(true);
          }}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 border rounded-lg transition-all duration-200
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${inputIcon ? 'pl-12' : 'pl-4'}
            ${error || (validationResult && !validationResult.isValid && touched)
              ? 'border-red-300 dark:border-red-600 focus:ring-red-500/30 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-green-500/30 focus:border-green-500'
            }
            ${isFocused ? 'shadow-lg' : 'shadow-sm'}
          `}
          {...props}
        />

        {/* Validation indicator */}
        {showValidation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validationResult.isValid ? (
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <X className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
          </div>
        )}
      </div>

      {/* Validation message */}
      {showValidation && (
        <div className={`flex items-center gap-1 text-xs ${
          validationResult.isValid
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {validationResult.isValid ? (
            <Check className="w-3 h-3" />
          ) : (
            <X className="w-3 h-3" />
          )}
          {validationResult.message}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}