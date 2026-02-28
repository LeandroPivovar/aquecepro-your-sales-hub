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
    yPosition = addPoolData(doc, proposal.data, yPosition, pageWidth, cityData);
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

function addPoolData(doc: jsPDF, data: any, yPosition: number, pageWidth: number, cityData?: City): number {
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

  // Q = m * c * deltaT * FP / 860
  // P = Q / tempo (72h)
  const qFunda = (volTotalLitros * 1 * Math.max(0, deltaT) * windFactor) / 860;
  const pFunda = qFunda / 72;

  // P = 0.06 * area * deltaT * FP
  const pRasa = 0.06 * areaRasa * Math.max(0, deltaT) * windFactor;

  const pTotal = pFunda + pRasa;

  // Equipamento sugerido
  const refPotenciaKw = 13.19;
  const refConsumoKw = 1.88;
  const numMaquinas = Math.max(1, Math.ceil(pTotal / refPotenciaKw));
  const tempoEstimado = pTotal > 0 ? Math.round((pTotal * 72) / (refPotenciaKw * numMaquinas)) : 0;
  const consumoEstimado = tempoEstimado * refConsumoKw * numMaquinas;
  const consumoMes = 8 * 30 * refConsumoKw * numMaquinas; // 8h por dia

  if (currentY > pageHeight - 60) { doc.addPage(); currentY = 20; }
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CÁLCULOS E POTÊNCIA', 20, currentY);
  currentY += 10;
  doc.setFontSize(10);

  doc.setFont('helvetica', 'normal');
  doc.text(`Menor temp. média para período: ${minTemp.toFixed(1)}°C`, 20, currentY); currentY += 6;
  doc.text(`Velocidade máx. do vento: ${maxWindSpeed} km/h (FP: ${windFactor})`, 20, currentY); currentY += 6;
  if (volTotalLitros > 0) { doc.text(`Volume Parte Funda: ~${volTotalLitros.toLocaleString('pt-BR')} litros -> Potência: ${pFunda.toFixed(2)} kW`, 20, currentY); currentY += 6; }
  if (areaRasa > 0) { doc.text(`Área Parte Rasa/Prainha: ~${areaRasa.toFixed(2)} m² -> Potência: ${pRasa.toFixed(2)} kW`, 20, currentY); currentY += 6; }

  doc.setFont('helvetica', 'bold');
  doc.text(`Potência Mínima Necessária: ${pTotal.toFixed(2)} kW`, 20, currentY);
  currentY += 10;

  if (currentY > pageHeight - 60) { doc.addPage(); currentY = 20; }
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EQUIPAMENTOS SELECIONADOS', 20, currentY);
  currentY += 8;
  doc.setFontSize(10);

  doc.setFont('helvetica', 'normal');
  doc.text(`• ${numMaquinas}x Bomba de Calor Inverter`, 25, currentY); currentY += 6;
  doc.text(`  (Capac. térmica: ${refPotenciaKw.toFixed(2)} kW, Consumo elétrico: ${refConsumoKw.toFixed(2)} kWh) `, 25, currentY); currentY += 6;
  doc.text(`• ${numMaquinas}x Motobomba (vazão ref. 4,5 m³/h com pré filtro)`, 25, currentY); currentY += 8;

  if (currentY > pageHeight - 60) { doc.addPage(); currentY = 20; }
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTIMATIVA DE AQUECIMENTO E CONSUMO', 20, currentY);
  currentY += 10;
  doc.setFontSize(10);

  autoTable(doc, {
    startY: currentY,
    head: [['Elevação Temp.', 'Capac. Aquecimento', 'Tempo Estimado', 'Consumo 1º Aq.']],
    body: [
      [`${minTemp.toFixed(1)}°C - ${tempDesejada}°C`, `${(refPotenciaKw * numMaquinas).toFixed(2)} kW`, `~${tempoEstimado} horas`, `~${consumoEstimado.toFixed(0)} kWh`]
    ],
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { left: 20, right: 20 },
  });
  currentY = ((doc as any).lastAutoTable?.finalY || currentY) + 10;

  doc.setFont('helvetica', 'normal');
  doc.text(`Consumo Mensal Estimado: ~${consumoMes.toFixed(0)} kWh/mês (considerando 8 horas/dia)`, 20, currentY);
  currentY += 15;

  // Serviços de instalação e projeto e valores
  if (currentY > pageHeight - 60) { doc.addPage(); currentY = 20; }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVIÇOS', 20, currentY);
  currentY += 8;
  doc.setFontSize(10);

  if (data.needsInstallation) {
    doc.setFont('helvetica', 'normal');
    doc.text('[X] Instalação do sistema de aquecimento de piscina', 25, currentY);
    currentY += 6;
    doc.text('    Instalação dos equipamentos bomba de calor e motobomba.', 25, currentY); currentY += 6;
    doc.text('    Incluso materiais (conexões, tubos, registros, quadros elétricos).', 25, currentY);
    currentY += 8;
  }

  if (data.needsProject) {
    doc.setFont('helvetica', 'normal');
    doc.text('[X] Projeto', 25, currentY);
    currentY += 6;
  }

  currentY += 10;
  if (currentY > pageHeight - 60) { doc.addPage(); currentY = 20; }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INVESTIMENTO E CONDIÇÕES', 20, currentY);
  currentY += 8;
  doc.setFontSize(10);

  // Valor simulado baseado nos equipamentos (exemplo)
  const valorMaquinas = numMaquinas * 20000;
  const valorServicos = (data.needsInstallation ? 2000 : 0) + (data.needsProject ? 1000 : 0);
  const valorTotal = valorMaquinas + valorServicos;

  doc.setFont('helvetica', 'bold');
  doc.text(`Valor total: R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, currentY); currentY += 8;

  doc.setFont('helvetica', 'normal');
  doc.text('Pagamento pix/boleto', 20, currentY); currentY += 6;
  doc.text(`Ou 12x R$ ${(valorTotal / 10).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no cartão de crédito.`, 20, currentY); currentY += 10;

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

