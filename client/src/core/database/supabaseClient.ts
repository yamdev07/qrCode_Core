// src/core/database/supabaseClient.ts
// Supabase n'est plus utilisé. Client factice chainable pour satisfaire le type checker.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any

const NULL_RESULT = { data: null, error: null }

function chain(): Any {
  return new Proxy({}, {
    get(_target, _prop) {
      if (_prop === Symbol.toPrimitive || _prop === Symbol.toStringTag) return undefined
      if (_prop === 'then' || _prop === 'catch' || _prop === 'finally') {
        return undefined
      }
      // Methods that return the chain (query builder methods)
      if (_prop === 'select' || _prop === 'eq' || _prop === 'neq' ||
          _prop === 'gt' || _prop === 'lt' || _prop === 'gte' ||
          _prop === 'lte' || _prop === 'like' || _prop === 'ilike' ||
          _prop === 'in' || _prop === 'is' || _prop === 'order' ||
          _prop === 'limit' || _prop === 'range' || _prop === 'filter' ||
          _prop === 'match' || _prop === 'not' || _prop === 'or') {
        return (..._args: Any[]) => chain()
      }
      // Methods that return async results
      if (_prop === 'single' || _prop === 'maybeSingle' ||
          _prop === 'insert' || _prop === 'update' || _prop === 'upsert' ||
          _prop === 'delete' || _prop === 'rpc' ||
          _prop === 'select' || _prop === 'download') {
        return async (..._args: Any[]) => NULL_RESULT
      }
      // Sub-chains (like .data.session, .from())
      return (..._args: Any[]) => chain()
    }
  })
}

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (_callback: Any) => ({
      data: { subscription: { unsubscribe: () => {} } }
    }),
    signInWithPassword: async (_creds: Any) => ({
      data: { session: null },
      error: { message: 'Supabase désactivé' }
    }),
    signOut: async () => ({ error: null })
  },
  storage: {
    listBuckets: async () => ({ data: [], error: null }),
    createBucket: async (_name: Any, _opts: Any) => ({ error: null }),
    from: (_bucket: Any) => ({
      upload: async (_path: Any, _file: Any, _opts: Any) => ({ error: null }),
      download: async (_path: Any) => ({ data: null, error: null }),
      getPublicUrl: (_path: Any) => ({ data: { publicUrl: '' } }),
      list: async (_prefix: Any) => ({ data: [], error: null }),
      remove: async (_paths: Any) => ({ error: null })
    })
  },
  from: (_table: Any) => chain(),
  rpc: (_fn: Any, _params: Any) => chain()
}
