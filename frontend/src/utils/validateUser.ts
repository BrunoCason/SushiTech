export const validateName = (name: string) => /^[a-zA-Z\s]{3,}$/.test(name);

export const validatePhone = (phone: string) => phone.replace(/\D/g, '').length === 10 || phone.replace(/\D/g, '').length === 11;

export const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password: string) => password.length >= 8;

export const phoneMask = ['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
