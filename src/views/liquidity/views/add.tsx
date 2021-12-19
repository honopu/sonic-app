import { useEffect, useMemo, useState } from 'react';
import { Text, Flex, Image, Box, Stack, SimpleGrid } from '@chakra-ui/react';

import {
  Button,
  LPImageBlock,
  PlugButton,
  TitleBox,
  Token,
  TokenBalances,
  TokenBalancesDetails,
  TokenBalancesPrice,
  TokenContent,
  TokenDetails,
  TokenDetailsLogo,
  TokenDetailsSymbol,
  TokenInput,
} from '@/components';

import { plusSrc } from '@/assets';
import {
  FeatureState,
  INITIAL_LIQUIDITY_SLIPPAGE,
  LiquidityTokenDataKey,
  liquidityViewActions,
  NotificationType,
  useAppDispatch,
  useLiquidityViewStore,
  useNotificationStore,
  usePlugStore,
  useSwapCanisterStore,
  useTokenModalOpener,
} from '@/store';
import { useNavigate } from 'react-router';
import { useQuery } from '@/hooks/use-query';
import { getAppAssetsSources } from '@/config/utils';
import { SlippageSettings } from '@/components';
import { useBalances } from '@/hooks/use-balances';
import {
  getCurrencyString,
  getAmountEqualLPToken,
  getAmountLP,
  getLPPercentageString,
  formatAmount,
} from '@/utils/format';
import BigNumber from 'bignumber.js';

export const LiquidityAdd = () => {
  const query = useQuery();

  const { isConnected } = usePlugStore();
  const { allPairs } = useSwapCanisterStore();

  const { addNotification } = useNotificationStore();
  const { token0, token1, slippage, pair } = useLiquidityViewStore();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tokenBalances, sonicBalances, totalBalances } = useBalances();
  const { supportedTokenList, supportedTokenListState } =
    useSwapCanisterStore();
  const openSelectTokenModal = useTokenModalOpener();

  const [isReviewing, setIsReviewing] = useState(false);
  const [autoSlippage, setAutoSlippage] = useState(true);

  useEffect(() => {
    if (!isLoading && supportedTokenList && supportedTokenList.length > 0) {
      const toTokenId = query.get('token0');
      const fromTokenId = query.get('token1');

      if (fromTokenId) {
        const token0 = supportedTokenList!.find(
          (token) => token.id === fromTokenId
        );
        dispatch(
          liquidityViewActions.setToken({
            data: 'token0',
            token: token0,
          })
        );
      } else {
        dispatch(
          liquidityViewActions.setToken({
            data: 'token0',
            token: supportedTokenList[0],
          })
        );
      }
      dispatch(
        liquidityViewActions.setValue({ data: 'token0', value: '0.00' })
      );

      if (toTokenId) {
        const token1 = supportedTokenList!.find(
          (token) => token.id === toTokenId
        );
        dispatch(
          liquidityViewActions.setToken({ data: 'token1', token: token1 })
        );
      } else {
        dispatch(
          liquidityViewActions.setToken({
            data: 'token1',
            token: supportedTokenList[1],
          })
        );
      }
      dispatch(
        liquidityViewActions.setValue({ data: 'token1', value: '0.00' })
      );
    }
  }, [supportedTokenListState, supportedTokenList]);

  const handlePreviousStep = () => {
    if (isReviewing) {
      setIsReviewing(false);
    } else {
      navigate('/liquidity');
    }
  };

  const handleButtonClick = () => {
    if (!isReviewing) {
      setIsReviewing(true);
    }

    if (isReviewing) {
      // TODO: Add liqudity batch run
      addNotification({
        title: 'Liquidity Added',
        type: NotificationType.Success,
        id: Date.now().toString(),
      });
    }
  };

  const handleToken0MaxClick = () => {
    const value =
      totalBalances && token0.token
        ? getCurrencyString(
            totalBalances[token0.token?.id],
            token0.token?.decimals
          )
        : '0.00';

    setTokenValueAndLPTokenValue('token0', value);
  };

  const handleToken1MaxClick = () => {
    const value =
      totalBalances && token1.token
        ? getCurrencyString(
            totalBalances[token1.token?.id],
            token1.token?.decimals
          )
        : '0.00';

    setTokenValueAndLPTokenValue('token1', value);
  };

  const handleSelectToken = (dataKey: LiquidityTokenDataKey) => {
    if (!isReviewing) {
      openSelectTokenModal({
        metadata: supportedTokenList,
        onSelect: (tokenId) => {
          const foundToken = supportedTokenList!.find(
            (token) => token.id === tokenId
          );
          dispatch(
            liquidityViewActions.setToken({
              data: dataKey,
              token: foundToken,
            })
          );
          dispatch(
            liquidityViewActions.setValue({ data: 'token0', value: '0.00' })
          );
          dispatch(
            liquidityViewActions.setValue({ data: 'token1', value: '0.00' })
          );
        },
        selectedTokenIds,
      });
    }
  };

  // Utils

  const setTokenValueAndLPTokenValue = (
    dataKey: LiquidityTokenDataKey,
    value?: string
  ) => {
    const amountIn =
      value ?? (dataKey === 'token0' ? token0.value : token1.value);

    const reserveIn = String(
      dataKey === 'token0' ? pairData?.reserve0 : pairData?.reserve1
    );
    const reserveOut = String(
      dataKey === 'token1' ? pairData?.reserve0 : pairData?.reserve1
    );

    dispatch(liquidityViewActions.setValue({ data: dataKey, value: amountIn }));

    if (
      token0.token &&
      token1.token &&
      allPairs?.[token0.token.id]?.[token1.token.id]
    ) {
      const decimalsOut =
        dataKey === 'token0' ? token1.token?.decimals : token0.token?.decimals;

      const lpValue = getAmountEqualLPToken({
        amountIn,
        reserveIn,
        reserveOut,
        decimalsOut,
      });

      const reversedDataKey = dataKey === 'token0' ? 'token1' : 'token0';

      if (lpValue) {
        dispatch(
          liquidityViewActions.setValue({
            data: reversedDataKey,
            value: lpValue,
          })
        );
      }
    }
  };

  // Memorized values

  const isLoading = useMemo(() => {
    return supportedTokenListState === FeatureState.Loading;
  }, [supportedTokenListState]);

  const [buttonDisabled, buttonMessage] = useMemo<[boolean, string]>(() => {
    if (isLoading) return [true, 'Loading'];
    if (!token0.token || !token1.token) return [true, 'Select tokens'];

    const parsedToken0Value = (token0.value && parseFloat(token0.value)) || 0;
    const parsedToken1Value = (token1.value && parseFloat(token1.value)) || 0;

    if (parsedToken0Value <= 0)
      return [true, `No ${token0.token.name} value selected`];

    if (parsedToken1Value <= 0)
      return [true, `No ${token1.token.name} value selected`];

    if (totalBalances) {
      const parsedToken0Balance = parseFloat(
        formatAmount(totalBalances[token0.token.id], token0.token.decimals)
      );
      const parsedToken1Balance = parseFloat(
        formatAmount(totalBalances[token1.token.id], token1.token.decimals)
      );

      if (parsedToken0Value > parsedToken0Balance) {
        return [true, `Insufficient ${token0.token.name} Balance`];
      }

      if (parsedToken1Balance > parsedToken1Balance) {
        return [true, `Insufficient ${token1.token.name} Balance`];
      }
    }

    if (isReviewing) return [false, 'Confirm Supply'];
    return [false, 'Review Swap'];
  }, [isLoading, isReviewing, totalBalances, token0, token1]);

  const selectedTokenIds = useMemo(() => {
    let selectedIds = [];
    if (token0?.token?.id) selectedIds.push(token0.token.id);
    if (token1?.token?.id) selectedIds.push(token1.token.id);

    return selectedIds;
  }, [token0?.token?.id, token1?.token?.id]);

  const pairData = useMemo(() => {
    if (allPairs && token0.token && token1.token) {
      return allPairs[token0.token.id][token1.token.id];
    }
    return undefined;
  }, [allPairs, token0.token, token1.token]);

  const liquidityAmounts = useMemo(() => {
    if (
      Number(token0.value) &&
      Number(token1.value) &&
      token0.token?.decimals &&
      token1.token?.decimals
    ) {
      if (pair) {
        const getAmountLPOptions = {
          token0Amount: token0.value,
          token1Amount: token1.value,
          reserve0: String(pair.reserve0),
          reserve1: String(pair.reserve1),
          totalSupply: String(pair.totalSupply),
        };

        const getPercentageLPOptions = {
          ...getAmountLPOptions,
          token0Decimals: token0.token?.decimals,
          token1Decimals: token1.token?.decimals,
        };

        const value = getAmountLP(getAmountLPOptions);
        const percentage = getLPPercentageString(getPercentageLPOptions);

        return { value, percentage };
      }

      if (!pair) {
        return {
          value: new BigNumber(token0.value)
            .plus(new BigNumber(token1.value))
            .div(2)
            .toFixed(3),
          percentage: '100%',
        };
      }
    }

    return { value: '0.00', percentage: '0%' };
  }, [token0, token1, pair]);

  const { token0Price, token1Price, token0USDPrice, token1USDPrice } =
    useMemo(() => {
      if (token0.token && token1.token) {
        if (pairData && pairData.reserve0 && pairData.reserve1) {
          const token0Price = new BigNumber(String(pairData.reserve0))
            .div(new BigNumber(String(pairData.reserve1)))
            .dp(Number(token0.token.decimals))
            .toFixed(3);

          const token1Price = new BigNumber(String(pairData.reserve1))
            .div(new BigNumber(String(pairData.reserve0)))
            .dp(Number(token1.token.decimals))
            .toFixed(3);

          return {
            token0Price,
            token1Price,
            token0USDPrice: '0.00',
            token1USDPrice: '0.00',
          };
        } else {
          return {
            token0Price: token0.value,
            token1Price: token1.value,
            token0USDPrice: '0.00',
            token1USDPrice: '0.00',
          };
        }
      }

      return {
        token0Price: '0.00',
        token1Price: '0.00',
        token0USDPrice: '0.00',
        token1USDPrice: '0.00',
      };
    }, [token0, token1, pairData]);

  return (
    <>
      <TitleBox
        onArrowBack={handlePreviousStep}
        title="Add Liquidity"
        settings={
          <SlippageSettings
            slippage={slippage}
            setSlippage={(value) =>
              dispatch(liquidityViewActions.setSlippage(value))
            }
            isAutoSlippage={autoSlippage}
            setIsAutoSlippage={(value) => {
              setAutoSlippage(value);
              dispatch(
                liquidityViewActions.setSlippage(INITIAL_LIQUIDITY_SLIPPAGE)
              );
            }}
          />
        }
      />
      <Flex my={5} direction="column" alignItems="center">
        <Box width="100%">
          <Token
            value={token0.value}
            setValue={(value) => setTokenValueAndLPTokenValue('token0', value)}
            tokenListMetadata={supportedTokenList}
            tokenMetadata={token0.token}
            isDisabled={isReviewing}
            price={token0USDPrice}
            sources={getAppAssetsSources({
              balances: {
                plug:
                  token0.token && tokenBalances
                    ? tokenBalances[token0.token.id]
                    : 0,
                sonic:
                  token0.token && sonicBalances
                    ? sonicBalances[token0.token.id]
                    : 0,
              },
            })}
            isLoading={isLoading}
          >
            <TokenContent>
              <TokenDetails onClick={() => handleSelectToken('token0')}>
                <TokenDetailsLogo />
                <TokenDetailsSymbol />
              </TokenDetails>

              <TokenInput />
            </TokenContent>
            <TokenBalances>
              <TokenBalancesDetails onMaxClick={handleToken0MaxClick} />
              <TokenBalancesPrice />
            </TokenBalances>
          </Token>
        </Box>
        <Box
          borderRadius={4}
          width={10}
          height={10}
          border="1px solid #373737"
          py={3}
          px={3}
          bg="#1E1E1E"
          mt={-2}
          mb={-2}
          zIndex={1200}
        >
          <Image m="auto" src={plusSrc} />
        </Box>
        <Box width="100%">
          <Token
            value={token1.value}
            setValue={(value) => setTokenValueAndLPTokenValue('token1', value)}
            tokenListMetadata={supportedTokenList}
            tokenMetadata={token1.token}
            isDisabled={isReviewing}
            price={token1USDPrice}
            sources={getAppAssetsSources({
              balances: {
                plug:
                  token1.token && tokenBalances
                    ? tokenBalances[token1.token.id]
                    : 0,
                sonic:
                  token1.token && sonicBalances
                    ? sonicBalances[token1.token.id]
                    : 0,
              },
            })}
            isLoading={isLoading}
          >
            <TokenContent>
              <TokenDetails onClick={() => handleSelectToken('token1')}>
                <TokenDetailsLogo />
                <TokenDetailsSymbol />
              </TokenDetails>

              <TokenInput />
            </TokenContent>
            <TokenBalances>
              <TokenBalancesDetails onMaxClick={handleToken1MaxClick} />
              <TokenBalancesPrice />
            </TokenBalances>
          </Token>
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          pl={3}
          pr={5}
          py={2}
          borderRadius="full"
          w="fit-content"
          mt={-4}
          mb={-4}
          zIndex={1200}
          bg={isReviewing ? '#3D52F4' : '#1E1E1E'}
          border={`1px solid ${isReviewing ? '#3D52F4' : '#373737'}`}
        >
          <LPImageBlock
            size="sm"
            imageSources={[token0.token?.logo, token1.token?.logo]}
          />

          <Text fontWeight="bold">
            {token0.token?.symbol} - {token1.token?.symbol}
          </Text>
        </Stack>

        <Box width="100%">
          <Token value={token1.value} isDisabled shouldGlow={isReviewing}>
            <SimpleGrid columns={3}>
              <Box>
                <Text color="gray.300">Share of pool:</Text>
                <Text>
                  {liquidityAmounts.value} ({liquidityAmounts.percentage})
                </Text>
              </Box>
              <Box textAlign="center">
                <Text color="gray.300">
                  {token0.token?.symbol} per {token1.token?.symbol}
                </Text>
                <Text>{token0Price}</Text>
              </Box>
              <Box textAlign="right">
                <Text color="gray.300">
                  {token1.token?.symbol} per {token0.token?.symbol}
                </Text>
                <Text>{token1Price}</Text>
              </Box>
            </SimpleGrid>
          </Token>
        </Box>
      </Flex>

      {!isConnected ? (
        <PlugButton />
      ) : (
        <Button
          isFullWidth
          size="lg"
          onClick={handleButtonClick}
          isDisabled={buttonDisabled}
          isLoading={isLoading}
        >
          {buttonMessage}
        </Button>
      )}
    </>
  );
};
