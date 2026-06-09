import { useEffect, useState } from 'react';

import { fetchHealth } from './api/health.api.ts';
import { AppTestIds } from './app.test-ids.ts';
import { BookList } from './features/books/book-list.ts';
import { AddBookForm } from './features/books/add-book-form.ts';
import { BookListProvider } from './features/books/book-list-context.ts';
import { BookToolbar } from './features/books/book-toolbar.ts';
import { Column, Row } from './ui/box.ts';

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
