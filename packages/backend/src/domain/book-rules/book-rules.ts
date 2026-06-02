import { ReadingStatus } from '@reading-room/common';

// All valid status transitions, expressed as data rather than branching logic.
// Adding or changing a transition means editing this table — nothing else.
export const nextStatusesMap: Record<ReadingStatus, ReadingStatus[]> = {
    [ReadingStatus.WantToRead]: [ReadingStatus.Reading, ReadingStatus.Abandoned],
    [ReadingStatus.Reading]: [ReadingStatus.Read, ReadingStatus.Abandoned],
    [ReadingStatus.Read]: [ReadingStatus.Abandoned],
    [ReadingStatus.Abandoned]: [ReadingStatus.WantToRead],
};

export const canTransition = (from: ReadingStatus, to: ReadingStatus): boolean => {
    const allowed = nextStatusesMap[from];
    if (allowed === undefined) {
        throw new Error(`canTransition: unexpected ReadingStatus '${from}'`);
    }

    return allowed.includes(to);
};

export const canRate = (status: ReadingStatus): boolean => status === ReadingStatus.Read;
