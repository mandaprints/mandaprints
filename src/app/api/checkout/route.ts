import { NextRequest, NextResponse } from "next/server";
import { CartItem } from "@/lib/cart-context";
import { getSupabaseServerClient } from "@/lib/supabase";
import { EnderecoEntrega } from "@/lib/types";

/**
 * Cria uma preferência de pagamento no Mercado Pago (Checkout Pro) e devolve
 * a URL (init_point) para redirecionar o cliente.
 *
 * Requer a variável de ambiente MERCADOPAGO_ACCESS_TOKEN (Access Token de
 * produção ou de teste, gerado em mercadopago.com.br/developers/panel).
 *
 * O pedido é salvo no Supabase ANTES de criar a preferência, e o id desse
 * registro é enviado como "external_reference" para o Mercado Pago. É esse
 * campo — não o id da preferência nem o do merchant_order, que não batem
 * com nada que a gente guarda — que o webhook usa depois para encontrar o
 * pedido certo e atualizar o status.
 */
export async function POST(req: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json(
      { error: "MERCADOPAGO_ACCESS_TOKEN não configurado no .env" },
      { status: 500 }
    );
  }

  const body = (await req.json()) as {
    itens: CartItem[];
    frete: { nome: string; preco: number } | null;
    endereco: EnderecoEntrega;
  };

  const total =
    body.itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0) +
    (body.frete?.preco ?? 0);

  let pedidoId: string | null = null;
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("pedidos")
      .insert({
        status: "pendente",
        itens: body.itens,
        frete: body.frete,
        endereco: body.endereco,
        total,
        cliente_nome: body.endereco?.nome ?? null,
        cliente_email: body.endereco?.email ?? null,
        cliente_telefone: body.endereco?.telefone ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    pedidoId = data.id;
  } catch (err) {
    console.error("Falha ao salvar pedido no Supabase:", err);
  }

  // Sem o pedido salvo o webhook não consegue localizá-lo depois do pagamento
  // (nem e-mails, nem painel) — melhor recusar do que cobrar um pedido
  // "fantasma".
  if (!pedidoId) {
    return NextResponse.json(
      { error: "Não foi possível registrar o pedido agora. Tente novamente em instantes." },
      { status: 503 }
    );
  }

  const items = body.itens.map((item) => ({
    title: `${item.nome} (${item.tamanho}, ${item.moldura}, ${item.acabamento})`,
    quantity: item.quantidade,
    unit_price: item.preco,
    currency_id: "BRL",
  }));

  if (body.frete && body.frete.preco > 0) {
    items.push({
      title: `Frete — ${body.frete.nome}`,
      quantity: 1,
      unit_price: body.frete.preco,
      currency_id: "BRL",
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const preferenceResp = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      items,
      payer: {
        name: body.endereco?.nome,
        email: body.endereco?.email,
        phone: body.endereco?.telefone ? { number: body.endereco.telefone } : undefined,
        identification: body.endereco?.cpf
          ? { type: "CPF", number: body.endereco.cpf.replace(/\D/g, "") }
          : undefined,
      },
      external_reference: pedidoId ?? undefined,
      back_urls: {
        success: `${baseUrl}/pedido/sucesso`,
        failure: `${baseUrl}/pedido/erro`,
        pending: `${baseUrl}/pedido/pendente`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/webhooks/mercadopago`,
    }),
  });

  if (!preferenceResp.ok) {
    const erro = await preferenceResp.text();
    return NextResponse.json({ error: "Falha ao criar preferência", detalhe: erro }, { status: 502 });
  }

  const preference = await preferenceResp.json();

  if (pedidoId) {
    try {
      const supabase = getSupabaseServerClient();
      await supabase
        .from("pedidos")
        .update({ mercadopago_preference_id: preference.id })
        .eq("id", pedidoId);
    } catch (err) {
      console.error("Falha ao atualizar preference_id no pedido:", err);
    }
  }

  return NextResponse.json({
    init_point: preference.init_point,
    preference_id: preference.id,
  });
}
