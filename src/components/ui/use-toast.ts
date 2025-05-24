// Simple standalone toast implementation
import * as React from 'react';

export type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
  duration?: number; // Duration in milliseconds
};

let count = 0;

function generateId() {
  return `${count++}`;
}

export function toast({
  title,
  description,
  variant,
  ...props
}: ToastProps) {
  const id = generateId();

  // This would normally dispatch to a toast store
  // For simplicity, we're just logging to console
  console.log(`Toast ${id}:`, { title, description, variant, ...props });
  
  // In a real implementation, this would return methods to update or dismiss the toast
  return {
    id,
    dismiss: () => console.log(`Dismissing toast ${id}`),
    update: (props: ToastProps) => console.log(`Updating toast ${id}:`, props),
  };
}
