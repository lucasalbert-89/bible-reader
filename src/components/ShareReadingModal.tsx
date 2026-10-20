import React, { useState } from 'react';
import { DayReading, PlanId } from '../types';
import { getDayInfo } from '../lib/dateUtils';
import { 
  X, 
  Share2, 
  Check, 
  Download, 
  MessageCircle, 
  Copy, 
  ShieldCheck, 
  Sparkles,
  Quote,
  BookOpen
} from 'lucide-react';

interface ShareReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reading: DayReading | null;
  planId: PlanId;
  planTitle: string;
}

export const ShareReadingModal: React.FC<ShareReadingModalProps> = ({
  isOpen,
  onClose,
  reading,
  planId,
  planTitle,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  if (!isOpen || !reading) return null;

  const dayInfo = getDayInfo(planId, reading.day);

  // Formatted message for WhatsApp and clipboard
  const getShareText = () => {
    const segmentsText = reading.segments
      .map(s => `• *${s.title}:* ${s.chapters}`)
      .join('\n');

    const solaText = reading.sola ? `\n🏷️ _${reading.sola}_\n` : '';
    const citeText = reading.authorOrCatechism ? `\n📜 _"${reading.authorOrCatechism}"_\n` : '';

    return (
      `✝️ *LEITURA BÍBLICA DIÁRIA CONCLUÍDA!*\n` +
      `📅 *${dayInfo.fullLabel}*\n` +
      `📖 Plano: _${planTitle}_\n\n` +
      `*Leituras de Hoje:*\n${segmentsText}\n\n` +
      `💬 *Versículo do Dia:*\n"${reading.verse}"\n— *${reading.reference}*\n` +
      solaText +
      citeText +
      `\n🛡️ *Soli Deo Gloria • A Aliança das Escrituras*\n` +
      `🔗 Acesse e leia: ${window.location.origin}`
    );
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Leitura Bíblica Concluída - ${dayInfo.fullLabel}`,
          text: getShareText(),
          url: window.location.origin,
        });
      } catch {
        // User cancelled or not supported
      }
    } else {
      handleCopyText();
    }
  };

  // Helper function to split text into wrapped lines for Canvas
  const getWrappedLines = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = ctx.measureText(testLine).width;
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  };

  // Generate and download an image for Stories / Status
  const handleDownloadImage = () => {
    setIsGeneratingImage(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1440; // Optimal 3:4 aspect ratio
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Reset letterSpacing to 0px explicitly
      ctx.letterSpacing = '0px';

      // 1. Background Gradient (Deep Reformed Navy)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#070B14');
      bgGrad.addColorStop(0.5, '#0D1527');
      bgGrad.addColorStop(1, '#16233F');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Subtle Background Radiance
      const radGrad = ctx.createRadialGradient(
        canvas.width / 2, 450, 50,
        canvas.width / 2, 450, 600
      );
      radGrad.addColorStop(0, 'rgba(217, 119, 6, 0.12)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 3. Ornate Golden Outer Border
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      // Inner thin border
      ctx.strokeStyle = 'rgba(233, 206, 135, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);

      // Corner Accents
      const drawCorner = (x: number, y: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.strokeStyle = '#E5BD55';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.lineTo(0, 0);
        ctx.lineTo(30, 0);
        ctx.stroke();
        ctx.restore();
      };
      drawCorner(65, 65, 0);
      drawCorner(canvas.width - 65, 65, Math.PI / 2);
      drawCorner(canvas.width - 65, canvas.height - 65, Math.PI);
      drawCorner(65, canvas.height - 65, -Math.PI / 2);

      // 4. Header: Crest & Solas
      ctx.fillStyle = '#E5BD55';
      ctx.font = 'bold 20px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '5px';
      ctx.fillText('SOLA SCRIPTURA • SOLI DEO GLORIA', canvas.width / 2, 125);

      // Subtitle
      ctx.letterSpacing = '1px';
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'italic 21px "Georgia", serif';
      ctx.fillText('A Aliança das Escrituras', canvas.width / 2, 168);

      // 5. Celebration Badge Box
      const badgeY = 225;
      ctx.letterSpacing = '0px';
      ctx.fillStyle = 'rgba(217, 119, 6, 0.18)';
      ctx.beginPath();
      ctx.roundRect((canvas.width - 540) / 2, badgeY, 540, 56, 28);
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FDF2DD';
      ctx.font = 'bold 21px "Inter", sans-serif';
      ctx.letterSpacing = '2.5px';
      ctx.fillText('✦ LEITURA DIÁRIA CONCLUÍDA ✦', canvas.width / 2, badgeY + 36);

      // 6. Date Title
      ctx.letterSpacing = '0px';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 42px "Georgia", serif';
      ctx.fillText(dayInfo.formattedDate.toUpperCase(), canvas.width / 2, 350);

      // Plan Subtitle
      ctx.fillStyle = '#E5BD55';
      ctx.font = 'bold 22px "Inter", sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText(`DIA ${dayInfo.globalDay} DE ${dayInfo.totalDays} • ${planTitle.toUpperCase()}`, canvas.width / 2, 395);

      // Decorative divider
      ctx.strokeStyle = 'rgba(229, 189, 85, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 100, 430);
      ctx.lineTo(canvas.width / 2 + 100, 430);
      ctx.stroke();

      // 7. Segments Box (Dynamic Height to avoid empty space)
      ctx.letterSpacing = '0px';
      const segBoxY = 460;
      const visibleSegments = reading.segments.slice(0, 3);
      const segItemHeight = 40;
      const segBoxHeight = 55 + (visibleSegments.length * segItemHeight) + 15;

      ctx.fillStyle = 'rgba(13, 21, 39, 0.75)';
      ctx.beginPath();
      ctx.roundRect(100, segBoxY, canvas.width - 200, segBoxHeight, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(229, 189, 85, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#E5BD55';
      ctx.font = 'bold 17px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.letterSpacing = '2.5px';
      ctx.fillText('SAGRADAS ESCRITURAS LIDAS HOJE:', 140, segBoxY + 38);

      // Draw each segment item with guaranteed spacing between title and chapters
      ctx.letterSpacing = '0px';
      let segY = segBoxY + 76;
      visibleSegments.forEach((seg) => {
        const titleText = `• ${seg.title}:`;
        
        // 1. Measure title width in bold Georgia
        ctx.font = 'bold 22px "Georgia", serif';
        const titleWidth = ctx.measureText(titleText).width;

        // 2. Draw title in gold
        ctx.fillStyle = '#E5BD55';
        ctx.fillText(titleText, 140, segY);

        // 3. Draw chapters in clean white with comfortable 14px gap
        ctx.font = '22px "Georgia", serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(seg.chapters, 140 + titleWidth + 14, segY);

        segY += segItemHeight;
      });

      // 8. Dynamic Verse & Reflection Box (Auto-sized to fit text 100% inside)
      const verseBoxY = segBoxY + segBoxHeight + 24;

      // Pre-calculate wrapped lines
      ctx.font = 'italic 28px "Georgia", serif';
      const verseLines = getWrappedLines(ctx, `"${reading.verse}"`, canvas.width - 320);
      const verseLineHeight = 42;

      let catechismLines: string[] = [];
      const catechismLineHeight = 28;
      if (reading.authorOrCatechism) {
        ctx.font = 'italic 19px "Georgia", serif';
        catechismLines = getWrappedLines(ctx, `📜 ${reading.authorOrCatechism}`, canvas.width - 320);
      }

      // Calculate exact required box height
      const padTop = 28;
      const quoteHeight = 26;
      const verseTotalHeight = verseLines.length * verseLineHeight;
      const refGap = 20;
      const refHeight = 28;
      const catechismGap = catechismLines.length > 0 ? 26 : 0;
      const catechismDividerHeight = catechismLines.length > 0 ? 12 : 0;
      const catechismTotalHeight = catechismLines.length * catechismLineHeight;
      const padBottom = 34;

      const verseBoxHeight = padTop + quoteHeight + verseTotalHeight + refGap + refHeight + catechismGap + catechismDividerHeight + catechismTotalHeight + padBottom;

      // Draw Verse Card Background
      ctx.fillStyle = 'rgba(7, 11, 20, 0.88)';
      ctx.beginPath();
      ctx.roundRect(100, verseBoxY, canvas.width - 200, verseBoxHeight, 22);
      ctx.fill();

      ctx.strokeStyle = 'rgba(229, 189, 85, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Golden vertical left accent bar
      ctx.fillStyle = '#D97706';
      ctx.fillRect(100, verseBoxY + 20, 8, verseBoxHeight - 40);

      // Quote icon mark
      let cursorY = verseBoxY + padTop + quoteHeight;
      ctx.fillStyle = 'rgba(229, 189, 85, 0.3)';
      ctx.font = '65px "Georgia", serif';
      ctx.textAlign = 'left';
      ctx.fillText('“', 140, cursorY);

      // Draw Verse Lines (centered, fully spaced)
      cursorY += 12;
      ctx.fillStyle = '#FDF9EF';
      ctx.font = 'italic 28px "Georgia", serif';
      ctx.textAlign = 'center';
      for (const line of verseLines) {
        ctx.fillText(line, canvas.width / 2, cursorY);
        cursorY += verseLineHeight;
      }

      // Draw Reference
      cursorY += refGap;
      ctx.fillStyle = '#E5BD55';
      ctx.font = 'bold 23px "Inter", sans-serif';
      ctx.textAlign = 'right';
      ctx.letterSpacing = '1px';
      ctx.fillText(`— ${reading.reference}`, canvas.width - 150, cursorY);

      // Draw Catechism / Reformer Quote (safely inside the card)
      if (catechismLines.length > 0) {
        cursorY += catechismGap;

        // Subtle divider inside the box
        ctx.strokeStyle = 'rgba(229, 189, 85, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 120, cursorY - 14);
        ctx.lineTo(canvas.width / 2 + 120, cursorY - 14);
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = 'italic 19px "Georgia", serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '0px';
        for (const line of catechismLines) {
          ctx.fillText(line, canvas.width / 2, cursorY);
          cursorY += catechismLineHeight;
        }
      }

      // 9. Footer (Solemn Reformed Seal)
      ctx.fillStyle = '#E5BD55';
      ctx.font = 'bold 20px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '5px';
      ctx.fillText('POST TENEBRAS LUX • SOLI DEO GLORIA', canvas.width / 2, canvas.height - 110);

      ctx.fillStyle = '#64748B';
      ctx.font = '17px "Inter", sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('A Aliança das Escrituras • Leitura Bíblica Diária', canvas.width / 2, canvas.height - 75);

      // 10. Trigger Download
      const link = document.createElement('a');
      link.download = `leitura-biblica-${dayInfo.formattedDate.replace(/\s+/g, '-').toLowerCase()}-dia-${reading.day}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-backdrop-enter"
      onClick={onClose}
    >
      <div 
        className="bg-parchment-50 dark:bg-reformedNavy-900 rounded-3xl w-full max-w-lg shadow-2xl border border-reformedGold-300/70 dark:border-reformedGold-600/40 max-h-[92dvh] flex flex-col overflow-hidden animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-reformedGold-200/60 dark:border-reformedNavy-800 flex justify-between items-center bg-white/70 dark:bg-reformedNavy-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-reformedGold-100 dark:bg-reformedNavy-800 flex items-center justify-center text-reformedGold-600 dark:text-reformedGold-400 border border-reformedGold-300/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-reformedGold-600 dark:text-reformedGold-400 tracking-widest block font-sans">
                Meta Cumprida
              </span>
              <h4 className="display-title text-base sm:text-lg font-bold text-slate-900 dark:text-reformedGold-100">
                Compartilhar Leitura Diária
              </h4>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 rounded-xl hover:bg-slate-200/60 dark:hover:bg-reformedNavy-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors flex items-center justify-center active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Preview Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Visual Share Card Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-reformedNavy-900 via-reformedNavy-950 to-reformedNavy-900 border-2 border-reformedGold-500/60 text-white shadow-xl relative overflow-hidden space-y-4">
            
            {/* Top Solas Badge */}
            <div className="text-center">
              <span className="inline-block text-[10px] sm:text-[11px] font-bold text-reformedGold-300 tracking-[0.25em] uppercase font-sans border-b border-reformedGold-500/30 pb-1">
                A Aliança das Escrituras
              </span>
            </div>

            {/* Victory Badge */}
            <div className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-full bg-reformedGold-500/20 border border-reformedGold-400/50 text-reformedGold-200 text-xs font-bold uppercase tracking-wider mx-auto w-fit">
              <ShieldCheck className="w-4 h-4 text-reformedGold-400" />
              <span>Leitura Diária Concluída!</span>
            </div>

            {/* Date Title */}
            <div className="text-center space-y-0.5">
              <h3 className="display-title text-xl sm:text-2xl font-black text-white tracking-wide">
                {dayInfo.formattedDate}
              </h3>
              <p className="text-xs text-reformedGold-300 font-sans uppercase font-bold tracking-wider">
                Dia {dayInfo.globalDay} de {dayInfo.totalDays} • {planTitle}
              </p>
            </div>

            {/* Segments Read */}
            <div className="p-3.5 rounded-xl bg-reformedNavy-950/80 border border-reformedGold-500/30 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase text-reformedGold-400 tracking-wider block font-sans">
                Porção Bíblica Meditada:
              </span>
              {reading.segments.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-200 font-serif">
                  <BookOpen className="w-3.5 h-3.5 text-reformedGold-500 shrink-0" />
                  <span className="font-bold text-reformedGold-300">{s.title}:</span>
                  <span className="text-white font-sans text-xs">{s.chapters}</span>
                </div>
              ))}
            </div>

            {/* Featured Verse */}
            <div className="p-4 rounded-xl bg-reformedNavy-950/90 border-l-4 border-reformedGold-500 space-y-2">
              <Quote className="w-5 h-5 text-reformedGold-400/50" />
              <p className="bible-text text-sm sm:text-base italic text-reformedGold-100 leading-relaxed">
                "{reading.verse}"
              </p>
              <p className="text-right text-xs font-bold text-reformedGold-400 font-sans uppercase">
                — {reading.reference}
              </p>

              {reading.authorOrCatechism && (
                <div className="mt-2.5 pt-2.5 border-t border-reformedGold-500/20 text-center text-xs text-slate-400 italic font-serif">
                  📜 {reading.authorOrCatechism}
                </div>
              )}
            </div>

            {/* Reformed Footer Stamp */}
            <div className="text-center pt-1 border-t border-reformedGold-500/20 text-[10px] font-bold text-reformedGold-400 tracking-widest uppercase font-sans">
              Post Tenebras Lux • Soli Deo Gloria
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            
            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareWhatsApp}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Compartilhar no WhatsApp</span>
            </button>

            {/* Copy Text Button */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleCopyText}
                className="py-3 px-3 rounded-2xl bg-white dark:bg-reformedNavy-800 hover:bg-parchment-100 dark:hover:bg-reformedNavy-700 text-slate-800 dark:text-reformedGold-200 font-bold text-xs border border-reformedGold-300/50 dark:border-reformedNavy-700 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Texto Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Texto</span>
                  </>
                )}
              </button>

              {/* Download Image Button */}
              <button
                onClick={handleDownloadImage}
                disabled={isGeneratingImage}
                className="py-3 px-3 rounded-2xl bg-reformedGold-600 hover:bg-reformedGold-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingImage ? 'Gerando...' : 'Baixar Imagem'}</span>
              </button>
            </div>

            {/* Mobile Native Share Sheet (if supported) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-parchment-100 dark:hover:bg-reformedNavy-800 text-slate-600 dark:text-slate-400 font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-reformedGold-500" />
                <span>Outros Aplicativos (Compartilhar Nativo)</span>
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
