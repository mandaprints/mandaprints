import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

/**
 * Mantém o projeto Supabase ativo: o plano gratuito pausa o projeto depois de
 * ~7 dias sem atividade (e com ele o banco inteiro, derrubando checkout,
 * webhook e painel). A Vercel chama esta rota todo dia (ver vercel.json) e a
 * consulta abaixo conta como atividade.
 *
 * A Vercel envia "Authorization: Bearer <CRON_SECRET>" automaticamente quando
 * a variável CRON_SECRET existe; sem ela a rota recusa a chamada.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { error } = await getSupabaseServerClient().from("pedidos").select("id").limit(1);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
