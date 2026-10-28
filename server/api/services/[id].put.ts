export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do serviço obrigatório' })
  }

  const body = await readBody(event)
  const supabase = useServerSupabase()

  const updates: Record<string, any> = {}
  if (body.name !== undefined) updates.name = body.name
  if (body.description !== undefined) updates.description = body.description
  if (body.price !== undefined) updates.price = Number(body.price)
  if (body.duration_minutes !== undefined) updates.duration_minutes = Number(body.duration_minutes)
  if (body.is_active !== undefined) updates.is_active = body.is_active

  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message
    })
  }

  if (!data || data.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: `Serviço com ID ${id} não encontrado no banco de dados.`
    })
  }

  return data[0]
})
