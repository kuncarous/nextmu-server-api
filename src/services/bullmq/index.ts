import { createBullBoard } from 'bull-board';
import { BullMQAdapter } from 'bull-board/bullMQAdapter';
//import { ReportsQueue } from './reports';

export const bullBoard = createBullBoard(
    [
        //new BullMQAdapter(ReportsQueue),
    ]
);

export * from './reports';