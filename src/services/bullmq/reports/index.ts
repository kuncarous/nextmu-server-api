import { logger } from '@shared';
import * as BullMQ from 'bullmq';
import _ from 'lodash';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { RedisConnection } from '../../redis';
import { ReportJobData, ReportJobType } from './types';

export const ReportsQueueName = process.env.ReportS_QUEUE_NAME ?? "reportsQueue";
export const ReportsQueue = new BullMQ.Queue<ReportJobData>(
    ReportsQueueName,
    {
        connection: RedisConnection,
    }
);
export const ReportsQueueSchedule = new BullMQ.QueueScheduler(
    ReportsQueueName,
    {
        connection: RedisConnection,
    }
);

const processReportJob = async (job: BullMQ.Job<ReportJobData>) => {
    const { type } = job.data;
    
    try {
        switch(type)
        {
        case ReportJobType.None: break;
        default: throw new Error(`invalid job type`);
        }
    } catch(error) {
        throw (error);
    }
};

export const ReportsWorker = (
    Number(process.env.ReportS_QUEUE_PROCESS ?? 1) > 0
    ? new BullMQ.Worker(
        ReportsQueueName,
        processReportJob,
        {
            connection: RedisConnection,
        }
    ) : null
);

export * from './types';