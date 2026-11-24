const PREFIX = 'list-page:';

export const STUDENTS_LIST_PAGE = 'students';

export const ListPageMemory = {
  get(key: string): number {
    if (typeof window === 'undefined') return 1;
    const page = Number(window.sessionStorage.getItem(PREFIX + key));
    return Number.isInteger(page) && page > 0 ? page : 1;
  },
  set(key: string, page: number) {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem(PREFIX + key, String(page));
  },
};
