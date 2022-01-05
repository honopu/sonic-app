import { Image, SkeletonCircle } from '@chakra-ui/react';
import React from 'react';

import { questionMarkSrc } from '@/assets';

export type TokenImageBlockProps = {
  isLoading?: boolean;
  src?: string;
};

export const TokenImageBlock: React.FC<TokenImageBlockProps> = ({
  isLoading,
  src = questionMarkSrc,
}) => {
  return (
    <SkeletonCircle h={10} w={10} isLoaded={!isLoading}>
      <Image width={10} height={10} src={src} borderRadius="full" alt="token" />
    </SkeletonCircle>
  );
};