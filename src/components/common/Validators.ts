import validator from 'validator';

export const isEmailValid = (emailAddress: string): boolean => validator.isEmail(emailAddress);

export const isUrlValid = (url: string): boolean => validator.isURL(url);
