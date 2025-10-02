// User interfaces for consistent data structure across registration and profile editing

/**
 * Common user fields shared between registration and profile
 */
export interface UserBase {
  // Personal Information
  firstName: string;
  lastName: string;
  middleName?: string; // Optional
  gender: string;
  birthdate: string; // ISO format: YYYY-MM-DD
  email: string;
  mobile: string;
  
  // Address Information (optional during registration, required in profile)
  addressLine1?: string;
  addressLine2?: string;
  barangay?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  region?: string;
  
  // Education Information (optional during registration, required in profile)
  college?: string; // maps to college in DB
  course?: string;
  yearLevel?: string;
  gpa?: string;
}

/**
 * User data specific to registration
 */
export interface UserRegistration extends UserBase {
  password: string;
  confirmPassword?: string; // Only used in UI, not stored
}

/**
 * User profile data with additional fields
 */
export interface UserProfile extends UserBase {
  userId?: string;
  scholarId?: string;
  
  // Document URLs
  psaDocumentUrl?: string;
  voterDocumentUrl?: string;
  nationalIdDocumentUrl?: string;
  
  // Academic information
  yearLevel?: string;
  gpa?: string;
  
  // Additional fields that may be needed for profile
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  lastLogin?: string;
}

/**
 * Validation utilities for user data
 */
export const userValidation = {
  /**
   * Validates email format
   * @param email Email address to validate
   * @returns Whether the email is valid
   */
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validates mobile number format
   * @param mobile Mobile number to validate
   * @returns Cleaned mobile number or error message
   */
  validateMobile: (mobile: string): { isValid: boolean; value?: string; error?: string } => {
    if (!mobile || mobile.trim() === '') {
      return { isValid: true, value: '' }; // Allow empty mobile numbers
    }
    
    const cleaned = mobile.replace(/\D/g, '');
    
    // Handle different Philippine mobile number formats
    if (cleaned.length === 10) {
      // 10 digits: 9171234567 -> add leading 0
      return { isValid: true, value: '0' + cleaned };
    } else if (cleaned.length === 11) {
      // 11 digits: 09171234567 -> standard format
      return { isValid: true, value: cleaned };
    } else if (cleaned.length === 13 && cleaned.startsWith('63')) {
      // 13 digits with country code: 639171234567 -> convert to 09171234567
      return { isValid: true, value: '0' + cleaned.substring(2) };
    } else if (cleaned.length >= 7 && cleaned.length <= 15) {
      // International numbers or other valid formats
      return { isValid: true, value: cleaned };
    }
    
    return { isValid: false, error: 'Please enter a valid mobile number (e.g., 09171234567)' };
  },

  /**
   * Validates required fields
   * @param fields Object with field names and values to validate
   * @returns Array of missing required fields
   */
  validateRequiredFields: (fields: Record<string, any>): string[] => {
    const requiredFields = ['firstName', 'lastName', 'email', 'gender', 'birthdate'];
    const missing: string[] = [];
    
    requiredFields.forEach(field => {
      if (!fields[field] || fields[field].toString().trim() === '') {
        missing.push(field);
      }
    });
    
    return missing;
  },
  
  /**
   * Validates ZIP code format
   * @param zipCode ZIP code to validate
   * @returns Whether the ZIP code is valid
   */
  validateZipCode: (zipCode: string): boolean => {
    return /^\d{4}$/.test(zipCode);
  },
  
  /**
   * Formats date from ISO to MM/DD/YYYY display format
   * @param isoDate Date in ISO format
   * @returns Date in MM/DD/YYYY format
   */
  formatDateForDisplay: (isoDate: string): string => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  },
  
  /**
   * Parses display date (MM/DD/YYYY) back to ISO format
   * @param displayDate Date in MM/DD/YYYY format
   * @returns Date in ISO format
   */
  parseDisplayDate: (displayDate: string): string => {
    if (!displayDate) return '';
    
    // Handle different formats: MM/DD/YYYY or MM-DD-YYYY
    const parts = displayDate.split(/[/\-]/);
    if (parts.length !== 3) return '';
    
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = parts[2];
    
    return `${year}-${month}-${day}`;
  }
};