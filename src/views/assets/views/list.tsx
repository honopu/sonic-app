import { useNavigate } from 'react-router';
import {
  Alert,
  AlertTitle,
  AlertIcon,
  // AlertDescription,
  Stack,
  Box,
  HStack,
  Text,
} from '@chakra-ui/react';

import {
  Asset,
  AssetIconButton,
  AssetImageBlock,
  AssetTitleBlock,
  Header,
  InformationBox,
  PlugButton,
} from '@/components';
import { FeatureState, usePlugStore, useSwapCanisterStore } from '@/store';
import { DefaultTokensImage } from '@/constants';
import { theme } from '@/theme';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { questionMarkSrc } from '@/assets';
import { useBalances } from '@/hooks/use-balances';
import { getCurrencyString } from '@/utils/format';

export const Assets = () => {
  const { totalBalances } = useBalances();
  const { supportedTokenListState, balancesState, supportedTokenList } =
    useSwapCanisterStore();
  const { isConnected } = usePlugStore();

  const navigate = useNavigate();

  const navigateToDeposit = (tokenId?: string) => {
    if (tokenId) {
      navigate(`/assets/deposit?tokenId=${tokenId}`);
    }
  };

  const navigateToWithdraw = (tokenId?: string) => {
    if (tokenId) {
      navigate(`/assets/withdraw?tokenId=${tokenId}`);
    }
  };

  const isSupportedTokenListPresent =
    supportedTokenList && supportedTokenList.length > 0;

  const shouldShowSkeletons =
    (supportedTokenListState === FeatureState.Loading &&
      !isSupportedTokenListPresent) ||
    balancesState === FeatureState.Loading;

  return (
    <>
      <InformationBox title="Assets Details" mb={9}>
        <Text color="#888E8F">Assets description here</Text>
      </InformationBox>

      <Header title="Your Assets" />

      {!isConnected ? (
        <>
          <Alert status="warning" mb={6}>
            <AlertIcon />
            <AlertTitle>You are not connected to the wallet</AlertTitle>
          </Alert>

          <PlugButton />
        </>
      ) : (
        <Box
          overflow="hidden"
          height="100%"
          display="flex"
          flexDirection="column"
          position="relative"
          _after={{
            content: "''",
            position: 'absolute',
            pointerEvents: 'none',
            height: 20,
            left: 0,
            right: 0,
            bottom: -1,
            background: `linear-gradient(to bottom, transparent 0%, ${theme.colors.bg} 100%)`,
          }}
        >
          <Stack
            css={{
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
            spacing={4}
            pb={8}
            overflow="auto"
          >
            {shouldShowSkeletons ? (
              <>
                <Asset isLoading>
                  <AssetImageBlock />
                  <HStack>
                    <AssetIconButton aria-label="Deposit" icon={<FaPlus />} />
                    <AssetIconButton aria-label="Withdraw" icon={<FaMinus />} />
                  </HStack>
                </Asset>

                <Asset isLoading>
                  <AssetImageBlock />
                  <HStack>
                    <AssetIconButton aria-label="Deposit" icon={<FaPlus />} />
                    <AssetIconButton aria-label="Withdraw" icon={<FaMinus />} />
                  </HStack>
                </Asset>

                <Asset isLoading>
                  <AssetImageBlock />
                  <HStack>
                    <AssetIconButton aria-label="Deposit" icon={<FaPlus />} />
                    <AssetIconButton aria-label="Withdraw" icon={<FaMinus />} />
                  </HStack>
                </Asset>
              </>
            ) : isSupportedTokenListPresent ? (
              supportedTokenList.map(({ id, name, symbol, decimals }) => (
                <Asset
                  key={id}
                  imageSources={[DefaultTokensImage[symbol] ?? questionMarkSrc]}
                  isLoading={supportedTokenListState === FeatureState.Loading}
                >
                  <HStack spacing={4}>
                    <AssetImageBlock />
                    <AssetTitleBlock title={name} subtitle={symbol} />
                  </HStack>

                  <Box>
                    <Text fontWeight="bold" color="gray.400">
                      Amount
                    </Text>
                    <Text fontWeight="bold">
                      {getCurrencyString(totalBalances?.[id], decimals)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.400">
                      Price
                    </Text>
                    <Text fontWeight="bold">{`$0.00`}</Text>
                  </Box>

                  <HStack>
                    <AssetIconButton
                      aria-label={`Withdraw ${symbol}`}
                      icon={<FaMinus />}
                      onClick={() => navigateToWithdraw(id)}
                    />
                    <AssetIconButton
                      colorScheme="dark-blue"
                      aria-label={`Deposit ${symbol}`}
                      icon={<FaPlus />}
                      onClick={() => navigateToDeposit(id)}
                    />
                  </HStack>
                </Asset>
              ))
            ) : null}
          </Stack>
        </Box>
      )}
    </>
  );
};
