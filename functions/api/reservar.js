const SUPABASE_URL = "https://rllnbaothkjafmbsmlgr.supabase.co"

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: { "Content-Type": "application/json" },
  })
}

function fechaLima(desfaseDias) {
  const ms = Date.now() - 5 * 3600 * 1000 + desfaseDias * 86400 * 1000
  return new Date(ms).toISOString().slice(0, 10)
}

export async function onRequestPost(context) {
  const request = context.request
  const env = context.env

  if (!env.TURNSTILE_SECRET || !env.SUPABASE_SECRET_KEY) {
    return json({ error: "config" }, 500)
  }

  let body
  try {
    body = await request.json()
  } catch (e) {
    return json({ error: "invalido" }, 400)
  }
  body = body || {}

  const token = body.token
  const servicio = typeof body.servicio === "string" ? body.servicio.trim() : ""
  const fecha = typeof body.fecha === "string" ? body.fecha : ""
  const hora = typeof body.hora === "string" ? body.hora : ""
  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : ""
  const telefono = typeof body.telefono === "string" ? body.telefono : ""
  const mascota = typeof body.mascota === "string" ? body.mascota.trim() : ""

  const datosValidos =
    typeof token === "string" &&
    token.length > 0 &&
    servicio.length >= 1 && servicio.length <= 60 &&
    /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
    fecha >= fechaLima(0) && fecha <= fechaLima(90) &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(hora) &&
    nombre.length >= 3 && nombre.length <= 80 &&
    /^9[0-9]{8}$/.test(telefono) &&
    mascota.length >= 1 && mascota.length <= 60

  if (!datosValidos) {
    return json({ error: "invalido" }, 400)
  }

  const form = new FormData()
  form.append("secret", env.TURNSTILE_SECRET)
  form.append("response", token)
  const ip = request.headers.get("CF-Connecting-IP")
  if (ip) form.append("remoteip", ip)

  const verif = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form }
  )
  const resultado = await verif.json()
  if (!resultado.success) {
    return json({ error: "captcha" }, 403)
  }

  const guardado = await fetch(SUPABASE_URL + "/rest/v1/citas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_SECRET_KEY,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      servicio: servicio,
      fecha: fecha,
      hora: hora,
      nombre: nombre,
      telefono: telefono,
      mascota: mascota,
    }),
  })

  if (guardado.status === 201) {
    return json({ ok: true }, 201)
  }
  if (guardado.status === 409) {
    return json({ error: "ocupado" }, 409)
  }
  return json({ error: "servidor" }, 500)
}