import { useMemo } from 'react';

import {
  DepositModalDataStep,
  modalsSliceActions,
  useAppDispatch,
} from '@/store';

import { Batch, Deposit } from '../..';
import {
  useApproveTransactionMemo,
  useBatchHook,
  useDepositTransactionMemo,
} from '..';

export const useDepositBatch = (deposit: Deposit) => {
  const dispatch = useAppDispatch();

  const approveTx = useApproveTransactionMemo(deposit);
  const depositTx = useDepositTransactionMemo(deposit);

  const transactions = useMemo(() => {
    return {
      approve: approveTx,
      deposit: depositTx,
    };
  }, [approveTx, depositTx]);

  const handleOpenDepositModal = () => {
    dispatch(
      modalsSliceActions.setDepositModalData({
        steps: Object.keys(transactions) as DepositModalDataStep[],
        tokenSymbol: deposit.token?.symbol,
      })
    );
    dispatch(modalsSliceActions.openDepositProgressModal());
  };
  return [
    useBatchHook({
      transactions,
      handleRetry: () => {
        dispatch(modalsSliceActions.closeDepositProgressModal());
        return Promise.resolve(false);
      },
    }),
    handleOpenDepositModal,
  ] as [Batch.Hook<DepositModalDataStep>, () => void];
};