import { Product, Collection, ProductVariants, OpcaoServico, LogisticaEmbalagem } from "./types";

export const collections: Collection[] = [
  {
    slug: "indonesia",
    nome: "Indonésia",
    descricao: "Paisagens e texturas inspiradas nas ilhas e templos da Indonésia.",
    capa: "/images/indonesia/DJI_0128.jpg",
  },
  {
    slug: "islandia",
    nome: "Islândia",
    descricao: "Fiordes, geleiras e céus nórdicos em fotografia de autor.",
    capa: "/images/islandia/FLP01977.jpg",
  },
  {
    slug: "nyc",
    nome: "Nova York",
    descricao: "O skyline e as ruas de Nova York em preto e branco e cor.",
    capa: "/images/nyc/FLP04607.jpg",
  },
];

// Tabela real de preços passada pelo cliente (Planilha_Loja_de_Quadros_Filipe_Lara.xlsx,
// aba "Catálogo de Quadros"). ATENÇÃO: ele avisou por WhatsApp que esses valores
// são RASCUNHO/custo — ainda vai mandar o valor de venda final. Trocar assim que
// ele confirmar.
const TAMANHOS = [
  { id: "30x40", label: "30x40 cm" },
  { id: "40x60", label: "40x60 cm" },
  { id: "60x90", label: "60x90 cm" },
  { id: "90x120", label: "90x120 cm" },
  { id: "120x160", label: "120x160 cm" },
  { id: "150x200", label: "150x200 cm" },
];

// Opções de cor/estilo de moldura (aba "Molduras"). O próprio cliente marcou
// como "A CONFIRMAR" quais combinações valem para cada serviço — o mapeamento
// abaixo (Laminado -> moldura 4cm, Vidro -> moldura 2cm caixinha, Canvas com
// moldura -> moldura negativa) é a leitura mais razoável da planilha, mas
// ainda não foi validado por ele.
const MOLDURA_4CM = [
  { id: "4cm-preta", label: "Moldura 4 cm — Preta lisa" },
  { id: "4cm-branca", label: "Moldura 4 cm — Branca lisa" },
];
const MOLDURA_2CM_CAIXINHA = [
  { id: "2cm-preta", label: "Moldura 2 cm caixinha — Preta" },
  { id: "2cm-branca", label: "Moldura 2 cm caixinha — Branca" },
];
const MOLDURA_NEGATIVA = [
  { id: "negativa-preta", label: "Moldura negativa — Preta" },
  { id: "negativa-branca", label: "Moldura negativa — Branca" },
  { id: "negativa-madeira", label: "Moldura negativa — Madeira" },
];
const SEM_MOLDURA = [{ id: "sem-moldura", label: "Sem moldura" }];

// Dados de expedição do PDF "FILIPE LARA CÁLCULO DE PESOS E MEDIDAS DE QUADROS".
// O PDF informa só 2 medidas da caixa (ex.: 42x52) e o peso total já com
// embalagem; a espessura NÃO foi informada. Estimativa por tipo de embalagem
// (bolha+papelão = quadro fino; caixa de madeira = vidro com cantoneiras) —
// confirmar com o cliente, porque muda o peso cubado cobrado pela transportadora.
type TipoEmbalagem = "bolha" | "madeira";
const ESPESSURA_ESTIMADA_CM: Record<TipoEmbalagem, number> = { bolha: 6, madeira: 12 };

function emb(
  tipo: TipoEmbalagem,
  medidaCm: [number, number],
  pesoKg: number,
  valorEmbalagem: number
): LogisticaEmbalagem {
  return {
    pesoKg,
    comprimentoCm: Math.max(...medidaCm),
    larguraCm: Math.min(...medidaCm),
    alturaCm: ESPESSURA_ESTIMADA_CM[tipo],
    valorEmbalagem,
  };
}

const SERVICOS: OpcaoServico[] = [
  {
    id: "laminado-entrada",
    nome: "Laminado Entrada",
    acabamento: "Laminado",
    material: "Papel fotográfico",
    precos: { "30x40": 63, "40x60": 81, "60x90": 137 },
    logistica: {
      "30x40": emb("bolha", [42, 52], 1, 3.5),
      "40x60": emb("bolha", [52, 72], 2, 7),
      "60x90": emb("bolha", [72, 102], 5, 20),
    },
    molduras: MOLDURA_4CM,
  },
  {
    id: "laminado-premium",
    nome: "Laminado Premium",
    acabamento: "Laminado",
    material: "Papel fotográfico",
    precos: { "30x40": 79, "40x60": 114, "60x90": 202 },
    logistica: {
      "30x40": emb("bolha", [42, 52], 1, 3.5),
      "40x60": emb("bolha", [52, 72], 2, 7),
      "60x90": emb("bolha", [72, 102], 5, 20),
    },
    molduras: MOLDURA_4CM,
  },
  {
    id: "vidro-liso",
    nome: "Vidro Liso",
    acabamento: "Vidro brilho/liso",
    material: "Papel fotográfico",
    precos: { "30x40": 87, "40x60": 127, "60x90": 237, "90x120": 435, "120x160": 609 },
    logistica: {
      "30x40": emb("bolha", [42, 52], 1.45, 5),
      "40x60": emb("madeira", [52, 72], 5.7, 30.85),
      "60x90": emb("madeira", [78, 110], 11.1, 54),
      "90x120": emb("madeira", [108, 138], 22.2, 87.68),
      "120x160": emb("madeira", [138, 178], 39.8, 118.1),
    },
    molduras: MOLDURA_2CM_CAIXINHA,
  },
  {
    id: "vidro-fosco",
    nome: "Vidro Fosco",
    acabamento: "Vidro fosco",
    material: "Papel fotográfico",
    precos: { "30x40": 109, "40x60": 159, "60x90": 297, "90x120": 565, "120x160": 780 },
    logistica: {
      "30x40": emb("bolha", [42, 52], 1.45, 5),
      "40x60": emb("madeira", [52, 72], 5.5, 30.85),
      "60x90": emb("madeira", [78, 110], 11.1, 54),
      "90x120": emb("madeira", [108, 138], 22.2, 87.68),
      "120x160": emb("madeira", [138, 178], 39.8, 118.1),
    },
    molduras: MOLDURA_2CM_CAIXINHA,
  },
  {
    id: "canvas",
    nome: "Canvas",
    acabamento: "Sem vidro",
    material: "Canvas",
    precos: {
      "30x40": 55,
      "40x60": 74,
      "60x90": 95,
      "90x120": 160,
      "120x160": 224,
      "150x200": 336,
    },
    logistica: {
      "30x40": emb("bolha", [36, 46], 1, 3.5),
      "40x60": emb("bolha", [46, 66], 2, 10),
      "60x90": emb("bolha", [66, 96], 5, 20),
      "90x120": emb("bolha", [96, 126], 10, 40),
      "120x160": emb("bolha", [126, 166], 18, 48),
      "150x200": emb("bolha", [156, 206], 28, 93),
    },
    molduras: SEM_MOLDURA,
  },
  {
    id: "canvas-moldura-negativa",
    nome: "Canvas + Moldura Negativa",
    acabamento: "Sem vidro",
    material: "Canvas",
    precos: {
      "30x40": 86,
      "40x60": 125,
      "60x90": 180,
      "90x120": 290,
      "120x160": 395,
      "150x200": 540,
    },
    logistica: {
      "30x40": emb("bolha", [42, 52], 1.2, 3.5),
      "40x60": emb("bolha", [52, 72], 2.5, 10),
      "60x90": emb("bolha", [72, 102], 5.5, 20),
      "90x120": emb("bolha", [102, 132], 11, 40),
      "120x160": emb("bolha", [132, 172], 19, 48),
      "150x200": emb("bolha", [168, 218], 30, 93),
    },
    molduras: MOLDURA_NEGATIVA,
  },
];

const variantesPadrao: ProductVariants = {
  tamanhos: TAMANHOS,
  servicos: SERVICOS,
};

// "A partir de": menor preço entre todos os serviços/tamanhos — usado no
// card de listagem.
const precoAPartirDe = Math.min(
  ...SERVICOS.flatMap((s) => Object.values(s.precos))
);

type FotoInfo = { arquivo: string; titulo: string; descricao: string };

function gerarProdutosColecao(colecaoSlug: string, fotos: FotoInfo[]): Product[] {
  return fotos.map((foto, i) => ({
    slug: `${colecaoSlug}-${i + 1}`,
    nome: foto.titulo,
    colecao: colecaoSlug,
    referencia: `FL-${colecaoSlug.slice(0, 3).toUpperCase()}${String(i + 1).padStart(2, "0")}`,
    precoBase: precoAPartirDe,
    imagens: [`/images/${colecaoSlug}/${foto.arquivo}`],
    descricao: foto.descricao,
    variantes: variantesPadrao,
  }));
}

// Título e descrição reais fornecidos pelo cliente (DESCRICAO FOTOS - LOJA QUADROS.docx).
const fotosIndonesia: FotoInfo[] = [
    {
      arquivo: "DJI_0128.jpg",
      titulo: "Areia Negra ao Pé do Vulcão",
      descricao: "Norte da Indonésia, imagem aérea. Um mar de coqueiros avança até encontrar uma faixa de areia preta, formada pela força vulcânica que molda essa região. O contraste entre o verde denso e o solo escuro revela a paisagem única de quem vive na sombra de um vulcão ativo.\n\nCheguei até aqui depois de 4 horas de moto, atravessando Bali inteira de sul a norte e passando por vários vulcões pelo caminho. É um trecho bem diferente do Bali que todo mundo conhece, bem mais isolado, mais cru, longe das multidões do sul. A estrada não é fácil, tem trecho de terra, neblina e curva fechada direto, mas foi assim que consegui ver esse pedaço da ilha que fica fora do roteiro turístico de sempre.",
    },
    {
      arquivo: "DJI_0297.jpg",
      titulo: "Kelingking, a Baía Mais Famosa da Indonésia",
      descricao: "Nusa Penida, Indonésia, vista do alto. Um penhasco recortado se abre em duas pontas sobre o mar, formando uma baía escondida de areia clara e água turquesa. O formato da rocha é o motivo da fama do lugar, muita gente diz que lembra a cabeça e o pescoço de um T-Rex, e é por causa dessa curiosidade que o ponto virou um dos mais fotografados da Indonésia.\n\nVisitei a Indonésia em 2022, e Nusa Penida foi uma das paradas da viagem. Para chegar até aqui, peguei um barco saindo de Bali até a ilha e depois mais 2 horas de moto, debaixo de um sol forte e um clima que mudava a cada trecho da estrada, chegando no fim da tarde. De lá, foi 1 hora de caminhada só para descer a trilha íngreme até a praia, uma descida absurda, degrau atrás de degrau, com as pernas tremendo bem antes de chegar na metade do caminho, até essa praia que está entre as mais perigosas do mundo: arraias pretas circulando na água e ondas fortes que não perdoam. Para voltar, mais 1 hora de subida, com as pernas já pesando e o fôlego batendo a cada curva da trilha. Difícil de chegar, difícil de sair, mas um dos pontos mais icônicos que já vi na Indonésia.",
    },
    {
      arquivo: "DJI_0698.jpg",
      titulo: "Arrozais do Sul de Bali",
      descricao: "Sul da ilha de Bali, visto do alto. Os arrozais se espalham em retalhos verdes que mudam de tom com a luz do dia, cortados por canais de irrigação que parecem desenhados à mão. No meio da plantação, pequenos casebres de madeira servem de abrigo para quem trabalha a terra, os únicos pontos que quebram a repetição geométrica dos campos.\n\nVisitei a Indonésia em 2022, e esse cenário ficou registrado numa passagem pelo interior do sul de Bali, bem longe das praias badaladas. Ali a vida segue outro ritmo: motos cruzam as estradas de terra sem pressa, muita gente sem capacete, indo e voltando do trabalho no campo. São famílias que plantam arroz há gerações, sustentando toda uma comunidade com o que a terra dá. É outro lado de Bali, o do dia a dia real, bem distante do roteiro que a maioria dos turistas segue.",
    },
    {
      arquivo: "FLP00547.jpg",
      titulo: "Kelingking, a Baía Mais Famosa da Indonésia",
      descricao: "Nusa Penida, Indonésia, vista do alto. Um penhasco recortado se abre em duas pontas sobre o mar, formando uma baía escondida de areia clara e água turquesa. O formato da rocha é o motivo da fama do lugar, muita gente diz que lembra a cabeça e o pescoço de um T-Rex, e é por causa dessa curiosidade que o ponto virou um dos mais fotografados da Indonésia.\n\nVisitei a Indonésia em 2022, e Nusa Penida foi uma das paradas da viagem. Para chegar até aqui, peguei um barco saindo de Bali até a ilha e depois mais 2 horas de moto, debaixo de um sol forte e um clima que mudava a cada trecho da estrada, chegando no fim da tarde. De lá, foi 1 hora de caminhada só para descer a trilha íngreme até a praia, uma descida absurda, degrau atrás de degrau, com as pernas tremendo bem antes de chegar na metade do caminho, até essa praia que está entre as mais perigosas do mundo: arraias pretas circulando na água e ondas fortes que não perdoam. Para voltar, mais 1 hora de subida, com as pernas já pesando e o fôlego batendo a cada curva da trilha. Difícil de chegar, difícil de sair, mas um dos pontos mais icônicos que já vi na Indonésia.",
    },
    {
      arquivo: "FLP01088.jpg",
      titulo: "Amanhecer na Costa Vulcânica de Bali",
      descricao: "Norte de Bali, Indonésia. O sol nasce atrás do mar e as palmeiras se curvam como se apontassem o caminho até a água. A luz dourada do início da manhã contrasta com a areia escura da praia, ainda fria da madrugada, numa cena que muda de cor a cada minuto conforme o dia vai começando.\n\nVisitei a Indonésia em 2022, numa das etapas da viagem por Bali. Cheguei até essa praia depois de 4 horas de moto, atravessando a ilha inteira de sul a norte e passando por vários vulcões pelo caminho. É um trecho bem diferente do Bali que todo mundo conhece, bem mais isolado, mais cru, longe das multidões do sul. A estrada não é fácil, tem trecho de terra, neblina e curva fechada direto, mas foi assim que consegui ver esse pedaço da ilha que fica fora do roteiro turístico de sempre.",
    },
    {
      arquivo: "FLP01223.jpg",
      titulo: "Indonésia 6",
      descricao: "Peça da coleção Indonésia, impressa em tecido canvas de alta gramatura. Disponível em diversos tamanhos, molduras e acabamentos.",
    },
    {
      arquivo: "FLP01360.jpg",
      titulo: "Rumah Pohon, a Casa da Árvore de Nusa Penida",
      descricao: "Nusa Penida, Indonésia, bem ao lado da Diamond Beach. O Rumah Pohon, uma casinha de madeira com telhado de palha, fica pendurado na beira do penhasco, ligado por uma escada rústica que desce até uma baía escondida logo abaixo. A vista se abre entre rochas altas e água turquesa, um dos cantos mais fotografados dessa parte da ilha.\n\nVisitei a Indonésia em 2022, e esse ponto fica bem ao lado da Diamond Beach, no mesmo roteiro. É um lugar turístico mesmo, paguei uns 50 reais pra entrar. O engraçado é que, como tinha muita gente querendo foto na escadinha, os vigias locais cronometravam 60 segundos pra cada pessoa lá em cima, uma fila corrida e bem cômica de acompanhar. Como eu não fui ali pra posar de modelo na escada, não precisei pagar nada além da entrada. Mesmo com toda a agitação, a vista compensava cada segundo de espera.",
    },
    {
      arquivo: "FLP01644.jpg",
      titulo: "Indonésia 8",
      descricao: "Peça da coleção Indonésia, impressa em tecido canvas de alta gramatura. Disponível em diversos tamanhos, molduras e acabamentos.",
    },
    {
      arquivo: "FLP02148.jpg",
      titulo: "Taman Sari, o Coração dos Arrozais de Bali",
      descricao: "Taman Sari, Bali, Indonésia. Uma trabalhadora local caminha por entre os arrozais, carregando cestos de palha e usando um chapéu tradicional trançado à mão. Ao fundo, a vegetação densa e as palmeiras marcam o verde intenso que cobre essa região, um dos points mais conhecidos de Bali quando o assunto é plantação de arroz.\n\nVisitei a Indonésia em 2022, e Taman Sari foi uma parada no meio da viagem por Bali. É um lugar bem conhecido por quem passa pela ilha, com trilhas que cortam os arrozais e deixam ver de perto o trabalho dos agricultores locais. Cruzei com essa senhora carregando os cestos, voltando do trabalho no campo debaixo do calor da tarde, uma cena simples que mostra bem o dia a dia de quem vive ali.",
    },
    {
      arquivo: "FLP02946.jpg",
      titulo: "Floresta Sagrada dos Macacos, em Ubud",
      descricao: "Ubud, Bali, Indonésia. Um macaco solta os dentes em cima da cabeça de um antigo elefante de pedra, coberto de musgo pelo tempo, cercado pela vegetação densa e pela luz que filtra entre as árvores. A cena mostra bem o temperamento imprevisível dos moradores dessa floresta sagrada.\n\nVisitei a Indonésia em 2022, e Ubud foi uma das paradas da viagem, com essa floresta praticamente obrigatória no roteiro. Na entrada, recebi um briefing de boas-vindas com as regras: nunca olhar os macacos diretamente nos olhos e, principalmente, nunca abrir a mochila perto deles, porque podiam pular em cima de mim e roubar qualquer coisa. Ganhei um saquinho de amendoim pra ir distribuindo enquanto caminhava, e vi cena de dar medo e rir ao mesmo tempo: grupos de macacos avançando em bando pra cima de turistas, roubando óculos, celular, o que desse. Tem até um ponto famoso lá dentro onde dá pra tirar aquela foto clássica de selfie com o macaco. Assustador e mágico ao mesmo tempo.",
    },
    {
      arquivo: "FLP03035.jpg",
      titulo: "Olhar Curioso na Floresta de Ubud",
      descricao: "Ubud, Bali, Indonésia. Escondido entre galhos e folhas largas, um macaco observa tudo com um olhar atento, quase desconfiado, camuflado pelo verde denso da floresta. Diferente da cena de confronto, aqui o clima é de quietude, o silêncio típico de quem está sendo observado sem perceber.\n\nVisitei a Indonésia em 2022, e Ubud foi uma das paradas da viagem, com essa floresta praticamente obrigatória no roteiro. Na entrada, recebi um briefing de boas-vindas com as regras: nunca olhar os macacos diretamente nos olhos e, principalmente, nunca abrir a mochila perto deles, porque podiam pular em cima de mim e roubar qualquer coisa. Ganhei um saquinho de amendoim pra ir distribuindo enquanto caminhava, e vi cena de dar medo e rir ao mesmo tempo: grupos de macacos avançando em bando pra cima de turistas, roubando óculos, celular, o que desse. Tem até um ponto famoso lá dentro onde dá pra tirar aquela foto clássica de selfie com o macaco. Assustador e mágico ao mesmo tempo.",
    },
];

const fotosIslandia: FotoInfo[] = [
    {
      arquivo: "DJI_20260318105321_0023_D.jpg",
      titulo: "A Ring Road Cortando as Montanhas da Islândia",
      descricao: "Islândia. A estrada avança sozinha por um vale coberto de neve, cercada por montanhas nevadas que se perdem no horizonte sob um céu claro. A cor da terra ainda aparece em alguns trechos, misturando marrom e branco numa paisagem que muda de cara a cada curva.\n\nEm 2026, fui para a Islândia fazer a Ring Road, a estrada que dá a volta completa no país, viajando de motorhome. Foram 11 dias rodando de ponta a ponta, e essa foto foi feita no norte da ilha, já quase fechando o círculo inteiro ao redor do país. Um dos maiores desafios de fotografar de drone por lá é o vento: rajadas fortes o tempo todo, do tipo que derruba o drone do nada e chega a empurrar a própria van pra fora da pista. Cada decolagem virava um cálculo de risco, mas a paisagem compensava cada segundo de tensão segurando o controle.",
    },
    {
      arquivo: "DJI_20260318132544_0048_D.jpg",
      titulo: "Cidade Congelada no Norte da Islândia",
      descricao: "Norte da Islândia, ainda no inverno, em março. Um rio corta a neve em curvas suaves até passar por baixo de uma ponte que liga os dois lados de uma pequena cidade. Casas espalhadas, montanhas cobertas de branco ao fundo e o silêncio típico de um lugar onde a vida segue num ritmo bem mais lento.\n\nEm 2026, fui para a Islândia fazer a Ring Road, a estrada que dá a volta completa no país, viajando de motorhome. Foram 11 dias rodando de ponta a ponta, e essa foto foi feita numa cidade pequena do norte da ilha, ainda no inverno islandês, em março. Um dos maiores desafios de fotografar de drone por lá é o vento: rajadas fortes o tempo todo, do tipo que derruba o drone do nada e chega a empurrar a própria van pra fora da pista. Cada decolagem virava um cálculo de risco, mas a paisagem compensava cada segundo de tensão segurando o controle.",
    },
    {
      arquivo: "FLP00304-Aprimorado-NR.jpg",
      titulo: "Aurora Boreal nas Montanhas Geladas do Leste",
      descricao: "Leste da Islândia. A aurora boreal se espalha pelo céu em ondas verdes que parecem se mover sozinhas, cobrindo as montanhas nevadas logo abaixo. As estrelas ainda aparecem entre as cores, numa cena que parece pintada à mão, mas é só a luz natural fazendo o trabalho.\n\nEm 2026, durante a Ring Road pela Islândia, boa parte das noites foi dedicada a caçar aurora boreal, já que o país é um dos melhores lugares do mundo pra ver o fenômeno. Essa foto foi feita no leste da ilha, numa noite de verdadeira explosão de aurora, quando o céu praticamente não parava de se mexer. Fiquei 3 horas ali parado fotografando, com a temperatura negativa cortando o rosto e as mãos quase travando no gatilho da câmera, mas impossível desviar o olhar da cena.",
    },
    {
      arquivo: "FLP00531-Aprimorado-NR.jpg",
      titulo: "THE AURORA",
      descricao: "Leste da Islândia. A aurora toma quase todo o céu em ondas densas de verde, com toques de roxo se misturando entre as cores, e as estrelas ainda piscando por trás. Na base da imagem, a silhueta escura de alguns arbustos emoldura a cena, marcando o chão gelado do camping onde tudo foi registrado.\n\nEssa foi tirada no leste da Islândia, mas é a minha foto favorita de toda a viagem. Passei horas da madrugada fotografando com o tripé montado em cima do teto do motorhome, enquanto meu corpo ficava quase todo pra dentro do veículo tentando fugir do frio. O ângulo veio dali mesmo, do teto, estacionado no camping, com uns arbustos do lado que acabaram servindo de moldura natural pra composição. Enquanto todo mundo dormia, fiquei sozinho ali no frio cortante e presenciei uma tempestade de aurora boreal que chegou num nível bem alto de Kp, o tipo de cena que não se repete.",
    },
    {
      arquivo: "FLP01977.jpg",
      titulo: "Svartifoss Congelada",
      descricao: "Sul da Islândia, no Parque Nacional Vatnajökull. A queda d'água corta um paredão de colunas de basalto perfeitamente alinhadas, um fenômeno geológico famoso por ter inspirado a arquitetura de uma das igrejas mais conhecidas do país. Na base, o gelo se acumula formando um monte branco, e a neve caindo completa a cena de inverno pesado.\n\nA trilha até a Svartifoss tinha só 1 km e parecia rápida e fácil pelo mapa, mas na prática foi um dos trechos mais difíceis da viagem, nevando e ventando de um jeito insano. Tive que subir pedaços de penhasco e colocar grampos no calçado só pra conseguir chegar perto. Parecia simples, mas foi um perrengue daqueles, e ver os basaltos congelados debaixo de neve valeu cada dificuldade do caminho.",
    },
    {
      arquivo: "FLP02103.jpg",
      titulo: "Casa Isolada",
      descricao: "Sul da Islândia, perto da Svartifoss. Uma casinha vermelha de telhado azul aparece isolada no meio do campo dourado, encostada numa montanha escura marcada por sulcos que parecem cicatrizes na terra. A escala minúscula da construção diante da paisagem mostra como a natureza domina esse canto do país.\n\nEssa foto foi feita numa parada aleatória, na mesma região da Svartifoss, durante a Ring Road pela Islândia em 2026. Rodando de motorhome, é comum passar por casas assim, isoladas no meio do nada, cercadas de quilômetros de paisagem vazia entre uma parada e outra. Dá pra imaginar como deve ser viver tão longe de tudo, com o inverno islandês batendo forte boa parte do ano.",
    },
    {
      arquivo: "FLP02340.jpg",
      titulo: "Jökulsárlón",
      descricao: "Jökulsárlón, no sul da Islândia. Um iceberg de gelo azulado flutua nas águas paradas da lagoa, quase espelhado na superfície, com pedaços menores de gelo espalhados na beira congelada em primeiro plano. É um dos pontos mais fotografados do país, onde blocos inteiros da geleira se soltam e vão parar no mar.\n\nEssa lagoa fica bem perto da Diamond Beach da Islândia, onde os pedaços de gelo que se soltam aqui acabam encalhando depois na areia preta, um dos trechos clássicos da Ring Road. Foi engraçado lembrar que eu já tinha fotografado outra \"Diamond Beach\" antes, na Indonésia, sem imaginar que ia visitar uma segunda com o mesmo nome do outro lado do mundo.",
    },
    {
      arquivo: "FLP03147.jpg",
      titulo: "Vestrahorn",
      descricao: "Vestrahorn, Islândia. Os picos escarpados e nevados se refletem quase perfeitamente na água parada, criando uma simetria quase irreal entre montanha e espelho d'água. É um dos lugares mais fotografados do país, famoso também pelo vento que castiga sem trégua.\n\nVisitei a Islândia em 2026, durante a Ring Road pelo país, e esse foi um dos pontos que mais me marcou pela paisagem e pelo vento sem trégua. Passei a tarde inteira ali, acampado ao lado das montanhas, sentindo cada rajada gelada bater direto no rosto. A região fica pertinho da antiga aldeia viking usada em filmagens, um detalhe que dá ainda mais clima ao cenário. Ficar horas esperando a luz certa valeu cada minuto de vento, com essa vista na frente o tempo passa rápido.",
    },
    {
      arquivo: "FLP03436.jpg",
      titulo: "Pedra Isolada",
      descricao: "Sul da Islândia. Do alto do penhasco, uma pedra isolada se ergue no meio da água, cercada pela força das ondas que quebram contra a costa de areia preta. A vista se estende por uma faixa longa de litoral, sem nenhuma construção à vista, só rocha, mar e vento.\n\nEssa foi uma parada rápida durante um trecho longo e perigoso da estrada, na Ring Road pela Islândia em 2026, sem nem saber direito o nome do lugar. Se eu tivesse descido até a pedra e uma onda mais forte chegasse, ficaria facilmente ilhado ali embaixo. Foi um desses achados aleatórios de estrada, um cenário atípico que só apareceu porque resolvi parar o carro sem plano nenhum.",
    },
    {
      arquivo: "FLP03842.jpg",
      titulo: "Tempestade de Neve",
      descricao: "Norte da Islândia. A estrada corta uma paisagem completamente branca, sem nenhum ponto de referência no horizonte, só neve e mais neve até onde a vista alcança. Uma linha nítida divide o asfalto recém-limpo do restante ainda coberto, marca de uma máquina que tinha acabado de passar por ali.\n\nPassei por essa estrada bem no meio de uma tempestade de neve, um dos trechos mais tensos da Ring Road em 2026. O carro derrapava e escorregava a cada curva, andando bem devagar pra não sair da pista, enquanto o vento jogava neve pra todo lado. Foram horas sem cruzar com nenhum outro carro, num deserto branco que parecia infinito. A máquina de limpeza passou bem na hora certa e deixou essa divisão que aparece na foto, um raro respiro de visibilidade no meio do nevoeiro branco.",
    },
    {
      arquivo: "FLP04319.jpg",
      titulo: "Hallgrímskirkja",
      descricao: "Reykjavik, Islândia. A torre da igreja se ergue no fim da rua, com sua fachada de concreto esculpida em colunas verticais que imitam as formações de basalto espalhadas pelo país. Carros estacionados dos dois lados e a neve fina no chão completam o clima urbano e frio da capital.\n\nEssa foto marcou a passagem pelo centro de Reykjavik durante a Ring Road, em 2026. É o marco mais reconhecível da cidade, visível de quase qualquer ponto por causa da altura da torre, e um contraste e tanto com as paisagens vazias e geladas do resto da viagem pelo interior da ilha.",
    },
    {
      arquivo: "FLP09181.jpg",
      titulo: "Skógafoss",
      descricao: "Sul da Islândia, bem na beira da Ring Road. A queda d'água de quase 60 metros despenca em cortina larga entre dois paredões de rocha, e o sol da manhã cria um arco-íris duplo bem na base, contra o gelo e a neve acumulados nas pedras. É uma das cachoeiras mais famosas do país, e o fenômeno do arco-íris é tão constante ali que virou praticamente uma marca registrada do lugar.\n\nEssa parada fez parte do roteiro da Ring Road pela Islândia em 2026, e o acesso aqui foi bem mais tranquilo do que em outros pontos da viagem: a cachoeira fica a poucos passos da estrada principal, sem trilha difícil ou escalada pra enfrentar. Cheguei numa manhã de sol raro no meio de tantos dias fechados, e o contraste entre a água clara, a neve no chão e o arco-íris formado pela neblina da queda foi um dos momentos mais bonitos de toda a viagem.",
    },
    {
      arquivo: "FLP09395.jpg",
      titulo: "Dyrhólaey",
      descricao: "Sul da Islândia, na famosa praia de Reynisfjara, conhecida pelas ondas extremamente fortes e pelas perigosas correntes do Atlântico. De frente para a praia, a paisagem revela as formações rochosas de Dyrhólaey e os enormes arcos naturais esculpidos pelo mar, contrastando com a areia negra característica da costa vulcânica islandesa.\n\nEssa fotografia foi registrada durante a viagem pela Islândia em 2026, justamente na parada da chamada “praia mais perigosa do mundo”. Estar ali, diante daquele mar e com essa vista das formações vulcânicas ao fundo, foi uma experiência que misturava admiração e respeito pela força da natureza. O cenário parecia tranquilo na fotografia, mas as ondas e o vento deixavam claro por que esse lugar exige tanta atenção de quem o visita.",
    },
    {
      arquivo: "FLP09831.jpg",
      titulo: "Reynisfjara",
      descricao: "Sul da Islândia, na famosa praia de Reynisfjara, conhecida como uma das praias mais perigosas do mundo. A areia negra de origem vulcânica encontra o Atlântico, enquanto enormes paredões de basalto formam a costa e as famosas formações rochosas de Reynisdrangar aparecem ao fundo, isoladas dentro do mar.\n\nEssa fotografia foi registrada durante a viagem pela Islândia em 2026, durante a parada nessa praia. Caminhar por esse trecho da costa foi uma experiência de estar diante de uma paisagem impressionante, mas também de sentir de perto a força do oceano. As ondas chegavam com muita força à areia e, entre os paredões de basalto e as rochas espalhadas pela praia, a cena transmitia exatamente o motivo pelo qual esse lugar é tão conhecido e exige tanto respeito.",
    },
];

const fotosNyc: FotoInfo[] = [
    {
      arquivo: "FLP04607.jpg",
      titulo: "A Cidade Que Nunca Para",
      descricao: "Nova York, Estados Unidos, dezembro de 2022. Uma das cenas mais características da cidade vista entre os grandes edifícios de Manhattan. Ruas movimentadas, táxis, carros atravessando os cruzamentos e pessoas seguindo seus caminhos em meio à arquitetura que parece familiar de tantos filmes e séries. O enquadramento mostra a escala e o ritmo intenso de uma cidade que está sempre em movimento.\n\nEssa foi a minha primeira vez em Nova York. Passei o Natal na cidade, enfrentando o frio e os ventos fortes enquanto caminhava pelas ruas e fotografava aquilo que, até então, eu só tinha visto nas telas. Estar ali pela primeira vez foi deslumbrante. Reconhecer os cenários dos filmes, observar a cidade funcionando em um ritmo próprio e perceber de perto toda aquela movimentação fez essa primeira experiência em Nova York ficar marcada na memória.",
    },
    {
      arquivo: "FLP04641.jpg",
      titulo: "One Way",
      descricao: "Nova York, Estados Unidos. Uma placa “One Way” se destaca entre os prédios de Manhattan, junto aos tradicionais sinais de trânsito da cidade. A luz de inverno ilumina a fachada dos edifícios e a calçada, enquanto ao fundo a rua segue com carros, pedestres e o movimento constante de Nova York. Uma cena simples do cotidiano que representa muito da identidade visual da cidade.\n\nCaminhando pelas ruas de Manhattan, fui fotografando os detalhes que apareciam pelo caminho. Em vez de procurar apenas os grandes pontos turísticos, comecei a prestar atenção nas placas, nos sinais, nas fachadas e nas pequenas cenas que fazem parte da rotina da cidade. Essa fotografia nasceu desse olhar, registrando um detalhe comum que, naquele momento, ganhou outro significado por estar em Nova York.",
    },
    {
      arquivo: "FLP04895.jpg",
      titulo: "A Ponte de Brooklyn",
      descricao: "Nova York, Estados Unidos. O trânsito atravessa a Ponte de Brooklyn em direção ao Brooklyn, cercado pela estrutura metálica característica da ponte e pelo horizonte de Manhattan ao fundo. As placas da estrada, os táxis e a sequência de carros ajudam a mostrar uma das principais ligações entre Manhattan e Brooklyn e o movimento constante da cidade.\n\nDurante a caminhada por Nova York, fui registrando os detalhes que apareciam pelo caminho e a própria cidade acabou se tornando parte da fotografia. Chegar até a ponte e observar aquele fluxo de carros passando entre a estrutura metálica, com os prédios surgindo ao fundo, foi uma daquelas cenas que fazem a cidade parecer exatamente como nos filmes.",
    },
    {
      arquivo: "FLP04910.jpg",
      titulo: "Brooklyn Bridge",
      descricao: "Nova York, Estados Unidos. A Ponte do Brooklyn aparece ao fundo, enquadrada pelo grande fluxo de pessoas que atravessa sua passarela. A estrutura de pedra, os cabos de aço e os prédios de Manhattan ao fundo formam uma das imagens mais reconhecíveis da cidade.\n\nDurante a caminhada pela ponte, fui fotografando o movimento ao redor e tentando registrar não apenas a estrutura, mas também a quantidade de pessoas que passam por ali todos os dias. O frio intenso fazia todo mundo caminhar agasalhado, enquanto a ponte permanecia cheia. No meio daquele fluxo, encontrei esse enquadramento que mostra a ponte sendo vivida pelas pessoas, e não apenas como um ponto turístico.",
    },
    {
      arquivo: "FLP05091.jpg",
      titulo: "Simetria da Ponte",
      descricao: "Nova York, Estados Unidos. Um enquadramento minimalista da Ponte do Brooklyn, destacando os cabos de aço que se cruzam em padrões geométricos sobre a estrutura de pedra. A composição centralizada cria uma forte simetria, enquanto as diferentes texturas da pedra, dos cabos e dos detalhes da construção dão profundidade à imagem.\n\nDurante a caminhada pela ponte, em vez de fotografar apenas a paisagem e o movimento das pessoas, parei para observar a própria estrutura. Os cabos formando linhas perfeitas, a textura das pedras e a repetição dos elementos chamaram minha atenção. Foi uma fotografia feita a partir de um olhar mais atento aos detalhes, transformando uma parte da ponte em uma composição simples e minimalista.",
    },
    {
      arquivo: "FLP05397.jpg",
      titulo: "DUMBO",
      descricao: "Brooklyn, Nova York. Entre as ruas do bairro DUMBO, a Manhattan Bridge aparece enquadrada entre os prédios, criando uma das imagens mais características dessa região. A arquitetura de tijolos, as estruturas metálicas e o movimento das ruas mostram a mistura entre o passado industrial do Brooklyn e a cidade que continua se transformando ao redor.\n\nDepois de atravessar a Brooklyn Bridge caminhando, desci pelas ruas próximas de DUMBO e fui registrando o que encontrava pelo caminho. A ideia era não apenas chegar a um ponto específico, mas deixar a caminhada conduzir a fotografia. De trecho em trecho, fui encontrando novos ângulos, detalhes e cenas da cidade, construindo aos poucos um registro de Nova York através do que aparecia diante da câmera.",
    },
    {
      arquivo: "FLP05426.jpg",
      titulo: "York Street",
      descricao: "Nova York, Estados Unidos. A estação York Street, no Brooklyn, aparece em um dos seus corredores subterrâneos, com os trilhos desaparecendo na escuridão e a faixa amarela conduzindo o olhar até o fundo da plataforma. A iluminação, as colunas metálicas e a sinalização antiga criam uma estética característica do metrô de Nova York, marcada pelo contraste entre a luz e a profundidade dos túneis.\n\nDepois de passar pelas ruas de DUMBO, entrei no metrô e continuei registrando a cidade pelo caminho. O metrô faz parte da experiência de conhecer Nova York tanto quanto seus prédios e pontos turísticos. Enquanto esperava o trem, parei para observar as linhas da plataforma, a sinalização e a perspectiva do túnel. De estação em estação, a fotografia continuava sendo uma forma de descobrir e registrar a cidade.",
    },
    {
      arquivo: "FLP05680.jpg",
      titulo: "Central Park",
      descricao: "Nova York, Estados Unidos. O Central Park aparece em primeiro plano, cercado pelo horizonte de arranha céus de Manhattan. Vista através de uma grade, a paisagem cria um contraste entre o espaço aberto do parque e a enorme concentração de prédios ao fundo, mostrando duas das características mais marcantes de Nova York lado a lado.\n\nCaminhando pelo Central Park, fui observando a cidade por diferentes ângulos e encontrei essa composição ao olhar através da grade. O enquadramento acabou criando uma espécie de moldura para os prédios, como se a própria cidade estivesse sendo observada de dentro do parque. Entre uma caminhada e outra, fui registrando esses pequenos encontros entre natureza, arquitetura e o movimento de Nova York.",
    },
    {
      arquivo: "FLP05783.jpg",
      titulo: "A Casa de Friends",
      descricao: "Greenwich Village, Nova York. Na esquina da Bedford Street com a Grove Street está o edifício usado como fachada externa do apartamento de Monica e Rachel em Friends. O prédio aparece em diversas cenas externas da série e se tornou um dos endereços mais reconhecidos pelos fãs que visitam o bairro. Na mesma esquina também funciona o Little Owl, no térreo do edifício. (Governo da Cidade de Nova Iorque)\n\nCaminhando pelas ruas de Greenwich Village, fui atrás de alguns dos lugares que já faziam parte da minha memória através dos filmes e séries. Quando cheguei nessa esquina, reconheci imediatamente o cenário de Friends. Parei para fotografar o prédio e os detalhes da rua, tentando registrar não apenas o local conhecido pela série, mas também a atmosfera real do bairro onde aquela história foi ambientada. É mais uma daquelas situações em que caminhar pela cidade faz você encontrar, de repente, um cenário que já conhecia antes mesmo de chegar a Nova York.",
    },
    {
      arquivo: "FLP05962.jpg",
      titulo: "GREENWICH VILLAGE",
      descricao: "Greenwich Village, Nova York\n\nCaminhando pelas ruas de Nova York, fui registrando os detalhes que encontrava pelo caminho. Placas, esquinas, fachadas e elementos do cotidiano chamavam minha atenção enquanto explorava a cidade a pé. A fotografia surgiu de um desses momentos, buscando transformar um detalhe simples da rua em um registro da atmosfera e da identidade de Nova York.\n\nExplorar a cidade caminhando, sem um roteiro definido, permite encontrar fotografias em lugares que muitas vezes passam despercebidos. A cada esquina, fui observando a arquitetura, a sinalização e a movimentação ao redor, construindo aos poucos uma coleção de pequenos recortes da vida urbana de Nova York.",
    },
    {
      arquivo: "FLP05972.jpg",
      titulo: "Upper West Side, Nova York",
      descricao: "Upper West Side, Nova York\n\nCaminhando pelas ruas do bairro, fui observando a rotina acontecendo ao meu redor e buscando momentos espontâneos para fotografar. As árvores, os prédios antigos, os carros estacionados e o movimento das pessoas criam uma composição muito característica de Nova York. Nesta imagem, o movimento de uma pessoa atravessando a rua quebra a quietude da cena e traz vida para a fotografia.\n\nExplorar Nova York a pé foi uma forma de descobrir a cidade além dos pontos turísticos. Entre uma rua e outra, fui encontrando pequenas cenas do cotidiano, esperando o momento certo para enquadrar arquitetura, pessoas e movimento em uma mesma fotografia.",
    },
    {
      arquivo: "FLP05994-2.jpg",
      titulo: "Chinatown",
      descricao: "Nova York, Estados Unidos. Caminhando por Chinatown, encontrei essa composição entre os antigos prédios de tijolos, as escadas de emergência e uma grande pintura ocupando parte da fachada. A presença dos trabalhadores realizando a manutenção do prédio acrescenta movimento à cena e mostra um pouco da rotina do bairro.\n\nSeguindo pelas ruas de Chinatown, fui fotografando os detalhes que apareciam pelo caminho, prestando atenção principalmente à arquitetura e às situações espontâneas da cidade. A combinação entre a textura dos tijolos, as estruturas metálicas e a pintura na parede criou uma cena que representa bem os contrastes encontrados durante uma caminhada por Nova York.",
    },
    {
      arquivo: "FLP06006.jpg",
      titulo: "Midtown Manhattan",
      descricao: "Nova York, Estados Unidos. A cidade se estende em uma longa perspectiva entre os prédios, com o trânsito ocupando as ruas e os arranha céus criando uma espécie de corredor urbano. Ao fundo, o Empire State Building aparece entre as construções, enquanto táxis, carros e pessoas dão movimento à cena.\n\nCaminhando pelas ruas de Manhattan, fui buscando enquadramentos que mostrassem a dimensão e a intensidade da cidade. A perspectiva formada pelos prédios conduz o olhar até o horizonte, enquanto o trânsito e os pedestres ajudam a transmitir o ritmo constante de Nova York. Uma cena simples da rua, mas que resume muito da identidade visual da cidade.",
    },
    {
      arquivo: "FLP06053.jpg",
      titulo: "Chinatown, Nova York",
      descricao: "Nova York, Estados Unidos. As ruas de Chinatown aparecem tomadas por lanternas coloridas, placas, fachadas antigas e pelo intenso movimento de pessoas. A luz atravessa a rua e destaca os elementos suspensos, criando profundidade entre os prédios e dando à cena uma atmosfera muito característica do bairro.\n\nCaminhando por Chinatown, fui explorando as ruas e registrando os detalhes que fazem esse pedaço de Nova York parecer tão diferente de outras regiões da cidade. As lanternas espalhadas entre os edifícios, o comércio, a arquitetura e a quantidade de pessoas transformavam cada trecho em uma nova composição. Entre o movimento e os detalhes, fui encontrando diferentes formas de fotografar a identidade do bairro.",
    },
    {
      arquivo: "FLP06089.jpg",
      titulo: "Metrô de Nova York — Astoria–Ditmars Blvd",
      descricao: "Nova York, Estados Unidos. Dentro de um dos vagões do metrô, a luz que entra pela janela ilumina os bancos e cria uma composição simples, marcada pelos tons quentes do interior do trem. Ao fundo, o letreiro indica Astoria–Ditmars Blvd, uma das estações do sistema de metrô de Nova York.\n\nDurante o percurso pela cidade, o metrô acabou sendo também uma forma de observar e fotografar Nova York. Entre uma estação e outra, fui registrando detalhes do cotidiano que normalmente passam despercebidos: os bancos, as janelas, a luz entrando no vagão e as pequenas marcas deixadas pelo tempo. Uma fotografia mais minimalista, que mostra a cidade também através de seus deslocamentos.",
    },
    {
      arquivo: "FLP06246.jpg",
      titulo: "Triborough Bridge, Nova York",
      descricao: "Nova York, Estados Unidos. A ponte atravessa o rio sob a luz do fim do dia, enquanto a margem rochosa e a água conduzem o olhar em direção ao horizonte. A estrutura metálica se destaca contra o céu e cria uma composição marcada por linhas, repetição e profundidade, com a silhueta de Manhattan aparecendo ao fundo.\n\nDurante minhas caminhadas pela cidade, fui explorando também regiões mais afastadas dos pontos turísticos tradicionais. Ao chegar à margem do rio, encontrei essa perspectiva da ponte iluminada pela luz baixa do sol. O contraste entre a estrutura, a água e a paisagem urbana ao fundo transformou uma caminhada comum em mais um registro da diversidade visual de Nova York.",
    },
];

// Produto interno para testar o checkout em produção sem gastar quase
// nada (R$ 0,10). Não aparece em nenhuma coleção/galeria — só acessível
// direto pela URL /produtos/teste-checkout. Remover quando não precisar mais.
const variantesTeste: ProductVariants = {
  tamanhos: [{ id: "unico", label: "Tamanho único" }],
  servicos: [
    {
      id: "teste",
      nome: "Sem vidro",
      acabamento: "Sem vidro",
      material: "Teste",
      precos: { unico: 0.1 },
      logistica: { unico: { pesoKg: 1, comprimentoCm: 42, larguraCm: 52, alturaCm: 6, valorEmbalagem: 0 } },
      molduras: [{ id: "sem-moldura", label: "Sem moldura" }],
    },
  ],
};

const produtoTeste: Product = {
  slug: "teste-checkout",
  nome: "[TESTE] Produto de 10 centavos",
  colecao: "teste-interno",
  referencia: "FL-TESTE01",
  precoBase: 0.1,
  imagens: ["/images/islandia/FLP03147.jpg"],
  descricao: "Produto interno para testar o fluxo completo de checkout em produção sem custo relevante.",
  variantes: variantesTeste,
};

export const products: Product[] = [
  ...gerarProdutosColecao("indonesia", fotosIndonesia),
  ...gerarProdutosColecao("islandia", fotosIslandia),
  ...gerarProdutosColecao("nyc", fotosNyc),
  produtoTeste,
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCollection(colecaoSlug: string) {
  return products.filter((p) => p.colecao === colecaoSlug);
}

// Preço de um serviço num tamanho específico. undefined se essa combinação
// não existir no catálogo (ex.: Laminado em 90x120).
export function getPrecoServico(servico: OpcaoServico, tamanhoId: string) {
  return servico.precos[tamanhoId];
}
