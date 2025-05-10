import { defineStyleConfig, defineStyle, createMultiStyleConfigHelpers, extendTheme } from '@chakra-ui/react';

// Theme configuration for dark mode
const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

// Extreme black and white color palette
const colors = {
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#F7F7F7',
    100: '#EDEDED',
    200: '#DFDFDF',
    300: '#CACACA',
    400: '#A0A0A0',
    500: '#747474',
    600: '#5E5E5E',
    700: '#3F3F3F',
    800: '#262626',
    900: '#121212',
  },
};

// Component style overrides
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      borderRadius: 'md',
    },
    variants: {
      solid: {
        bg: 'white',
        color: 'black',
        _hover: {
          bg: 'gray.200',
        },
        _active: {
          bg: 'gray.300',
        },
      },
      outline: {
        borderColor: 'white',
        color: 'white',
        _hover: {
          bg: 'gray.800',
        },
      },
      ghost: {
        color: 'white',
        _hover: {
          bg: 'gray.800',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'gray.900',
        borderColor: 'gray.700',
      },
    },
  },
  Heading: {
    baseStyle: {
      color: 'white',
    },
  },
  Text: {
    baseStyle: {
      color: 'gray.300',
    },
  },
  Input: {
    baseStyle: {
      field: {
        borderColor: 'gray.600',
        _hover: {
          borderColor: 'white',
        },
        _focus: {
          borderColor: 'white',
          boxShadow: '0 0 0 1px white',
        },
      },
    },
    variants: {
      outline: {
        field: {
          bg: 'gray.800',
          borderColor: 'gray.600',
        },
      },
    },
  },
  FormLabel: {
    baseStyle: {
      color: 'gray.200',
    },
  },
  Divider: {
    baseStyle: {
      borderColor: 'gray.700',
    },
  },
};

// Main theme
const theme = extendTheme({
  config,
  colors,
  components,
  styles: {
    global: {
      body: {
        bg: 'black',
        color: 'white',
      },
    },
  },
});

export default theme;
