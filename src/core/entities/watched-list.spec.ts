import { WatchedList } from './watched-list';

class NumberWatchedList extends WatchedList<number> {
  compareItems(a: number, b: number): boolean {
    return a === b;
  }
}

let watchedList: NumberWatchedList;

describe('Watched List', () => {
  beforeEach(() => {
    watchedList = new NumberWatchedList([1, 2, 3]);
  });

  it('sould be able to create a watched list with inital items', () => {
    expect(watchedList.currentItems).toHaveLength(3);
  });

  it('should be able to add new items to the list', () => {
    watchedList.add(4);

    expect(watchedList.currentItems).toHaveLength(4);
    expect(watchedList.getNewItems()).toEqual([4]);
  });

  it('should be able to remove items from the list', () => {
    watchedList.remove(2);

    expect(watchedList.currentItems).toHaveLength(2);
    expect(watchedList.getRemovedItems()).toEqual([2]);
  });

  it('should be able to add an item even if it was removed before', () => {
    watchedList.remove(2);
    watchedList.add(2);

    expect(watchedList.currentItems).toHaveLength(3);
    expect(watchedList.getRemovedItems()).toEqual([]);
    expect(watchedList.getNewItems()).toEqual([]);
  });

  it('should be able to remove an item even if it was removed before', () => {
    watchedList.add(4);
    watchedList.remove(4);

    expect(watchedList.currentItems).toHaveLength(3);
    expect(watchedList.getRemovedItems()).toEqual([]);
    expect(watchedList.getNewItems()).toEqual([]);
  });

  it('should be able to update watched list items', () => {
    watchedList.update([1, 3, 5]);

    expect(watchedList.getRemovedItems()).toEqual([2]);
    expect(watchedList.getNewItems()).toEqual([5]);
  });
});
