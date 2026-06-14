import { useState } from 'react';
import { ReadingStatus } from '@reading-room/common';

import { Column, Row } from '../../ui/box.tsx';
import { createBook } from '../../api/books.api.ts';
import { useAuthors } from '../../data/use-authors.ts';
import { useShelves } from '../../data/use-shelves.ts';
import { useBookListContext } from './book-list-context.tsx';
import { AddBookFormTestIds } from './add-book-form.test-ids.ts';
import { isReadingStatus, readingStatusLabelMap } from './book-list.utils.ts';
import { AddBookFormState, emptyAddBookForm, isAddBookFormValid, makeCreateBookDto } from './add-book-form.utils.ts';

import styles from './add-book-form.module.scss';

export const AddBookForm = (): JSX.Element => {
    const { setPage } = useBookListContext();
    const { data: authors } = useAuthors();
    const { data: shelves } = useShelves();
    const [form, setForm] = useState<AddBookFormState>(emptyAddBookForm());
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setForm((prev) => ({ ...prev, title: e.target.value }));
    };

    const handleAuthorChange = (authorId: string): void => {
        setForm((prev) => ({ ...prev, authorId }));
    };

    const handleShelfChange = (shelfId: string): void => {
        setForm((prev) => ({ ...prev, shelfId }));
    };

    const handleStatusChange = (status: ReadingStatus): void => {
        setForm((prev) => ({ ...prev, status }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        // Guard re-entrancy directly: the button's disabled state only applies on the next
        // render, so a rapid double-submit (e.g. Enter twice) could otherwise fire two creates.
        if (submitting || !isAddBookFormValid(form)) return;

        setSubmitting(true);
        setError(undefined);

        createBook(makeCreateBookDto(form))
            .then(() => {
                // The list is server-sorted (newest first) and paginated, so we can't know the
                // new book's position locally — jump to page 1 and re-fetch rather than guess.
                setForm(emptyAddBookForm());
                setPage(1);
            })
            .catch(() => {
                setError('Could not add the book. Please try again.');
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    const disabled = !isAddBookFormValid(form) || submitting;

    return (
        <form className={styles.form} onSubmit={handleSubmit} data-testid={AddBookFormTestIds.Form}>
            <Row className={styles.fields}>
                <label className={styles.field}>
                    {`Title`}
                    <input
                        value={form.title}
                        onChange={handleTitleChange}
                        data-testid={AddBookFormTestIds.TitleInput}
                    />
                </label>

                <EntitySelect
                    label={`Author`}
                    value={form.authorId}
                    options={(authors ?? []).map((a) => ({ value: a.id, label: a.name }))}
                    onChange={handleAuthorChange}
                    testId={AddBookFormTestIds.AuthorSelect}
                />

                <EntitySelect
                    label={`Shelf`}
                    value={form.shelfId}
                    options={(shelves ?? []).map((s) => ({ value: s.id, label: s.name }))}
                    onChange={handleShelfChange}
                    testId={AddBookFormTestIds.ShelfSelect}
                />

                <StatusSelect value={form.status} onChange={handleStatusChange} />

                <button type="submit" disabled={disabled} data-testid={AddBookFormTestIds.SubmitButton}>
                    {`Add book`}
                </button>
            </Row>

            {error !== undefined && (
                <Column className={styles.error} data-testid={AddBookFormTestIds.Error}>
                    {error}
                </Column>
            )}
        </form>
    );
};

type EntitySelectOption = { value: string; label: string };

type EntitySelectProps = {
    label: string;
    value: string;
    options: EntitySelectOption[];
    onChange: (value: string) => void;
    testId: string;
};

const EntitySelect = ({ label, value, options, onChange, testId }: EntitySelectProps): JSX.Element => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        onChange(e.target.value);
    };

    return (
        <label className={styles.field}>
            {label}
            <select value={value} onChange={handleChange} data-testid={testId}>
                <option value="">{`Select…`}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </label>
    );
};

type StatusSelectProps = {
    value: ReadingStatus;
    onChange: (status: ReadingStatus) => void;
};

const StatusSelect = ({ value, onChange }: StatusSelectProps): JSX.Element => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        if (isReadingStatus(e.target.value)) onChange(e.target.value);
    };

    return (
        <label className={styles.field}>
            {`Status`}
            <select value={value} onChange={handleChange} data-testid={AddBookFormTestIds.StatusSelect}>
                {Object.values(ReadingStatus).map((s) => (
                    <option key={s} value={s}>
                        {readingStatusLabelMap[s]}
                    </option>
                ))}
            </select>
        </label>
    );
};
