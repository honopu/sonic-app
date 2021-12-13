import { Principal } from '@dfinity/principal';

import { parseAmount } from '@/utils/format';
import { usePlugStore } from '@/store';
import { TokenIDL } from '@/did';
import { useSwapActor } from '@/integrations/actor/use-swap-actor';
import { useToken } from '@/hooks/use-token';

export const useAssetsView = () => {
  const swapActor = useSwapActor();
  const { principalId } = usePlugStore();

  const { getTokenInfo } = useToken();

  async function getUserInfoByNamePageAbove(_owner: Principal) {
    if (swapActor) {
      try {
        const result = await swapActor.getUserInfoByNamePageAbove(
          _owner,
          BigInt(0),
          '', // token name
          BigInt(0), // token start at
          BigInt(0), // token limit
          BigInt(0), // above 0
          '', // lp name or symbol
          BigInt(0),
          BigInt(10)
        );
        const res = (result as { lpBalances: [[string, BigInt][], BigInt] })
          .lpBalances[0];
        if (!res.length) {
          return [];
        }

        const info = await Promise.all(
          res.map((_i) => getTokenInfo(String(_i[0])))
        );

        const infoWithoutUndefined = info.filter(
          (_i) => _i !== undefined
        ) as TokenIDL.TokenInfo[];

        return infoWithoutUndefined.map((i, index) => {
          const { metadata, ...infoWithoutMetadata } = i;

          i = { ...metadata, metadata, ...infoWithoutMetadata };
          return {
            ...infoWithoutMetadata,
            bal: res[index][1],
            id: res[index][0],
          };
        });
        // CommonApi
      } catch (e) {
        console.log(e, 'getUserInfoByNamePageAbove');
      }
    }
  }

  async function deposit(
    tokenCanisterId: string,
    value: string | number,
    decimals: number
  ) {
    try {
      const amount = parseAmount(value.toString(), decimals);
      return await swapActor?.deposit(
        Principal.fromText(tokenCanisterId),
        amount
      );
    } catch (e) {
      console.log(e, 'deposit');
    }
  }

  async function withdraw(
    tokenCanisterId: string,
    value: string | number,
    decimals: number
  ) {
    if (swapActor) {
      try {
        const amount = parseAmount(value.toString(), decimals);

        await swapActor.withdraw(Principal.fromText(tokenCanisterId), amount);
      } catch (e) {
        console.error('withdraw', e);
      }
    }
  }

  async function getBalance(tokenCanisterId: string) {
    if (principalId) {
      try {
        return await swapActor?.balanceOf(
          tokenCanisterId,
          Principal.fromText(principalId)
        );
      } catch (error) {
        console.error('balanceOf', error);
        return error;
      }
    }
  }

  return {
    getUserInfoByNamePageAbove,
    getBalance,
    deposit,
    withdraw,
  };
};
