import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Proposal } from '@/lib/api';

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
  
  const clientInfo = [
    ['Nome:', proposal.clientName || proposal.clientId || 'Não informado'],
    ['Telefone:', proposal.clientPhone || 'Não informado'],
    ['Cidade:', proposal.city || 'Não informada'],
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
    yPosition = addPoolData(doc, proposal.data, yPosition, pageWidth);
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

function addPoolData(doc: jsPDF, data: any, yPosition: number, pageWidth: number): number {
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

  if (data.isEnclosed !== undefined) {
    poolInfo.push(['Ambiente Fechado:', data.isEnclosed ? 'Sim' : 'Não']);
  }

  if (data.isSuspended !== undefined) {
    poolInfo.push(['Piscina Suspensa:', data.isSuspended ? 'Sim' : 'Não']);
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

  // Áreas da piscina
  if (data.poolAreas && Array.isArray(data.poolAreas) && data.poolAreas.length > 0) {
    currentY += 5;
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Áreas da Piscina:', 20, currentY);
    currentY += 8;

    const areasData = data.poolAreas.map((area: any, index: number) => [
      `Área ${index + 1}`,
      area.length ? `${area.length}m` : '-',
      area.width ? `${area.width}m` : '-',
      area.depth ? `${area.depth}m` : '-',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Área', 'Comprimento', 'Largura', 'Profundidade']],
      body: areasData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 },
    });

    currentY = ((doc as any).lastAutoTable?.finalY || currentY) + 10;
  }

  // Serviços adicionais
  if (data.additionalServices) {
    currentY += 5;
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Serviços Adicionais:', 20, currentY);
    currentY += 8;

    const services = [];
    if (data.additionalServices.filtrationSystem) services.push('Sistema de Filtração');
    if (data.additionalServices.lighting) services.push('Iluminação');
    if (data.additionalServices.ozone) services.push('Ozônio');
    if (data.additionalServices.chlorineGenerator) services.push('Gerador de Cloro');
    if (data.additionalServices.waterfall) services.push('Cascata');

    if (services.length > 0) {
      services.forEach((service) => {
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${service}`, 25, currentY);
        currentY += 6;
      });
    } else {
      doc.setFont('helvetica', 'normal');
      doc.text('Nenhum serviço adicional selecionado', 25, currentY);
      currentY += 6;
    }
  }

  // Serviços de instalação e projeto
  currentY += 5;
  if (currentY > pageHeight - 30) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.text('Serviços:', 20, currentY);
  currentY += 8;

  if (data.needsInstallation) {
    doc.setFont('helvetica', 'normal');
    doc.text('✓ Serviço de Instalação', 25, currentY);
    currentY += 6;
  }

  if (data.needsProject) {
    doc.setFont('helvetica', 'normal');
    doc.text('✓ Projeto', 25, currentY);
    currentY += 6;
  }

  return currentY;
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
    doc.text('✓ Serviço de Instalação', 25, currentY);
    currentY += 6;
  }

  if (data.needsProject) {
    doc.setFont('helvetica', 'normal');
    doc.text('✓ Projeto', 25, currentY);
    currentY += 6;
  }

  return currentY;
}

