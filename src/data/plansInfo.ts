import { ReadingPlanInfo } from '../types';

export const PLANS_INFO: ReadingPlanInfo[] = [
  {
    id: 'plano-365',
    title: 'Plano 365 Dias',
    badge: 'A Aliança da Graça • 1 Ano',
    subtitle: 'Do Gênesis ao Apocalipse: a soberana história da redenção',
    totalDays: 365,
    chaptersPerDay: '3 a 4 capítulos / dia',
    description: 'Leitura pactual clássica unindo Antigo Testamento, Poéticos e o Evangelho de Cristo todos os dias. O meio ordinário de graça para santificação diária da alma.'
  },
  {
    id: 'plano-180',
    title: 'Plano 180 Dias',
    badge: 'Conselho Integral • 6 Meses',
    subtitle: 'Toda a Escritura em um semestre de devoção',
    totalDays: 180,
    chaptersPerDay: '6 a 7 capítulos / dia',
    description: 'Ritmo focado e consistente para contemplar a majestade de Deus, os pactos eternos e a suficiência de Cristo em 6 meses de meditação contínua.'
  },
  {
    id: 'plano-90',
    title: 'Plano 90 Dias',
    badge: 'Imersão Bíblica • 3 Meses',
    subtitle: 'Consagração intensiva na Palavra Inerrante',
    totalDays: 90,
    chaptersPerDay: '13 a 14 capítulos / dia',
    description: 'Jornada intensiva inspirada na devoção dos teólogos reformadores e puritanos. Uma imersão profunda na autoridade suprema e infalível das Sagradas Escrituras.'
  }
];
