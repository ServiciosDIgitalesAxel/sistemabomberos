import { createClient } from '@/lib/supabaseClient'

export default async function CuartelPage({ params }) {
  const supabase = createClient()
  const { id } = params

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

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