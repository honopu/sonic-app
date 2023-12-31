// import { Principal } from '@dfinity/principal';
import { createAsyncThunk } from '@reduxjs/toolkit';

// import { ENV } from '@/config';
// import { createAnonTokenActor } from '@/integrations/actor';
import { RootState } from '@/store/store';
import { AppLog , getTokenAllowance} from '@/utils';

import { allowanceActions } from '../allowance-slice';

type FetchAllowance = { tokenId: string };

export const fetchAllowance = createAsyncThunk<void, FetchAllowance>(
  'plug/disconnect',
  async ({ tokenId }, { dispatch, getState }): Promise<void> => {
    const { principalId } = (getState() as RootState).plug;
    try {
      if (!principalId) throw new Error('Plug is not connected');
      const allowance = await getTokenAllowance(tokenId);
      dispatch( allowanceActions.setAllowance({ tokenId,allowance: Number(allowance),expiration: Date.now() + 30000}) );
    } catch (error) {
      AppLog.error( `Allowance fetch error: token=${tokenId} principal=${principalId}`, error );
      dispatch(allowanceActions.clearAllowance({ tokenId }));
    }
  }
);
