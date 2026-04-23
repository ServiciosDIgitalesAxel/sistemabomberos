import { createAdminClient } from '@/lib/supabase/admin'

export default async function CuartelPage({ params }) {
  const supabase = createAdminClient()
  const { id } = params

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('ERROR:', error)
  }

  if (!data) {
    return <div>No existe el cuartel</div>
  }

  return (
    <div>
      <h1>{data.nombre}</h1>
      <p>ID: {data.id}</p>
    </div>
  )
}