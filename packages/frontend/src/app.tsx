import { useEffect, useState } from 'react';

import { fetchHealth } from './api/health.api.ts';
import { AppTestIds } from './app.test-ids.ts';
import { BookList } from './features/books/book-list.tsx';
import { AddBookForm } from './features/books/add-book-form.tsx';
import { BookListProvider } from './features/books/book-list-context.tsx';
import { BookToolbar } from './features/books/book-toolbar.tsx';
import { Column, Row } from './ui/box.tsx';

export const App = (): JSX.Element => {
    const [backendStatus, setBackendStatus] = useState<string | undefined>(undefined);

    useEffect(() => {
        fetchHealth()
            .then((data) => {
                setBackendStatus(data.status);
            })
            .catch(() => {
                setBackendStatus('error');
            });
    }, []);

    return (
        <Column>
            <Row>
                <h1 data-testid={AppTestIds.Heading}>Reading Room</h1>
                <span data-testid={AppTestIds.BackendBadge}>
                    {backendStatus === undefined ? 'checking backend…' : `backend: ${backendStatus}`}
                </span>
            </Row>

            <BookListProvider>
                <AddBookForm />
                <BookToolbar />
                <BookList />
            </BookListProvider>
        </Column>
    );
};
