// utils/validation.tsx

// Checks if the username is 6–20 characters, starts with a letter,
// and only contains letters, numbers, dots (.), underscores (_), or hyphens (-)
export const isValidUsername = (username: string): boolean => {
    const regex = /^[a-zA-Z][a-zA-Z0-9._-]{5,19}$/;
    return regex.test(username);
};

// Validates standard email format with @ and a valid domain,
// including a top-level domain of at least 2 letters
export const isValidEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };
  
// Ensures the password is at least 8 characters long and includes
// one uppercase letter, one lowercase letter, one number, and one special character
export const isValidPassword = (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };
  
// Checks if the input is exactly a 4-digit numeric PIN, only 0–9 are valid
export const isValidPin = (pin: string): boolean => {
    const regex = /^\d{4}$/;
    return regex.test(pin);
  };