import { isEmailValid, isUrlValid } from './Validators';

describe('isEmailValid', () => {
  it('returns true if valid email address', () => {
    expect(isEmailValid('test@test.com')).toBe(true);
  });

  it('returns false if missing @', () => {
    expect(isEmailValid('testtest.com')).toBe(false);
  });

  it('returns false if missing domain extension', () => {
    expect(isEmailValid('test@test')).toBe(false);
  });

  it('returns false if address is empty', () => {
    expect(isEmailValid('')).toBe(false);
  });

  it('returns false if missing user name', () => {
    expect(isEmailValid('@test.com')).toBe(false);
  });
});

describe('isUrlValid', () => {
  it('returns true if url is valid', () => {
    expect(isUrlValid('https://www.youtube.com/watch?v=s4fYqncpc6k')).toBe(true);
  });

  it('returns false if invalid protocol', () => {
    expect(isUrlValid('aaa://www.youtube.com/watch?v=s4fYqncpc6k')).toBe(false);
  });

  it('returns false if invalid domain', () => {
    expect(isUrlValid('aaa://bbb')).toBe(false);
  });
});
