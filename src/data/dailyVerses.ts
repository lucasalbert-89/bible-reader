export interface DailyMessage {
  verse: string;
  reference: string;
  reflection: string;
  authorOrCatechism?: string;
  sola?: 'Sola Scriptura' | 'Sola Gratia' | 'Sola Fide' | 'Solus Christus' | 'Soli Deo Gloria';
}

export const INSPIRATIONAL_MESSAGES: DailyMessage[] = [
  {
    verse: "Porque dele, e por meio dele, e para ele são todas as coisas. A ele, pois, a glória eternamente. Amém!",
    reference: "Romanos 11:36",
    reflection: "O universo não gira em torno do homem, mas da infinita majestade do Criador. Toda a história da redenção e cada dia de sua vida encontram seu propósito supremo no louvor da glória da graça de Deus.",
    authorOrCatechism: "Catecismo Breve de Westminster, Pergunta 1: O fim principal do homem é glorificar a Deus e gozá-lo para sempre.",
    sola: "Soli Deo Gloria"
  },
  {
    verse: "Toda a Escritura é divinamente inspirada e proveitosa para ensinar, para redarguir, para corrigir, para instruir em justiça.",
    reference: "2 Timóteo 3:16",
    reflection: "A Palavra de Deus não é um conselho humano, mas a própria voz do Senhor comunicada com poder. Como nos ensina a fé reformada, a Escritura interpreta a Escritura e é a nossa única regra infalível de fé e prática.",
    authorOrCatechism: "João Calvino: 'A Escritura é a escola do Espírito Santo, onde nada se omite do que é necessário e proveitoso saber.'",
    sola: "Sola Scriptura"
  },
  {
    verse: "Porque pela graça sois salvos, por meio da fé; e isto não vem de vós; é dom de Deus. Não vem das obras, para que ninguém se glorie.",
    reference: "Efésios 2:8-9",
    reflection: "Não fomos nós que escolhemos a Deus por virtude própria; Ele nos amou primeiro quando ainda estávamos mortos em nossos delitos. Descanse no favor imerecido do Pai, cuja graça soberana nos resgatou e nos preserva até o fim.",
    authorOrCatechism: "Charles Spurgeon: 'Se houvesse uma gota de mérito humano necessária para a salvação, nenhum de nós poderia estar no céu.'",
    sola: "Sola Gratia"
  },
  {
    verse: "Justificados, pois, mediante a fé, temos paz com Deus por meio de nosso Senhor Jesus Cristo.",
    reference: "Romanos 5:1",
    reflection: "A nossa paz não repousa em nossas imperfeitas obras ou sentimentos oscilantes, mas na justiça perfeita de Cristo que nos foi imputada pela fé. Na cruz, o justo Juiz declarou justos os pecadores que confiam em Seu Filho.",
    authorOrCatechism: "Martinho Lutero: 'A justificação pela fé é o artigo pelo qual a Igreja subsiste ou cai.'",
    sola: "Sola Fide"
  },
  {
    verse: "Porquanto há um só Deus e um só Mediador entre Deus e os homens, Cristo Jesus, homem, o qual a si mesmo se deu em resgate por todos.",
    reference: "1 Timóteo 2:5-6",
    reflection: "Nenhum homem, rito ou obra pode mediar nossa comunhão com o Santo de Israel. Somente Cristo, nosso verdadeiro Profeta, Sacerdote e Rei eterno, realizou a expiação completa e agora intercede continuamente por Seu povo eleito.",
    authorOrCatechism: "Catecismo de Heidelberg, Pergunta 1: 'Meu único consolo é que pertenço em corpo e alma, na vida e na morte, ao meu fiel Salvador Jesus Cristo.'",
    sola: "Solus Christus"
  },
  {
    verse: "O Senhor é o meu pastor; de nada terei falta. Em verdes pastagens me faz repousar e me conduz a águas tranquilas.",
    reference: "Salmos 23:1-2",
    reflection: "A providência de Deus governa até o menor fio de cabelo de nossas cabeças. O Pastor da aliança não abandona suas ovelhas nas veredas escuras; Ele mesmo é o descanso e a fortaleza pactual da nossa peregrinação terrena.",
    authorOrCatechism: "João Calvino: 'Saber que nada acontece neste mundo sem a vontade e decreto divino traz uma serenidade inabalável à alma crente.'",
    sola: "Soli Deo Gloria"
  },
  {
    verse: "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.",
    reference: "Romanos 8:28",
    reflection: "A providência de Deus não falha e seus decretos jamais são frustrados. Até as dores e provações mais amargas são ferramentas da graça soberana para nos conformar à imagem do Primogênito e revelar a Sua fidelidade.",
    authorOrCatechism: "Jonathan Edwards: 'A absoluta soberania de Deus não é um motivo para pavor, mas o mais doce e seguro fundamento de consolo da alma regenerada.'",
    sola: "Sola Gratia"
  },
  {
    verse: "Eis que as virgens conceberá e dará à luz um filho, e ele será chamado pelo nome de Emanuel (que traduzido é: Deus conosco).",
    reference: "Mateus 1:23",
    reflection: "A promessa da aliança feita a Abraão e repetida pelos profetas encontra seu clímax na encarnação de Cristo. Deus habitou entre nós para cumprir a lei que quebrantamos e beber o cálice da ira divina em nosso lugar.",
    authorOrCatechism: "Herman Bavinck: 'Em Cristo, Deus se doa a Si mesmo ao homem na mais sublime manifestação de Seu amor soberano.'",
    sola: "Solus Christus"
  },
  {
    verse: "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.",
    reference: "Salmos 119:105",
    reflection: "Em tempos de confusão cultural e enganos do coração, a Escritura sagrada permanece como farol imutável. Não precisamos de novas revelações, pois em Sua Palavra o Senhor nos outorgou tudo o que é necessário para a vida e a piedade.",
    authorOrCatechism: "Confissão de Fé de Westminster (I.6): 'Todo o conselho de Deus concernente a todas as coisas necessárias para a sua própria glória e para a salvação, fé e vida do homem está expressamente declarado na Escritura.'",
    sola: "Sola Scriptura"
  },
  {
    verse: "Portanto, agora, nenhuma condenação há para os que estão em Cristo Jesus, que não andam segundo a carne, mas segundo o Espírito.",
    reference: "Romanos 8:1",
    reflection: "A lei de Deus já não pronuncia maldição sobre o crente, pois Cristo se fez maldição em nosso favor. Selados pelo Santo Espírito da promessa, vivemos em doce liberdade filial para agradar ao Pai que nos reconciliou.",
    authorOrCatechism: "Charles Spurgeon: 'A justiça de Cristo é um manto tão perfeito que nenhuma condenação da lei divina consegue encontrar uma brecha nele.'",
    sola: "Sola Fide"
  },
  {
    verse: "Santifica-os na verdade; a tua palavra é a verdade.",
    reference: "João 17:17",
    reflection: "A santificação não é um esforço moralista autônomo, mas a obra contínua do Espírito Santo que nos purifica por meio da meditação e obediência às Escrituras. Ler a Bíblia é colocar-se debaixo do orvalho vivificante da graça.",
    authorOrCatechism: "João Calvino: 'Não há outro meio de nos mantermos puros no mundo senão guardando os mandamentos do Senhor em nossos corações.'",
    sola: "Sola Scriptura"
  },
  {
    verse: "Estou plenamente certo de que aquele que começou boa obra em vós há de completá-la até ao Dia de Cristo Jesus.",
    reference: "Filipenses 1:6",
    reflection: "A perseverança dos santos repousa na imutabilidade do decreto divino, não na fragilidade da vontade humana. Aquele que comprou a Sua Igreja com sangue precioso jamais deixará cair nenhum dos Seus pequeninos.",
    authorOrCatechism: "Cânones de Dort: 'Deus, que é rico em misericórdia, segundo o imutável propósito da eleição, não retira totalmente o Seu Espírito Santo dos Seus, nem permite que caiam da graça da adoção.'",
    sola: "Sola Gratia"
  }
];

export function getInspirationalMessage(day: number): DailyMessage {
  const index = (day - 1) % INSPIRATIONAL_MESSAGES.length;
  return INSPIRATIONAL_MESSAGES[index];
}
