/**
 * Utility function for consistent currency formatting across the application
 */

export function formatCurrency(
  amount: number, 
  currency: string = 'NGN', 
  locale: string = 'en-NG'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function formatNumber(
  number: number,
  locale: string = 'en-NG'
): string {
  try {
    return new Intl.NumberFormat(locale).format(number);
  } catch (error) {
    return number.toLocaleString();
  }
}

export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`;
}
