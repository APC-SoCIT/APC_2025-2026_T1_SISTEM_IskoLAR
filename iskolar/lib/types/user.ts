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
  college?: string;
  course?: string;
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
  
  // Additional fields that may be needed for profile
  createdAt?: string;
  updatedAt?: string;
  status?: string;
}

/**
 * Validation utilities for user data
 */
export const userValidation = {
  /**
   * Validates mobile number format
   * @param mobile Mobile number to validate
   * @returns Cleaned mobile number or error message
   */
  validateMobile: (mobile: string): { isValid: boolean; value?: string; error?: string } => {
    const cleaned = mobile.replace(/\D/g, '');
    if (cleaned.length < 7 || cleaned.length > 15) {
      return { isValid: false, error: 'Phone number must be between 7 and 15 digits' };
    }
    return { isValid: true, value: cleaned };
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