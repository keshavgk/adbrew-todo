# Solution Notes


## Tech Stack

- **Frontend:** React 
- **Backend:** Django 3
- **Database:** MongoDB, accessed directly via `pymongo` (no Django ORM / SQLite)
- **Infra:** Docker Compose — three containers: `app`, `api`, `mongo`

## Fixes Made to the Provided Scaffold

The provided `Dockerfile` no longer built against current base images. I made two
minimal, targeted fixes so the setup builds cleanly today:

1. **Pinned the base image to `python:3.8-bullseye`** (was the unpinned `python:3.8`).


2. **Removed `RUN easy_install pip`.**

   `easy_install` was removed from modern `setuptools`, 

## Architecture & Design Decisions

The main decisions:

### Backend

- **Repository layer (`rest/repository.py`).** All MongoDB access and document
  live in a small dedicated module. The view (`views.py`) is left with
  only HTTP concerns — read the request, choose a status code, return a response.
  
- **`ObjectId` → string `id`.** Every MongoDB document has an auto-generated `_id` of
  type `bson.ObjectId`, which is **not** JSON-serializable and would crash the
  response. I convert it to a string and expose it as `id`. 

- **Validation and error handling.** `POST` validates that `description` is a
  non-empty string and returns `400` on bad input, `201` on success. Database calls
  are wrapped so a failure returns a clean `500` JSON error instead of leaking

### Frontend

- **Hooks only.** State is managed with `useState`; the initial load runs in a
  `useEffect` with an empty dependency array 

- **Component split + API layer.** `App`  `TodoList` and
  `TodoForm` `api.js`  `fetch` 

- **Refresh from the source of truth.** After a successful create, the app re-fetches
  the list from MongoDB

## API Reference

| Method | Endpoint  | Request body                  | Success               | Errors       |
| ------ | --------- | ----------------------------- | --------------------- | ------------ |
| GET    | `/todos/` | —                             | `200` + list of todos | `500`        |
| POST   | `/todos/` | `{ "description": "string" }` | `201` + created todo  | `400`, `500` |

 create a todo:

```http
POST /todos/
Content-Type: application/json

{ "description": "Learn MongoDB" }
```

```json
{ "id": "665f1c...", "description": "Learn MongoDB" }
```


