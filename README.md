# Simple Green API Chat

A minimal chat client for [GREEN-API](https://green-api.com/): sign in with your instance credentials, open a chat
by phone number and exchange **text** messages. The layout follows the web chat UI (sidebar with chats,
bubbles, composer). Requests go to the documented v3 base path
`{VITE_GREEN_API_BASE}/waInstance{idInstance}/{method}/{apiTokenInstance}` — `waInstance` is simply how the API is
addressed, regardless of the instance type.

API methods used: `getStateInstance`, `checkAccount`, `getChats`, `sendMessage`, `receiveNotification`,
`deleteNotification` — as described in the [API v3 reference](https://green-api.com/v3/docs/api/sending/SendMessage/).

## Stack

React 19 · TypeScript · Vite · React Router · TanStack Query · Zustand ·
CSS Modules · MSW · Vitest + Testing Library · Oxlint · React Compiler.

Requires Node ≥ 22 (verified on 26.4) and npm ≥ 10.

## Quick start

```bash
npm install

# 1. Environment (`.env` is git-ignored)
cp .env.example .env
#    set VITE_GREEN_API_BASE=https://XXXX.api.green-api.com   (XXXX = your instance id)

npm run dev        # http://localhost:5173
```

No instance at hand? Sign in with `idInstance = test` and any `apiTokenInstance` and the app runs on mocks —
see [Mock mode](#mock-mode).

### Scripts

| Command           | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `npm run dev`     | dev server (starts the MSW mocks)                      |
| `npm run build`   | `tsc -b && vite build` — production build + type check |
| `npm run preview` | serve the production build locally                     |
| `npm run lint`    | Oxlint                                                 |
| `npm run test`    | Vitest, single run                                     |
| `npx vitest`      | Vitest in watch mode                                   |

## How it works

1. **Credentials.** `/login` asks for `idInstance` and `apiTokenInstance` and verifies them with
   `getStateInstance`. Anything but `authorized` is reported in the form and keeps the user out.
   If the token is refused later on (rotated, revoked), the session ends by itself: back to `/login`,
   everything the previous instance had loaded is dropped, and the draft being typed is kept.
   Credentials live in memory only — see [Known limitations](#known-limitations).
2. **Chats.** The sidebar is the instance's chat list (`getChats`) ordered by last activity. The “+” button
   resolves a phone number with `checkAccount`; the new chat is added to the list and opened right away.
   A contact who writes first is added to the list as well, so the reply is always reachable.
3. **Sending.** `sendMessage`; the bubble is rendered optimistically and stays in the history once the API
   confirms it. Forms are built on React actions, so pending and error states come from `useActionState`.
4. **Receiving.** `useMessagesListener` polls `receiveNotification` every 10 s and immediately acknowledges
   every delivery through `deleteNotification` — an unacknowledged notification is served again and again.
   Incoming messages are deduplicated by `idMessage`; anything that is not a text message is acknowledged and
   dropped, and each conversation is kept sorted by timestamp.
5. **Replies** appear in the open chat without a page reload.

## Mock mode

`npm run dev` registers a Service Worker (`public/mockServiceWorker.js`) that intercepts requests before they
reach the network. The handlers are pinned to the `/waInstancetest/...` path, so **mocks only respond when
`idInstance = test`**; with real credentials requests go to the actual Green API.

Emulated:

- `getStateInstance` → `authorized`;
- `checkAccount` → `79001112233`, `79112223344`, `79223334455`, `79334445566` are considered to exist;
- `getChats` → three chats: `79001112233` (User1), `79112223344` (User2), `79223334455` (Group1);
- `sendMessage` → returns an `idMessage` and queues an echo of the sent message (same `idMessage`, so the UI
  does not duplicate it);
- `receiveNotification` / `deleteNotification` → an in-memory queue with acknowledgement.

Mock delays are random (up to 10 s) to exercise loading and pending states.

To fill the incoming queue from the browser console:

```js
fetch("/injectRandomMessages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ count: 3 }),
});
```

There is no auto-reply: the echo of an outgoing message is dropped by the `idMessage` deduplication. To see an
incoming message, fill the queue or reply from a phone bound to a real instance.

## Architecture

Laid out in FSD layers, dependencies point downwards only.

```
src/
  app/            # composition: providers (Query, Router), error boundary, routes, global styles
  pages/          # auth-page, chat-page — compose widgets and features
  widgets/        # chat-list, chat-window
  features/       # auth-api, create-chat, send-message, receive-messages
  entities/       # instance, chat, message: api / model / ui
  shared/         # api (apiRequest), ui (Button, LoadSpin, Toaster), model, lib
  mocks/          # MSW: browser handlers + node server for tests
  test/           # test helpers: render, api, fixtures, reset
```

Design decisions:

- **Server state lives in TanStack Query** (`getChats`), **client state in Zustand** (credentials, active chat,
  messages, locally created chats) — no duplicated state.
- **A single API entry point** — `shared/api/base.ts`: builds the URL, injects the credentials, validates that
  they are present, extracts the error message and returns `undefined` on `204` (empty notification queue).
- **Sending** goes through form actions: the optimistic message is rendered right away and rolled back on
  failure, with the reason shown next to the composer.
- **Receiving** is a polling hook with backoff: the interval grows on failure (`10s × (1 + Math.E)` per failed
  attempt) and resets after a successful poll.
- Messages are deduplicated by `idMessage` and sorted by `timestamp`, so a delivery is never rendered twice.

## Error handling

Failures have to be visible: the ones that went unnoticed here were silent ones — React warnings, a broken
poll, an exception inside a form action.

- **Toasts** (`shared/model/useToasts.ts` + `shared/ui/Toaster.tsx`) are the channel for anything that has no
  place in the layout. Identical texts are deduplicated within 5 s and the last three are kept; errors use
  `role="alert"`, information `role="status"`, and both dismiss themselves after 5 s.
- **Queries** are reported in one place: `QueryCache.onError` in `app/providers/queryClient.ts` turns any failed
  request into a toast carrying the reason Green API returned — no per-component `try/catch`.
- **Failure classes, not just messages**: `apiRequest` throws `ApiError` with the HTTP status attached (or `null`
  when the request never reached the API), so callers branch on the class of failure instead of parsing text.
- **A refused token (401)** ends the session once, however many requests fail in the same batch: credentials are
  cleared, the route guard returns to `/login`, `useSessionTeardown` drops the previous instance's chats, history
  and cached queries, and only the session toast is shown — the per-request toast is suppressed for 401 so that one
  cause produces one message.
- **Drafts live in the store**, not in the input element: a session ending, a failed send or a chat switch does not
  throw away text the user was typing. It is cleared once the message is actually on its way.
- **Polling** reports a lost connection once per outage and re-arms it after the instance answers again.
- **Form actions and any other unawaited promise**: `registerUnhandledRejectionReporter` (called in `main.tsx`)
  shows a safe text to the user and keeps the real reason in the console.
- **Render errors** are caught by `app/ErrorBoundary.tsx`, which swaps the crashed subtree for a readable screen
  with a reload button instead of a blank page.

In tests the same idea works the other way round — see the quiet rule below: an unexpected `console.error` or
`console.warn` fails the test.

## Testing

```bash
npm run test          # single run
npx vitest            # watch
```

## Known limitations

- Credentials are kept in memory on purpose: instance tokens in `localStorage`/`sessionStorage` are readable by any
  script running on the page. A reload therefore returns to `/login`; a token refused by the API ends the session
  automatically, and there is no manual sign-out.
- Delivery uses the HTTP API (`receiveNotification` → `deleteNotification`) with a fixed 10 s interval between
  polls; a shorter idle interval would cut the latency (the API also documents a webhook endpoint).
- Green API does not expose message history: conversations live for the duration of the browser session.
- Non-text messages (`imageMessage`, …) are acknowledged and ignored: the app is text-only.
- No virtualisation of the message list (noted in the code) and no auto-scroll to the latest message.
