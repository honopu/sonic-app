import { useColorModeValue } from '@chakra-ui/color-mode';
import { Box, Flex } from '@chakra-ui/react';
import { FC, HTMLAttributes } from 'react';

type GradientBoxProps = HTMLAttributes<HTMLDivElement> & {
  size?: 'sm' | 'md' | 'lg';
};

/*
   _before={{
content: '""',
position: 'absolute',
top: 0,
right: 0,
bottom: 0,
left: 0,
margin: '-4px',
borderRadius: 'inherit',
zIndex: 'hide',
background:
'linear-gradient(93.07deg,#ffd719 0.61%,#f754d4 33.98%,#1fd1ec 65.84%,#48fa6b 97.7%)',
}}
 */

export const GradientBox: FC<GradientBoxProps> = ({
  size = 'md',
  children,
  ...props
}: GradientBoxProps) => {
  const bg = useColorModeValue('gray.100', 'gray.800');

  const boxProps = {
    sm: {
      w: '4',
      h: '4',
    },
    md: {
      w: '6',
      h: '6',
    },
    lg: {
      w: '8',
      h: '8',
    },
  };

  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      borderRadius="full"
      background={bg}
      pt={-1}
      {...boxProps[size]}
    >
      <Box
        position="absolute"
        bg="linear-gradient(93.07deg,#ffd719 0.61%,#f754d4 33.98%,#1fd1ec 65.84%,#48fa6b 97.7%)"
        width={7}
        height={7}
        borderRadius="full"
      />
      <Box
        position="absolute"
        bg="gray.900"
        height={6}
        width={6}
        borderRadius="full"
      />
      {children}
    </Flex>
  );
};
