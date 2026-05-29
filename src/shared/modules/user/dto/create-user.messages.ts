export const CreateUserMessages = {
  name: {
    requiredField: 'name is required',
    invalidFormat: 'name must be string',
    lengthField: 'name: min length is 1, max is 15'
  },
  email: {
    requiredField: 'email is required',
    invalidFormat: 'email must be a valid address'
  },
  password: {
    requiredField: 'password is required',
    invalidFormat: 'password must be string',
    lengthField: 'password: min length is 6, max is 12'
  },
  type: {
    requiredField: 'type is required',
    invalidFormat: 'type must be ordinary or pro'
  },
} as const;
