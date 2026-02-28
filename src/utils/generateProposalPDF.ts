import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api, Proposal, City } from '@/lib/api';

interface PDFOptions {
  proposal: Proposal;
}

export async function generateProposalPDF({ proposal }: PDFOptions): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Cores da marca
  const primaryColor = [41, 128, 185]; // Azul
  const secondaryColor = [52, 73, 94]; // Cinza escuro

  // ===== CABEÇALHO COM LOGO CENTRALIZADO =====
  let logoAdded = false;
  try {
    // Tentar carregar o logo usando import dinâmico
    const logoModule = await import('@/assets/aquecepro-logo.png');
    const logoUrl = logoModule.default;

    if (logoUrl && typeof logoUrl === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          resolve();
        }, 2000); // Timeout de 2 segundos

        img.onload = () => {
          try {
            const logoWidth = 80;
            const logoHeight = (img.height * logoWidth) / img.width;
            // Centralizar o logo horizontalmente
            const logoX = (pageWidth - logoWidth) / 2;
            doc.addImage(img, 'PNG', logoX, yPosition, logoWidth, logoHeight);
            logoAdded = true;
            yPosition += logoHeight + 10;
          } catch (error) {
            console.warn('Erro ao adicionar logo:', error);
          }
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.src = logoUrl;
      });
    }
  } catch (error) {
    console.warn('Erro ao carregar logo:', error);
    // Continuar sem o logo se houver erro
  }

  // Ajustar posição se o logo não foi adicionado
  if (!logoAdded) {
    yPosition = 30;
  } else {
    yPosition += 5;
  }

  // Linha separadora
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;

  // ===== TÍTULO DO DOCUMENTO =====
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPOSTA COMERCIAL', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`ID: ${proposal.id.substring(0, 8).toUpperCase()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // ===== INFORMAÇÕES DO CLIENTE =====
  doc.setFontSize(14);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  let cityData: City | undefined;
  if (proposal.city) {
    try {
      cityData = await api.getCity(proposal.city);
    } catch (error) {
      console.warn('Erro ao carregar dados da cidade:', error);
    }
  }
  const cityName = cityData ? cityData.name : (proposal.city || 'Não informada');

  const clientInfo = [
    ['Nome:', proposal.clientName || proposal.clientId || 'Não informado'],
    ['Telefone:', proposal.clientPhone || 'Não informado'],
    ['Cidade:', cityName],
    ['Segmento:', proposal.segment === 'piscina' ? 'Piscina' : 'Residencial'],
  ];

  clientInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, yPosition);
    yPosition += 7;
  });

  yPosition += 5;

  // ===== DADOS ESPECÍFICOS DO SEGMENTO =====
  if (proposal.segment === 'piscina') {
    yPosition = await addPoolData(doc, proposal.data, yPosition, pageWidth, cityData);
  } else if (proposal.segment === 'residencial') {
    yPosition = addResidentialData(doc, proposal.data, yPosition, pageWidth);
  }

  // ===== RODAPÉ =====
  const footerY = pageHeight - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  doc.text('AquecePro - Soluções em Aquecimento', pageWidth / 2, footerY + 5, { align: 'center' });

  // Salvar o PDF
  const fileName = `Proposta_${proposal.id.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

async function addPoolData(doc: jsPDF, data: any, yPosition: number, pageWidth: number, cityData?: City): Promise<number> {
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = yPosition;

  // Verificar se precisa de nova página
  if (currentY > pageHeight - 80) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(52, 73, 94);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMAÇÕES DA PISCINA', 20, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  const poolInfo: string[][] = [];

  const hasSpa = data.poolAreas?.some((a: any) => a.isSpa) || false;
  const hasPrainha = data.poolAreas?.some((a: any) => parseFloat(a.depth) > 0 && parseFloat(a.depth) <= 0.6) || false;

  if (data.months && Array.isArray(data.months) && data.months.length > 0) {
    poolInfo.push(['Meses de Utilização:', data.months.join(', ')]);
  }

  if (data.useFrequency) {
    poolInfo.push(['Frequência de Uso:', data.useFrequency]);
  }

  if (data.desiredTemp) {
    poolInfo.push(['Temperatura Desejada:', `${data.desiredTemp}°C`]);
  }

  if (data.poolSurfaceArea) {
    poolInfo.push(['Área da Piscina:', `${data.poolSurfaceArea.toFixed(2)} m²`]);
  }

  poolInfo.forEach(([label, value]) => {
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, currentY);
    currentY += 7;
  });

  // Características em tags visuais
  currentY += 5;
  const tags = [];
  if (hasSpa) tags.push('C/ spa integrado');
  if (hasPrainha) tags.push('C/ prainha');
  if (data.waterfall) tags.push('C/ cascata'); else tags.push('S/ cascata');
  if (data.infinityEdge) tags.push('C/ borda infinita'); else tags.push('S/ borda infinita');
  tags.push(data.isEnclosed ? 'Piscina em local fechado' : 'Piscina em local aberto');
  tags.push(data.isSuspended ? 'Piscina suspensa' : 'Piscina enterrada');

  tags.forEach(tag => {
    if (currentY > pageHeight - 20) { doc.addPage(); currentY = 20; }
    doc.setFont('helvetica', 'normal');
    doc.text(`• ${tag}`, 20, currentY);
    currentY += 6;
  });

  currentY += 10;

  currentY += 10;

  // Calculos Térmicos
  let minTemp = 20;
  let maxWindSpeed = 10;
  let windFactor = data.isEnclosed ? 1.0 : 1.15; // padrão

  if (cityData && data.months?.length > 0) {
    const selectedMonthsData = cityData.monthlyData.filter(m => data.months.includes(m.month));
    if (selectedMonthsData.length > 0) {
      minTemp = Math.min(...selectedMonthsData.map(m => m.temperature));
      maxWindSpeed = Math.max(...selectedMonthsData.map(m => m.windSpeed));

      if (!data.isEnclosed) {
        if (maxWindSpeed < 19) windFactor = 1.15;
        else if (maxWindSpeed < 36) windFactor = 1.25;
        else windFactor = 1.8;
      }
    }
  }

  let volumeFunda = 0;
  let areaRasa = 0;

  if (data.poolAreas && Array.isArray(data.poolAreas)) {
    data.poolAreas.forEach((area: any) => {
      const w = parseFloat(area.width) || 0;
      const l = parseFloat(area.length) || 0;
      const d = parseFloat(area.depth) || 0;
      if (d > 0.6) {
        volumeFunda += (w * l * d * 1000);
      } else if (d > 0) {
        areaRasa += (w * l);
      }
    });
  }

  const volTotalLitros = volumeFunda > 0 ? volumeFunda : (areaRasa > 0 ? 0 : 14000); // fallback
  const tempDesejada = parseFloat(data.desiredTemp || '32');
  const deltaT = tempDesejada - minTemp;

  const tempInicial = minTemp; // temperatura inicial média mais baixa do período

  // Q = m * c * deltaT * FP / 860
  // P = Q / tempo (72h)
  const qFunda = (volTotalLitros * 1 * Math.max(0, deltaT) * windFactor) / 860;
  const pFunda = qFunda / 72;

  // P = 0.06 * area * deltaT * FP
  const pRasa = 0.06 * areaRasa * Math.max(0, deltaT) * windFactor;

  const pTotal = pFunda + pRasa;

  // Equipamento sugerido
  const refPotenciaKw = 13.19; // ~ 13,188 kW
  const refConsumoKw = 1.88;
  const copNumber = 7.01;
  const numMaquinas = Math.max(1, Math.ceil(pTotal / refPotenciaKw));
  const tempoEstimado = pTotal > 0 ? Math.round((pTotal * 72) / (refPotenciaKw * numMaquinas)) : 0;
  const consumoEstimado = tempoEstimado * refConsumoKw * numMaquinas;
  const consumoMes = 8 * 30 * refConsumoKw * numMaquinas; // 8h por dia

  // DADOS CLIMÁTICOS (com gráfico)
  if (cityData && cityData.monthlyData && cityData.monthlyData.length > 0) {
    if (currentY > pageHeight - 120) { doc.addPage(); currentY = 20; }

    doc.setFontSize(14);
    doc.setTextColor(52, 73, 94);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS CLIMÁTICOS DA CIDADE', 20, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cidade selecionada: ${cityData.name} - Temperatura média mensal e ventos.`, 20, currentY);
    currentY += 6;

    // Tabela mensal
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    // const monthsBr = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const sortedData = [...cityData.monthlyData].sort((a, b) => {
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

    const labels = sortedData.map(m => {
      const idx = months.indexOf(m.month);
      return idx >= 0 ? ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][idx] : m.month;
    });
    const dataTemp = sortedData.map(m => m.temperature);
    // const dataWind = sortedData.map(m => m.windSpeed);

    const chartConfig = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Temperatura Média Inicial (°C)',
          data: dataTemp,
          backgroundColor: 'rgba(41, 128, 185, 0.7)',
          borderColor: 'rgba(41, 128, 185, 1)',
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          datalabels: { display: true, align: 'end', anchor: 'end' },
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    };

    const chartUrl = `https://quickchart.io/chart?w=500&h=250&c=${encodeURIComponent(JSON.stringify(chartConfig))}`;

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, 3000); // 3 sec timeout
        img.onload = () => {
          doc.addImage(img, 'PNG', 20, currentY, 170, 85);
          currentY += 95;
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => { clearTimeout(timeout); resolve(); };
        img.src = chartUrl;
      });
    } catch (e) {
      console.warn('Erro ao carregar grafico', e);
    }
  }

  // ============== DIMENSIONAMENTO ==============
  if (currentY > pageHeight - 60) { doc.addPage(); currentY = 20; }
  doc.setFontSize(14);
  doc.setTextColor(52, 73, 94);
  doc.setFont('helvetica', 'bold');
  doc.text('DIMENSIONAMENTO', 20, currentY);
  currentY += 8;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Considerações:', 20, currentY); currentY += 6;

  doc.setFont('helvetica', 'normal');
  const considText = `A água mais quente se encontra na superfície, maior perca de energia ocorre na lâmina de água aparente, onde temos a troca térmica com o ambiente. Por esse motivo é utilizado cálculos diferentes para borda infinita e prainha, nesses espaços é considerado cálculo por área, e nos espaços onde a profundidade é superior a 60cm é considerado cálculo por volume.
Para piscinas em ambiente aberto o fator vento precisa ser considerado, quanto maior a velocidade do vento, maior será a perda térmica para o ambiente, segue fator de perdas (FP):`;
  const splitConsid = doc.splitTextToSize(considText, pageWidth - 40);
  doc.text(splitConsid, 20, currentY);
  currentY += (splitConsid.length * 5) + 5;

  // Tabela FP
  autoTable(doc, {
    startY: currentY,
    head: [['Tipo do vento', 'Velocidade (km/h)', 'Fator de correção (FP)']],
    body: [
      ['Fraco', '7 - 18', '1,15'],
      ['Moderado', '19 - 35', '1,25'],
      ['Forte', '36 - 44', '1,8'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { left: 20, right: 20 },
  });
  currentY = ((doc as any).lastAutoTable?.finalY || currentY) + 10;

  // ===== CARGA TÉRMICA - Parte funda =====
  if (volumeFunda > 0) {
    if (currentY > pageHeight - 80) { doc.addPage(); currentY = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CARGA TÉRMICA - Parte funda', 20, currentY); currentY += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Volume: ~${volTotalLitros.toLocaleString('pt-BR')} litros`, 20, currentY); currentY += 6;

    const legendFunda = [
      'Q = Energia térmica (kW)',
      'P = Potência necessária (kW)',
      'm = Quantidade de massa (kg)',
      'c = Calor específico da água (1 cal/kg .°C)',
      'ΔT = Tpiscina − Tinicial (temperatura final - temperatura inicial média mais baixa do período)',
      'Fp = Perdas térmicas relacionadas a velocidade do vento',
      'Tempo = Tempo de aquecimento (horas)'
    ];
    legendFunda.forEach(item => {
      doc.text(item, 20, currentY); currentY += 5;
    });

    currentY += 5;
    if (currentY > pageHeight - 50) { doc.addPage(); currentY = 20; }

    doc.setFont('helvetica', 'bold');
    doc.text('Cálculo energia térmica – Considerando volume', 20, currentY); currentY += 5;

    autoTable(doc, {
      startY: currentY,
      head: [['ETAPAS', 'MEMORIAL DE CÁLCULO', 'VOLUME']],
      body: [
        [
          'Quantidade de\nenergia (kW)',
          `Q = [m × c × ΔT × Fp] / 860\nQ = [${volTotalLitros.toLocaleString('pt-BR')} × 1 × (${tempDesejada} - ${tempInicial.toFixed(1)}) × ${windFactor}] / 860`,
          `${qFunda.toFixed(2)} kW`
        ],
        [
          'Potência necessária\n(kW)',
          `P = Q / Tempo\nP = ${qFunda.toFixed(2)} / 72`,
          `${pFunda.toFixed(2)} kW`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 90 }, 2: { cellWidth: 40 } },
      margin: { left: 20 },
    });
    currentY = ((doc as any).lastAutoTable?.finalY || currentY) + 10;
  }

  // ===== CARGA TÉRMICA - Parte rasa =====
  if (areaRasa > 0) {
    if (currentY > pageHeight - 80) { doc.addPage(); currentY = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CARGA TÉRMICA – Parte rasa', 20, currentY); currentY += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Medidas: ~${areaRasa.toFixed(2).replace('.', ',')}m²`, 20, currentY); currentY += 6;

    const legendRasa = [
      'P = Potência necessária (kW)',
      '0,06 = Constante',
      'área = área da piscina m² (C x L)',
      'ΔT = Tpiscina − Tinicial (temperatura final - temperatura inicial, média mais baixa do período)',
      'Fp = Perdas térmicas relacionadas a velocidade do vento'
    ];
    legendRasa.forEach(item => {
      doc.text(item, 20, currentY); currentY += 5;
    });

    currentY += 5;
    if (currentY > pageHeight - 50) { doc.addPage(); currentY = 20; }

    doc.setFont('helvetica', 'bold');
    doc.text('Cálculo energia térmica – Considerando a área', 20, currentY); currentY += 5;

    autoTable(doc, {
      startY: currentY,
      head: [['ETAPAS', 'MEMORIAL DE CÁLCULO', 'Potência']],
      body: [
        [
          'Potência necessária\n(kW)',
          `P = 0,06 × área × ΔT × Fp\nP = 0,06 × ${areaRasa.toFixed(2).replace('.', ',')} × (${tempDesejada} - ${tempInicial.toFixed(1).replace('.', ',')}) × ${windFactor.toString().replace('.', ',')}`,
          `${pRasa.toFixed(2)} kW`
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 90 }, 2: { cellWidth: 40 } },
      margin: { left: 20 },
    });
    currentY = ((doc as any).lastAutoTable?.finalY || currentY) + 10;
  }

  // ===== QUANTIDADE DE MÁQUINAS =====
  if (currentY > pageHeight - 100) { doc.addPage(); currentY = 20; }
  doc.setFontSize(14);
  doc.setTextColor(52, 73, 94);
  doc.setFont('helvetica', 'bold');
  doc.text('QUANTIDADE DE MÁQUINAS', 20, currentY); currentY += 8;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(`Máquina de referência capacidade de aquecimento: ~ ${refPotenciaKw.toFixed(2)} kW`, 20, currentY); currentY += 5;
  doc.text(`Potência elétrica: ~ ${refConsumoKw.toFixed(2)} kW`, 20, currentY); currentY += 5;
  doc.text(`COP: ~ ${copNumber}`, 20, currentY); currentY += 5;
  doc.text(`h = Tempo de aquecimento previsto, estimativa ${tempoEstimado} horas`, 20, currentY); currentY += 5;
  doc.text(`* Temperatura ambiente 26 °C`, 20, currentY); currentY += 8;

  const memCalMaq = [
    `PTotal = ${pFunda.toFixed(2)} + ${pRasa.toFixed(2)} = ${pTotal.toFixed(2)} kW`,
    `N° = [ PTotal × 72 ÷ h ] ÷ ${refPotenciaKw.toFixed(2)}`,
    `N° = [ ${pTotal.toFixed(2)} × 72 ÷ ${tempoEstimado} ] ÷ ${refPotenciaKw.toFixed(2)} = ${numMaquinas}`,
  ];
  memCalMaq.forEach(item => {
    doc.text(item, 30, currentY); currentY += 5;
  });
  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    head: [['ETAPAS', 'MEMORIAL DE CÁLCULO', 'VOLUME']],
    body: [
      [
        'Somatório das\npotencias (kW)',
        `PTotal = ∑P`,
        `${pTotal.toFixed(2)} kW`
      ],
      [
        'Quantidade de\nmáquinas',
        `N° = (PTotal × 72 ÷ h) / Capacidade de aquecimento\nN° = [${pTotal.toFixed(2)} × 72 ÷ ${tempoEstimado}] / ${refPotenciaKw.toFixed(2)}`,
        `${numMaquinas.toFixed(1).replace('.', ',')}`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 90 }, 2: { cellWidth: 40 } },
    margin: { left: 20 },
  });
  currentY = ((doc as any).lastAutoTable?.finalY || currentY) + 10;

  // ===== ESTIMATIVA DE TEMPO E CONSUMO =====
  if (currentY > pageHeight - 80) { doc.addPage(); currentY = 20; }
  doc.setFontSize(14);
  doc.setTextColor(52, 73, 94);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTIMATIVA DE TEMPO P/ AQUECIMENTO E CONSUMO', 20, currentY); currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [['Elevação\nTemperatura (°C)', 'Capacidade de\naquecimento\n* (kW)\n(01 unidade)', 'Tempo\nEstimado\n(horas)', 'Consumo\nelétrico\nestimado(kWh)']],
    body: [
      [
        `${tempInicial.toFixed(1).replace('.', ',')} - ${tempDesejada}`,
        `${refPotenciaKw.toFixed(2).replace('.', ',')}`,
        `${tempoEstimado}`,
        `${consumoEstimado.toFixed(0)}`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 9, halign: 'center', valign: 'middle' },
    margin: { left: 20, right: 20 },
  });
  currentY = ((doc as any).lastAutoTable?.finalY || currentY) + 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`~${consumoEstimado.toFixed(0)} kWh para o primeiro aquecimento totalizando ~${tempoEstimado} horas`, 20, currentY); currentY += 5;
  doc.text(`~${(refConsumoKw * numMaquinas * 8).toFixed(0)} kW/dia considerando um funcionamento de 8 horas/dia`, 20, currentY); currentY += 5;
  doc.text(`~${consumoMes.toFixed(0)} kW/mês considerando um funcionamento de 240 horas/mês`, 20, currentY); currentY += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('*Condições de ensaio: Temperatura do ambiente: 26°C / Umidade do ar: 80% /', 20, currentY); currentY += 4;
  doc.text('Temperatura de Entrada de água: 26°C / Temperatura de saída de água: 28°C', 20, currentY); currentY += 10;

  // ===== INSERIR PRINTS DA PISCINA =====
  try {
    const prints = await Promise.all([
      import('@/assets/print1.png'),
      import('@/assets/print2.png'),
      import('@/assets/print3.png'),
      import('@/assets/print4.png')
    ]);

    for (const printModule of prints) {
      const printUrl = printModule.default;
      if (printUrl && typeof printUrl === 'string') {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise<void>((resolve) => {
          const timeout = setTimeout(resolve, 3000); // 3 sec timeout
          img.onload = () => {
            const imgWidth = 170;
            const imgHeight = (img.height * imgWidth) / img.width;

            if (currentY + imgHeight > pageHeight - 20) {
              doc.addPage();
              currentY = 20;
            }

            doc.addImage(img, 'PNG', 20, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 10;
            clearTimeout(timeout);
            resolve();
          };
          img.onerror = () => { clearTimeout(timeout); resolve(); };
          img.src = printUrl;
        });
      }
    }
  } catch (error) {
    console.warn('Erro ao carregar prints da piscina:', error);
  }

  // ===== RELAÇÃO DE EQUIPAMENTOS =====
  if (currentY > pageHeight - 60) { doc.addPage(); currentY = 20; }
  doc.setFontSize(14);
  doc.setTextColor(52, 73, 94);
  doc.setFont('helvetica', 'bold');
  doc.text('RELAÇÃO DE EQUIPAMENTOS – Sistema de aquecimento piscina', 20, currentY); currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [['Itens', 'Características']],
    body: [
      [
        `${('0' + numMaquinas).slice(-2)} Bomba de calor`,
        `Inverter\nCapacidade térmica de ${refPotenciaKw.toFixed(2)} kW\nConsumo elétrico ${refConsumoKw.toFixed(2)} kWh\nNível de ruido 60dB`
      ],
      [
        `${('0' + numMaquinas).slice(-2)} Motobomba`,
        `vazão de 4,5 m³/h\nC/ pré filtro`
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 120 } },
    margin: { left: 20 },
  });
  currentY = ((doc as any).lastAutoTable?.finalY || currentY) + 10;

  // ===== RELACAO DE SERVIÇOS =====
  if (currentY > pageHeight - 60) { doc.addPage(); currentY = 20; }
  doc.setFontSize(14);
  doc.setTextColor(52, 73, 94);
  doc.setFont('helvetica', 'bold');
  doc.text('RELAÇÃO DE SERVIÇOS – Sistema de aquecimento piscina', 20, currentY); currentY += 8;

  const servicosBody: string[][] = [];
  if (data.needsInstallation) {
    servicosBody.push([
      `01 Instalação sistema de aquecimento de\npiscina`,
      `Instalação dos equipamentos\nbomba de calor\nIncluso os materiais para instalação como\nconexões e tubos, registros`
    ]);
    servicosBody.push([
      `01 Instalação motobomba`,
      `Instalação das motobomba do sistema de aquecimento de\nágua, incluso os materiais para instalação como conexões,\ntubos, registros, válvulas`
    ]);
  }

  servicosBody.push([
    `01 Montagem\nquadro elétrico`,
    `Montagem do quadro elétrico para o sistema de\naquecimento de água, incluso os materiais para instalação\ncomo disjuntores, DRs, DPS, cabos e tomadas e\nconfiguração`
  ]);

  if (servicosBody.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Itens', 'Características']],
      body: servicosBody,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 110 } },
      margin: { left: 20 },
    });
    currentY = ((doc as any).lastAutoTable?.finalY || currentY) + 10;
  }

  // Preços removidos conforme solicitado
  doc.setFontSize(10);
  doc.setTextColor(52, 73, 94);
  doc.setFont('helvetica', 'normal');
  doc.text('Prazo de entrega: 30 dias (sujeito a disponibilidade)', 20, currentY); currentY += 6;

  const validade = new Date();
  validade.setDate(validade.getDate() + 15);
  doc.text(`Proposta válida até ${validade.toLocaleDateString('pt-BR')}.`, 20, currentY); currentY += 10;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text('*Não incluso no valor a infraestrutura, como impermeabilizações, barrilhetes de água, distribuição elétrica...', 20, currentY);

  return currentY + 10;
}

function addResidentialData(doc: jsPDF, data: any, yPosition: number, pageWidth: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = yPosition;

  // Verificar se precisa de nova página
  if (currentY > pageHeight - 80) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(52, 73, 94);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIGURAÇÕES RESIDENCIAIS', 20, currentY);
  currentY += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  // Temperatura de consumo
  if (data.consumptionTemp) {
    doc.setFont('helvetica', 'bold');
    doc.text('Temperatura de Consumo:', 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.consumptionTemp}°C`, 80, currentY);
    currentY += 10;
  }

  // Chuveiros
  if (data.shower1 || data.shower2) {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('CHUVEIROS', 20, currentY);
    currentY += 8;

    const showerData: string[][] = [];

    if (data.shower1) {
      showerData.push([
        'Chuveiro 01',
        data.shower1.flow ? `${data.shower1.flow} L/min` : '-',
        data.shower1.time ? `${data.shower1.time} min` : '-',
        data.shower1.quantity ? `${data.shower1.quantity} un` : '1 un',
      ]);
    }

    if (data.shower2) {
      showerData.push([
        'Chuveiro 02',
        data.shower2.flow ? `${data.shower2.flow} L/min` : '-',
        data.shower2.time ? `${data.shower2.time} min` : '-',
        data.shower2.quantity ? `${data.shower2.quantity} un` : '1 un',
      ]);
    }

    if (showerData.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['Chuveiro', 'Vazão', 'Tempo de Uso', 'Quantidade']],
        body: showerData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 },
      });

      currentY = ((doc as any).lastAutoTable?.finalY || currentY) + 10;
    }
  }

  // Outros pontos de consumo
  const consumptionPoints = [];
  if (data.bathroom) {
    consumptionPoints.push([
      'Torneiras Banheiro',
      data.bathroom.flow ? `${data.bathroom.flow} L/min` : '-',
      data.bathroom.time ? `${data.bathroom.time} min` : '-',
    ]);
  }
  if (data.kitchen) {
    consumptionPoints.push([
      'Cozinha',
      data.kitchen.flow ? `${data.kitchen.flow} L/min` : '-',
      data.kitchen.time ? `${data.kitchen.time} min` : '-',
      data.kitchen.quantity ? `${data.kitchen.quantity} un` : '1 un',
    ]);
  }
  if (data.laundry) {
    consumptionPoints.push([
      'Lavanderia',
      data.laundry.flow ? `${data.laundry.flow} L/min` : '-',
      data.laundry.time ? `${data.laundry.time} min` : '-',
      data.laundry.quantity ? `${data.laundry.quantity} un` : '1 un',
    ]);
  }
  if (data.bathtub) {
    consumptionPoints.push([
      'Banheira',
      data.bathtub.flow ? `${data.bathtub.flow} L` : '-',
      `Freq: ${data.bathtub.frequency || '-'}x/semana`,
    ]);
  }

  if (consumptionPoints.length > 0) {
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('OUTROS PONTOS DE CONSUMO', 20, currentY);
    currentY += 8;

    autoTable(doc, {
      startY: currentY,
      head: [['Ponto', 'Vazão/Capacidade', 'Tempo/Frequência', 'Quantidade']],
      body: consumptionPoints,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Vazão máxima simultânea
  if (data.maxSimultaneousFlow) {
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('CÁLCULOS', 20, currentY);
    currentY += 8;

    doc.setFont('helvetica', 'normal');
    doc.text(`Vazão Máxima Simultânea: ${data.maxSimultaneousFlow.toFixed(2)} L/min`, 25, currentY);
    currentY += 6;
    doc.text(`Vazão Máxima Simultânea: ${(data.maxSimultaneousFlowPerHour || data.maxSimultaneousFlow * 60).toFixed(2)} L/h`, 25, currentY);
    currentY += 10;
  }

  // Tipos de sistemas de aquecimento
  if (data.heatingTypes && Array.isArray(data.heatingTypes) && data.heatingTypes.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('SISTEMAS DE AQUECIMENTO SELECIONADOS', 20, currentY);
    currentY += 8;

    data.heatingTypes.forEach((type: string) => {
      doc.setFont('helvetica', 'normal');
      doc.text(`• ${type}`, 25, currentY);
      currentY += 6;
    });

    // Aquecedor a Gás
    if (data.gasHeater) {
      currentY += 5;
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('Aquecedor a Gás:', 25, currentY);
      currentY += 8;

      doc.setFont('helvetica', 'normal');
      if (data.gasHeater.model) {
        doc.text(`Modelo: ${data.gasHeater.model}`, 30, currentY);
        currentY += 6;
      }
      if (data.gasHeater.quantity) {
        doc.text(`Quantidade: ${data.gasHeater.quantity}`, 30, currentY);
        currentY += 6;
      }
      if (data.gasHeater.calculatedPower) {
        doc.text(`Potência Calculada: ${data.gasHeater.calculatedPower.toFixed(2)} kcal/h`, 30, currentY);
        currentY += 6;
      }
      if (data.gasHeater.cascadeSystem) {
        doc.text('Sistema Cascata: Sim', 30, currentY);
        currentY += 6;
      }
    }

    // Coletor Solar
    if (data.solarCollector) {
      currentY += 5;
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('Coletor Solar:', 25, currentY);
      currentY += 8;

      doc.setFont('helvetica', 'normal');
      if (data.solarCollector.model) {
        doc.text(`Modelo: ${data.solarCollector.model}`, 30, currentY);
        currentY += 6;
      }
      if (data.solarCollector.quantity) {
        doc.text(`Quantidade: ${data.solarCollector.quantity}`, 30, currentY);
        currentY += 6;
      }
      if (data.solarCollector.calculatedRequiredArea) {
        doc.text(`Área Necessária: ${data.solarCollector.calculatedRequiredArea.toFixed(2)} m²`, 30, currentY);
        currentY += 6;
      }
      if (data.solarCollector.inclination) {
        doc.text(`Inclinação: ${data.solarCollector.inclination}°`, 30, currentY);
        currentY += 6;
      }
      if (data.solarCollector.orientation) {
        doc.text(`Orientação: ${data.solarCollector.orientation}°`, 30, currentY);
        currentY += 6;
      }
    }

    // Equipamentos selecionados
    if (data.selectedEquipments && Object.keys(data.selectedEquipments).length > 0) {
      currentY += 5;
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('Equipamentos Selecionados:', 25, currentY);
      currentY += 8;

      Object.entries(data.selectedEquipments).forEach(([type, equipments]: [string, any]) => {
        if (Array.isArray(equipments) && equipments.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text(`${type}:`, 30, currentY);
          currentY += 6;
          equipments.forEach((equipment: string) => {
            doc.setFont('helvetica', 'normal');
            doc.text(`  • ${equipment}`, 35, currentY);
            currentY += 6;
          });
        }
      });
    }
  }

  // Sistemas adicionais
  const additionalSystems = [];
  if (data.networkCirculation?.enabled) {
    additionalSystems.push(`Sistema de Circulação de Rede${data.networkCirculation.quantity ? ` (${data.networkCirculation.quantity} un)` : ''}`);
  }
  if (data.pressurizationSystem?.enabled) {
    additionalSystems.push('Sistema de Pressurização');
  }
  if (data.lajeStructure) {
    additionalSystems.push('Estrutura para Laje');
  }

  if (additionalSystems.length > 0) {
    currentY += 5;
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('SISTEMAS ADICIONAIS', 20, currentY);
    currentY += 8;

    additionalSystems.forEach((system) => {
      doc.setFont('helvetica', 'normal');
      doc.text(`• ${system}`, 25, currentY);
      currentY += 6;
    });
  }

  // Serviços
  currentY += 5;
  if (currentY > pageHeight - 30) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('SERVIÇOS', 20, currentY);
  currentY += 8;

  if (data.needsInstallation) {
    doc.setFont('helvetica', 'normal');
    doc.text('[X] Servico de Instalacao', 25, currentY);
    currentY += 6;
  }

  if (data.needsProject) {
    doc.setFont('helvetica', 'normal');
    doc.text('[X] Projeto', 25, currentY);
    currentY += 6;
  }

  return currentY;
}

