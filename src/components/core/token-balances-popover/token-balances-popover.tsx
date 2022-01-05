import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from '@chakra-ui/popover';
import { Heading, HStack, Image } from '@chakra-ui/react';
import { FC, useMemo } from 'react';

import { TokenSource } from '@/components';

import { TokenBalancesPopoverItem } from './token-balances-popover-item';

type TokenBalancesPopoverProps = {
  symbol?: string;
  decimals?: number;
  sources?: TokenSource[];
  children?: React.ReactNode;
};

export const TokenBalancesPopover: FC<TokenBalancesPopoverProps> = ({
  symbol,
  decimals,
  sources = [],
  children,
}) => {
  const filteredSources = useMemo(
    () => sources.filter((source) => source.balance && source.balance > 0),
    [sources]
  );

  if (filteredSources.length === 0) {
    return null;
  }

  return (
    <Popover trigger="hover">
      <PopoverTrigger>
        <HStack spacing={1}>
          {children ||
            filteredSources.map((source) => (
              <Image key={source?.src} src={source?.src} alt={source.name} />
            ))}
        </HStack>
      </PopoverTrigger>
      <PopoverContent color="gray.50">
        <PopoverArrow />
        <PopoverHeader>
          <Heading as="h3" size="sm">
            Balance Breakdown
          </Heading>
        </PopoverHeader>
        <PopoverBody>
          {filteredSources.map((source) => (
            <TokenBalancesPopoverItem
              key={source.name}
              decimals={decimals}
              symbol={symbol}
              {...source}
            />
          ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};