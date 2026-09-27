// In future could be applied some pattern, e.g. Strategy pattern to make state more "actionable" and flexible
export type TInstanceState =
  | "notAuthorized"
  | "authorized"
  | "blocked"
  | "starting"
  | "suspended"
  | "pendingPassword";
