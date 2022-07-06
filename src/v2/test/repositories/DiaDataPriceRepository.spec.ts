import 'reflect-metadata';
import axios from 'axios';
import { TokenInfo } from 'src/v2/models';
import { DiaDataPriceRepository } from 'src/v2/repositories/implementations/DiaDataPriceRepository';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CoinGeckoPriceRepository.ts', () => {
  const token = new TokenInfo('Astar', 'ASTR');

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns data received from API', async () => {
    const expectedUrl = `${DiaDataPriceRepository.BaseUrl}/${token.symbol}`;
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        Price: 100,
      },
    });
    const repo = new DiaDataPriceRepository();

    const price = await repo.getUsdPrice(token);

    expect(mockedAxios.get).toHaveBeenCalledWith(expectedUrl);
    expect(price).toBeCloseTo(100, 0);
  });

  it('throws exception in case of error', async () => {
    const message = 'Network error';
    mockedAxios.get.mockRejectedValueOnce(new Error(message));
    const repo = new DiaDataPriceRepository();

    await expect(repo.getUsdPrice(token)).rejects.toThrow(Error);
  });
});
