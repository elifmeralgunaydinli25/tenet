export interface APIResult<T> {
  data: T
}

export async function fetchAPI<T>(query: string, token?: string): Promise<APIResult<T>> {
  const r = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token ?? 'INVALID_TOKEN'}`,
    },
    body: JSON.stringify({
      query,
    }),
  })
  return await r.json()
}
