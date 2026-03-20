import { AppState } from '../types';
import { DEFAULT_WEIGHTS } from '../lib/scoring';

export const SEED_DATA: AppState = {
  insights: [
    {
      id: 'ins-001',
      title: 'PMEs portuguesas carecem de automação de relatórios financeiros',
      description:
        'A maioria das pequenas e médias empresas em Portugal ainda produz relatórios financeiros mensais manualmente em Excel. O processo consome entre 4 a 8 horas por mês de um técnico ou gestor. Existe uma lacuna entre ferramentas enterprise (SAP, Oracle) e o básico (Excel). Ferramentas como Notion ou Airtable podem ser usadas como base, mas faltam templates financeiros adaptados ao contexto português (IVA, IRC, IRS).',
      origin: 'Conversa com contabilista em Lisboa; análise de grupos de Facebook de gestores PME',
      evidence:
        'Grupo "Gestores PME Portugal" no Facebook tem 12.000 membros. Posts frequentes sobre "como fazer relatório de tesouraria". 3 contactos pessoais confirmam dor. Pesquisa Google Trends mostra crescimento de "automatizar relatório financeiro" +34% YoY em Portugal.',
      confidence: 'high',
      impact: 8,
      nextStep: 'Entrevistar 5 donos de PME sobre processo atual e disposição a pagar por template/ferramenta',
      tags: ['automação', 'financeiro', 'PME', 'B2B', 'Portugal'],
      sources: [
        { type: 'history', label: 'Conversa com Ana Ferreira (contabilista)', date: '2026-01-15' },
        { type: 'web', label: 'Grupo Facebook Gestores PME Portugal', url: 'https://facebook.com/groups/gestorespmept', date: '2026-01-20' },
        { type: 'web', label: 'Google Trends Portugal - relatório financeiro', date: '2026-02-01' },
      ],
      createdAt: '2026-01-20T10:00:00Z',
      updatedAt: '2026-02-01T14:30:00Z',
      status: 'active',
      promotedTo: 'opp-001',
    },
    {
      id: 'ins-002',
      title: 'Criadores de conteúdo lusófonos sem sistema de gestão editorial',
      description:
        'Existe um número crescente de criadores de conteúdo em português (Portugal, Brasil, Angola, Moçambique) que operam de forma solo ou em pequenas equipas. A maioria usa grupos de WhatsApp, notas no telemóvel ou no máximo uma folha de cálculo para planear conteúdo. Não existe uma ferramenta focada no criador lusófono que integre calendário editorial, banco de ideias, e análise de desempenho por plataforma (YouTube, Instagram, TikTok).',
      origin: 'Observação própria ao gerir canal no YouTube; pesquisa de ferramentas existentes',
      evidence:
        'Tentei usar Notion, Later, Buffer — nenhum tem interface em português decente nem é adaptado ao fluxo de trabalho real. Community de criadores portugueses tem pedidos frequentes por "ferramentas em português". Mercado lusófono total: ~270M falantes.',
      confidence: 'medium',
      impact: 7,
      nextStep: 'Criar questionário para 50 criadores de conteúdo lusófonos sobre ferramentas e workflow atual',
      tags: ['criadores-conteúdo', 'editorial', 'lusófono', 'SaaS', 'produtividade'],
      sources: [
        { type: 'history', label: 'Experiência pessoal criador de conteúdo', date: '2026-01-10' },
        { type: 'vault', label: 'Nota pessoal: ferramentas testadas e gaps encontrados', date: '2026-01-12' },
        { type: 'web', label: 'Reddit r/empreendedorismo - thread sobre ferramentas', url: 'https://reddit.com/r/empreendedorismo', date: '2026-01-25' },
      ],
      createdAt: '2026-01-25T09:15:00Z',
      updatedAt: '2026-01-25T09:15:00Z',
      status: 'active',
      promotedTo: 'opp-002',
    },
    {
      id: 'ins-003',
      title: 'Restaurantes locais sem presença digital estruturada',
      description:
        'Muitos restaurantes em cidades médias portuguesas (Coimbra, Braga, Évora, Faro) têm boa comida mas presença digital muito fraca — perfil do Google por actualizar, sem Instagram activo, sem forma de recolher reviews proativamente. Os donos querem clientes online mas não têm tempo ou conhecimento para gerir. Existe oportunidade para um serviço mensal de gestão digital focado em restauração local.',
      origin: 'Conversa com dono de restaurante em Coimbra; pesquisa de mercado informal',
      evidence:
        '15 restaurantes próximos verificados no Google Maps: 9 têm perfil desactualizado, 7 sem Instagram activo. Dono do Restaurante Mondego confirmou pagar €150/mês por serviço ineficaz. Estimativa: 15.000+ restaurantes independentes em Portugal.',
      confidence: 'high',
      impact: 6,
      nextStep: 'Criar pacote MVP de presença digital para restaurantes e oferecer a 3 restaurantes locais de graça',
      tags: ['restauração', 'presença-digital', 'local', 'B2B', 'serviços'],
      sources: [
        { type: 'history', label: 'Conversa Rui Santos - Restaurante Mondego', date: '2026-02-05' },
        { type: 'web', label: 'Google Maps audit - restaurantes Coimbra centro', date: '2026-02-08' },
        { type: 'derived', label: 'Estimativa mercado restauração PT (INE 2024)', date: '2026-02-10' },
      ],
      createdAt: '2026-02-10T11:00:00Z',
      updatedAt: '2026-02-15T16:00:00Z',
      status: 'active',
    },
    {
      id: 'ins-004',
      title: 'Profissionais liberais PT sem sistema de onboarding de clientes',
      description:
        'Advogados, psicólogos, nutricionistas e outros profissionais liberais em Portugal perdem tempo significativo no processo de onboarding de novos clientes — recolha de documentos, preenchimento de formulários, explicação de processos. Muitos usam email e PDF com formulários para imprimir. Existe espaço para um produto que digitalize e automatize este processo com conformidade RGPD.',
      origin: 'Pesquisa de competidores no mercado SaaS; feedback de psicóloga e advogada',
      evidence:
        'Typeform e Jotform existem mas são genéricas. DocuSign é caro para profissionais individuais. 2 profissionais liberais entrevistados estimam perder 3h/semana em administração de onboarding. Pesquisa "onboarding clientes portugal" tem baixa concorrência.',
      confidence: 'medium',
      impact: 7,
      nextStep: 'Prototipar formulário de onboarding adaptável para 3 tipos de profissional liberal',
      tags: ['profissionais-liberais', 'onboarding', 'RGPD', 'automação', 'B2B'],
      sources: [
        { type: 'history', label: 'Entrevista Dra. Margarida Costa (psicóloga)', date: '2026-02-12' },
        { type: 'history', label: 'Entrevista Dr. Pedro Almeida (advogado)', date: '2026-02-14' },
        { type: 'web', label: 'Product Hunt - GDPR compliance tools', url: 'https://producthunt.com', date: '2026-02-16' },
      ],
      createdAt: '2026-02-16T14:00:00Z',
      updatedAt: '2026-02-16T14:00:00Z',
      status: 'active',
    },
    {
      id: 'ins-005',
      title: 'Mercado de templates Notion em português praticamente inexistente',
      description:
        'O Notion tem crescido fortemente em Portugal e Brasil, mas o mercado de templates em português é muito limitado. Comparando com o mercado anglófono (criadores ganham $5k-$30k/mês em templates), a versão lusófona está na infância. Existe potencial para criar templates de alta qualidade adaptados ao contexto empresarial português — com IVA, estruturas societárias PT, fluxos de trabalho típicos de empresas portuguesas.',
      origin: 'Análise do Gumroad/Notion marketplace; pesquisa de keywords em português',
      evidence:
        'Pesquisa "template Notion português" no Google: ~1.200 resultados (vs 48M para "Notion template" em inglês). Gumroad: 3 vendedores lusófonos com média de $800/mês. Potencial underexplored. Comunidade Notion Portugal no Discord tem 800+ membros.',
      confidence: 'medium',
      impact: 6,
      nextStep: 'Criar e publicar 1 template gratuito para testar tracção antes de produto pago',
      tags: ['templates', 'Notion', 'produto-digital', 'lusófono', 'baixo-custo'],
      sources: [
        { type: 'web', label: 'Gumroad - análise vendedores templates português', url: 'https://gumroad.com', date: '2026-02-20' },
        { type: 'web', label: 'Discord Notion Portugal', date: '2026-02-22' },
        { type: 'derived', label: 'Estimativa mercado templates Notion PT/BR', date: '2026-02-22' },
      ],
      createdAt: '2026-02-22T10:00:00Z',
      updatedAt: '2026-02-22T10:00:00Z',
      status: 'active',
    },
  ],

  opportunities: [
    {
      id: 'opp-001',
      problem: 'PMEs portuguesas perdem 4-8h/mês em relatórios financeiros manuais',
      audience: 'Donos e gestores de PMEs com 2-20 funcionários em Portugal, sem CFO interno',
      offer: 'Pack de templates Notion + Airtable para gestão financeira adaptado à fiscalidade portuguesa (IVA, IRC), com vídeos de setup de 15 min e suporte por email durante 30 dias',
      channel: 'LinkedIn ads para gestores PME, grupos Facebook de empreendedores, parcerias com associações empresariais (ACISO, AEP)',
      score: {
        marketSize: 7,
        feasibility: 8,
        differentiation: 7,
        urgency: 8,
        alignment: 9,
        total: 7.7,
      },
      rationale:
        'Dor validada por múltiplas fontes, mercado de ~350.000 PMEs em Portugal, feasibility alta pois produto digital com criação única, urgência alta pois dor contínua mensal, forte alinhamento com skills de gestão e ferramentas no-code.',
      tradeoffs:
        'Produto one-time vs. recorrente (considerar plano de manutenção anual). Risco de contabilistas verem como ameaça. Necessário criar conteúdo de educação sobre automação financeira.',
      nextAction: 'Validar preço com 10 entrevistas de discovery e lançar pre-venda a €97',
      tags: ['automação', 'financeiro', 'PME', 'B2B', 'Portugal', 'templates'],
      sources: [
        { type: 'history', label: 'Promoção de ins-001', date: '2026-02-05' },
        { type: 'derived', label: 'Análise de mercado PME Portugal', date: '2026-02-05' },
      ],
      createdAt: '2026-02-05T10:00:00Z',
      updatedAt: '2026-02-15T09:00:00Z',
      status: 'active',
      insightId: 'ins-001',
      experiments: ['exp-001'],
    },
    {
      id: 'opp-002',
      problem: 'Criadores de conteúdo lusófonos não têm sistema editorial adaptado ao seu workflow',
      audience: 'Criadores solo e micro-equipas (1-3 pessoas) em Portugal e Brasil, com 1k-100k seguidores, que publicam em 2+ plataformas',
      offer: 'Template Notion "Creator OS" em português com: banco de ideias, calendário editorial, tracker de métricas por plataforma, sistema de repurposing de conteúdo',
      channel: 'YouTube (vídeo tutorial + link na descrição), Instagram reels mostrando o sistema, comunidades de criadores no Discord',
      score: {
        marketSize: 8,
        feasibility: 9,
        differentiation: 8,
        urgency: 6,
        alignment: 8,
        total: 7.9,
      },
      rationale:
        'Mercado lusófono de criadores em forte crescimento, produto 100% digital com margens altas, diferenciação clara vs. concorrência anglófona, forte alinhamento com experiência pessoal como criador.',
      tradeoffs:
        'Brasil vs Portugal: contexto diferente (moeda, plataformas preferidas). Risco de commoditização se o mercado crescer rápido. Necessário suporte contínuo para manter template atualizado com mudanças de plataformas.',
      nextAction: 'Lançar versão gratuita para construir email list e testar conversão para versão paga a €49',
      tags: ['criadores-conteúdo', 'Notion', 'templates', 'lusófono', 'produto-digital'],
      sources: [
        { type: 'history', label: 'Promoção de ins-002', date: '2026-02-10' },
        { type: 'web', label: 'Análise mercado criadores Brasil/Portugal', date: '2026-02-10' },
      ],
      createdAt: '2026-02-10T11:00:00Z',
      updatedAt: '2026-02-20T10:00:00Z',
      status: 'active',
      insightId: 'ins-002',
      experiments: ['exp-002', 'exp-003'],
    },
    {
      id: 'opp-003',
      problem: 'Restaurantes independentes em cidades médias PT sem presença digital eficaz',
      audience: 'Donos de restaurantes independentes em cidades médias portuguesas (10.000-150.000 habitantes), sem recursos para agência de marketing',
      offer: 'Pacote mensal "Restaurante Digital": gestão Google Business, 12 posts/mês Instagram, resposta a reviews, relatório mensal — €199/mês',
      channel: 'Visita presencial a restaurantes locais, referências entre donos, grupos de associações de restauração',
      score: {
        marketSize: 6,
        feasibility: 7,
        differentiation: 5,
        urgency: 7,
        alignment: 6,
        total: 6.2,
      },
      rationale:
        'Dor validada, serviço recorrente com receita previsível, escalável com sistemas e freelancers. Porém, o mercado é fragmentado e o processo de venda porta-a-porta é lento.',
      tradeoffs:
        'Serviço vs. produto: serviço tem valor imediato mas escala com dificuldade. Concorrência de agências locais e plataformas genéricas. Requer presença local — difícil expandir além de 1-2 cidades.',
      nextAction: 'Fechar 3 clientes piloto a €99/mês (desconto 50%) para validar entrega e retenção',
      tags: ['restauração', 'presença-digital', 'serviços', 'local', 'recorrente'],
      sources: [
        { type: 'history', label: 'Promoção de ins-003', date: '2026-02-15' },
      ],
      createdAt: '2026-02-15T14:00:00Z',
      updatedAt: '2026-02-15T14:00:00Z',
      status: 'active',
      insightId: 'ins-003',
      experiments: [],
    },
    {
      id: 'opp-004',
      problem: 'Templates e recursos Notion em português de qualidade são escassos',
      audience: 'Profissionais e estudantes universitários em Portugal e Brasil que usam ou querem usar Notion para produtividade pessoal e profissional',
      offer: 'Pack de 5 templates Notion premium adaptados ao mercado lusófono: gestão de projetos, sistema GTD, tracker financeiro pessoal, diário semanal, sistema de estudo universitário — €29 (pack) ou €9 individual',
      channel: 'Gumroad, YouTube tutoriais Notion em português, Pinterest, comunidades Notion em português',
      score: {
        marketSize: 7,
        feasibility: 9,
        differentiation: 7,
        urgency: 5,
        alignment: 8,
        total: 7.2,
      },
      rationale:
        'Baixíssimo esforço inicial, mercado não explorado, margens 95%+, boa prova de conceito antes de produtos mais complexos. Ideal como "primeiro produto" para aprender sobre marketing digital.',
      tradeoffs:
        'Receita limitada (low-ticket). Risco de pirataria/cópia. Plataformas mudam e templates ficam desatualizados. Mas serve como funil de entrada para produtos mais caros.',
      nextAction: 'Criar 2 templates em 1 semana, publicar no Gumroad como "pague o que quiser" para validar interesse',
      tags: ['templates', 'Notion', 'produto-digital', 'lusófono', 'baixo-custo', 'produtividade'],
      sources: [
        { type: 'history', label: 'Promoção de ins-005', date: '2026-02-25' },
        { type: 'web', label: 'Análise Gumroad templates português', date: '2026-02-25' },
      ],
      createdAt: '2026-02-25T09:00:00Z',
      updatedAt: '2026-02-25T09:00:00Z',
      status: 'active',
      insightId: 'ins-005',
      experiments: [],
    },
  ],

  experiments: [
    {
      id: 'exp-001',
      hypotheses:
        'Se publicar um artigo de LinkedIn detalhando o processo manual de relatórios financeiros e oferecer uma lista de espera para o template, pelo menos 50 gestores de PME vão demonstrar interesse nas próximas 2 semanas.',
      successMetric: '50+ inscrições na lista de espera via LinkedIn em 14 dias',
      deadline: '2026-03-20',
      status: 'running',
      notes:
        'Artigo publicado a 2026-03-06 com 847 impressões. Até agora: 23 inscrições. Bom engagement nos comentários — vários contabilistas a confirmar a dor. Ritmo atual sugere ~40 inscrições no prazo.',
      opportunityId: 'opp-001',
      createdAt: '2026-03-01T10:00:00Z',
      updatedAt: '2026-03-15T14:00:00Z',
    },
    {
      id: 'exp-002',
      hypotheses:
        'Se lançar um template Notion "Creator OS" gratuito em português e o promover num vídeo YouTube de 10 minutos, conseguirei 200+ downloads na primeira semana, validando o interesse do mercado.',
      successMetric: '200+ downloads do template gratuito em 7 dias pós-publicação',
      deadline: '2026-04-01',
      status: 'hypothesis',
      notes:
        'Template em construção. Vídeo YouTube planeado para finais de março. Ainda a decidir se faz sentido exigir email para o download ou manter completamente gratuito.',
      opportunityId: 'opp-002',
      createdAt: '2026-03-05T09:00:00Z',
      updatedAt: '2026-03-10T11:00:00Z',
    },
    {
      id: 'exp-003',
      hypotheses:
        'Se publicar um reel Instagram mostrando o sistema de gestão de conteúdo em uso real (antes/depois), vou conseguir pelo menos 500 visualizações orgânicas e 30 DMs de criadores interessados.',
      successMetric: '500 visualizações e 30 DMs em 72 horas após publicação',
      deadline: '2026-03-25',
      status: 'hypothesis',
      notes:
        'Reel gravado mas ainda em edição. Plano B: publicar como carrossel se o reel não performar. Preparar resposta padrão para DMs com link para lista de espera.',
      opportunityId: 'opp-002',
      createdAt: '2026-03-08T15:00:00Z',
      updatedAt: '2026-03-12T10:00:00Z',
    },
  ],

  decisionLog: [
    {
      id: 'dec-001',
      date: '2026-02-05',
      decision: 'Priorizar opp-001 (templates financeiros PME) como primeiro produto a lançar',
      context:
        'Tinha 3 ideias em paralelo: templates financeiros, serviço restaurantes, e curso de produtividade. Precisava de foco para avançar.',
      rationale:
        'Templates financeiros têm: (1) dor mais clara e urgente, (2) melhor alinhamento com background em gestão, (3) potencial B2B com maior ticket médio, (4) mais fácil de validar digitalmente sem contacto presencial.',
      outcome: undefined,
      linkedTo: { type: 'opportunity', id: 'opp-001' },
      sources: [
        { type: 'derived', label: 'Análise comparativa das 3 oportunidades', date: '2026-02-05' },
      ],
    },
    {
      id: 'dec-002',
      date: '2026-02-20',
      decision: 'Não avançar com curso online sobre produtividade como primeiro produto',
      context:
        'Estava a considerar criar um curso sobre sistemas de produtividade para profissionais portugueses. Tinha conteúdo e experiência na área.',
      rationale:
        'Mercado de cursos de produtividade é muito saturado (mesmo em português). Criação de um curso leva 3-4 meses de trabalho. Risco alto de investir tempo sem retorno. Prefiro produtos mais rápidos de validar. Pode ser considerado mais tarde como upsell depois de ter audiência.',
      outcome: 'Decisão mantida — foco em produtos digitais de baixo custo de produção primeiro.',
      linkedTo: undefined,
      sources: [
        { type: 'web', label: 'Análise cursos produtividade Hotmart/Udemy PT', date: '2026-02-18' },
        { type: 'derived', label: 'Estimativa tempo criação curso vs. templates', date: '2026-02-20' },
      ],
    },
    {
      id: 'dec-003',
      date: '2026-03-01',
      decision: 'Usar LinkedIn como canal principal de validação para opp-001, não Google Ads',
      context:
        'Estava a planear investir €200 em Google Ads para validar interesse no template financeiro. Alternativa era conteúdo orgânico no LinkedIn.',
      rationale:
        'LinkedIn permite validar com custo zero. Audiência de gestores PME no LinkedIn é mais precisa do que Google Ads genéricos. Artigo de LinkedIn gera prova social e credibilidade que um ad não gera. €200 pode ser usado mais tarde para amplificar o que já funciona organicamente.',
      outcome: 'Artigo publicado, bom engagement inicial. A validar se gera lista de espera suficiente.',
      linkedTo: { type: 'experiment', id: 'exp-001' },
      sources: [
        { type: 'derived', label: 'Comparação LinkedIn orgânico vs. paid ads para B2B', date: '2026-03-01' },
      ],
    },
  ],

  scoringWeights: DEFAULT_WEIGHTS,
  lastUpdated: '2026-03-15T14:00:00Z',
};
