export const CreateUserMessages = {
  name: {
    invalidFormat: 'name is required',
    lengthField: 'name: min length is 1, max is 15'
  },
  email: {
    invalidFormat: 'email must be a valid address'
  },
  password: {
    invalidFormat: 'password is required',
    lengthField: 'password: min length is 6, max is 12'
  },
  type: {
    invalidFormat: 'type must be ordinary or pro'
  },
} as const;
