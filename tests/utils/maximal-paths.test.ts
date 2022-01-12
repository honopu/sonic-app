// import { AppTokenMetadataListObject } from '@/models';
import {
  findMaximalPaths,
  GraphNodeList,
  WeightList,
} from '@/utils/maximal-paths';

// const tokenListMock: AppTokenMetadataListObject = [
//   'A',
//   'B',
//   'C',
//   'D',
//   'E',
//   'F',
//   'G',
// ].reduce(
//   (list, symbol) => ({
//     ...list,
//     [`token${symbol}`]: {
//       id: `token${symbol}`,
//       decimals: 8,
//       fee: BigInt(0),
//       logo: '',
//       name: `Token ${symbol}`,
//       symbol: `T${symbol}`,
//       totalSupply: BigInt(1000000),
//     },
//   }),
//   {}
// );

describe('findMaximalPaths', () => {
  const case0 = [
    0,
    {
      tokenA: {
        tokenB: 10,
      },
      tokenB: {
        tokenA: 10,
      },
    },
    {
      tokenA: {
        id: 'tokenA',
        coefficient: 1,
        path: new Set(['tokenA']),
      },
      tokenB: {
        id: 'tokenB',
        coefficient: 10,
        path: new Set(['tokenA', 'tokenB']),
      },
    },
  ] as [number, WeightList, GraphNodeList];

  const case1 = [
    1,
    {
      tokenA: {
        tokenB: 1.2,
        tokenC: 0.5,
      },
      tokenB: {
        tokenA: 1.2,
        tokenD: 2,
        tokenE: 0.7,
        tokenC: 10,
      },
      tokenC: {
        tokenA: 0.5,
        tokenE: 5.4,
        tokenB: 10,
      },
      tokenD: {
        tokenB: 2,
        tokenE: 2,
      },
      tokenE: {
        tokenB: 0.7,
        tokenC: 5.4,
        tokenD: 2,
      },
      tokenF: {
        tokenG: 10,
      },
      tokenG: {
        tokenF: 10,
      },
    },
    {
      tokenA: {
        id: 'tokenA',
        coefficient: 1,
        path: new Set(['tokenA']),
      },
      tokenB: {
        id: 'tokenB',
        coefficient: 10.8,
        path: new Set(['tokenA', 'tokenC', 'tokenE', 'tokenD', 'tokenB']),
      },
      tokenC: {
        id: 'tokenC',
        coefficient: 25.92,
        path: new Set(['tokenA', 'tokenB', 'tokenD', 'tokenE', 'tokenC']),
      },
      tokenD: {
        id: 'tokenD',
        coefficient: 129.6,
        path: new Set(['tokenA', 'tokenB', 'tokenC', 'tokenE', 'tokenD']),
      },
      tokenE: {
        id: 'tokenE',
        coefficient: 64.8,
        path: new Set(['tokenA', 'tokenB', 'tokenC', 'tokenE']),
      },
      tokenF: {
        id: 'tokenF',
        coefficient: 0,
        path: new Set(),
      },
      tokenG: {
        id: 'tokenG',
        coefficient: 0,
        path: new Set(),
      },
    },
  ] as [number, WeightList, GraphNodeList];

  test.each([case0, case1] as [number, WeightList, GraphNodeList][])(
    'should return the correct path case%i',
    (index, weights, expected) => {
      const paths = findMaximalPaths(weights, 'tokenA');

      Object.values(paths).forEach((path) => {
        const expectedItem = expected[path.id];
        expect(path.id).toEqual(expectedItem.id);
        expect(path.coefficient).toBeCloseTo(expectedItem.coefficient);
        expect(path.path).toEqual(expectedItem.path);
      });
    }
  );
});
