import { Link } from '@chakra-ui/react';
import { Principal } from '@dfinity/principal';
import { useEffect, useMemo } from 'react';

import { useBalances } from '@/hooks/use-balances';
import { useUnwrapBatch } from '@/integrations/transactions';
import {
  modalsSliceActions,
  NotificationType,
  UnwrapModalDataStep,
  useAppDispatch,
  useNotificationStore,
  usePlugStore,
  useSwapViewStore,
} from '@/store';
import { deserialize, stringify } from '@/utils/format';
import { getAccountId } from '@/utils/icp';

export interface UnwrapLinkProps {
  id: string;
}

export const UnwrapLink: React.FC<UnwrapLinkProps> = ({ id }) => {
  const { principalId } = usePlugStore();
  const dispatch = useAppDispatch();
  const swapViewStore = useSwapViewStore();
  const { addNotification, popNotification } = useNotificationStore();
  const { getBalances } = useBalances();

  const { from } = useMemo(() => {
    const { from } = swapViewStore;

    return deserialize(stringify({ from }));
  }, []);

  const [batch, openUnwrapModal] = useUnwrapBatch({
    amount: from.value,
    toAccountId: principalId
      ? getAccountId(Principal.fromText(principalId))
      : undefined,
  });

  const handleStateChange = () => {
    if (
      Object.values(UnwrapModalDataStep).includes(
        batch.state as UnwrapModalDataStep
      )
    ) {
      dispatch(
        modalsSliceActions.setUnwrapModalData({
          step: batch.state as UnwrapModalDataStep,
        })
      );
    }
  };

  const handleOpenModal = () => {
    handleStateChange();
    openUnwrapModal();
  };

  useEffect(handleStateChange, [batch.state]);

  useEffect(() => {
    batch
      .execute()
      .then(() => {
        dispatch(modalsSliceActions.closeUnwrapProgressModal());

        addNotification({
          title: `Unwrapped ${from.value} ${from.metadata.symbol}`,
          type: NotificationType.Success,
          id: Date.now().toString(),
          transactionLink: '/activity',
        });
        getBalances();
      })
      .catch((err) => {
        console.error('Unwrap Error', err);

        addNotification({
          title: `Failed unwrapping ${from.value} ${from.metadata.symbol}`,
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