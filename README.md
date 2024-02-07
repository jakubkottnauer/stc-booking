# stc-booking

A tiny CLI utility used to book workout sessions at one of the gym chains in Sweden (STC) to avoid having to use their mobile app.

Two env variables need to be provided, `STC_TOKEN` (JWT auth token) and `CLUBS` (comma-delimited list of club IDs). Both of these values can be intercepted using a mitm proxy (such as Charles or Proxyman).

![Alt text](images/example.png?raw=true "App in action")

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

