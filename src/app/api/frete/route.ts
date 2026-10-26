import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/products";

interface ItemFrete {
  produtoSlug: string;
  tamanhoId?: string;
  servicoId?: string;
  quantidade: number;
  preco: number;
}

// Taxa mecanizada da matriz Jadlog: não vem no valor devolvido pela API e
// precisa ser somada manualmente ao frete (combustível, manuseio, GRIS, ad
// valorem e seguro) — instrução da própria Jadlog/FCB.
const TAXA_MATRIZ = 7;

// Modalidade negociada no contrato: 3 = .Package (a mais barata das que o
// contrato da FCB aceita nos testes: .Package, Rodoviário, Econômico, Expresso...).
const MODALIDADE = 3;

// Peso usado quando o item não tem tamanho/serviço identificável (carrinho
// salvo no navegador antes dos IDs existirem).
const PESO_PADRAO_KG = 3;

// Peso total (com embalagem) vem do catálogo no servidor, não do navegador.
function pesoTotalKg(itens: ItemFrete[]) {
  const total = itens.reduce((acc, item) => {
    const produto = getProductBySlug(item.produtoSlug);
    const servico = produto?.variantes.servicos.find((s) => s.id === item.servicoId);
    const peso = (item.tamanhoId && servico?.logistica[item.tamanhoId]?.pesoKg) || PESO_PADRAO_KG;
    return acc + peso * Math.max(1, item.quantidade);
  }, 0);
  return Math.round(total * 100) / 100;
}

/**
 * Cota o frete via API da Jadlog (franquia FCB) — Simulador de Frete.
 *
 * Variáveis de ambiente:
 * - JADLOG_TOKEN: token da API (vai no header "Authorization: Bearer <token>").
 * - JADLOG_CNPJ: CNPJ do tomador (campo "Usuário" dos dados de acesso).
 * - FRETE_CEP_ORIGEM: CEP de onde o fornecedor despacha os quadros.
 *
 * Enquanto não estiverem configuradas, devolve uma cotação simulada para
 * permitir testes do front-end.
 */
export async function POST(req: NextRequest) {
  const { cepDestino, itens } = (await req.json()) as {
    cepDestino: string;
    itens?: ItemFrete[];
  };
  const token = process.env.JADLOG_TOKEN;
  const cnpj = process.env.JADLOG_CNPJ;
  const cepOrigem = process.env.FRETE_CEP_ORIGEM;

  if (!token || !cnpj || !cepOrigem) {
    return NextResponse.json({
      simulado: true,
      opcoes: [{ nome: "Transportadora (simulado)", preco: 39.9, prazo: "5 a 8 dias úteis" }],
    });
  }

  const resp = await fetch("https://www.jadlog.com.br/embarcador/api/frete/valor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      frete: [
        {
          cepori: cepOrigem.replace(/\D/g, ""),
          cepdes: cepDestino.replace(/\D/g, ""),
          frap: "N",
          peso: itens?.length ? pesoTotalKg(itens) : PESO_PADRAO_KG,
          cnpj: cnpj.replace(/\D/g, ""),
          conta: null,
          contrato: null,
          modalidade: MODALIDADE,
          tpentrega: "D",
          tpseguro: "N",
          vldeclarado: itens?.reduce((acc, i) => acc + i.preco * Math.max(1, i.quantidade), 0) ?? 0,
          vlcoleta: 0,
        },
      ],
    }),
  });

  const dados = await resp.json().catch(() => null);
  const cotacao = dados?.frete?.[0];

  if (!resp.ok || dados?.error || typeof cotacao?.vltotal !== "number") {
    return NextResponse.json(
      { error: "Falha ao cotar frete", detalhe: dados?.error ?? resp.status },
      { status: 502 }
    );
  }

  return NextResponse.json({
    simulado: false,
    opcoes: [
      {
        nome: "Jadlog .Package",
        preco: Math.round((cotacao.vltotal + TAXA_MATRIZ) * 100) / 100,
        prazo: `${cotacao.prazo} dias úteis`,
      },
    ],
  });
}
