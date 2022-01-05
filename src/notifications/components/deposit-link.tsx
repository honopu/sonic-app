import { Link } from '@chakra-ui/react';
import { useEffect, useMemo } from 'react';

import { useBalances } from '@/hooks/use-balances';
import { useDepositBatch } from '@/integrations/transactions';
import {
  DepositModalDataStep,
  modalsSliceActions,
  NotificationType,
  useAppDispatch,
  useDepositViewStore,
  useNotificationStore,
  useSwapCanisterStore,
} from '@/store';

export interface DepositLinkProps {
  id: string;
}

export const DepositLink: React.FC<DepositLinkProps> = ({ id }) => {
  const dispatch = useAppDispatch();
  const { addNotification, popNotification } = useNotificationStore();
  const { getBalances } = useBalances();

  const { amount: value, tokenId } = useDepositViewStore();
  const { supportedTokenList } = useSwapCanisterStore();

  const selectedToken = useMemo(() => {
    if (tokenId && supportedTokenList) {
      return supportedTokenList.find(({ id }) => id === tokenId);
    }

    return undefined;
  }, [supportedTokenList, tokenId]);

  const [batch, openDepositModal] = useDepositBatch({
    amount: value,
    token: selectedToken,
  });

  const handleStateChange = () => {
    if (
      Object.values(DepositModalDataStep).includes(
        batch.state as DepositModalDataStep
      )
    ) {
      dispatch(
        modalsSliceActions.setDepositModalData({
          step: batch.state as DepositModalDataStep,
        })
      );
    }
  };

  const handleOpenModal = () => {
    handleStateChange();
    openDepositModal();
  };

  useEffect(handleStateChange, [batch.state]);

  useEffect(() => {
    batch
      .execute()
      .then(() => {
        dispatch(modalsSliceActions.clearDepositModalData());
        dispatch(modalsSliceActions.closeDepositProgressModal());
        getBalances();
        addNotification({
          title: 'Deposit successful',
          type: NotificationType.Success,
          id: Date.now().toString(),
          transactionLink: '/activity',
        });
      })
      .catch((err) => {
        console.error('Deposit Error', err);
        dispatch(modalsSliceActions.clearDepositModalData());
        addNotification({
          title: `Deposit failed ${value} ${selectedToken?.symbol}`,
          type: NotificationType.Error,
          id: Date.now().toString(),
        });
      })
      .finally(() => popNotification(id));

    handleOpenModal();
  }, []);

  return (
    <Link
      target="_blank"
      rel="noreferrer"
      color="#3D52F4"
      onClick={handleOpenModal}
    >
      View progress
    </Link>
  );
};