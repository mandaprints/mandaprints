export interface VariantOption {
  id: string;
  label: string;
  priceDelta?: number; // acréscimo/desconto sobre o preço base
}

// Cor/estilo de moldura disponível para um serviço específico (ex.: "Moldura
// 4 cm — Preta lisa"). Não tem impacto no preço — é so estética.
export interface OpcaoMoldura {
  id: string;
  label: string;
}

// Dados de expedição de um quadro já embalado (PDF "Cálculo de pesos e
// medidas de quadros" do cliente).
export interface LogisticaEmbalagem {
  pesoKg: number; // peso total: quadro + embalagem
  comprimentoCm: number;
  larguraCm: number;
  // O PDF só informa 2 medidas (ex.: 42x52). A espessura NÃO veio do
  // cliente — é estimada por tipo de embalagem (ver products.ts).
  alturaCm: number;
  valorEmbalagem: number; // custo da embalagem em reais (informativo)
}

// Um "serviço" é uma combinação real do catálogo do fornecedor (ex.:
// "Laminado Premium", "Vidro Fosco", "Canvas + Moldura Negativa"). Cada
// serviço tem seu próprio preço por tamanho — não é um preço base + soma de
// adicionais, porque a tabela real não escala assim.
export interface OpcaoServico {
  id: string;
  nome: string;
  acabamento: string; // "Laminado" | "Vidro brilho/liso" | "Vidro fosco" | "Sem vidro"
  material: string; // "Papel fotográfico" | "Canvas"
  // tamanhoId -> preço em reais. Um serviço pode não estar disponível em
  // todos os tamanhos (ex.: Laminado só vai até 60x90).
  precos: Record<string, number>;
  // tamanhoId -> dados de expedição (mesmas chaves de `precos`).
  logistica: Record<string, LogisticaEmbalagem>;
  // Opções de cor/estilo de moldura aplicáveis a este serviço. Sempre tem
  // pelo menos uma entrada ("Sem moldura" para os que não levam moldura).
  molduras: OpcaoMoldura[];
}

export interface ProductVariants {
  tamanhos: VariantOption[];
  servicos: OpcaoServico[];
}

export interface Product {
  slug: string;
  nome: string;
  colecao: string; // "indonesia" | "islandia" | "nyc"
  referencia: string;
  precoBase: number; // em reais
  imagens: string[];
  descricao: string;
  variantes: ProductVariants;
}

export interface Collection {
  slug: string;
  nome: string;
  descricao: string;
  capa: string;
}

export interface EnderecoEntrega {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}
