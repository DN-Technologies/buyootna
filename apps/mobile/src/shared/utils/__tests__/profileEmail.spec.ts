import { emailForSave } from '../profileEmail';

describe('emailForSave', () => {
  it('sends the address in the field, trimmed', () => {
    expect(emailForSave(' new@mail.com ', 'old@mail.com')).toBe('new@mail.com');
    expect(emailForSave('new@mail.com', null)).toBe('new@mail.com');
  });

  // QA: an empty string is "not sent" to the API, so a cleared address
  // came back; a removal is asked for with null
  it('asks to remove the address on file when the field was cleared', () => {
    expect(emailForSave('', 'old@mail.com')).toBeNull();
    expect(emailForSave('   ', 'old@mail.com')).toBeNull();
  });

  it('sends nothing when there was no address to begin with', () => {
    expect(emailForSave('', null)).toBeUndefined();
    expect(emailForSave(undefined, '')).toBeUndefined();
  });
});
