import { Box, Text, VStack } from "@chakra-ui/react";

export default function Logo({ size = "md", darkBg = false }) {
  const scales = {
    sm: { top: "9px", main: "22px", sub: "9px" },
    md: { top: "10px", main: "32px", sub: "10px" },
    lg: { top: "12px", main: "44px", sub: "12px" },
  };
  const s = scales[size];
  const textColor = darkBg ? "#F2EDE4" : "#6E2035";
  const ruleColor = darkBg ? "rgba(184,169,154,0.4)" : "#B8A99A";
  const topColor = darkBg ? "#7C9A7E" : "#3A5040";
  const subColor = darkBg ? "#B8A99A" : "#7A6A5A";

  return (
    <VStack spacing={1} align="center">
      <Text
        fontSize={s.top}
        letterSpacing="0.3em"
        color={topColor}
        textTransform="uppercase"
        fontFamily="Georgia, serif"
      >
        From Lil With Love
      </Text>
      <Box w="80px" h="1px" bg={ruleColor} />
      <Text
        fontSize={s.main}
        fontWeight="bold"
        color={textColor}
        fontFamily="Georgia, serif"
        lineHeight={1.1}
      >
        Biscuit Bar
      </Text>
      <Box w="80px" h="1px" bg={ruleColor} />
      <Text
        fontSize={s.sub}
        letterSpacing="0.2em"
        color={subColor}
        textTransform="uppercase"
        fontFamily="Georgia, serif"
      >
        Franklin, Indiana
      </Text>
    </VStack>
  );
}
