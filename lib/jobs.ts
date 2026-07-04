import { logger } from '@/lib/logger';

type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'delayed';

interface Job {
  id: string;
  name: string;
  data: unknown;
  status: JobStatus;
  attempts: number;
  createdAt: Date;
  processedAt?: Date;
  failedAt?: Date;
  error?: string;
}

interface JobOptions {
  attempts?: number;
  delay?: number;
  priority?: number;
}

interface JobResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

type JobHandler = (data: unknown) => Promise<JobResult>;

const jobs = new Map<string, Job>();
const handlers = new Map<string, JobHandler>();
const MAX_ATTEMPTS = 3;

export function registerJob(name: string, handler: JobHandler): void {
  handlers.set(name, handler);
}

export async function enqueueJob(
  name: string,
  data: unknown,
  options: JobOptions = {}
): Promise<string> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  
  const job: Job = {
    id,
    name,
    data,
    status: options.delay ? 'delayed' : 'pending',
    attempts: 0,
    createdAt: new Date(),
  };

  jobs.set(id, job);

  if (options.delay) {
    setTimeout(() => processJob(id), options.delay);
  } else {
    processJob(id);
  }

  return id;
}

async function processJob(id: string): Promise<void> {
  const job = jobs.get(id);
  if (!job) return;

  const handler = handlers.get(job.name);
  if (!handler) {
    job.status = 'failed';
    job.error = `No handler registered for job: ${job.name}`;
    return;
  }

  job.status = 'processing';
  job.attempts += 1;

  try {
    const result = await handler(job.data);
    if (result.success) {
      job.status = 'completed';
      job.processedAt = new Date();
    } else {
      throw new Error(result.error ?? 'Job failed');
    }
  } catch (error) {
    job.error = (error as Error).message;
    
    if (job.attempts < MAX_ATTEMPTS) {
      job.status = 'pending';
      setTimeout(() => processJob(id), 1000 * job.attempts);
    } else {
      job.status = 'failed';
      job.failedAt = new Date();
      logger.error('Job failed after max attempts', { jobId: id, error: job.error });
    }
  }
}

export async function getJobStatus(id: string): Promise<Job | undefined> {
  return jobs.get(id);
}

export function getJobs(name?: string): Job[] {
  return Array.from(jobs.values())
    .filter((job) => !name || job.name === name)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}