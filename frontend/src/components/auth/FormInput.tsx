import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface FormInputProps {
  type?: 'text' | 'email' | 'password';
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  type = 'text',
  label,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  autoComplete,
  className = ""
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasValue = value.length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`
            w-full px-4 py-4 pt-6 pb-2
            bg-[#2A2A2A] border-2 rounded-lg
            text-white placeholder-transparent
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-0
            ${isFocused || hasValue 
              ? 'border-[#A78BFA] bg-[#2F2F2F]' 
              : 'border-[#404040] hover:border-[#505050]'
            }
            ${error ? 'border-[#F472B6] bg-[#2F2F2F]' : ''}
          `}
        />
        
        <label
          className={`
            absolute left-4 transition-all duration-200 ease-in-out pointer-events-none
            ${isFocused || hasValue 
              ? 'top-2 text-xs text-[#A78BFA]' 
              : 'top-4 text-base text-[#B3B3B3]'
            }
            ${error ? 'text-[#F472B6]' : ''}
          `}
        >
          {label}
          {required && <span className="text-[#F472B6] ml-1">*</span>}
        </label>

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#B3B3B3] hover:text-white transition-colors"
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#F472B6] rounded-full" />
          <span className="text-sm text-[#F472B6]">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput; 