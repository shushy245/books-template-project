export const BookListTestIds = {
    Toolbar: 'BookListTestIds.Toolbar',
    SortBySelect: 'BookListTestIds.SortBySelect',
    SortDirSelect: 'BookListTestIds.SortDirSelect',
    List: 'BookListTestIds.List',
    Card: (id: string): string => `BookListTestIds.Card.${id}`,
    CardTitle: (id: string): string => `BookListTestIds.CardTitle.${id}`,
    CardStatus: (id: string): string => `BookListTestIds.CardStatus.${id}`,
    CardDeleteButton: (id: string): string => `BookListTestIds.CardDeleteButton.${id}`,
    EmptyState: 'BookListTestIds.EmptyState',
    PrevPage: 'BookListTestIds.PrevPage',
    NextPage: 'BookListTestIds.NextPage',
} as const;
