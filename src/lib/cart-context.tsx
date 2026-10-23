"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface CartItem {
  id: string; // slug + variantes combinadas
  produtoSlug: string;
  // IDs usados no cálculo de frete (servidor busca peso/medidas no catálogo).
  // Opcionais: carrinhos salvos no navegador antes deste campo existir não têm.
  tamanhoId?: string;
  servicoId?: string;
  nome: string;
  imagem: string;
  tamanho: string;
  moldura: string;
  acabamento: string;
  preco: number;
  quantidade: number;
}

interface CartContextValue {
  itens: CartItem[];
  adicionar: (item: Omit<CartItem, "quantidade">, quantidade?: number) => void;
  remover: (id: string) => void;
  atualizarQuantidade: (id: string, quantidade: number) => void;
  limpar: () => void;
  total: number;
  quantidadeTotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "fl-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<CartItem[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItens(JSON.parse(raw));
    } catch {
      // ignora
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
    } catch {
      // ignora
    }
  }, [itens, carregado]);

  function adicionar(item: Omit<CartItem, "quantidade">, quantidade = 1) {
    setItens((atual) => {
      const existente = atual.find((i) => i.id === item.id);
      if (existente) {
        return atual.map((i) =>
          i.id === item.id ? { ...i, quantidade: i.quantidade + quantidade } : i
        );
      }
      return [...atual, { ...item, quantidade }];
    });
  }

  function remover(id: string) {
    setItens((atual) => atual.filter((i) => i.id !== id));
  }

  function atualizarQuantidade(id: string, quantidade: number) {
    setItens((atual) =>
      atual.map((i) => (i.id === id ? { ...i, quantidade: Math.max(1, quantidade) } : i))
    );
  }

  function limpar() {
    setItens([]);
  }

  const total = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
  const quantidadeTotal = itens.reduce((acc, i) => acc + i.quantidade, 0);

  return (
    <CartContext.Provider
      value={{ itens, adicionar, remover, atualizarQuantidade, limpar, total, quantidadeTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
