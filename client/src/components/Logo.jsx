import { Box } from "@chakra-ui/react";

const sizes = {
  sm: "80px",
  md: "120px",
  lg: "160px",
};

export default function Logo({ size = "md" }) {
  return (
    <Box w={sizes[size]} h={sizes[size]} borderRadius="50%" overflow="hidden" flexShrink={0}>
      <img
        src="/logo.webp"
        alt="Biscuit Bar — Franklin, IN"
        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
      />
    </Box>
  );
}
