// Deno tests for the get-characters Edge Function
// Run with: deno test --allow-net supabase/functions/get-characters/index.test.ts

// deno-lint-ignore no-import-prefix
import { assertEquals, assertMatch } from "https://deno.land/std@0.168.0/testing/asserts.ts"
import { validateFilter, handleRequest } from "./index.ts"

// ─── validateFilter ───────────────────────────────────────────────────────────

Deno.test("validateFilter: null input returns null valid with no errors", () => {
  const { valid, errors } = validateFilter(null)
  assertEquals(valid, null)
  assertEquals(errors.length, 0)
})

Deno.test("validateFilter: undefined input returns null valid with no errors", () => {
  const { valid, errors } = validateFilter(undefined)
  assertEquals(valid, null)
  assertEquals(errors.length, 0)
})

Deno.test("validateFilter: non-object returns error", () => {
  const { errors } = validateFilter("not-an-object")
  assertEquals(errors.length, 1)
})

Deno.test("validateFilter: valid name passes through", () => {
  const { valid, errors } = validateFilter({ name: "Rick" })
  assertEquals(errors.length, 0)
  assertEquals(valid?.name, "Rick")
})

Deno.test("validateFilter: name is trimmed", () => {
  const { valid } = validateFilter({ name: "  Morty  " })
  assertEquals(valid?.name, "Morty")
})

Deno.test("validateFilter: XSS chars are stripped from name", () => {
  const { valid } = validateFilter({ name: "<script>Rick</script>" })
  assertEquals(valid?.name, "scriptRick/script")
})

Deno.test("validateFilter: name over 100 chars returns error", () => {
  const { errors } = validateFilter({ name: "a".repeat(101) })
  assertEquals(errors.length, 1)
  assertEquals(errors[0]?.field, "filter.name")
})

Deno.test("validateFilter: valid status Alive passes through", () => {
  const { valid, errors } = validateFilter({ status: "Alive" })
  assertEquals(errors.length, 0)
  assertEquals(valid?.status, "Alive")
})

Deno.test("validateFilter: invalid status returns error", () => {
  const { errors } = validateFilter({ status: "Zombie" })
  assertEquals(errors.length, 1)
  assertEquals(errors[0]?.field, "filter.status")
})

Deno.test("validateFilter: valid species Human passes through", () => {
  const { valid, errors } = validateFilter({ species: "Human" })
  assertEquals(errors.length, 0)
  assertEquals(valid?.species, "Human")
})

Deno.test("validateFilter: invalid species returns error", () => {
  const { errors } = validateFilter({ species: "Dragon" })
  assertEquals(errors.length, 1)
})

Deno.test("validateFilter: combined valid filter", () => {
  const { valid, errors } = validateFilter({ name: "Rick", status: "Alive", species: "Human" })
  assertEquals(errors.length, 0)
  assertEquals(valid?.name, "Rick")
  assertEquals(valid?.status, "Alive")
  assertEquals(valid?.species, "Human")
})

// ─── handleRequest ────────────────────────────────────────────────────────────

Deno.test("handleRequest: OPTIONS returns CORS headers", async () => {
  const req = new Request("http://localhost/functions/v1/get-characters", {
    method: "OPTIONS",
  })
  const res = await handleRequest(req)
  assertEquals(res.status, 200)
  assertEquals(res.headers.get("Access-Control-Allow-Origin"), "*")
})

Deno.test("handleRequest: invalid page returns 400", async () => {
  const req = new Request("http://localhost/functions/v1/get-characters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page: -1 }),
  })
  const res = await handleRequest(req)
  assertEquals(res.status, 400)
  const body = await res.json()
  assertMatch(body.error, /invalid page/i)
})

Deno.test("handleRequest: page above max returns 400", async () => {
  const req = new Request("http://localhost/functions/v1/get-characters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page: 9999 }),
  })
  const res = await handleRequest(req)
  assertEquals(res.status, 400)
})

Deno.test("handleRequest: invalid filter returns 400", async () => {
  const req = new Request("http://localhost/functions/v1/get-characters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page: 1, filter: { status: "InvalidStatus" } }),
  })
  const res = await handleRequest(req)
  assertEquals(res.status, 400)
  const body = await res.json()
  assertMatch(body.error, /invalid filter/i)
})
