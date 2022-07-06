import 'reflect-metadata';
import axios from 'axios';
import { TokenInfo } from 'src/v2/models';
import { CoinGeckoPriceRepository } from 'src/v2/repositories/implementations/CoinGeckoPriceRepository';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CoinGeckoPriceRepository.ts', () => {
  const token = new TokenInfo('Astar', 'ASTR');

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns data received from API', async () => {
    const expectedUrl = `${
      CoinGeckoPriceRepository.BaseUrl
    }/simple/price?ids=${token.name.toLowerCase()}&vs_currencies=usd`;
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        astar: {
          usd: 100,
        },
      },
    });
    const repo = new CoinGeckoPriceRepository();

    const price = await repo.getUsdPrice(token);

    expect(mockedAxios.get).toHaveBeenCalledWith(expectedUrl);
    expect(price).toBeCloseTo(100, 0);
  });

  it('throws exception in case of error', async () => {
    const message = 'Network error';
    mockedAxios.get.mockRejectedValueOnce(new Error(message));
    const repo = new CoinGeckoPriceRepository();

    // a pattern how to test if async function throws error.
    await expect(repo.getUsdPrice(token)).rejects.toThrow(Error);
  });
});
