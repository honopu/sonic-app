import { MODALS } from '@/modals';
import { useModalStore, useSwapStore } from '@/store';

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useBatchHook,
  useMemorizedWithdrawTransaction,
  useMemorizedRemoveLiquidityTransaction,
} from '..';
import { RemoveLiquidity } from '../..';

type RemoveLiquidityBatchStep = 'removeLiquidity' | 'withdraw';

export interface UseRemoveLiquidityBatchOptions extends RemoveLiquidity {
  keepInSonic: boolean;
}

export const useRemoveLiquidityBatch = ({
  keepInSonic,
  ...removeLiquidityParams
}: UseRemoveLiquidityBatchOptions) => {
  const { sonicBalances } = useSwapStore();

  const {
    setCurrentModal,
    setModalCallbacks,
    setCurrentModalData,
    setOnClose,
  } = useModalStore();

  if (!sonicBalances) {
    throw new Error('Sonic balance are required');
  }

  if (
    !removeLiquidityParams.token0.token ||
    !removeLiquidityParams.token1.token
  ) {
    throw new Error('Tokens are required');
  }

  const navigate = useNavigate();

  const withdrawParams = {
    token: removeLiquidityParams.token1.token,
    amount: removeLiquidityParams.token1.value,
  };

  const removeLiquidity = useMemorizedRemoveLiquidityTransaction(
    removeLiquidityParams
  );
  const withdraw = useMemorizedWithdrawTransaction(withdrawParams);

  const transactions = useMemo(() => {
    let _transactions = {};

    _transactions = {
      removeLiquidity,
    };

    if (!keepInSonic) {
      _transactions = {
        ..._transactions,
        withdraw,
      };
    }

    return _transactions;
  }, [...Object.values(removeLiquidityParams), keepInSonic]);

  const handleRetry = async () => {
    return new Promise<boolean>((resolve) => {
      setModalCallbacks([
        // Retry callback
        () => {
          openSwapModal();
          resolve(true);
        },
        // Not retry callback
        () => {
          navigate(
            `/assets/withdraw?tokenId=${removeLiquidityParams.token0.token?.id}&amount=${removeLiquidityParams.token0.value}`
          );
          resolve(false);
        },
      ]);
      setOnClose(() => resolve(false));
      setCurrentModal(MODALS.swapFailed);
    });
  };

  const openSwapModal = () => {
    setCurrentModalData({
      steps: Object.keys(transactions),
      fromToken: removeLiquidityParams.token0.token?.symbol,
      toToken: removeLiquidityParams.token1.token?.symbol,
    });
    setCurrentModal(MODALS.swapProgress);
  };

  return useBatchHook<RemoveLiquidityBatchStep>({ transactions, handleRetry });
};
