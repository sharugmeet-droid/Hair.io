
import React, { useState, useRef } from 'react';
import Layout from './components/Layout';
import { AppState } from './types';
import { suggestHairstyles, applyHairstyle } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    originalImage: null,
    editedImage: null,
    suggestions: [],
    customHairstyle: '',
    isLoading: false,
    isAnalyzing: false,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setState(prev => ({ 
          ...prev, 
          originalImage: base64, 
          editedImage: null, 
          suggestions: [], 
          isAnalyzing: true,
          error: null 
        }));
        
        try {
          const suggestions = await suggestHairstyles(base64);
          setState(prev => ({ ...prev, suggestions, isAnalyzing: false }));
        } catch (error) {
          setState(prev => ({ ...prev, isAnalyzing: false, error: "Failed to analyze face shape." }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = async (style?: string) => {
    const hairstyleToUse = style || state.customHairstyle;
    if (!state.originalImage || !hairstyleToUse) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await applyHairstyle(state.originalImage, hairstyleToUse);
      if (result) {
        setState(prev => ({ ...prev, editedImage: result, isLoading: false }));
      } else {
        setState(prev => ({ ...prev, isLoading: false, error: "Could not process image." }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, error: "Error applying hairstyle." }));
    }
  };

  const handleClear = () => {
    setState({
      originalImage: null,
      editedImage: null,
      suggestions: [],
      customHairstyle: '',
      isLoading: false,
      isAnalyzing: false,
      error: null,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-lg border border-green-50">
            <h2 className="text-2xl font-bold text-[#2D5A27] mb-4">1. Upload Image</h2>
            <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${state.originalImage ? 'border-green-500 bg-green-50' : 'border-green-200 hover:border-[#2D5A27]'}`}>
              {state.originalImage ? (
                <div className="relative group">
                  <img src={state.originalImage} alt="Original" className="mx-auto max-h-72 rounded-lg shadow-md" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                    <button onClick={() => fileInputRef.current?.click()} className="bg-white text-green-800 px-4 py-2 rounded-full font-bold text-sm">Change</button>
                  </div>
                </div>
              ) : (
                <div className="py-6">
                  <i className="fas fa-camera text-5xl text-green-100 mb-4"></i>
                  <p className="text-gray-500 mb-4 font-medium">Clear front-facing photos work best</p>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-[#2D5A27] text-white px-8 py-3 rounded-full hover:bg-green-800 transition-colors font-bold">Upload Photo</button>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-lg border border-green-50">
            <h2 className="text-2xl font-bold text-[#2D5A27] mb-4">2. Pick a Style</h2>
            <div className="mb-6">
              <label className="block text-sm font-bold text-green-900 mb-2">Custom Request</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. Long wavy brown hair with bangs"
                  className="w-full px-4 py-3 border border-green-100 rounded-xl focus:ring-2 focus:ring-[#2D5A27] outline-none"
                  value={state.customHairstyle}
                  onChange={(e) => setState(prev => ({ ...prev, customHairstyle: e.target.value }))}
                />
                <button 
                  disabled={!state.originalImage || !state.customHairstyle || state.isLoading}
                  onClick={() => handleApply()}
                  className="absolute right-2 top-2 bottom-2 bg-[#2D5A27] text-white px-5 rounded-lg hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                >
                  <i className="fas fa-magic"></i>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-green-900 mb-4 flex items-center gap-2">
                <i className="fas fa-sparkles text-yellow-500"></i> AI Recommendations
              </h3>
              {state.isAnalyzing ? (
                <div className="flex items-center gap-3 text-gray-400 p-4 border border-dashed border-gray-100 rounded-xl">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#2D5A27] border-t-transparent"></div>
                  <span className="text-sm">Finding your perfect match...</span>
                </div>
              ) : state.suggestions.length > 0 ? (
                <div className="space-y-3">
                  {state.suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleApply(s.styleName)}
                      className="w-full text-left p-4 border border-green-50 rounded-xl hover:bg-green-50 transition-all group border-l-4 border-l-transparent hover:border-l-[#2D5A27]"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-green-800">{s.styleName}</span>
                        <i className="fas fa-plus-circle text-green-200 group-hover:text-[#2D5A27]"></i>
                      </div>
                      <p className="text-xs text-[#2D5A27]/60 mb-1">{s.reason}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{s.description}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                  Upload a photo to see suggestions tailored to you.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="flex flex-col h-full">
          <section className="bg-white p-6 rounded-2xl shadow-lg border border-green-50 flex-grow flex flex-col min-h-[500px]">
            <h2 className="text-2xl font-bold text-[#2D5A27] mb-6">Visualizer</h2>
            <div className="flex-grow flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 relative overflow-hidden">
              {state.isLoading ? (
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-[#2D5A27]/20 border-t-[#2D5A27] rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="font-bold text-green-800">Transforming...</p>
                </div>
              ) : state.editedImage ? (
                <div className="relative group p-4">
                  <img src={state.editedImage} alt="Edited" className="max-w-full max-h-[500px] rounded-lg shadow-2xl" />
                  <button 
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = state.editedImage!;
                      a.download = 'new-look.png';
                      a.click();
                    }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-[#2D5A27] px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <i className="fas fa-download"></i> Download Look
                  </button>
                </div>
              ) : (
                <div className="text-center opacity-20 flex flex-col items-center">
                  <i className="fas fa-user-circle text-9xl text-green-800 mb-4"></i>
                  <p className="text-xl font-bold">Your New Look Here</p>
                </div>
              )}
            </div>
            {state.error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2">
                <i className="fas fa-exclamation-triangle"></i> {state.error}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default App;
