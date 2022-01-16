import BigNumber from 'bignumber.js';
import { useEffect } from 'react';

import { ENV } from '@/config';
import { getICPTokenMetadata, ICP_METADATA } from '@/constants';
import { useTokenSelectionChecker } from '@/hooks';
import { PairList } from '@/models';
import { useAppDispatch } from '@/store';
import { parseResponseTokenList } from '@/utils/canister';
import { formatAmount, getSwapAmountOut } from '@/utils/format';
import { getTokenPaths } from '@/utils/maximal-paths';

import { usePriceStore, useSwapCanisterStore } from '..';
import { swapViewActions, useSwapViewStore } from '.';

export const useSwapView = () => {
  const dispatch = useAppDispatch();
  const { icpPrice } = usePriceStore();
  const { allPairs, supportedTokenList } = useSwapCanisterStore();
  const { from, to, tokenList } = useSwapViewStore();

  const { isTokenSelected: isICPSelected } = useTokenSelectionChecker({
    id0: from.metadata?.id,
    id1: to.metadata?.id,
  });

  const { isTokenSelected: isWICPSelected } = useTokenSelectionChecker({
    id0: from.metadata?.id,
    id1: to.metadata?.id,
    targetId: ENV.canistersPrincipalIDs.WICP,
  });

  function handleICPToWICPChange() {
    const value = new BigNumber(from.value).minus(
      formatAmount(ICP_METADATA.fee, ICP_METADATA.decimals)
    );
    dispatch(
      swapViewActions.setValue({
        data: 'to',
        value: value.toNumber() > 0 ? value.toString() : '',
      })
    );
  }

  function handleICPToTokenChange() {
    const wrappedICPMetadata = supportedTokenList?.find(
      (token) => token.id === ENV.canistersPrincipalIDs.WICP
    );

    if (wrappedICPMetadata && tokenList) {
      const paths = getTokenPaths(
        allPairs as PairList,
        tokenList,
        wrappedICPMetadata.id,
        from.value
      );

      console.log('cp', paths);

      const fromWICP = {
        ...from,
        metadata: wrappedICPMetadata,
        paths,
      };

      dispatch(
        swapViewActions.setValue({
          data: 'to',
          value: getSwapAmountOut(fromWICP, to),
        })
      );
    }
  }

  useEffect(() => {
    if (!supportedTokenList) return;

    const tokenList = parseResponseTokenList([
      getICPTokenMetadata(icpPrice),
      ...supportedTokenList,
    ]);
    dispatch(swapViewActions.setTokenList(tokenList));
  }, [dispatch, icpPrice, supportedTokenList]);

  useEffect(() => {
    dispatch(swapViewActions.setAllPairs(allPairs));
  }, [allPairs, dispatch]);

  useEffect(() => {
    if (!from.metadata) return;
    if (!to.metadata) return;
    if (!allPairs) return;

    if (isICPSelected && isWICPSelected) {
      handleICPToWICPChange();
      return;
    }

    if (isICPSelected) {
      handleICPToTokenChange();
    }

    dispatch(
      swapViewActions.setValue({
        data: 'to',
        value: getSwapAmountOut(from, to),
      })
    );
  }, [from, to.metadata, dispatch]);
};
