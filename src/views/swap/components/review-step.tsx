import { Box, Button, Flex, Image, Stack } from '@chakra-ui/react';

import { arrowDownSrc } from '@/assets';
import {
  ExchangeBox,
  TitleBox,
  Token,
  TokenBalances,
  TokenBalancesDetails,
  TokenBalancesPrice,
  TokenContent,
  TokenDetailsButton,
  TokenDetailsLogo,
  TokenDetailsSymbol,
  TokenInput,
} from '@/components';
import { getAppAssetsSources } from '@/config/utils';
import {
  NotificationType,
  SwapStep,
  swapViewActions,
  useAppDispatch,
  useNotificationStore,
  useSwapCanisterStore,
  useSwapViewStore,
} from '@/store';
import { debounce } from '@/utils/function';

import { KeepInSonicBox } from './keep-in-sonic-box';

export const SwapReviewStep = () => {
  const { sonicBalances, tokenBalances } = useSwapCanisterStore();
  const { addNotification } = useNotificationStore();
  const { fromTokenOptions, toTokenOptions, from, to, slippage } =
    useSwapViewStore();
  const dispatch = useAppDispatch();

  const handleApproveSwap = () => {
    addNotification({
      title: `Swapping ${from.metadata?.symbol} for ${to.metadata?.symbol}`,
      type: NotificationType.Swap,
      id: String(new Date().getTime()),
    });
    debounce(
      () => dispatch(swapViewActions.setValue({ data: 'from', value: '' })),
      300
    );
  };

  return (
    <Stack spacing={4}>
      <TitleBox
        title="Swap"
        onArrowBack={() => dispatch(swapViewActions.setStep(SwapStep.Home))}
      />
      <Flex direction="column" alignItems="center">
        <Box width="100%">
          <Token
            value={from.value}
            setValue={(value) =>
              dispatch(swapViewActions.setValue({ data: 'from', value }))
            }
            tokenListMetadata={fromTokenOptions}
            tokenMetadata={from.metadata}
            price={0}
            sources={getAppAssetsSources({
              balances: {
                plug:
                  from.metadata && tokenBalances
                    ? tokenBalances[from.metadata.id]
                    : 0,
                sonic:
                  from.metadata && sonicBalances
                    ? sonicBalances[from.metadata.id]
                    : 0,
              },
            })}
          >
            <TokenContent>
              <TokenDetailsButton>
                <TokenDetailsLogo />
                <TokenDetailsSymbol />
              </TokenDetailsButton>

              <TokenInput />
            </TokenContent>
            <TokenBalances>
              <TokenBalancesDetails />
              <TokenBalancesPrice />
            </TokenBalances>
          </Token>
        </Box>
        <Box
          borderRadius={4}
          width={10}
          height={10}
          py={3}
          px={3}
          bg="#3D52F4"
          mt={-2}
          mb={-2}
          zIndex={1200}
        >
          <Image m="auto" src={arrowDownSrc} />
        </Box>
        <Box width="100%">
          <Token
            value={to.value}
            setValue={(value) =>
              dispatch(swapViewActions.setValue({ data: 'to', value }))
            }
            tokenListMetadata={toTokenOptions}
            tokenMetadata={to.metadata}
            price={0}
            sources={getAppAssetsSources({
              balances: {
                plug:
                  to.metadata && tokenBalances
                    ? tokenBalances[to.metadata.id]
                    : 0,
                sonic:
                  to.metadata && sonicBalances
                    ? sonicBalances[to.metadata.id]
                    : 0,
              },
            })}
            shouldGlow
            isDisabled
          >
            <TokenContent>
              <TokenDetailsButton>
                <TokenDetailsLogo />
                <TokenDetailsSymbol />
              </TokenDetailsButton>

              <TokenInput />
            </TokenContent>
            <TokenBalances>
              <TokenBalancesDetails />
              <TokenBalancesPrice />
            </TokenBalances>
          </Token>
        </Box>
      </Flex>

      <ExchangeBox from={from} to={to} slippage={slippage} />
      <KeepInSonicBox />

      <Button
        variant="gradient"
        colorScheme="dark-blue"
        isFullWidth
        size="lg"
        onClick={handleApproveSwap}
      >
        Confirm Swap
      </Button>
    </Stack>
  );
};
