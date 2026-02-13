# CS130Project

## Temporary Auth Stub (Expenses Development)

The Expenses backend currently uses a temporary auth middleware that injects
a fixed test `userId`.

Purpose:
- Allow Expenses APIs to be developed independently
- Avoid blocking on Auth implementation

Action required:
- Should replace `requireAuth.ts` with real JWT-based authentication
- No changes should be needed in expense controllers or repositories

! This stub must be removed before production.