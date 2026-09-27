import { http } from "msw";
import type { IBaseCredentials } from ".";

export const getStateInstance = http.get<IBaseCredentials>(
  "/waInstance:idInstance/getStateInstance/{{apiTokenInstance}}",
  ({ params }) => {
    console.log(params);
  },
);
