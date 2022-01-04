import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useCallback, useMemo } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router';

import {
  Asset,
  AssetIconButton,
  AssetImageBlock,
  AssetTitleBlock,
  DisplayValue,
  Header,
  InformationBox,
  PlugButton,
} from '@/components';
import { AppTokenMetadata } from '@/models';
import {
  FeatureState,
  liquidityViewActions,
  modalsSliceActions,
  useAppDispatch,
  useLiquidityViewStore,
  usePlugStore,
  useSwapCanisterStore,
} from '@/store';
import { getCurrencyString } from '@/utils/format';

const INFORMATION_TITLE = 'Liquidity Provider Rewards';
const INFORMATION_DESCRIPTION =
  'Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity. If you want to learn ';

const InformationDescription = () => (
  <Text color="#888E8F">
    {INFORMATION_DESCRIPTION}
    <Box
      as="a"
      color="#888E8F"
      href="#"
      textDecoration="underline"
      _visited={{
        color: '#888E8F',
      }}
    >
      review our documentation
    </Box>
    .
  </Text>
);

type PairedUserLPToken = {
  token0: AppTokenMetadata;
  token1: AppTokenMetadata;
  balance: string;
};

export const LiquidityListView = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isConnected } = usePlugStore();
  const {
    userLPBalances,
    userLPBalancesState,
    supportedTokenList,
    supportedTokenListState,
  } = useSwapCanisterStore();
  const { isBannerOpened } = useLiquidityViewStore();

  const moveToAddLiquidityView = (token0?: string, token1?: string) => {
    const query =
      token0 || token1
        ? `?${token0 ? `token0=${token0}` : ''}${
            token1 ? `&token1=${token1}` : ''
          }`
        : '';

    navigate(`/liquidity/add${query}`);
  };

  const handleInformationClose = () => {
    dispatch(liquidityViewActions.setIsBannerOpened(false));
  };

  const handleOpenRemoveLiquidityModal = (
    token0: AppTokenMetadata,
    token1: AppTokenMetadata
  ) => {
    dispatch(liquidityViewActions.setToken({ data: 'token0', token: token0 }));
    dispatch(liquidityViewActions.setToken({ data: 'token1', token: token1 }));
    dispatch(modalsSliceActions.openRemoveLiquidityModal());
  };

  const isLoading = useMemo(() => {
    return (
      supportedTokenListState === FeatureState.Loading ||
      userLPBalancesState === FeatureState.Loading
    );
  }, [supportedTokenListState, userLPBalancesState]);

  const isRefreshing = useMemo(() => {
    return (
      supportedTokenListState === FeatureState.Refreshing ||
      userLPBalancesState === FeatureState.Refreshing
    );
  }, [supportedTokenListState, userLPBalancesState]);

  const pairedUserLPTokens = useMemo(() => {
    if (userLPBalances && supportedTokenList) {
      const lpBalancesPairIDs = Object.keys(userLPBalances);
      const existentPairs = new Set();

      return lpBalancesPairIDs.reduce((acc, tokenId0) => {
        const tokenId1 = Object.keys(userLPBalances[tokenId0])[0];
        if (existentPairs.has(`${tokenId1}:${tokenId0}`)) return acc;
        existentPairs.add(`${tokenId0}:${tokenId1}`);

        const token0 = supportedTokenList.find(
          (token) => token.id === tokenId0
        );
        const token1 = supportedTokenList.find(
          (token) => token.id === tokenId1
        );

        const balance = getCurrencyString(
          userLPBalances[tokenId0][tokenId1],
          Math.round(((token0?.decimals ?? 0) + (token1?.decimals ?? 0)) / 2)
        );

        return [
          ...acc,
          {
            token0,
            token1,
            balance,
          } as PairedUserLPToken,
        ];
      }, [] as PairedUserLPToken[]);
    }
  }, [userLPBalances, supportedTokenList]);

  const getUserLPValue = useCallback(
    (token0: AppTokenMetadata, token1: AppTokenMetadata) => {
      const lpPrice = undefined;
      return lpPrice;
    },
    [userLPBalances]
  );

  return (
    <>
      {isBannerOpened && (
        <InformationBox
          onClose={handleInformationClose}
          title={INFORMATION_TITLE}
          mb={9}
        >
          <InformationDescription />
        </InformationBox>
      )}
      <Header
        title="Your Liquidity Positions"
        buttonText="Create Position"
        onButtonClick={() => moveToAddLiquidityView()}
        isRefreshing={isRefreshing}
      />

      {!isConnected ? (
        <>
          <Alert status="warning" mb={6}>
            <AlertIcon />
            <AlertTitle>You are not connected to the wallet</AlertTitle>
          </Alert>

          <PlugButton />
        </>
      ) : isLoading ? (
        <Stack spacing={4}>
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
        </Stack>
      ) : !pairedUserLPTokens?.length ? (
        <Text textAlign="center" color="gray.400">
          You have no liquidity positions
        </Text>
      ) : (
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
          {pairedUserLPTokens.map(({ token0, token1, balance }, index) => {
            if (!token0.id || !token1.id) {
              return null;
            }

            return (
              <Asset
                key={index}
                type="lp"
                imageSources={[token0.logo, token1.logo]}
              >
                <HStack spacing={4}>
                  <AssetImageBlock />
                  <AssetTitleBlock
                    title={`${token0.symbol}/${token1.symbol}`}
                  />
                </HStack>
                <Box>
                  <Text fontWeight="bold" color="gray.400">
                    LP Tokens
                  </Text>
                  <DisplayValue value={balance} />
                </Box>

                <Box>
                  <Text fontWeight="bold" color="gray.400">
                    LP Value
                  </Text>
                  <DisplayValue
                    color="green.400"
                    prefix="$"
                    value={getUserLPValue(token0, token1)}
                  />
                </Box>

                <HStack>
                  <AssetIconButton
                    aria-label="Remove liquidity"
                    icon={<FaMinus />}
                    onClick={() =>
                      handleOpenRemoveLiquidityModal(token0, token1)
                    }
                  />
                  <AssetIconButton
                    aria-label="Add liquidity"
                    colorScheme="dark-blue"
                    icon={<FaPlus />}
                    onClick={() => moveToAddLiquidityView(token0.id, token1.id)}
                  />
                </HStack>
              </Asset>
            );
          })}
        </Stack>
      )}
    </>
  );
};
