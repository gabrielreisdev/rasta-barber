import { createClient } from '@supabase/supabase-js'

export const useServerSupabase = () => {
  const config = useRuntimeConfig()
  const url = process.env.SUPABASE_URL || (config.public?.supabase as any)?.url
  const key = process.env.SUPABASE_KEY || (config.public?.supabase as any)?.key

  if (!url || !key) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configuração do Supabase ausente no servidor (.env).'
    })
  }

  return createClient(url, key)
}
