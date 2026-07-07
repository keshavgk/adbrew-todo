# Solution Notes

My write-up for this submission: how to run it, the fixes I had to make to the
provided scaffold, and the design decisions behind the code. The original
assignment brief is preserved in `README.md`.

## Tech Stack

- **Frontend:** React 17 — functional components with hooks only (no class components)
- **Backend:** Django 3 + Django REST Framework
- **Database:** MongoDB, accessed directly via `pymongo` (no Django ORM / SQLite)
- **Infra:** Docker Compose — three containers: `app`, `api`, `mongo`

## Fixes Made to the Provided Scaffold

The provided `Dockerfile` no longer built against current base images. I made two
minimal, targeted fixes so the setup builds cleanly today:

1. **Pinned the base image to `python:3.8-bullseye`** (was the unpinned `python:3.8`).

   The unpinned tag now resolves to Debian *bookworm*, which ships `libssl3` and has
   dropped `libssl1.1`. The MongoDB 4.4 packages installed further down depend on
   `libssl1.1`, so the build failed with an unmet-dependency error. Debian *buster*
   has `libssl1.1` but is end-of-life — its apt repositories moved to archive, so
   `apt-get update` fails against it. **Bullseye is the middle ground:** still
   maintained (apt works) and still ships `libssl1.1` (MongoDB installs). The MongoDB
   apt repo already targets `buster` packages, which bullseye can satisfy, so no
   other line needed changing.

2. **Removed `RUN easy_install pip`.**

   `easy_install` was removed from modern `setuptools`, so the command no longer
   exists and failed with exit code 127. It was also redundant — `pip` already ships
   in the `python` base image — so the line was safe to delete outright.

## Architecture & Design Decisions

The solution favours clarity and extensibility over cleverness. The main decisions:

### Backend

- **Repository layer (`rest/repository.py`).** All MongoDB access and document
  serialization live in a small dedicated module. The view (`views.py`) is left with
  only HTTP concerns — read the request, choose a status code, return a response.
  This keeps each layer single-purpose, makes the data logic testable in isolation,
  and means swapping the datastore later would not touch the view.

- **`ObjectId` → string `id`.** Every MongoDB document has an auto-generated `_id` of
  type `bson.ObjectId`, which is **not** JSON-serializable and would crash the
  response. I convert it to a string and expose it as `id`. I keep it rather than
  dropping it so each todo has a stable, unique identity — used as the React list
  `key` today, and ready for future update/delete-by-id endpoints.

- **Validation and error handling.** `POST` validates that `description` is a
  non-empty string and returns `400` on bad input, `201` on success. Database calls
  are wrapped so a failure returns a clean `500` JSON error instead of leaking a
  stack trace. Validation lives in the view because it is an HTTP concern; the
  repository trusts the inputs it is given.

### Frontend

- **Hooks only.** State is managed with `useState`; the initial load runs in a
  `useEffect` with an empty dependency array — the hooks equivalent of
  `componentDidMount` — so it fires exactly once on mount, as required by the brief.

- **Component split + API layer.** `App` owns the state and logic. `TodoList` and
  `TodoForm` are presentational children: data flows down through props, events flow
  up through callbacks (lifting state up). `api.js` is the single place that knows the
  server URL and how to talk to it, keeping `fetch` calls out of the components.

- **Refresh from the source of truth.** After a successful create, the app re-fetches
  the list from MongoDB rather than optimistically appending locally, so the UI always
  reflects what is actually persisted.

## API Reference

| Method | Endpoint  | Request body                  | Success               | Errors       |
| ------ | --------- | ----------------------------- | --------------------- | ------------ |
| GET    | `/todos/` | —                             | `200` + list of todos | `500`        |
| POST   | `/todos/` | `{ "description": "string" }` | `201` + created todo  | `400`, `500` |

Example — create a todo:

```http
POST /todos/
Content-Type: application/json

{ "description": "Learn MongoDB" }
```

```json
{ "id": "665f1c...", "description": "Learn MongoDB" }
```

## Possible Improvements

Deliberately kept out of scope to match the task, but natural next steps:

- Update and delete endpoints — the string `id` already supports addressing a single todo.
- Automated tests — `pytest` for the repository/views, React Testing Library for the components.
- Move the API base URL into environment-based configuration instead of a hardcoded constant.
- Loading and empty-state polish, and pagination once the list grows.
