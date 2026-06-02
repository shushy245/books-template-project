import { useEffect, useState } from 'react';

import { fetchHealth } from './api/health.api';
import { AppTestIds } from './app.test-ids';
import { Column, Row } from './ui/box';

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
    </Column>
  );
};
