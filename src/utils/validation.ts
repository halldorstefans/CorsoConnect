// Common validation rules for forms
export const validationRules = {
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  },

  password: {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters",
    },
  },

  vehicle: {
    make: {
      required: "Make is required",
    },
    model: {
      required: "Model is required",
    },
    year: {
      required: "Year is required",
      min: {
        value: 1900,
        message: "Year must be 1900 or later",
      },
      max: {
        value: new Date().getFullYear() + 1,
        message: `Year cannot be later than ${new Date().getFullYear() + 1}`,
      },
    },
  },

  service: {
    date: {
      required: "Date is required",
    },
    description: {
      required: "Description is required",
    },
    cost: {
      required: "Cost is required",
      min: {
        value: 0,
        message: "Cost cannot be negative",
      },
    },
    service_type: {
      required: "Service type is required",
    },
    odometer_reading: {
      min: {
        value: 0,
        message: "Odometer reading cannot be negative",
      },
    },
  },
};

// Helper function to format validation errors for display
export function formatValidationErrors(errors: Record<string, any>): string {
  return Object.values(errors)
    .map((error) => error.message)
    .join(", ");
}

// Form input styling helper
export function getInputClassName(
  error?: any,
  baseClass = "border p-2 w-full rounded-md bg-background text-neutral-800",
) {
  return `${baseClass} ${error ? "border-error" : "border-neutral-600"}`;
}
