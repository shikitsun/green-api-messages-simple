import { http, HttpResponse } from "msw";
import { getStateInstance } from "./instance";

export interface IBaseCredentials {
  apiTokenInstance: string;
}

export const handlers = [getStateInstance];
