import { http, HttpResponse } from "msw";
import { getStateInstance } from "./instance";

export interface IBaseCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

export const handlers = [getStateInstance];
