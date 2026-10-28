export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const supabase = useServerSupabase()

  const { data, error } = await supabase
    .from('services')
    .insert([
      {
        name: body.name,
        description: body.description || '',
        price: Number(body.price),
        duration_minutes: Number(body.duration_minutes),
        is_active: body.is_active ?? true
      }
    ])
    .select()
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  return data
})
