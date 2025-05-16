/**
 * Utility function to conditionally join CSS class names together
 * 
 * @param classes - Array of class names or conditional class name strings
 * @returns Combined class name string
 * 
 * @example
 * // Basic usage
 * classNames('text-red-500', 'font-bold') // 'text-red-500 font-bold'
 * 
 * // With conditional classes
 * classNames('text-base', isActive && 'font-bold', error && 'text-red-500')
 * // If isActive is true and error is false: 'text-base font-bold'
 */
export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
