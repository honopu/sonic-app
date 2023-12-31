import {
  addNotification,
  FeatureState,
  Notification,
  popNotification,
  selectNotificationState,
  setNotificationSliceState,
} from '@/store';
import { useAppDispatch, useAppSelector } from '@/store';

export const useNotificationStore = () => {
  const { notifications, state } = useAppSelector(selectNotificationState);
  const dispatch = useAppDispatch();

  const _addNotification = (notification: Notification) => {
    dispatch(addNotification(notification));
  };

  const _popNotification = (notificationId: string) => {
    dispatch(popNotification(notificationId));
  };

  const _setNotificationState = (state: FeatureState) => {
    dispatch(setNotificationSliceState(state));
  };

  return {
    notifications,
    state,
    addNotification: _addNotification,
    popNotification: _popNotification,
    setNotificationState: _setNotificationState,
  };
};
