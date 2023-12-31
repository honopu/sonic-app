import { Heading, HStack, Stack } from '@chakra-ui/react';
import { FaPlus } from '@react-icons/all-files/fa/FaPlus';

import {
  Asset,
  AssetImageBlock,
  AssetTitleBlock,
  DisplayValue,
} from '@/components';
import { useActivityViewStore } from '@/store';

export type AddLiquidityActivityProps = {
  amount0: number;
  amount1: number;
  lpAmount: number;
  pairId: string;
  reserve0: number;
  reserve1: number;
  token0: string;
  token1: string;
  time: number;
};

export const AddLiquidityActivity: React.FC<AddLiquidityActivityProps> = ({
  token0: _token0,
  token1: _token1,
  amount0,
  amount1,
  time,
}) => {
  const { tokenList } = useActivityViewStore();

  if (!tokenList) return null;

  const token0 = tokenList[_token0];
  const token1 = tokenList[_token1];

  if (!token0 || !token1) return null;

  return (
    <Asset type="lp" imageSources={[token0.logo, token1.logo]}>
      <HStack spacing={4}>
        <AssetImageBlock />
        <AssetTitleBlock
          title="Add Liquidity"
          subtitle={new Date(time).toLocaleTimeString('en-US')}
        />
      </HStack>
      <Stack textAlign="end">
        <Heading as="h6" size="sm" display="flex" alignItems="center">
          <DisplayValue
            value={amount0}
            decimals={token0.decimals}
            suffix={' ' + token0.symbol}
            shouldDivideByDecimals
          />
          &nbsp;
          <FaPlus />
          &nbsp;
          <DisplayValue
            value={amount1}
            decimals={token1.decimals}
            suffix={' ' + token1.symbol}
            shouldDivideByDecimals
          />
        </Heading>
      </Stack>
    </Asset>
  );
};
