export const errorStatusMap: Record<string, number> = {
    NotFoundError: 404,
    ConflictError: 409,
    RuleError: 422,
};

export const errorToHttpStatus = (error: Error): number => errorStatusMap[error.name] ?? 500;
