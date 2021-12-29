import { infoSrc } from '@/assets';
import { TokenData } from '@/models';
import { useSwapCanisterStore } from '@/store';
import {
  calculatePriceImpact,
  getAmountMin,
  getAmountOut,
  getCurrencyString,
} from '@/utils/format';
import {
  Flex,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Stack,
  StackItem,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

export type ExchangeBoxProps = {
  from: TokenData;
  to: TokenData;
  slippage: string;
};

type StackLineProps = {
  title: string;
  value: string;
};

const StackLine: React.FC<StackLineProps> = ({ value, title }) => {
  return (
    <StackItem>
      <Flex>
        <Text>{title}</Text>
        <Text ml={2} flex={1} textAlign="right">
          {value}
        </Text>
      </Flex>
    </StackItem>
  );
};

export const ExchangeBox: React.FC<ExchangeBoxProps> = ({
  from,
  to,
  slippage,
}) => {
  const { allPairs } = useSwapCanisterStore();
  if (
    !from.metadata ||
    !to.metadata ||
    !allPairs ||
    !allPairs[from.metadata.id][to.metadata.id]
  )
    return null;

  const { reserve0, reserve1 } = allPairs[from.metadata.id][to.metadata.id];

  return (
    <Flex opacity={0.4} alignItems="center" px={4} fontWeight={400}>
      <Text display="flex" alignItems="center">
        {from.metadata.symbol}&nbsp;
        <FaArrowRight />
        &nbsp;{to.metadata.symbol}
      </Text>
      <Text flex={1} textAlign="right" mx={2}>
        1&nbsp;{from.metadata.symbol}&nbsp;=&nbsp;
        {getAmountOut(
          1,
          from.metadata.decimals,
          to.metadata.decimals,
          Number(reserve0),
          Number(reserve1)
        )}
        &nbsp;
        {to.metadata.symbol}
      </Text>
      <Popover trigger="hover">
        <PopoverTrigger>
          <Image src={infoSrc} width={5} transition="opacity 200ms" />
        </PopoverTrigger>
        <Portal>
          <PopoverContent>
            <PopoverHeader>Transaction Details</PopoverHeader>
            <PopoverArrow />
            <PopoverBody display="inline-block">
              <Stack>
                <StackLine
                  title="Minimum Received"
                  value={`${
                    to.value
                      ? getAmountMin(
                          to.value,
                          Number(slippage) / 100,
                          to.metadata.decimals
                        )
                      : 0
                  } ${to.metadata.symbol}`}
                />
                <StackLine
                  title="Price Impact"
                  value={`${calculatePriceImpact(
                    from.value,
                    from.metadata.decimals,
                    to.value,
                    to.metadata.decimals,
                    Number(reserve0),
                    Number(reserve1)
                  )}%`}
                />
                <StackLine title="Allowed Slippage" value={`${slippage}%`} />
                {/* TODO: add liquidity fee */}
                {/* <StackLine
                  title="Liquidity Provider Fee"
                  value={`${10} ${to.metadata.symbol}`}
                /> */}
                <StackLine
                  title="Network Fee"
                  value={`${getCurrencyString(
                    from.metadata.fee,
                    from.metadata.decimals
                  )} ${from.metadata.symbol}`}
                />
              </Stack>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </Flex>
  );
};
