import { open as openMmdb } from 'maxmind';
import { existsSync } from 'fs';
import { GeoIpService, isPublicIp } from './geoip.service';

jest.mock('maxmind', () => ({ open: jest.fn() }));
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
}));

const cityReader = (records: Record<string, unknown>) => ({
  get: jest.fn((ip: string) => records[ip] ?? null),
});

describe('isPublicIp', () => {
  it.each([
    '10.0.0.5',
    '127.0.0.1',
    '172.18.0.3', // docker bridge (nginx)
    '192.168.1.10',
    '169.254.1.1',
    '100.64.0.1',
    '::1',
    'fe80::1',
    'fd12::1',
    '::ffff:127.0.0.1',
    'not-an-ip',
  ])('treats %s as private/unknown', (ip) => {
    expect(isPublicIp(ip)).toBe(false);
  });

  it.each(['41.33.0.1', '::ffff:41.33.0.1', '2a00:1450:4001::1'])(
    'treats %s as public',
    (ip) => {
      expect(isPublicIp(ip)).toBe(true);
    },
  );
});

describe('GeoIpService.locate', () => {
  let service: GeoIpService;
  const reader = cityReader({
    '41.33.0.1': {
      city: { names: { en: 'Cairo' } },
      country: { iso_code: 'EG' },
    },
    '37.36.0.1': {
      city: { names: { en: 'Kuwait City' } },
      country: { iso_code: 'KW' },
    },
    '5.1.0.1': { country: { iso_code: 'KW' } },
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    delete process.env.MAXMIND_ACCOUNT_ID;
    delete process.env.MAXMIND_LICENSE_KEY;
    (existsSync as jest.Mock).mockReturnValue(true);
    (openMmdb as jest.Mock).mockResolvedValue(reader);
    service = new GeoIpService();
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);
    // Pretend the file is fresh so no download is attempted
    jest.spyOn(service as any, 'isStale').mockResolvedValue(false);
    await service.refresh(false);
  });

  it('formats city with the Arabic country name', () => {
    expect(service.locate('41.33.0.1')).toBe('Cairo، مصر');
    expect(service.locate('37.36.0.1')).toBe('Kuwait City، الكويت');
  });

  it('handles the IPv4-mapped IPv6 form proxies report', () => {
    expect(service.locate('::ffff:41.33.0.1')).toBe('Cairo، مصر');
    expect(reader.get).toHaveBeenCalledWith('41.33.0.1');
  });

  it('falls back to the country when there is no city', () => {
    expect(service.locate('5.1.0.1')).toBe('الكويت');
  });

  it('returns null for addresses not in the database', () => {
    expect(service.locate('8.8.4.4')).toBeNull();
  });

  it('never looks up private addresses', () => {
    expect(service.locate('172.18.0.3')).toBeNull();
    expect(service.locate(undefined)).toBeNull();
    expect(reader.get).not.toHaveBeenCalled();
  });

  it('returns null (no throw) when the database is unavailable', async () => {
    (existsSync as jest.Mock).mockReturnValue(false);
    const fresh = new GeoIpService();
    jest.spyOn(fresh['logger'], 'warn').mockImplementation(() => undefined);
    jest.spyOn(fresh as any, 'isStale').mockResolvedValue(true);

    await fresh.refresh(false);

    expect(fresh.locate('41.33.0.1')).toBeNull();
  });
});

describe('GeoIpService download', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = jest.fn().mockResolvedValue({ ok: false, status: 401 });
    global.fetch = fetchMock as unknown as typeof fetch;
    (existsSync as jest.Mock).mockReturnValue(false);
  });

  it('does not download without MaxMind credentials', async () => {
    delete process.env.MAXMIND_ACCOUNT_ID;
    delete process.env.MAXMIND_LICENSE_KEY;
    const service = new GeoIpService();
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);

    await service.refresh(true);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('downloads with basic auth when credentials are set, and survives a failure', async () => {
    process.env.MAXMIND_ACCOUNT_ID = '123';
    process.env.MAXMIND_LICENSE_KEY = 'key';
    const service = new GeoIpService();
    jest.spyOn(service['logger'], 'warn').mockImplementation(() => undefined);

    await expect(service.refresh(true)).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('GeoLite2-City/download');
    expect(init.headers.Authorization).toBe(
      `Basic ${Buffer.from('123:key').toString('base64')}`,
    );
    delete process.env.MAXMIND_ACCOUNT_ID;
    delete process.env.MAXMIND_LICENSE_KEY;
  });
});
