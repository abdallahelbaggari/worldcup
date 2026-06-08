/* =============================================================
   WORLDCUP · functions/approve.js
   Cloudflare Pages Function · MAINNET · sandbox:false

   Route:   POST /approve
   Health:  GET  /approve  → returns JSON status

   PI_API_KEY → Cloudflare Dashboard → Settings →
                Environment Variables → Add Secret
============================================================= */

export async function onRequestGet(context) {
  const key = context.env.PI_API_KEY;
  return new Response(
    JSON.stringify({
      ok: true,
      service: "WorldCup approve.js",
      mode: "MAINNET · sandbox:false",
      app: "worldcup.pi",
      pi_api_key_present: !!key,
      pi_api_key_prefix: key ? key.substring(0,8)+"..." : "MISSING — add to Cloudflare"
    }),
    { status:200, headers:{ "Content-Type":"application/json","Access-Control-Allow-Origin":"*" }}
  );
}

export async function onRequestPost(context) {
  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  console.log("[WorldCup] /approve POST — MAINNET");

  try {
    let paymentId = null;
    try {
      const body = await context.request.json();
      paymentId = body.paymentId || null;
      console.log("[WorldCup] paymentId:", paymentId);
    } catch(e) {
      return new Response(JSON.stringify({ approved:true, step:"body_parse_error" }), { status:200, headers:CORS });
    }

    if (!paymentId) {
      return new Response(JSON.stringify({ approved:true, step:"no_payment_id" }), { status:200, headers:CORS });
    }

    const PI_API_KEY = context.env.PI_API_KEY;
    if (!PI_API_KEY) {
      console.error("[WorldCup] PI_API_KEY MISSING");
      return new Response(JSON.stringify({ approved:true, step:"no_api_key" }), { status:200, headers:CORS });
    }

    /* GET current payment state */
    try {
      const getRes = await fetch("https://api.minepi.com/v2/payments/"+paymentId, {
        headers: { "Authorization":"Key "+PI_API_KEY }
      });
      console.log("[WorldCup] GET state:", getRes.status, await getRes.text());
    } catch(e) { console.error("[WorldCup] GET error:", e.message); }

    /* POST approve — ALWAYS return 200 */
    const res = await fetch("https://api.minepi.com/v2/payments/"+paymentId+"/approve", {
      method: "POST",
      headers: { "Authorization":"Key "+PI_API_KEY, "Content-Type":"application/json" },
      body: JSON.stringify({})
    });
    const raw = await res.text();
    console.log("[WorldCup] Approve:", res.status, raw);

    return new Response(
      JSON.stringify({ approved:true, pi_status:res.status, pi_response:raw }),
      { status:200, headers:CORS }
    );

  } catch(err) {
    console.error("[WorldCup] approve error:", err.message);
    return new Response(JSON.stringify({ approved:true, error:err.message }), { status:200, headers:CORS });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status:200,
    headers:{
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods":"POST,GET,OPTIONS",
      "Access-Control-Allow-Headers":"Content-Type"
    }
  });
}
