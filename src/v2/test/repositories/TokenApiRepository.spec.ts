import 'reflect-metadata';
import axios from 'axios';
import { TokenApiRepository } from 'src/v2/repositories/implementations/TokenApiRepository';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CoinGeckoPriceRepository.ts', () => {
  const symbol = 'ASTR';

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns data received from API', async () => {
    const expectedUrl = `${TokenApiRepository.BaseUrl}/v1/token/price/${symbol}`;
    mockedAxios.get.mockResolvedValueOnce({
      data: 100,
    });
    const repo = new TokenApiRepository();

    const price = await repo.getUsdPrice(symbol);

    expect(mockedAxios.get).toHaveBeenCalledWith(expectedUrl);
    expect(price).toBeCloseTo(100, 0);
  });

  it('throws exception in case of error', async () => {
    const message = 'Network error';
    mockedAxios.get.mockRejectedValueOnce(new Error(message));
    const repo = new TokenApiRepository();

    await expect(repo.getUsdPrice(symbol)).rejects.toThrow(Error);
  });
});
