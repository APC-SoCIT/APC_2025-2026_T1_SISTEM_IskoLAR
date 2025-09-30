export interface PasswordValidationResult {
  isValid: boolean;
  error: string;
}

export function validatePassword(password: string): PasswordValidationResult {
  // Check minimum length
  if (password.length < 8) {
    return { 
      isValid: false, 
      error: 'Password must be at least 8 characters long'
    };
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one uppercase letter'
    };
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one number'
    };
  }

  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one special character'
    };
  }

  return { 
    isValid: true, 
    error: ''
  };
}

export function validatePasswordMatch(password: string, confirmPassword: string): PasswordValidationResult {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Passwords do not match'
    };
  }
  return {
    isValid: true,
    error: ''
  };
}

export const PASSWORD_REQUIREMENTS = [
  'At least 8 characters long',
  'At least one uppercase letter',
  'At least one number',
  'At least one special character (!@#$%^&*(),.?":{}|<>)'
];