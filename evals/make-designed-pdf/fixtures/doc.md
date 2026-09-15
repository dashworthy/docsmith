# Widget API — Quick Guide

The Widget API lets a service create, read, and retire widgets over HTTP. It is a small,
versioned REST surface designed to be boring: predictable paths, predictable errors.

## Authentication

Every request carries a bearer token in the `Authorization` header. Tokens are scoped per
project and expire after 24 hours; a `401` means the token is missing or stale.

> Tip: cache the token for its full lifetime rather than minting one per request — the mint
> endpoint is rate-limited and a fresh token per call will trip it under load.

## Creating a widget

`POST /v1/widgets` with a JSON body of `{ "name": string, "color": string }` returns `201`
and the created widget, including its server-assigned `id`. A missing `name` returns `422`
with a field-level error list.
