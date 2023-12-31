import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { getswapActor } from '@/utils/canisterDriver'


import { FeatureState, swapCanisterActions, useKeepSync, useSwapCanisterStore } from '@/store';
import { AppLog } from '@/utils';
import { parseResponseAllPairs } from '@/utils/canister';

export const useAllPairs = () => {
  const dispatch = useDispatch();
  const { allPairsState, allPairs } = useSwapCanisterStore();

  const getAllPairs = useKeepSync('getAllPairs',
    useCallback(async (isRefreshing?: boolean) => {
      try {
        if (allPairsState !== FeatureState.Loading) {
          dispatch(swapCanisterActions.setAllPairsState(isRefreshing ? FeatureState.Updating : FeatureState.Loading));
          const swapActor = await getswapActor(true);
          var response = await swapActor.getAllPairs();
          if (response) {
            dispatch(swapCanisterActions.setAllPairs(parseResponseAllPairs(response)));
          } else {
            throw new Error('No "getAllPairs" response');
          }
          dispatch(swapCanisterActions.setAllPairsState(FeatureState.Idle));
        }
      } catch (error) {
        AppLog.error(`All pairs fetch error`, error);
        dispatch(swapCanisterActions.setAllPairsState(FeatureState.Error));
      }
    },[dispatch, allPairsState]),{ interval: 25 * 1000 }
  );

  const directGetAllPairs = async()=>{
    try {
      if (allPairsState !== FeatureState.Loading) {
        dispatch(swapCanisterActions.setAllPairsState(FeatureState.Updating ));
        const swapActor = await getswapActor(true);
        var response = await swapActor.getAllPairs();
        if (response) {
          dispatch(swapCanisterActions.setAllPairs(parseResponseAllPairs(response)));
        } else {
          throw new Error('No "getAllPairs" response');
        }
        dispatch(swapCanisterActions.setAllPairsState(FeatureState.Idle));
      }
    } catch (error) {
      AppLog.error(`All pairs fetch error`, error);
      dispatch(swapCanisterActions.setAllPairsState(FeatureState.Error));
    }
  }

  return { allPairs, allPairsState, getAllPairs , directGetAllPairs };
};

