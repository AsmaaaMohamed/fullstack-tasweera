/**
 * Parses backend error messages from string format into field-specific errors
 * Handles both structured errors object and string messages
 * 
 * @param {Object} result - The result object from API call
 * @returns {Object} - Object with field-specific error messages
 */
export function parseRegistrationErrors(result) {
  const errors = {};

  // First, check if there's a structured errors object
  if (result.errors && typeof result.errors === 'object') {
    const fieldMap = {
      email: "email",
      phone: "phone",
      name: "name",
      password: "password",
      password_confirmation: "confirmPassword",
      country_id: "city", // Show country/city errors on city field
      city_id: "city",
    };

    Object.keys(result.errors).forEach((key) => {
      const formField = fieldMap[key] || key;
      const errorMessage = Array.isArray(result.errors[key])
        ? result.errors[key][0]
        : result.errors[key];
      errors[formField] = errorMessage;
    });

    return errors;
  }

  // If no structured errors, parse the message string
  const errorMessage = result.message || result.fullError?.message || "";
  
  if (!errorMessage) {
    return errors;
  }

  // Remove "Validation failed: " prefix if present
  let message = errorMessage.replace(/^Validation failed:\s*/i, "");

  // Common error patterns to match
  const errorPatterns = [
    {
      // Email already exists
      pattern: /email\s+(?:already\s+exists|is\s+already\s+taken|مستخدم\s+من\s+قبل|موجود\s+من\s+قبل)/i,
      field: "email",
      message: message.match(/email\s+(?:already\s+exists|is\s+already\s+taken|مستخدم\s+من\s+قبل|موجود\s+من\s+قبل)/i)?.[0] || 
               (message.includes("email") && message.includes("exists") ? "Email already exists" : null)
    },
    {
      // Phone number invalid for country
      pattern: /(?:رقم\s+الهاتف\s+غير\s+صالح|phone\s+number\s+invalid|phone\s+is\s+invalid)/i,
      field: "phone",
      message: message.match(/(?:رقم\s+الهاتف\s+غير\s+صالح|phone\s+number\s+invalid|phone\s+is\s+invalid)/i)?.[0] || 
               (message.includes("phone") || message.includes("هاتف") ? "Phone number is invalid for the selected country" : null)
    },
    {
      // Phone already exists
      pattern: /phone\s+(?:already\s+exists|is\s+already\s+taken)/i,
      field: "phone",
      message: "Phone number already exists"
    },
    {
      // Password errors
      pattern: /password\s+(?:is\s+required|too\s+short|weak)/i,
      field: "password",
      message: message.match(/password\s+(?:is\s+required|too\s+short|weak)/i)?.[0] || "Password is invalid"
    },
    {
      // Name errors
      pattern: /name\s+(?:is\s+required|invalid)/i,
      field: "name",
      message: message.match(/name\s+(?:is\s+required|invalid)/i)?.[0] || "Name is invalid"
    }
  ];

  // Try to match patterns
  for (const pattern of errorPatterns) {
    if (pattern.pattern.test(message) && pattern.message) {
      errors[pattern.field] = pattern.message;
      break; // Take first match
    }
  }

  // If no pattern matched but message contains field names, try to extract
  if (Object.keys(errors).length === 0) {
    // Split by comma and try to map each part
    const parts = message.split(',').map(p => p.trim()).filter(p => p);
    
    parts.forEach(part => {
      // Check for email
      if (part.toLowerCase().includes('email') || part.includes('بريد')) {
        errors.email = part;
      }
      // Check for phone
      else if (part.toLowerCase().includes('phone') || part.includes('هاتف')) {
        errors.phone = part;
      }
      // Check for password
      else if (part.toLowerCase().includes('password') || part.includes('مرور')) {
        errors.password = part;
      }
      // Check for name
      else if (part.toLowerCase().includes('name') || part.includes('اسم')) {
        errors.name = part;
      }
    });
  }

  // If still no errors extracted, show the full message on a general field
  if (Object.keys(errors).length === 0 && message) {
    // Try to determine which field based on message content
    if (message.toLowerCase().includes('email') || message.includes('بريد')) {
      errors.email = message;
    } else if (message.toLowerCase().includes('phone') || message.includes('هاتف')) {
      errors.phone = message;
    } else {
      // Show as general error (could be shown in a general error area)
      errors._general = message;
    }
  }

  return errors;
}

