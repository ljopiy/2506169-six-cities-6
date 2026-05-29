export const LoginUserMessages = {
  email: {
    requiredField: 'email is required',
    invalidFormat: 'email must be a valid address'
  },
  password: {
    requiredField: 'password is required',
    invalidFormat: 'password is required',
    lengthField: 'password: min length is 6, max is 12'
  },
} as const;
