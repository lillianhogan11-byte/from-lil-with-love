import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#F2EDE4",
      100: "#EDE8DF",
      200: "#B8A99A",
      300: "#5C6E54",
      400: "#6E2035",
      500: "#6E2035",
      600: "#5A1929",
      700: "#3D1019",
      800: "#1A0F0A",
      900: "#0D0705",
    },
    sage: {
      500: "#5C6E54",
      600: "#4A5A43",
    },
  },
  fonts: {
    heading: "Georgia, serif",
    body: "Georgia, serif",
  },
  styles: {
    global: {
      body: {
        bg: "#F2EDE4",
        color: "#1A0F0A",
      },
    },
  },
  components: {
    Button: {
      defaultProps: { colorScheme: "brand" },
      variants: {
        solid: {
          bg: "#6E2035",
          color: "white",
          _hover: { bg: "#5A1929" },
        },
      },
    },
  },
});

export default theme;
