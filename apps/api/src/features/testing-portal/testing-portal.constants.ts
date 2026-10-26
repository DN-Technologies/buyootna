export const TESTING_PASSWORD_MIN_LENGTH = 10;

/** Who is signed in to the testing portal (from the testing token). */
export interface TestingUser {
  name: string;
}

export interface TestingTokenPayload extends TestingUser {
  // Marks the token as a testing-portal token; app and docs tokens never carry it
  kind: 'testing';
  // When the LOGIN password was set: rotating it signs everyone out
  ver: number;
}
