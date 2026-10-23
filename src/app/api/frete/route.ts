import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/products";

interface ItemFrete {
  produtoSlug: string;
  tamanhoId?: string;
  servicoId?: string;
  quantidade: number;
  preco: number;
}

// Embalagem padrão quando o item não tem tamanho/serviço identificável
// (ex.: carrinho salvo no navegador antes dos IDs existirem).
const EMBALAGEM_PADRAO = { height: 10, width: 60, length: 90, weight: 3 };

// Peso/medidas vêm do catálogo no servidor (PDF de pesos e medidas do
// cliente), não do que o navegador manda.
function volumesDoCarrinho(itens: ItemFrete[]) {
  return itens.map((item, i) => {
    const produto = getProductBySlug(item.produtoSlug);
    const servico = produto?.variantes.servicos.find((s) => s.id === item.servicoId);
    const log = item.tamanhoId ? servico?.logistica[item.tamanhoId] : undefined;
    const dim = log
      ? {
          height: log.alturaCm,
          width: log.larguraCm,
          length: log.comprimentoCm,
          weight: log.pesoKg,
        }
      : EMBALAGEM_PADRAO;
    return {
      id: String(i + 1),
      ...dim,
      insurance_value: item.preco,
      quantity: Math.max(1, item.quantidade),
    };
  });
}

/**
 * Cota o frete via API do Melhor Envio.
 *
 * Requer as variáveis de ambiente:
 * - MELHOR_ENVIO_TOKEN: token de integração gerado em
 *   melhorenvio.com.br > Configurações > Tokens de Integração.
 * - MELHOR_ENVIO_CEP_ORIGEM: CEP de onde o fornecedor despacha os produtos.
 *
 * Enquanto essas variáveis não estiverem configuradas, retorna uma cotação
 * simulada para permitir o desenvolvimento e testes do front-end.
 */
export async function POST(req: NextRequest) {
  const { cepDestino, itens } = (await req.json()) as {
    cepDestino: string;
    itens?: ItemFrete[];
  };
  const token = process.env.MELHOR_ENVIO_TOKEN;
  const cepOrigem = process.env.MELHOR_ENVIO_CEP_ORIGEM;

  if (!token || !cepOrigem) {
    // Cotação simulada — remover assim que as credenciais reais forem configuradas.
    return NextResponse.json({
      simulado: true,
      opcoes: [
        { nome: "Transportadora (simulado)", preco: 39.9, prazo: "5 a 8 dias úteis" },
      ],
    });
  }

  const resp = await fetch("https://www.melhorenvio.com.br/api/v2/me/shipment/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      from: { postal_code: cepOrigem },
      to: { postal_code: cepDestino.replace(/\D/g, "") },
      products: itens?.length
        ? volumesDoCarrinho(itens)
        : [{ id: "1", ...EMBALAGEM_PADRAO, insurance_value: 0, quantity: 1 }],
    }),
  });

  if (!resp.ok) {
    const erro = await resp.text();
    return NextResponse.json({ error: "Falha ao cotar frete", detalhe: erro }, { status: 502 });
  }

  const cotacoes = await resp.json();

  const opcoes = (cotacoes as Array<{ name: string; price: string; delivery_time: number }>)
    .filter((c) => c.price)
    .map((c) => ({
      nome: c.name,
      preco: Number(c.price),
      prazo: `${c.delivery_time} dias úteis`,
    }))
    // Mais barata primeiro — o carrinho usa a primeira opção como padrão.
    .sort((a, b) => a.preco - b.preco);

  return NextResponse.json({ simulado: false, opcoes });
}
