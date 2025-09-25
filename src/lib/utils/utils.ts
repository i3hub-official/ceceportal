// import { type ClassValue, clsx } from 'clsx';
// import { twMerge } from 'tailwind-merge';

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// // Validation functions
// export const validateNIN = (nin: string): boolean => {
//   return /^\d{11}$/.test(nin.replace(/\s/g, ''));
// };

// export const validatePhoneNumber = (phone: string): boolean => {
//   return /^(\+234|0)[789][01]\d{8}$/.test(phone.replace(/\s/g, ''));
// };

// export const validateAge = (dateOfBirth: string): boolean => {
//   const birthDate = new Date(dateOfBirth);
//   const today = new Date();
//   let age = today.getFullYear() - birthDate.getFullYear();
//   const monthDiff = today.getMonth() - birthDate.getMonth();
  
//   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//     age--;
//   }
  
//   return age >= 16;
// };

