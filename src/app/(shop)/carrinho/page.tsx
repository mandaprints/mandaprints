"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { EnderecoEntrega } from "@/lib/types";

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ENDERECO_VAZIO: EnderecoEntrega = {
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
};

export default function CarrinhoPage() {
  const { itens, remover, atualizarQuantidade, total } = useCart();
  const [endereco, setEndereco] = useState<EnderecoEntrega>(ENDERECO_VAZIO);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [frete, setFrete] = useState<{ nome: string; preco: number; prazo: string } | null>(null);
  const [carregandoFrete, setCarregandoFrete] = useState(false);
  const [erroFrete, setErroFrete] = useState<string | null>(null);
  const [finalizando, setFinalizando] = useState(false);

  function atualizarCampo<K extends keyof EnderecoEntrega>(campo: K, valor: string) {
    setEndereco((atual) => ({ ...atual, [campo]: valor }));
    if (campo === "cep") {
      setFrete(null);
      setErroFrete(null);
    }
  }

  async function buscarCep(cepDigitado: string) {
    const cepLimpo = cepDigitado.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;
    setBuscandoCep(true);
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await resp.json();
      if (!data.erro) {
        setEndereco((atual) => ({
          ...atual,
          rua: data.logradouro || atual.rua,
          bairro: data.bairro || atual.bairro,
          cidade: data.localidade || atual.cidade,
          uf: data.uf || atual.uf,
        }));
      }
      await calcularFrete(cepLimpo);
    } catch {
      // ViaCEP fora do ar — cliente ainda pode preencher manualmente.
    } finally {
      setBuscandoCep(false);
    }
  }

  const ehPedidoDeTeste = itens.some((item) => item.produtoSlug === "teste-checkout");

  async function calcularFrete(cepLimpo: string) {
    if (ehPedidoDeTeste) {
      // Produto interno de teste — frete zerado para não gerar custo.
      setFrete({ nome: "Grátis (pedido de teste)", preco: 0, prazo: "-" });
      return;
    }
    setCarregandoFrete(true);
    setErroFrete(null);
    try {
      const resp = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cepDestino: cepLimpo,
          itens: itens.map((i) => ({
            produtoSlug: i.produtoSlug,
            tamanhoId: i.tamanhoId,
            servicoId: i.servicoId,
            quantidade: i.quantidade,
            preco: i.preco,
          })),
        }),
      });
      const data = await resp.json();
      if (data.opcoes?.[0]) {
        setFrete(data.opcoes[0]);
      } else {
        setErroFrete("Não foi possível calcular o frete para esse CEP.");
      }
    } catch {
      setErroFrete("Não foi possível calcular o frete para esse CEP.");
    } finally {
      setCarregandoFrete(false);
    }
  }

  const enderecoCompleto =
    endereco.nome.trim() &&
    REGEX_EMAIL.test(endereco.email.trim()) &&
    endereco.cpf.replace(/\D/g, "").length === 11 &&
    endereco.telefone.trim() &&
    endereco.cep.replace(/\D/g, "").length === 8 &&
    endereco.rua.trim() &&
    endereco.numero.trim() &&
    endereco.bairro.trim() &&
    endereco.cidade.trim() &&
    endereco.uf.trim();

  const podeFinalizar = Boolean(enderecoCompleto && frete && !finalizando);

  async function finalizarCompra() {
    if (!podeFinalizar) return;
    setFinalizando(true);
    try {
      const resp = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itens, frete, endereco }),
      });
      const data = await resp.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } finally {
      setFinalizando(false);
    }
  }

  if (itens.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Seu carrinho está vazio</h1>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
        >
          Ver coleções
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <h1 className="text-2xl font-bold text-neutral-900">Meu Carrinho</h1>

      <div className="mt-6 divide-y divide-neutral-200">
        {itens.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imagem}
              alt={item.nome}
              className="h-20 w-20 rounded object-cover bg-neutral-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100%' height='100%' fill='%23e5e5e5'/></svg>";
              }}
            />
            <div className="flex-1">
              <p className="font-medium text-neutral-900">{item.nome}</p>
              <p className="text-sm text-neutral-500">
                {item.tamanho} · {item.moldura} · {item.acabamento}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantidade}
                  onChange={(e) => atualizarQuantidade(item.id, Number(e.target.value))}
                  className="w-16 rounded border border-neutral-300 px-2 py-1 text-sm"
                />
                <button
                  onClick={() => remover(item.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
            <p className="font-semibold text-neutral-900">
              {formatarPreco(item.preco * item.quantidade)}
            </p>
          </div>
        ))}
      </div>

      {/* Endereço de entrega */}
      <div className="mt-8 rounded-lg border border-neutral-200 p-4">
        <h3 className="text-sm font-semibold text-neutral-900">Endereço de entrega</h3>
        <p className="mt-1 text-xs text-neutral-500">
          Seu pedido é produzido e enviado diretamente pelo fornecedor — preencha o endereço
          completo para calcularmos o frete e garantirmos a entrega correta.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Nome completo"
            value={endereco.nome}
            onChange={(e) => atualizarCampo("nome", e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={endereco.email}
            onChange={(e) => atualizarCampo("email", e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            type="tel"
            placeholder="Telefone / WhatsApp"
            value={endereco.telefone}
            onChange={(e) => atualizarCampo("telefone", e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="CPF"
            value={endereco.cpf}
            onChange={(e) => atualizarCampo("cpf", e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <div className="relative">
            <input
              type="text"
              placeholder="CEP"
              value={endereco.cep}
              onChange={(e) => atualizarCampo("cep", e.target.value)}
              onBlur={(e) => buscarCep(e.target.value)}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
            {buscandoCep && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                buscando...
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="Rua"
            value={endereco.rua}
            onChange={(e) => atualizarCampo("rua", e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            type="text"
            placeholder="Número"
            value={endereco.numero}
            onChange={(e) => atualizarCampo("numero", e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Complemento (opcional)"
            value={endereco.complemento}
            onChange={(e) => atualizarCampo("complemento", e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Bairro"
            value={endereco.bairro}
            onChange={(e) => atualizarCampo("bairro", e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Cidade"
            value={endereco.cidade}
            onChange={(e) => atualizarCampo("cidade", e.target.value)}
            className="rounded border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="UF"
            maxLength={2}
            value={endereco.uf}
            onChange={(e) => atualizarCampo("uf", e.target.value.toUpperCase())}
            className="rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        {carregandoFrete && (
          <p className="mt-3 text-sm text-neutral-500">Calculando frete...</p>
        )}
        {frete && (
          <p className="mt-3 text-sm text-neutral-700">
            Frete: {frete.nome} — {formatarPreco(frete.preco)} · prazo estimado {frete.prazo}
          </p>
        )}
        {erroFrete && <p className="mt-3 text-sm text-red-600">{erroFrete}</p>}
      </div>

      {/* Resumo */}
      <div className="mt-8 flex flex-col items-end gap-2">
        <p className="text-sm text-neutral-600">Subtotal: {formatarPreco(total)}</p>
        {frete && <p className="text-sm text-neutral-600">Frete: {formatarPreco(frete.preco)}</p>}
        <p className="text-xl font-bold text-neutral-900">
          Total: {formatarPreco(total + (frete?.preco ?? 0))}
        </p>
        <button
          onClick={finalizarCompra}
          disabled={!podeFinalizar}
          className="mt-2 rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {finalizando ? "Redirecionando..." : "Finalizar Compra"}
        </button>
        {!enderecoCompleto && (
          <p className="text-xs text-neutral-400">Preencha o endereço de entrega para continuar.</p>
        )}
      </div>
    </div>
  );
}
