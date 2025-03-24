import { config } from "dotenv";

config();

export const mongoUser = String(process.env.MONGO_INITDB_ROOT_USERNAME);

export const mongoPassword = String(process.env.MONGO_INITDB_ROOT_PASSWORD);

export const rmqUser = String(process.env.RABBITMQ_USERNAME);

export const rmqPass = String(process.env.RABBITMQ_PASSWORD);

export const rmqhost = String(process.env.RABBITMQ_URL);

export const MAIN_QUEUE = "@main_queue";

export const BASE_QUEUE_NAME = "processing_queue";

export const DEAD_LETTER_EXCHANGE = "dlx";

export const DEAD_LETTER_QUEUE = "dead_letter_queue";