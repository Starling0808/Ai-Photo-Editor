import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Image as ImageIcon, Sliders, Wand2, Download, RotateCcw, 
  Camera, Sun, Contrast, Droplet, Circle, Aperture, Palette, Layers, 
  Share2, Check, Sparkles, ChevronLeft, AlertCircle, Smartphone
} from 'lucide-react';
import { FilterState, DEFAULT_FILTERS, PRESETS } from './types';
import { exportProcessedImage, readFileAsDataURL } from './utils/imageHelper';
import { generateEditedImage } from './services/gemini';
import Editor from './components/Editor';

type Tab = 'adjust' | 'presets' | 'ai';
type AdjustmentTool = 'brightness' | 'contrast' | 'saturation' | 'grayscale' | 'sepia' | 'blur' | 'hueRotate';

const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = useState<Tab>('adjust');
  
  // Adjustment State
  const [activeTool, setActiveTool] = useState<AdjustmentTool>('brightness');
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        setBaseImage(dataUrl);
        setImageSrc(dataUrl);
        setFilters(DEFAULT_FILTERS);
        setError(null);
      } catch (err) {
        setError("Failed to load image.");
      }
    }
  };

  const handleFilterChange = (value: number) => {
    setFilters((prev) => ({ ...prev, [activeTool]: value }));
  };

  const handleDownload = async () => {
    if (!baseImage) return;
    try {
      const result = await exportProcessedImage(baseImage, filters);
      const link = document.createElement('a');
      link.href = result;
      link.download = `ai-photo-edit-${Date.now()}.png`;
      link.click();
      setSuccessMsg("Image saved to gallery");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError("Failed to save image.");
    }
  };

  const handleAiGenerate = async () => {
    if (!baseImage || !aiPrompt.trim()) return;
    
    setIsAiProcessing(true);
    setError(null);
    try {
        const currentView = await exportProcessedImage(baseImage, filters);
        const newImage = await generateEditedImage(currentView, aiPrompt);
        setBaseImage(newImage);
        setFilters(DEFAULT_FILTERS);
        setAiPrompt('');
        setSuccessMsg("AI Edit applied successfully!");
        setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
        console.error(err);
        setError(err.message || "AI Generation failed. Try again.");
    } finally {
        setIsAiProcessing(false);
    }
  };

  const triggerFileUpload = () => fileInputRef.current?.click();

  // Helper to get tool icon
  const getToolIcon = (tool: AdjustmentTool) => {
    switch(tool) {
      case 'brightness': return <Sun size={20} />;
      case 'contrast': return <Contrast size={20} />;
      case 'saturation': return <Droplet size={20} />;
      case 'grayscale': return <Circle size={20} />;
      case 'sepia': return <Palette size={20} />;
      case 'blur': return <Aperture size={20} />;
      case 'hueRotate': return <Layers size={20} />;
    }
  };

  const getToolLabel = (tool: AdjustmentTool) => {
    return tool.charAt(0).toUpperCase() + tool.slice(1);
  };

  const getToolRange = (tool: AdjustmentTool) => {
    switch(tool) {
      case 'brightness': return { min: 0, max: 200 };
      case 'contrast': return { min: 0, max: 200 };
      case 'saturation': return { min: 0, max: 200 };
      case 'grayscale': return { min: 0, max: 100 };
      case 'sepia': return { min: 0, max: 100 };
      case 'blur': return { min: 0, max: 20 };
      case 'hueRotate': return { min: 0, max: 360 };
    }
  };

  // --- Main Render ---

  if (!baseImage) {
    return (
      <div className="h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at center, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
        
        {installPrompt && (
          <button 
            onClick={handleInstall}
            className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur rounded-full text-sm font-medium text-indigo-300 border border-indigo-500/30"
          >
            <Smartphone size={16} />
            Install App
          </button>
        )}

        <div className="z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/30 rotate-3">
            <Camera size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3 text-center">Ai Photo Editor</h1>
          <p className="text-slate-400 text-center mb-10 max-w-xs leading-relaxed">
            Professional filters and generative AI in your pocket.
          </p>

          <button 
            onClick={triggerFileUpload}
            className="w-full max-w-xs bg-white text-slate-900 font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            <Upload size={20} />
            <span>Select Photo</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          
          <button 
             onClick={() => fileInputRef.current?.click()} 
             className="mt-4 w-full max-w-xs bg-slate-800 text-slate-200 font-semibold py-4 rounded-xl border border-slate-700 active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            <Camera size={20} />
            <span>Take Photo</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-950 text-white flex flex-col overflow-hidden">
      
      {/* Top Bar */}
      <header className="h-16 shrink-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 z-20">
        <button onClick={() => setBaseImage(null)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-semibold text-lg tracking-tight">Editor</h1>
        <div className="flex items-center gap-2">
          {installPrompt && (
            <button 
              onClick={handleInstall}
              className="p-2 rounded-full bg-slate-800 text-indigo-400"
              title="Install App"
            >
              <Smartphone size={20} />
            </button>
          )}
          <button 
            onClick={handleDownload}
            className="px-4 py-1.5 bg-indigo-600 rounded-full text-sm font-semibold shadow-lg shadow-indigo-500/20 active:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </header>

      {/* Messages */}
      {error && (
        <div className="absolute top-20 left-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-5">
          <AlertCircle size={20} />
          <span className="text-sm font-medium flex-1">{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
      {successMsg && (
        <div className="absolute top-20 left-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-5">
          <Check size={20} />
          <span className="text-sm font-medium flex-1">{successMsg}</span>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 relative bg-[#0a0e17] overflow-hidden">
        <Editor 
          imageSrc={baseImage} 
          filters={filters} 
          isProcessingAI={isAiProcessing}
        />
      </main>

      {/* Bottom Controls */}
      <div className="shrink-0 bg-slate-900 border-t border-slate-800 z-20 pb-safe">
        
        {/* Tool-Specific Control Area */}
        <div className="px-4 pt-4 pb-2">
          
          {/* ADJUST TAB CONTROLS */}
          {activeTab === 'adjust' && (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between text-xs text-slate-400 mb-2 uppercase tracking-wider font-medium">
                <span>{getToolLabel(activeTool)}</span>
                <span>{filters[activeTool]}</span>
              </div>
              <div className="relative h-10 flex items-center">
                 <input
                  type="range"
                  min={getToolRange(activeTool).min}
                  max={getToolRange(activeTool).max}
                  value={filters[activeTool]}
                  onChange={(e) => handleFilterChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              
              {/* Tool Selector Scroll */}
              <div className="flex overflow-x-auto gap-6 py-4 no-scrollbar -mx-4 px-4 mt-2">
                {(['brightness', 'contrast', 'saturation', 'grayscale', 'sepia', 'blur', 'hueRotate'] as AdjustmentTool[]).map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setActiveTool(tool)}
                    className={`flex flex-col items-center gap-2 min-w-[60px] transition-colors ${activeTool === tool ? 'text-indigo-400' : 'text-slate-500'}`}
                  >
                    <div className={`p-3 rounded-full ${activeTool === tool ? 'bg-indigo-500/20' : 'bg-slate-800'}`}>
                      {getToolIcon(tool)}
                    </div>
                    <span className="text-[10px] font-medium">{getToolLabel(tool)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PRESETS TAB CONTROLS */}
          {activeTab === 'presets' && (
            <div className="py-2 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex overflow-x-auto gap-3 no-scrollbar -mx-4 px-4">
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="flex-shrink-0 w-20 h-24 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden relative group"
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <RotateCcw size={20} className="text-slate-400" />
                  </div>
                  <div className="absolute bottom-0 w-full bg-black/60 text-[10px] text-white py-1 text-center">Reset</div>
                </button>

                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setFilters((prev) => ({...prev, ...preset.filter}))}
                    className="flex-shrink-0 w-20 h-24 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden relative transition-transform active:scale-95"
                  >
                    <div 
                      className="w-full h-full bg-cover bg-center opacity-80"
                      style={{ 
                        backgroundImage: `url(${baseImage})`,
                        filter: `brightness(${preset.filter.brightness || 100}%) contrast(${preset.filter.contrast || 100}%) sepia(${preset.filter.sepia || 0}%) grayscale(${preset.filter.grayscale || 0}%)`
                      }}
                    />
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent text-[10px] font-medium text-white py-1.5 text-center">
                      {preset.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI TAB CONTROLS */}
          {activeTab === 'ai' && (
            <div className="animate-in slide-in-from-bottom-2 duration-300 pb-2">
              <div className="relative mb-3">
                <input 
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe changes (e.g. 'Add sunglasses')"
                  className="w-full bg-slate-800 border border-slate-700 rounded-full pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white placeholder:text-slate-500"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                   {/* Small helper icon inside input */}
                   <Sparkles size={16} className="text-indigo-500 opacity-50" />
                </div>
              </div>
              <button 
                onClick={handleAiGenerate}
                disabled={isAiProcessing || !aiPrompt.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAiProcessing ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <Wand2 size={16} />
                    Generate Edit
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-2">Powered by Gemini 2.5 Flash</p>
            </div>
          )}

        </div>

        {/* Bottom Navigation Bar */}
        <div className="flex justify-around items-center border-t border-slate-800 bg-slate-900/95 pt-2 pb-6 md:pb-2">
          <button 
            onClick={() => setActiveTab('adjust')}
            className={`flex flex-col items-center gap-1 p-2 w-20 rounded-lg transition-all ${activeTab === 'adjust' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Sliders size={22} strokeWidth={activeTab === 'adjust' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Adjust</span>
          </button>
          <button 
            onClick={() => setActiveTab('presets')}
            className={`flex flex-col items-center gap-1 p-2 w-20 rounded-lg transition-all ${activeTab === 'presets' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Layers size={22} strokeWidth={activeTab === 'presets' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Presets</span>
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center gap-1 p-2 w-20 rounded-lg transition-all ${activeTab === 'ai' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Wand2 size={22} strokeWidth={activeTab === 'ai' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">AI Magic</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;