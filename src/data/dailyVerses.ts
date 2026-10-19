export interface DailyMessage {
  verse: string;
  reference: string;
  reflection: string;
}

export const INSPIRATIONAL_MESSAGES: DailyMessage[] = [
  {
    verse: "O Senhor é o meu pastor; de nada terei falta. Em verdes pastagens me faz repousar e me conduz a águas tranquilas.",
    reference: "Salmos 23:1-2",
    reflection: "Comece o dia lembrando que o verdadeiro suprimento não vem da força dos seus braços, mas da fidelidade de Quem guia os seus passos. Se o Bom Pastor está à frente, você tem tudo o que necessita."
  },
  {
    verse: "Não andeis ansiosos por coisa alguma; antes, em tudo, sejam os vossos pedidos conhecidos diante de Deus pela oração e súplica com ações de graças.",
    reference: "Filipenses 4:6",
    reflection: "A ansiedade tenta antecipar fardos que você não foi chamado a carregar hoje. Entregue cada preocupação nas mãos de Deus e receba a paz que excede todo o entendimento."
  },
  {
    verse: "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.",
    reference: "Salmos 119:105",
    reflection: "A Bíblia não ilumina quilômetros de uma vez só, mas dá luz exatamente para o próximo passo de fé. Caminhe na certeza de que cada palavra lida hoje é semente para o seu futuro."
  },
  {
    verse: "Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento; reconheça-o em todos os seus caminhos, e ele endireitará as suas veredas.",
    reference: "Provérbios 3:5-6",
    reflection: "Abrir mão do controle nem sempre é fácil, mas colocar o leme nas mãos d'Aquele que conhece o princípio e o fim é o caminho mais seguro para a paz."
  },
  {
    verse: "Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de lhes causar dano, planos de dar-lhes esperança e um futuro.",
    reference: "Jeremias 29:11",
    reflection: "Mesmo em dias de incerteza ou cansaço, os desígnios de Deus para sua história continuam firmes, bons e perfeitos. Descanse nessa promessa infalível."
  },
  {
    verse: "O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e tenha misericórdia de ti; o Senhor sobre ti levante o seu rosto e te dê a paz.",
    reference: "Números 6:24-26",
    reflection: "Que a bênção sacerdotal envolva sua casa, seus pensamentos e suas decisões hoje. A graça de Deus te sustenta em cada detalhe."
  },
  {
    verse: "Tudo posso naquele que me fortalece.",
    reference: "Filipenses 4:13",
    reflection: "Essa força não significa ausência de desafios, mas a presença inabalável de Cristo que capacita você a vencer qualquer estação da vida."
  },
  {
    verse: "Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.",
    reference: "Isaías 40:31",
    reflection: "Esperar em Deus não é inércia, é confiança ativa. Quando as suas forças humanas terminam, o poder sobrenatural do Senhor se aperfeiçoa em você."
  },
  {
    verse: "Buscai primeiro o Reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.",
    reference: "Mateus 6:33",
    reflection: "Ao alinhar suas prioridades com o coração do Pai, as preocupações da rotina perdem o poder sobre você e encontram o seu devido lugar."
  },
  {
    verse: "Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos!",
    reference: "Filipenses 4:4",
    reflection: "A alegria bíblica não depende das circunstâncias ao redor, mas da certeza inabalável de quem Deus é em nossa vida."
  },
  {
    verse: "O Senhor é a minha luz e a minha salvação; de quem terei temor? O Senhor é a fortaleza da minha vida; a quem temerei?",
    reference: "Salmos 27:1",
    reflection: "Quando Deus é o alicerce e a fortaleza da sua vida, nenhuma tempestade é capaz de abalar sua estrutura espiritual."
  },
  {
    verse: "Mil cairão ao teu lado, e dez mil à tua direita, mas não chegará a ti.",
    reference: "Salmos 91:7",
    reflection: "Você está sob a sombra do Onipotente. Guarde o seu coração no descanso da proteção divina hoje e sempre."
  },
  {
    verse: "Deem graças ao Senhor, porque ele é bom; o seu amor dura para sempre.",
    reference: "Salmos 136:1",
    reflection: "A gratidão abre os nossos olhos para perceber a mão de Deus agindo até nas coisas mais simples do nosso cotidiano."
  },
  {
    verse: "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.",
    reference: "Mateus 11:28",
    reflection: "Jesus não exige que você venha perfeito ou com todas as respostas; Ele apenas convida você a se achegar e encontrar o verdadeiro descanso para a sua alma."
  },
  {
    verse: "Se Deus é por nós, quem será contra nós?",
    reference: "Romanos 8:31",
    reflection: "Nenhum obstáculo, oposição ou dúvida é maior do que o amor soberano de Deus operando a seu favor."
  }
];

export function getInspirationalMessage(day: number): DailyMessage {
  const index = (day - 1) % INSPIRATIONAL_MESSAGES.length;
  return INSPIRATIONAL_MESSAGES[index];
}
