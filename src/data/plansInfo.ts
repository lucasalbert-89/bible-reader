import { ReadingPlanInfo } from '../types';

export const PLANS_INFO: ReadingPlanInfo[] = [
  {
    id: 'plano-365',
    title: 'Plano 365 Dias',
    badge: '1 Ano • Clássico',
    subtitle: 'A Bíblia inteira ao longo de 1 ano',
    totalDays: 365,
    chaptersPerDay: '3 a 4 capítulos / dia',
    description: 'Leitura equilibrada com Antigo Testamento, Salmos/Sapienciais e Novo Testamento todos os dias. Ideal para criar um hábito diário e duradouro.'
  },
  {
    id: 'plano-180',
    title: 'Plano 180 Dias',
    badge: '6 Meses • Focado',
    subtitle: 'Toda a Bíblia em um semestre',
    totalDays: 180,
    chaptersPerDay: '6 a 7 capítulos / dia',
    description: 'Ritmo dinâmico e consistente para quem quer aprofundar sua vida devocional e concluir toda a Escritura em 6 meses.'
  },
  {
    id: 'plano-90',
    title: 'Plano 90 Dias',
    badge: '3 Meses • Intensivo',
    subtitle: 'Imersão bíblica em um trimestre',
    totalDays: 90,
    chaptersPerDay: '13 a 14 capítulos / dia',
    description: 'Jornada intensiva de imersão total nas Escrituras. Uma experiência transformadora para períodos de férias, retiros ou desafios de consagração.'
  }
];
