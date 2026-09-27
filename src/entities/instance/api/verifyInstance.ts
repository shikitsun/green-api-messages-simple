import { apiRequest } from "@/shared/api/base";
import type { TInstanceState } from "../model/model";

export async function verifyInstanceConnection() {
  return await apiRequest<{ stateInstance: TInstanceState }>(
    "/waInstance{{idInstance}}/getStateInstance/{{apiTokenInstance}}",
  );
}
