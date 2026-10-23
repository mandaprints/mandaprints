"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { MockupParede, FotoCompleta } from "./WallMockup";

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductCard({ produto }: { produto: Product }) {
  const [mostrarMockup, setMostrarMockup] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setMostrarMockup((m) => !m), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <Link
      href={`/produtos/${produto.slug}`}
      className="group block overflow-hidden rounded-lg border border-neutral-100 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            mostrarMockup ? "opacity-100" : "opacity-0"
          }`}
        >
          <MockupParede src={produto.imagens[0]} alt={produto.nome} />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            mostrarMockup ? "opacity-0" : "opacity-100"
          }`}
        >
          <FotoCompleta src={produto.imagens[0]} alt={produto.nome} />
        </div>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm text-neutral-800">{produto.nome}</p>
        <p className="mt-2 text-xs text-neutral-500">a partir de:</p>
        <p className="text-base font-semibold text-neutral-900">{formatarPreco(produto.precoBase)}</p>
      </div>
    </Link>
  );
}
