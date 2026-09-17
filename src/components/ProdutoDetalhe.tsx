"use client";

import { useMemo, useState } from "react";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import ImagemComZoom from "./ImagemComZoom";
import ScrollReveal from "./ScrollReveal";

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProdutoDetalhe({ produto }: { produto: Product }) {
  const router = useRouter();
  const { adicionar } = useCart();

  const [imagemAtiva, setImagemAtiva] = useState(0);
  const [visualizacao, setVisualizacao] = useState<"quadro" | "foto">("quadro");
  const [servicoId, setServicoId] = useState(produto.variantes.servicos[0].id);
  const servicoAtual = produto.variantes.servicos.find((s) => s.id === servicoId)!;
  const [tamanhoId, setTamanhoId] = useState(
    produto.variantes.tamanhos.find((t) => servicoAtual.precos[t.id] != null)!.id
  );
  const [molduraId, setMolduraId] = useState(servicoAtual.molduras[0].id);
  const [adicionado, setAdicionado] = useState(false);

  const preco = servicoAtual.precos[tamanhoId] ?? 0;
  const precoPix = preco * 0.95;

  const tamanho = produto.variantes.tamanhos.find((v) => v.id === tamanhoId)!;
  const moldura = servicoAtual.molduras.find((v) => v.id === molduraId) ?? servicoAtual.molduras[0];

  function selecionarServico(id: string) {
    const novoServico = produto.variantes.servicos.find((s) => s.id === id)!;
    setServicoId(id);
    setMolduraId(novoServico.molduras[0].id);
    // Se o tamanho atual não existir nesse serviço, cai pro menor disponível.
    if (novoServico.precos[tamanhoId] == null) {
      const primeiroTamanho = produto.variantes.tamanhos.find(
        (t) => novoServico.precos[t.id] != null
      );
      if (primeiroTamanho) setTamanhoId(primeiroTamanho.id);
    }
  }

  function selecionarTamanho(id: string) {
    setTamanhoId(id);
    // Se o serviço atual não existir nesse tamanho, troca pro primeiro
    // serviço que tiver essa combinação.
    if (servicoAtual.precos[id] == null) {
      const alternativo = produto.variantes.servicos.find((s) => s.precos[id] != null);
      if (alternativo) {
        setServicoId(alternativo.id);
        setMolduraId(alternativo.molduras[0].id);
      }
    }
  }

  function handleAdicionarAoCarrinho() {
    adicionar({
      id: `${produto.slug}-${tamanhoId}-${servicoId}-${molduraId}`,
      produtoSlug: produto.slug,
      nome: produto.nome,
      imagem: produto.imagens[0],
      tamanho: tamanho.label,
      moldura: moldura.label,
      acabamento: servicoAtual.nome,
      preco,
    });
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  }

  function handleComprarAgora() {
    handleAdicionarAoCarrinho();
    router.push("/carrinho");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <nav className="mb-6 text-sm text-neutral-500">
        Início &gt; {produto.colecao} &gt; <span className="text-neutral-800">{produto.nome}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Galeria */}
        <ScrollReveal>
          {/* Alternar entre foto do quadro na parede e a foto completa */}
          <div className="mb-3 inline-flex rounded-full border border-neutral-300 p-1 text-sm">
            <button
              onClick={() => setVisualizacao("quadro")}
              className={`rounded-full px-4 py-1.5 font-medium transition ${
                visualizacao === "quadro"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Quadro na parede
            </button>
            <button
              onClick={() => setVisualizacao("foto")}
              className={`rounded-full px-4 py-1.5 font-medium transition ${
                visualizacao === "foto"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Foto completa
            </button>
          </div>

          <ImagemComZoom
            key={`${imagemAtiva}-${visualizacao}`}
            src={produto.imagens[imagemAtiva]}
            alt={produto.nome}
            visualizacao={visualizacao}
          />

          <div className="mt-3 flex gap-3">
            {produto.imagens.map((img, i) => (
              <button
                key={img}
                onClick={() => setImagemAtiva(i)}
                className={`h-16 w-16 overflow-hidden rounded border ${
                  i === imagemAtiva ? "border-neutral-900" : "border-neutral-200"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${produto.nome} ${i + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100%' height='100%' fill='%23e5e5e5'/></svg>";
                  }}
                />
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Info + variantes */}
        <ScrollReveal atraso={150}>
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            REF: {produto.referencia}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">{produto.nome}</h1>

          {/* Serviço / tipo de impressão */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-neutral-900">Tipo de impressão</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {produto.variantes.servicos.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => selecionarServico(opt.id)}
                  className={`rounded border px-3 py-2 text-sm ${
                    opt.id === servicoId
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                  }`}
                >
                  {opt.nome}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-500">Material: {servicoAtual.material}</p>
          </div>

          {/* Tamanho (desabilita os que não existem para o serviço escolhido) */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-neutral-900">Tamanho</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {produto.variantes.tamanhos.map((opt) => {
                const disponivel = servicoAtual.precos[opt.id] != null;
                return (
                  <button
                    key={opt.id}
                    onClick={() => selecionarTamanho(opt.id)}
                    className={`rounded border px-3 py-2 text-sm ${
                      opt.id === tamanhoId
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : disponivel
                          ? "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                          : "border-neutral-200 text-neutral-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cor da moldura — só aparece quando há mais de uma opção (ex.: Canvas puro não tem moldura) */}
          {servicoAtual.molduras.length > 1 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-neutral-900">Cor da Moldura</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {servicoAtual.molduras.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setMolduraId(opt.id)}
                    className={`rounded border px-3 py-2 text-sm ${
                      opt.id === molduraId
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preço */}
          <div className="mt-8 border-t border-neutral-200 pt-6">
            <p className="text-3xl font-bold text-neutral-900">{formatarPreco(preco)}</p>
            <p className="mt-1 text-sm text-neutral-600">
              12x de {formatarPreco(preco / 12)} ou {formatarPreco(precoPix)} à vista no PIX
              (5% de desconto)
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAdicionarAoCarrinho}
              className="flex-1 rounded-full border border-neutral-900 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
            >
              {adicionado ? "Adicionado ✓" : "Adicionar ao carrinho"}
            </button>
            <button
              onClick={handleComprarAgora}
              className="flex-1 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Comprar agora
            </button>
          </div>

          <p className="mt-8 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
            {produto.descricao}
          </p>
        </ScrollReveal>
      </div>
    </div>
  );
}
