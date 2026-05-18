export const CreateUserMessages = {
  name: {
    invalidFormat: 'name is required',
    lengthField: 'min length is 1, max is 15'
  },
  email: {
    invalidFormat: 'email must be a valid address'
  },
  avatarPath: {
    invalidFormat: 'avatarPath must end with .jpg or .png'
  },
  password: {
    invalidFormat: 'password is required',
    lengthField: 'min length is 6, max is 12'
  },
  type: {
    invalidFormat: 'type must be Ordinary or Pro'
  },
} as const;
