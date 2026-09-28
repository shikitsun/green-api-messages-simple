import { getStateInstance } from "./instance";
import { chatHandlers } from "./chat";

export interface IBaseCredentials {
  apiTokenInstance: string;
}

export const handlers = [getStateInstance, ...chatHandlers];
