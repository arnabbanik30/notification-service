import mqConnection from "./rabbitmq";
import { MAIN_QUEUE } from "./config";

const listen = async () => {
  await mqConnection.connect();
  await mqConnection.consume(MAIN_QUEUE);
};

listen();