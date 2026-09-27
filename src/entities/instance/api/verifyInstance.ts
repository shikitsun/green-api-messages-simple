import { apiRequest } from "@/shared/api/base";
import type { TInstanceState } from "../model/model";
import type { useInstanceStore } from "../model/useInstanceStore";

export async function verifyInstanceConnection(
  credentials: Pick<
    ReturnType<typeof useInstanceStore.getState>,
    "idInstance" | "apiTokenInstance"
  >,
) {
  return await apiRequest<{ stateInstance: TInstanceState }>(
    "/waInstance{{idInstance}}/getStateInstance/{{apiTokenInstance}}",
    {},
    credentials,
  );
}
