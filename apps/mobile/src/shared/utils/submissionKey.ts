/**
 * A random v4-format UUID naming one publish attempt, so the server can tell
 * a repeated request from a new ad. It only has to be unique per persona's
 * publishes, so Math.random is enough (no native crypto dependency).
 */
export function newSubmissionKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
