import {
  nextAuthor,
  nextStory,
  previousAuthor,
  previousStory,
  swipeAction,
  tapAction,
} from '../storyNavigation';

// Three authors with 2, 1 and 3 stories
const counts = [2, 1, 3];

describe('storyNavigation', () => {
  it('next moves within an author, then to the next author, then closes', () => {
    expect(nextStory({ authorIndex: 0, storyIndex: 0 }, counts)).toEqual({
      kind: 'move',
      position: { authorIndex: 0, storyIndex: 1 },
    });
    expect(nextStory({ authorIndex: 0, storyIndex: 1 }, counts)).toEqual({
      kind: 'move',
      position: { authorIndex: 1, storyIndex: 0 },
    });
    expect(nextStory({ authorIndex: 2, storyIndex: 2 }, counts)).toEqual({
      kind: 'close',
    });
  });

  it('previous goes back within an author, then to the previous author’s last story', () => {
    expect(previousStory({ authorIndex: 2, storyIndex: 1 }, counts)).toEqual({
      kind: 'move',
      position: { authorIndex: 2, storyIndex: 0 },
    });
    expect(previousStory({ authorIndex: 2, storyIndex: 0 }, counts)).toEqual({
      kind: 'move',
      position: { authorIndex: 1, storyIndex: 0 },
    });
    expect(previousStory({ authorIndex: 1, storyIndex: 0 }, counts)).toEqual({
      kind: 'move',
      position: { authorIndex: 0, storyIndex: 1 },
    });
  });

  it('previous on the very first story restarts it', () => {
    expect(previousStory({ authorIndex: 0, storyIndex: 0 }, counts)).toEqual({
      kind: 'move',
      position: { authorIndex: 0, storyIndex: 0 },
    });
  });

  it('switching author opens at its first unseen story', () => {
    const firstUnseen = (i: number) => [0, 0, 2][i];
    expect(
      nextAuthor({ authorIndex: 1, storyIndex: 0 }, counts, firstUnseen),
    ).toEqual({ kind: 'move', position: { authorIndex: 2, storyIndex: 2 } });
    expect(
      previousAuthor({ authorIndex: 2, storyIndex: 1 }, firstUnseen),
    ).toEqual({ kind: 'move', position: { authorIndex: 1, storyIndex: 0 } });
    expect(previousAuthor({ authorIndex: 0, storyIndex: 0 })).toEqual({
      kind: 'close',
    });
  });

  it('taps follow the reading direction (left = forward in RTL)', () => {
    expect(tapAction('left', true)).toBe('next');
    expect(tapAction('right', true)).toBe('previous');
    expect(tapAction('right', false)).toBe('next');
    expect(tapAction('left', false)).toBe('previous');
  });

  it('swipes: down closes, sideways changes author in the reading direction', () => {
    expect(swipeAction(5, 120, true)).toBe('close');
    expect(swipeAction(100, 10, true)).toBe('nextAuthor');
    expect(swipeAction(-100, 10, true)).toBe('previousAuthor');
    expect(swipeAction(-100, 10, false)).toBe('nextAuthor');
    // Too small, or mostly vertical upward: nothing
    expect(swipeAction(30, 5, true)).toBeNull();
    expect(swipeAction(10, -120, true)).toBeNull();
  });
});
