import React, { useState, useRef, useEffect } from 'react';
import QRCodeStyling, {
  Options,
  DrawType,
  TypeNumber,
  Mode,
  ErrorCorrectionLevel,
  DotType,
  CornerSquareType,
  CornerDotType
} from 'qr-code-styling';
import { 
  Download, 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Type, 
  Settings2, 
  Palette, 
  Layout, 
  FileJson,
  FileImage,
  Printer,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

// --- Types ---
type CornerType = CornerSquareType;
type MyDotType = DotType;
type MyCornerDotType = CornerDotType;

interface QRState {
  data: string;
  dotsColor: string;
  dotsColor2: string; // For gradients
  useGradient: boolean;
  backgroundColor: string;
  dotsType: MyDotType;
  cornersColor: string;
  cornersType: CornerType;
  cornersDotColor: string;
  cornersDotType: MyCornerDotType;
  logo: string | null;
  errorCorrectionLevel: ErrorCorrectionLevel;
}

const PRESETS = [
  {
    name: 'Classic Black',
    dots: '#000000',
    bg: '#ffffff',
    dotsType: 'square' as MyDotType,
    corners: 'square' as CornerType,
  },
  {
    name: 'Cyber Neon',
    dots: '#00FF41',
    dots2: '#008F11',
    useGradient: true,
    bg: '#0D0208',
    dotsType: 'dots' as MyDotType,
    corners: 'extra-rounded' as CornerType,
  },
  {
    name: 'Sunset Glow',
    dots: '#FF512F',
    dots2: '#DD2476',
    useGradient: true,
    bg: '#ffffff',
    dotsType: 'classy-rounded' as MyDotType,
    corners: 'extra-rounded' as CornerType,
  },
  {
    name: 'Royal Blue',
    dots: '#000046',
    dots2: '#1CB5E0',
    useGradient: true,
    bg: '#ffffff',
    dotsType: 'rounded' as MyDotType,
    corners: 'rounded' as CornerType,
  }
];

export default function App() {
  const [qrState, setQrState] = useState<QRState>({
    data: 'https://canada.ca/',
    dotsColor: '#000000',
    dotsColor2: '#4facfe',
    useGradient: false,
    backgroundColor: '#ffffff',
    dotsType: 'rounded',
    cornersColor: '#000000',
    cornersType: 'extra-rounded',
    cornersDotColor: '#000000',
    cornersDotType: 'dot',
    logo: null,
    errorCorrectionLevel: 'Q',
  });

  const [poster, setPoster] = useState<PosterState>({
    text: 'Your Text here',
    show: true,
    theme: 'dark',
    customBg: '#000000',
    customText: '#ffffff',
  });

  const [posterGradient, setPosterGradient] = useState({
    color1: '#EFEFEF',
    color2: '#EFEFEF',
    useGradient: false
  });

  const qrRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  // Initialize QR instance
  useEffect(() => {
    qrInstanceRef.current = new QRCodeStyling(getQrOptions(qrState));
    if (qrRef.current) {
      qrInstanceRef.current.append(qrRef.current);
    }
    return () => {
      if (qrRef.current) qrRef.current.innerHTML = '';
    };
  }, []);

  // Update QR instance when state changes
  useEffect(() => {
    if (qrInstanceRef.current) {
      qrInstanceRef.current.update(getQrOptions(qrState));
    }
  }, [qrState]);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setQrState(prev => ({
      ...prev,
      dotsColor: preset.dots,
      dotsColor2: (preset as any).dots2 || prev.dotsColor2,
      useGradient: (preset as any).useGradient || false,
      backgroundColor: preset.bg,
      dotsType: preset.dotsType,
      cornersType: preset.corners,
      cornersColor: preset.dots,
      cornersDotColor: preset.dots,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQrState(prev => ({ 
          ...prev, 
          logo: e.target?.result as string,
          errorCorrectionLevel: 'H' // Default to high error correction when logo is present
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadFile = async (format: 'png' | 'svg' | 'pdf') => {
    if (!posterRef.current || !qrInstanceRef.current) return;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (format === 'png') {
       const dataUrl = await toPng(posterRef.current, { quality: 1.0, pixelRatio: 2 });
       const link = document.createElement('a');
       link.download = `fancy-qr-${Date.now()}.png`;
       link.href = dataUrl;
       link.click();
    } else if (format === 'svg') {
       const dataUrl = await toSvg(posterRef.current);
       const link = document.createElement('a');
       link.download = `fancy-qr-${Date.now()}.svg`;
       link.href = dataUrl;
       link.click();
    } else if (format === 'pdf') {
       const dataUrl = await toPng(posterRef.current, { quality: 1.0, pixelRatio: 2 });
       const pdf = new jsPDF();
       const imgProps = pdf.getImageProperties(dataUrl);
       const pdfWidth = pdf.internal.pageSize.getWidth();
       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
       pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
       pdf.save(`fancy-qr-${Date.now()}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Header */}
      <header className="border-b border-[#E5E5E5] px-6 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Fancy QR Studio</h1>
              <p className="text-[10px] text-[#808080] font-medium tracking-[0.2em] uppercase">Premium Generator</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <span className="text-[#808080] cursor-not-allowed">Templates</span>
            <span className="text-[#808080] cursor-not-allowed">Analytics</span>
            <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-[#1A1A1A] transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Import Config</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Control Panel */}
        <div className="lg:col-span-5 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#808080]">
              <Settings2 className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-widest">1. Content</h2>
            </div>
            <div className="relative group">
              <input
                type="text"
                value={qrState.data}
                onChange={(e) => setQrState(prev => ({ ...prev, data: e.target.value }))}
                placeholder="https://canada.ca/"
                className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
              />
              <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="p-1 hover:bg-[#F5F5F5] rounded text-[#808080]">
                    <Info className="w-3 h-3" />
                 </button>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-2 text-[#808080]">
              <Palette className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-widest">2. Appearance</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Dots Color</label>
                <div className="flex items-center gap-2 p-2 bg-white border border-[#E5E5E5] rounded-lg">
                  <input 
                    type="color" 
                    value={qrState.dotsColor} 
                    onChange={(e) => setQrState(prev => ({ ...prev, dotsColor: e.target.value }))}
                    className="w-6 h-6 rounded-md cursor-pointer border-none bg-transparent" 
                  />
                  <span className="text-xs font-mono uppercase text-[#808080]">{qrState.dotsColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Background</label>
                <div className="flex items-center gap-2 p-2 bg-white border border-[#E5E5E5] rounded-lg">
                  <input 
                    type="color" 
                    value={qrState.backgroundColor} 
                    onChange={(e) => setQrState(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-6 h-6 rounded-md cursor-pointer border-none bg-transparent" 
                  />
                  <span className="text-xs font-mono uppercase text-[#808080]">{qrState.backgroundColor}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Dots Pattern</label>
              <div className="grid grid-cols-3 gap-2">
                {(['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'] as MyDotType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setQrState(prev => ({ ...prev, dotsType: type }))}
                    className={`px-3 py-2 text-[10px] font-bold rounded-lg border transition-all ${
                      qrState.dotsType === type 
                        ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                        : 'bg-white text-[#808080] border-[#E5E5E5] hover:border-black'
                    }`}
                  >
                    {type.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Corner Style</label>
                <button 
                  onClick={() => {
                    const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                    setQrState(prev => ({ 
                      ...prev, 
                      dotsColor: randomColor(), 
                      backgroundColor: '#ffffff',
                      cornersColor: randomColor(),
                      cornersDotColor: randomColor()
                    }));
                  }}
                  className="text-[9px] font-bold text-orange-500 hover:text-orange-600 transition-colors uppercase tracking-wider flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Randomize Colors
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['square', 'dot', 'extra-rounded'] as (CornerType | MyCornerDotType)[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setQrState(prev => ({ ...prev, cornersType: type as CornerType, cornersDotType: type as MyCornerDotType }))}
                    className={`px-3 py-2 text-[10px] font-bold rounded-lg border transition-all ${
                      qrState.cornersType === type 
                        ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                        : 'bg-white text-[#808080] border-[#E5E5E5] hover:border-black'
                    }`}
                  >
                    {type.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-[#808080]">
              <ImageIcon className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-widest">3. Logo</h2>
            </div>
            <div className="flex items-center gap-4">
               {qrState.logo ? (
                 <div className="relative group">
                   <img src={qrState.logo} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-[#E5E5E5]" />
                   <button 
                     onClick={() => setQrState(prev => ({ ...prev, logo: null }))}
                     className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                   </button>
                 </div>
               ) : (
                 <label className="w-16 h-16 rounded-xl border-2 border-dashed border-[#E5E5E5] flex flex-col items-center justify-center cursor-pointer hover:border-[#1A1A1A] transition-all bg-white group">
                    <Upload className="w-4 h-4 text-[#808080] group-hover:text-black transition-colors" />
                    <span className="text-[8px] font-bold text-[#808080] mt-1 group-hover:text-black">Add Logo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                 </label>
               )}
               <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#808080] uppercase tracking-wider">Error Correction</span>
                    <span className="text-[10px] font-mono font-bold">{qrState.errorCorrectionLevel}</span>
                  </div>
                  <div className="flex gap-1">
                    {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map(level => (
                      <button
                        key={level}
                        onClick={() => setQrState(prev => ({ ...prev, errorCorrectionLevel: level }))}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold border transition-all ${
                          qrState.errorCorrectionLevel === level ? 'bg-black text-white border-black' : 'bg-white text-[#808080] border-[#E5E5E5]'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </section>

          <section className="space-y-4 p-5 bg-black/[0.02] border border-black/5 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#808080]">
                <Layout className="w-4 h-4" />
                <h2 className="text-xs font-bold uppercase tracking-widest">4. Poster</h2>
              </div>
              <button 
                onClick={() => setPoster(p => ({ ...p, show: !p.show }))}
                className={`relative w-8 h-4 rounded-full transition-colors ${poster.show ? 'bg-green-500' : 'bg-[#E5E5E5]'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${poster.show ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>
            <AnimatePresence>
              {poster.show && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4 pt-2"
                >
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Poster Text</label>
                    <input
                      type="text"
                      value={poster.text}
                      onChange={(e) => setPoster(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Block Color</label>
                      <div className="flex items-center gap-2 p-2 bg-white border border-[#E5E5E5] rounded-lg">
                        <input 
                          type="color" 
                          value={poster.customBg} 
                          onChange={(e) => setPoster(prev => ({ ...prev, customBg: e.target.value }))}
                          className="w-5 h-5 rounded cursor-pointer" 
                        />
                        <span className="text-[10px] font-mono">{poster.customBg}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#808080] uppercase tracking-wider">Text Color</label>
                      <div className="flex items-center gap-2 p-2 bg-white border border-[#E5E5E5] rounded-lg">
                        <input 
                          type="color" 
                          value={poster.customText} 
                          onChange={(e) => setPoster(prev => ({ ...prev, customText: e.target.value }))}
                          className="w-5 h-5 rounded cursor-pointer" 
                        />
                        <span className="text-[10px] font-mono">{poster.customText}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="sticky top-28 space-y-6">
            {/* The Poster Area */}
            <div className="bg-[#EFEFEF] rounded-3xl p-10 md:p-16 flex items-center justify-center min-h-[400px] shadow-inner relative overflow-hidden">
               {/* Decorative elements */}
               <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-200/20 blur-3xl rounded-full"></div>
               <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-200/20 blur-3xl rounded-full"></div>

               <div 
                 ref={posterRef} 
                 className="bg-white p-8 rounded-[40px] shadow-2xl flex flex-col items-center gap-6 relative group"
               >
                 <div ref={qrRef} className="relative z-10 transition-transform duration-500 group-hover:scale-[1.02]" id="qr-canvas-holder"></div>
                 
                 {poster.show && (
                   <div className="flex flex-col items-center z-10 w-full">
                     {/* Triangle Point */}
                     <div 
                       className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px]" 
                       style={{ borderBottomColor: poster.customBg }}
                     />
                     {/* Text Block */}
                     <div 
                       className="w-full min-w-[200px] text-center px-8 py-4 rounded-2xl shadow-lg"
                       style={{ backgroundColor: poster.customBg, color: poster.customText }}
                      >
                       <p className="text-xl font-black tracking-tight leading-none">{poster.text}</p>
                     </div>
                   </div>
                 )}
               </div>
            </div>

            {/* Export Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                onClick={() => downloadFile('png')}
                className="flex items-center justify-center gap-2 bg-white border border-[#E5E5E5] hover:border-black transition-all px-4 py-3 rounded-2xl text-xs font-bold shadow-sm"
              >
                <FileImage className="w-4 h-4" />
                Download PNG
              </button>
              <button 
                onClick={() => downloadFile('svg')}
                className="flex items-center justify-center gap-2 bg-white border border-[#E5E5E5] hover:border-black transition-all px-4 py-3 rounded-2xl text-xs font-bold shadow-sm"
              >
                <FileJson className="w-4 h-4" />
                Download SVG
              </button>
              <button 
                onClick={() => downloadFile('pdf')}
                className="flex items-center justify-center gap-2 bg-white border border-[#E5E5E5] hover:border-black transition-all px-4 py-3 rounded-2xl text-xs font-bold shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Current as PDF
              </button>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-4">
               <div className="w-10 h-10 shrink-0 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <Sparkles className="w-5 h-5" />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-orange-900">Pro Tip: Balance matters</h4>
                  <p className="text-xs text-orange-800/70 mt-1">If using a logo, choose 'H' error correction to ensure the code remains readable even with the covered center area.</p>
               </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-[#E5E5E5] mt-10">
        <div className="flex flex-col md:row items-center justify-between gap-6">
           <div className="flex items-center gap-2 opacity-30">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Fancy QR Studio © 2026</span>
           </div>
           <div className="flex gap-4">
              {['Twitter', 'Discord', 'Docs'].map(item => (
                <a key={item} href="#" className="text-[10px] uppercase font-bold text-[#808080] hover:text-black transition-colors tracking-widest">
                  {item}
                </a>
              ))}
           </div>
        </div>
      </footer>
    </div>
  );
}

// --- Utils ---

function getQrOptions(state: QRState): Options {
  return {
    width: 300,
    height: 300,
    type: 'svg',
    data: state.data,
    image: state.logo || undefined,
    margin: 10,
    qrOptions: {
      typeNumber: 0 as TypeNumber,
      mode: 'Byte' as Mode,
      errorCorrectionLevel: state.errorCorrectionLevel,
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 10,
      crossOrigin: 'anonymous',
    },
    dotsOptions: {
      color: state.dotsColor,
      type: state.dotsType,
    },
    backgroundOptions: {
      color: state.backgroundColor,
    },
    cornersSquareOptions: {
      color: state.cornersColor,
      type: state.cornersType,
    },
    cornersDotOptions: {
      color: state.cornersDotColor,
      type: state.cornersDotType,
    },
  };
}
