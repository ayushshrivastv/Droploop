// This file provides adapter components using Tailwind CSS
// to maintain the same component interfaces without Chakra UI

import React, { ReactNode } from 'react';

// Define props types to match the previous interface
type BoxProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
  p?: string | number;
  px?: string | number;
  py?: string | number;
  pt?: string | number;
  pr?: string | number;
  pb?: string | number;
  pl?: string | number;
  m?: string | number;
  mx?: string | number;
  my?: string | number;
  mt?: string | number;
  mr?: string | number;
  mb?: string | number;
  ml?: string | number;
  w?: string | number;
  h?: string | number;
  bg?: string;
  color?: string;
  borderRadius?: string;
  borderColor?: string;
  borderWidth?: string | number;
  shadow?: string;
  textAlign?: string;
  display?: string;
  alignItems?: string;
  justifyContent?: string;
  flexDirection?: string;
  flex?: string | number;
};

type FlexProps = BoxProps;

// Utility function to convert Chakra-style spacing to Tailwind classes
const getSpacing = (value: string | number | undefined): string => {
  if (value === undefined) return '';
  // Convert Chakra spacing (0-20) to Tailwind spacing (0, 0.5, 1, 1.5, 2, etc.)
  const numValue = typeof value === 'string' ? parseInt(value) : value;
  
  const spacingMap: Record<number, string> = {
    0: '0',
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    8: '8',
    10: '10',
    12: '12',
    16: '16',
    20: '20',
  };
  
  return spacingMap[numValue] || String(numValue);
};

// Box component (replaces Chakra's Box)
const Box: React.FC<BoxProps> = ({ 
  children,
  className = '',
  as: Component = 'div',
  p, px, py, pt, pr, pb, pl,
  m, mx, my, mt, mr, mb, ml,
  w, h,
  bg,
  color,
  borderRadius,
  borderColor,
  borderWidth,
  shadow,
  textAlign,
  display,
  alignItems,
  justifyContent,
  flexDirection,
  flex,
  ...props
}) => {
  const classes = [
    // Padding
    p ? `p-${getSpacing(p)}` : '',
    px ? `px-${getSpacing(px)}` : '',
    py ? `py-${getSpacing(py)}` : '',
    pt ? `pt-${getSpacing(pt)}` : '',
    pr ? `pr-${getSpacing(pr)}` : '',
    pb ? `pb-${getSpacing(pb)}` : '',
    pl ? `pl-${getSpacing(pl)}` : '',
    
    // Margin
    m ? `m-${getSpacing(m)}` : '',
    mx ? `mx-${getSpacing(mx)}` : '',
    my ? `my-${getSpacing(my)}` : '',
    mt ? `mt-${getSpacing(mt)}` : '',
    mr ? `mr-${getSpacing(mr)}` : '',
    mb ? `mb-${getSpacing(mb)}` : '',
    ml ? `ml-${getSpacing(ml)}` : '',
    
    // Dimensions
    w ? `w-${w}` : '',
    h ? `h-${h}` : '',
    
    // Colors
    bg ? `bg-${bg}` : '',
    color ? `text-${color}` : '',
    
    // Borders
    borderRadius ? `rounded-${borderRadius}` : '',
    borderColor ? `border-${borderColor}` : '',
    borderWidth ? `border-${borderWidth}` : '',
    
    // Shadow
    shadow ? `shadow-${shadow}` : '',
    
    // Text alignment
    textAlign ? `text-${textAlign}` : '',
    
    // Display and flex properties
    display ? `${display}` : '',
    alignItems ? `items-${alignItems}` : '',
    justifyContent ? `justify-${justifyContent}` : '',
    flexDirection ? `flex-${flexDirection}` : '',
    flex !== undefined ? `flex-${flex}` : '',
    
    className
  ].filter(Boolean).join(' ');
  
  return <Component className={classes} {...props}>{children}</Component>;
};

// Flex component (replaces Chakra's Flex)
const Flex: React.FC<FlexProps> = (props) => {
  return <Box display="flex" {...props} />;
};

type CardProps = BoxProps & {
  children: ReactNode;
  p?: string | number;
  m?: string | number;
  flex?: string | number;
  bg?: string;
  borderColor?: string;
  borderWidth?: string | number;
  textAlign?: string;
};

// Card adapter components
export const Card = ({ children, p, m, flex, bg, borderColor, borderWidth, textAlign, ...props }: CardProps) => {
  return (
    <Box 
      p={p} 
      m={m} 
      flex={flex} 
      bg={bg || 'gray-50'} 
      borderColor={borderColor || 'gray-200'} 
      borderWidth={borderWidth || '1'}
      borderRadius="md"
      shadow="sm"
      textAlign={textAlign as any}
      className="rounded-md shadow-sm"
      {...props}
    >
      {children}
    </Box>
  );
};

export const CardBody = ({ children, ...props }: BoxProps) => {
  return <Box p={4} className="p-4" {...props}>{children}</Box>;
};

// Stack adapter components
type StackProps = FlexProps & {
  children: ReactNode;
  spacing?: string | number;
  align?: string;
  justify?: string;
};

export const VStack = ({ children, spacing, align, ...props }: StackProps) => {
  const spacingClass = spacing ? `gap-${getSpacing(spacing)}` : 'gap-2';
  const alignClass = align ? `items-${align}` : 'items-stretch';
  
  return (
    <div 
      className={`flex flex-col ${spacingClass} ${alignClass} ${props.className || ''}`}
    >
      {children}
    </div>
  );
};

export const HStack = ({ children, spacing, justify, ...props }: StackProps) => {
  const spacingClass = spacing ? `gap-${getSpacing(spacing)}` : 'gap-2';
  const justifyClass = justify ? `justify-${justify}` : 'justify-start';
  
  return (
    <div 
      className={`flex flex-row ${spacingClass} ${justifyClass} ${props.className || ''}`}
    >
      {children}
    </div>
  );
};

// Divider adapter
export const Divider = ({ mb, ...props }: BoxProps & { mb?: string | number }) => {
  const mbClass = mb ? `mb-${getSpacing(mb)}` : '';
  return <hr className={`h-px w-full bg-gray-200 ${mbClass} ${props.className || ''}`} />;
};

// Button adapter
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: string;
  leftIcon?: ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
}

export const Button = ({ 
  children, 
  variant = 'solid', 
  size = 'md', 
  colorScheme = 'gray',
  leftIcon, 
  isLoading,
  isDisabled,
  onClick,
  className = '',
  ...props 
}: ButtonProps) => {
  // Define Tailwind classes based on props
  const baseClasses = 'font-medium rounded-md focus:outline-none transition-colors';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }[size];
  
  const variantClasses = {
    solid: 'bg-black text-white hover:bg-gray-800 border border-transparent',
    outline: 'bg-transparent text-white border border-white hover:bg-gray-900',
    ghost: 'bg-transparent text-white hover:bg-gray-900 border border-transparent',
  }[variant];
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
    </button>
  );
};

// Form components 
export const FormControl = ({ children, className = '', ...props }: BoxProps) => {
  return <div className={`mb-4 ${className}`} {...props}>{children}</div>;
};

export const FormLabel = ({ children, className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return <label className={`block font-medium mb-2 ${className}`} {...props}>{children}</label>;
};

// Alert components
type AlertProps = BoxProps & {
  status?: 'info' | 'warning' | 'success' | 'error';
  children: ReactNode;
};

export const Alert = ({ status = 'info', children, className = '', ...props }: AlertProps) => {
  const bgColor = {
    info: 'bg-blue-900',
    warning: 'bg-yellow-900',
    success: 'bg-green-900',
    error: 'bg-red-900',
  }[status];
  
  const borderColor = {
    info: 'border-blue-700',
    warning: 'border-yellow-700',
    success: 'border-green-700',
    error: 'border-red-700',
  }[status];
  
  return (
    <div
      className={`p-4 rounded-md ${bgColor} border border-${borderColor} flex items-center ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const AlertIcon = ({ status = 'info' }: { status?: 'info' | 'warning' | 'success' | 'error' }) => {
  // Use a simple colored circle instead of icons
  const color = {
    info: 'bg-blue-300',
    warning: 'bg-yellow-300',
    success: 'bg-green-300',
    error: 'bg-red-300',
  }[status];
  
  return (
    <div 
      className={`w-[18px] h-[18px] rounded-full ${color} mr-3`}
    />
  );
};

// LinkButton component for anchor tag functionality
export const LinkButton: React.FC<{
  href: string;
  target?: string;
  rel?: string;
  isDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'ghost';
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  className?: string;
}> = ({
  href,
  target,
  rel,
  isDisabled,
  size = 'md',
  variant = 'solid',
  children,
  leftIcon,
  className = '',
}) => {
  // Map sizes to Tailwind classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3 text-lg',
  }[size];

  // Map variants to Tailwind classes
  const variantClasses = {
    solid: 'bg-black text-white hover:bg-gray-800 border border-transparent',
    outline: 'bg-transparent text-white border border-white hover:bg-gray-900',
    ghost: 'bg-transparent text-white hover:bg-gray-900 border-transparent',
  }[variant];

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={`inline-flex items-center rounded-md font-medium ${sizeClasses} ${variantClasses} ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} transition-colors ${className}`}
      onClick={(e) => isDisabled && e.preventDefault()}
    >
      {leftIcon && (
        <span className="mr-2 inline-flex">
          {leftIcon}
        </span>
      )}
      {children}
    </a>
  );
};

// Toast adapter
export const useToast = () => {
  // Create a simple toast notification using browser alert for now
  // In a real app, you would use a proper toast library like react-hot-toast or sonner
  return (options: any) => {
    console.log('[Toast]', options.title, options.description);
    // You can replace this with a proper toast library integration
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        alert(options.title + (options.description ? '\n' + options.description : ''));
      }, 0);
    }
    // Return a fake ID for compatibility
    return Math.random().toString();
  };
};
