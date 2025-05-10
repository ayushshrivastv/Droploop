// This file provides adapter components for Chakra UI
// to make our components work without major refactoring

import React, { ReactNode, forwardRef } from 'react';
import { Box, Flex, Button as ChakraButton, BoxProps, FlexProps, Text, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';

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
      padding={p} 
      margin={m} 
      flex={flex} 
      bg={bg || 'gray.50'} 
      borderColor={borderColor || 'gray.200'} 
      borderWidth={borderWidth || '1px'}
      borderRadius="md"
      shadow="sm"
      textAlign={textAlign as any}
      {...props}
    >
      {children}
    </Box>
  );
};

export const CardBody = ({ children, ...props }: BoxProps) => {
  return <Box p={4} {...props}>{children}</Box>;
};

// Stack adapter components
type StackProps = FlexProps & {
  children: ReactNode;
  spacing?: string | number;
  align?: string;
  justify?: string;
};

export const VStack = ({ children, spacing, align, ...props }: StackProps) => {
  return (
    <Flex 
      direction="column" 
      gap={spacing || 2} 
      alignItems={align as any || 'stretch'} 
      {...props}
    >
      {children}
    </Flex>
  );
};

export const HStack = ({ children, spacing, justify, ...props }: StackProps) => {
  return (
    <Flex 
      direction="row" 
      gap={spacing || 2} 
      justifyContent={justify as any || 'flex-start'} 
      {...props}
    >
      {children}
    </Flex>
  );
};

// Divider adapter
export const Divider = ({ mb, ...props }: BoxProps & { mb?: string | number }) => {
  return <Box as="hr" h="1px" w="100%" bg="gray.200" marginBottom={mb} {...props} />;
};

// Button adapter
export interface ButtonProps extends Omit<React.ComponentProps<typeof ChakraButton>, 'size'> {
  children: ReactNode;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: string;
  leftIcon?: React.ReactElement | undefined;
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
  ...props 
}: ButtonProps) => {
  return (
    <ChakraButton
      onClick={onClick}
      disabled={isDisabled}
      loading={isLoading}
      {...props}
    >
      {leftIcon && <Box as="span" mr={2}>{leftIcon}</Box>}
      {children}
    </ChakraButton>
  );
};

// Forward ref button that can be used with Next.js Link
export const ButtonWithRef = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'ref'>>((props, ref) => {
  return <ChakraButton ref={ref} {...props}>{props.children}</ChakraButton>;
});

ButtonWithRef.displayName = 'ButtonWithRef';

// LinkButton Props interface
export interface LinkButtonProps extends ButtonProps {
  href: string;
  target?: string;
  rel?: string;
}

// LinkButton component for anchor tag functionality
export const LinkButton = ({ children, href, target, rel, ...props }: LinkButtonProps) => {
  return (
    <a href={href} target={target} rel={rel}>
      <Button {...props}>{children}</Button>
    </a>
  );
};

// Form components 
export const FormControl = ({ children, ...props }: BoxProps) => {
  return <Box mb={4} {...props}>{children}</Box>;
};

export const FormLabel = ({ children, ...props }: BoxProps) => {
  return <Text as="label" fontWeight="medium" mb={2} {...props}>{children}</Text>;
};

// Alert components
type AlertProps = BoxProps & {
  status?: 'info' | 'warning' | 'success' | 'error';
  children: ReactNode;
};

export const Alert = ({ status = 'info', children, ...props }: AlertProps) => {
  const bgColor = {
    info: 'blue.900',
    warning: 'yellow.900',
    success: 'green.900',
    error: 'red.900',
  }[status];
  
  const borderColor = {
    info: 'blue.700',
    warning: 'yellow.700',
    success: 'green.700',
    error: 'red.700',
  }[status];
  
  return (
    <Box
      p={4}
      borderRadius="md"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      display="flex"
      alignItems="center"
      {...props}
    >
      {children}
    </Box>
  );
};

export const AlertIcon = ({ status = 'info' }: { status?: 'info' | 'warning' | 'success' | 'error' }) => {
  // Use a simple colored circle instead of icons
  const color = {
    info: 'blue.300',
    warning: 'yellow.300',
    success: 'green.300',
    error: 'red.300',
  }[status];
  
  return (
    <Box 
      width="18px" 
      height="18px" 
      borderRadius="full" 
      bg={color} 
      mr={3}
    />
  );
};

// Toast adapter
export const useToast = () => {
  // Create a simple toast function for compatibility
  return (options: any) => {
    console.log('[Toast]', options.title, options.description);
    // Return a fake ID for compatibility
    return Math.random().toString();
  };
};
