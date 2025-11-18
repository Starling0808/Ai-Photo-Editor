import React, { useRef, useState, useEffect } from 'react';
import { FilterState } from '../types';
import { getFilterString } from '../utils/imageHelper';
import { Loader2, ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react';

interface EditorProps {
  imageSrc: string;
  filters: FilterState;
  isProcessingAI: boolean;
}

const Editor: React.FC<EditorProps> = ({ imageSrc, filters, isProcessingAI }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Reset zoom/pan when image changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [imageSrc]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault(); // Stop page scroll
    if (e.ctrlKey || e.metaKey) {
      const scaleAmount = -e.deltaY * 0.001;
      setZoom((prev) => Math.min(Math.max(0.1, prev + scaleAmount), 5));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#0a0e17] flex items-center justify-center select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      {/* Image Rendering */}
      {imageSrc ? (
        <div 
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="relative shadow-2xl"
        >
           <img 
            src={imageSrc} 
            alt="Editable"
            className="max-w-none max-h-[80vh] object-contain pointer-events-none"
            style={{
              filter: getFilterString(filters),
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
            draggable={false}
          />
          
          {/* AI Processing Overlay */}
          {isProcessingAI && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-in fade-in duration-300">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
              <p className="text-indigo-200 font-medium text-lg tracking-wide animate-pulse">AI is reimagining...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-slate-500 flex flex-col items-center">
          <p className="mb-2">No Image Loaded</p>
        </div>
      )}

      {/* Floating Zoom Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800/90 backdrop-blur p-2 rounded-full shadow-lg border border-slate-700/50">
        <button 
          onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}
          className="p-2 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
        >
          <ZoomOut size={18} />
        </button>
        <span className="w-12 text-center text-xs font-mono text-slate-300">{Math.round(zoom * 100)}%</span>
        <button 
          onClick={() => setZoom(z => Math.min(5, z + 0.1))}
          className="p-2 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
        >
          <ZoomIn size={18} />
        </button>
        <div className="w-px h-4 bg-slate-600 mx-1" />
        <button 
          onClick={() => { setZoom(1); setPan({x:0, y:0}); }}
          className="p-2 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
          title="Reset View"
        >
          <RefreshCcw size={16} />
        </button>
      </div>
    </div>
  );
};

export default Editor;
