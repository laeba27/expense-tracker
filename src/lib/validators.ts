export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2;
}

export function validateExpense(amount: number, description: string, category: string): boolean {
  return amount > 0 && description.trim().length > 0 && category.trim().length > 0;
}
