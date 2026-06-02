import { useEffect, useState } from 'react';

import { fetchHealth } from './api/health.api.js';
import { AppTestIds } from './app.test-ids.js';
import { BookList } from './features/books/book-list.js';
import { BookListProvider } from './features/books/book-list-context.js';
import { BookToolbar } from './features/books/book-toolbar.js';
import { Column, Row } from './ui/box.js';

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
                <BookToolbar />
                <BookList />
            </BookListProvider>
        </Column>
    );
};
