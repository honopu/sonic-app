import { Image } from '@chakra-ui/image';
import { Box, Flex, HStack, Text } from '@chakra-ui/layout';
import BigNumber from 'bignumber.js';
import { FC, useMemo } from 'react';

import { questionMarkSrc } from '@/assets';
import { AppTokenMetadata } from '@/models';

import { DisplayValue } from '..';

type RemoveLiquidityModalAssetProps = Partial<AppTokenMetadata> & {
  balance: string;
};

export const RemoveLiquidityModalAsset: FC<RemoveLiquidityModalAssetProps> = ({
  symbol,
  logo = questionMarkSrc,
  balance = 0,
  price = 0,
}) => {
  const balancePrice = useMemo(
    () => new BigNumber(price ?? 0).multipliedBy(balance ?? 0).toNumber(),
    [balance, price]
  );

  return (
    <Flex justifyContent="space-between">
      <HStack
        pl={2}
        py={2}
        pr={4}
        bg="gray.700"
        borderRadius="full"
        alignSelf="center"
      >
        <Image src={logo} alt={symbol} boxSize={6} borderRadius="full" />
        <Text fontWeight="bold">{symbol}</Text>
      </HStack>
      <Box textAlign="end">
        <Text fontSize="xl" fontWeight="bold">
          <DisplayValue value={balance} />
        </Text>
        <Text fontSize="xs">
          <DisplayValue value={balancePrice} prefix="~$" />
        </Text>
      </Box>
    </Flex>
  );
};