import React, { useState, useEffect } from "react";
import { formatCurrency } from "@helpers/formatCurrency";
import { ChevronDown, ChevronUp, X, Wallet, Globe, CreditCard, Palette, Eye, EyeOff, Check, Copy, Star, StarOff } from "lucide-react";
import CountUp from "react-countup";
import { useAuth } from "@context/AuthContext";
import { db } from "@lib/firebaseClient";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";

interface WalletTotalOverviewProps {
  totalsByCurrency: Record<string, number>;
  showBalance: boolean;
  onToggleBalance: () => void;
}

// Constants
const SETTINGS_DOC_ID = "_currency_settings";
const LOCAL_STORAGE_FALLBACK = "moniq_primary_currency";

// Modern Material Design Color Themes
const THEME_PRESETS = [
  { name: "Ocean Blue", start: "#1e3a8a", end: "#3b82f6", description: "Deep ocean vibes" },
  { name: "Sunset Orange", start: "#ea580c", end: "#fb923c", description: "Warm sunset glow" },
  { name: "Forest Green", start: "#166534", end: "#22c55e", description: "Nature inspired" },
  { name: "Royal Purple", start: "#6b21a8", end: "#a855f7", description: "Elegant luxury" },
  { name: "Rose Gold", start: "#be185d", end: "#f472b6", description: "Premium rose" },
  { name: "Midnight Dark", start: "#1f2937", end: "#6b7280", description: "Sleek darkness" },
  { name: "Coral Reef", start: "#dc2626", end: "#f87171", description: "Vibrant coral" },
  { name: "Arctic Teal", start: "#0f766e", end: "#2dd4bf", description: "Cool arctic" },
  { name: "Golden Hour", start: "#d97706", end: "#fbbf24", description: "Warm golden" },
  { name: "Lavender Dreams", start: "#7c3aed", end: "#c4b5fd", description: "Soft lavender" }
];

const WalletTotalOverview: React.FC<WalletTotalOverviewProps> = ({
  totalsByCurrency,
  showBalance,
  onToggleBalance,
}) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customColor, setCustomColor] = useState("#3b82f6");
  const [customEndColor, setCustomEndColor] = useState("#1e3a8a");
  const [colorInputType, setColorInputType] = useState<'hex' | 'rgb'>('hex');
  const [rgbStart, setRgbStart] = useState({ r: 59, g: 130, b: 246 });
  const [rgbEnd, setRgbEnd] = useState({ r: 30, g: 58, b: 138 });
  
  // Theme state
  const [currentTheme, setCurrentTheme] = useState({
    start: "#6366f1",
    end: "#8b5cf6"
  });
  
  // Primary currency state
  const [primaryCurrency, setPrimaryCurrency] = useState<string>("");
  
  // Sort currencies by balance
  const sortedCurrencies = Object.entries(totalsByCurrency)
    .sort((a, b) => b[1] - a[1]);

  // Get total count of currencies
  const currencyCount = sortedCurrencies.length;
  
  // Default to highest balance currency for fallback
  const defaultCurrency = sortedCurrencies[0]?.[0] || "";
  const primaryAmount = totalsByCurrency[primaryCurrency] || 0;
  
  // Compute total of all currencies
  const totalSum = Object.values(totalsByCurrency).reduce((sum, val) => sum + val, 0);
  
  // Load settings from Firestore
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        const settingsRef = doc(db, "users", user.uid, "wallets", SETTINGS_DOC_ID);
        const docSnap = await getDoc(settingsRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Load theme
          if (data.theme) {
            setCurrentTheme(data.theme);
            setCustomColor(data.theme.start);
            setCustomEndColor(data.theme.end);
            
            // Convert hex to RGB for inputs
            const startRgb = hexToRgb(data.theme.start);
            const endRgb = hexToRgb(data.theme.end);
            if (startRgb) setRgbStart(startRgb);
            if (endRgb) setRgbEnd(endRgb);
          }
          
          // Load primary currency
          if (data.primaryCurrency && totalsByCurrency[data.primaryCurrency] !== undefined) {
            setPrimaryCurrency(data.primaryCurrency);
          } else {
            setPrimaryCurrency(defaultCurrency);
          }
        } else {
          setPrimaryCurrency(defaultCurrency);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        setPrimaryCurrency(defaultCurrency);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [user?.uid, totalsByCurrency, defaultCurrency]);
  
  // Update primary currency if current selection is no longer valid
  useEffect(() => {
    if (sortedCurrencies.length > 0 && !totalsByCurrency[primaryCurrency]) {
      setPrimaryCurrency(defaultCurrency);
      savePrimaryCurrency(defaultCurrency);
    }
  }, [totalsByCurrency, primaryCurrency, defaultCurrency]);
  
  // Save settings to Firestore
  const saveSettings = async (settings: { theme?: { start: string; end: string }, primaryCurrency?: string }) => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const settingsRef = doc(db, "users", user.uid, "wallets", SETTINGS_DOC_ID);
      
      await setDoc(settingsRef, {
        ...settings,
        type: "settings",
        updatedAt: new Date()
      }, { merge: true });
      
      if (settings.theme) {
        toast.success("Theme berhasil disimpan!");
      }
      if (settings.primaryCurrency) {
        toast.success("Primary currency updated!");
      }
      
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setLoading(false);
    }
  };
  
  // Save theme to Firestore
  const saveTheme = async (theme: { start: string; end: string }) => {
    await saveSettings({ theme });
  };
  
  // Save primary currency
  const savePrimaryCurrency = async (currency: string) => {
    await saveSettings({ primaryCurrency: currency });
  };
  
  // Utility functions
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };
  
  const handlePresetSelect = (preset: typeof THEME_PRESETS[0]) => {
    const newTheme = { start: preset.start, end: preset.end };
    setCurrentTheme(newTheme);
    setCustomColor(preset.start);
    setCustomEndColor(preset.end);
    
    const startRgb = hexToRgb(preset.start);
    const endRgb = hexToRgb(preset.end);
    if (startRgb) setRgbStart(startRgb);
    if (endRgb) setRgbEnd(endRgb);
    
    saveTheme(newTheme);
  };
  
  const handleCustomColorChange = () => {
    let startColor, endColor;
    
    if (colorInputType === 'hex') {
      startColor = customColor;
      endColor = customEndColor;
    } else {
      startColor = rgbToHex(rgbStart.r, rgbStart.g, rgbStart.b);
      endColor = rgbToHex(rgbEnd.r, rgbEnd.g, rgbEnd.b);
    }
    
    const newTheme = { start: startColor, end: endColor };
    setCurrentTheme(newTheme);
    saveTheme(newTheme);
  };
  
  const handleSetPrimary = (currency: string) => {
    setPrimaryCurrency(currency);
    savePrimaryCurrency(currency);
  };
  
  const copyColorToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`Copied ${color} to clipboard!`);
  };
  
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 border border-indigo-100 dark:border-indigo-900 flex items-center">
          <button 
            onClick={() => setIsMinimized(false)}
            className="bg-indigo-500 text-white rounded-full p-2.5 mr-3"
          >
            <Wallet size={20} />
          </button>
          
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {currencyCount} Currencies
            </div>
            {showBalance ? (
              <div className="text-lg font-bold">
                <span className="text-gray-400 dark:text-gray-500 mr-1">~</span>
                <CountUp
                  end={primaryAmount}
                  duration={1.2}
                  separator="," 
                  decimals={0}
                  prefix={formatCurrency(0, primaryCurrency).replace(/\d+([.,]\d+)?/, "")}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1 font-normal">
                  + {currencyCount - 1} more
                </span>
              </div>
            ) : (
              <div className="text-lg font-bold text-gray-900 dark:text-white">••••••</div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">💰 Summary</h2>
        <div className="flex items-center gap-2">
          {/* Balance Toggle Button */}
          <button
            onClick={onToggleBalance}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="text-sm hidden sm:inline">
              {showBalance ? "Sembunyikan" : "Tampilkan"}
            </span>
          </button>
          
          <button 
            onClick={() => setShowThemeEditor(!showThemeEditor)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Customize Theme Colors"
          >
            <Palette size={18} />
          </button>
          <button 
            onClick={() => setIsMinimized(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Minimize to floating widget"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {/* Theme Editor */}
      {showThemeEditor && (
        <>
          {/* Backdrop for easy closing */}
          <div 
            className="fixed inset-0 bg-black/20 z-10"
            onClick={() => setShowThemeEditor(false)}
          />
          
          <div className="absolute right-0 top-12 w-96 bg-white dark:bg-zinc-800 shadow-xl rounded-xl z-20 border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[80vh] flex flex-col">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg flex items-center">
                    <Palette size={20} className="mr-2" />
                    Theme Customizer
                  </h3>
                  <p className="text-sm text-purple-100 mt-1">
                    Personalize your wallet summary colors
                  </p>
                </div>
                <button
                  onClick={() => setShowThemeEditor(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Theme Presets */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3">Material Design Presets</h4>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {THEME_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        currentTheme.start === preset.start && currentTheme.end === preset.end
                          ? 'border-purple-500 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${preset.start}, ${preset.end})`
                      }}
                    >
                      <div className="text-white text-xs font-medium">{preset.name}</div>
                      <div className="text-white/80 text-xs">{preset.description}</div>
                      {currentTheme.start === preset.start && currentTheme.end === preset.end && (
                        <Check size={14} className="text-white mt-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Custom Color Editor */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-200">Custom Colors</h4>
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setColorInputType('hex')}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        colorInputType === 'hex' 
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      HEX
                    </button>
                    <button
                      onClick={() => setColorInputType('rgb')}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        colorInputType === 'rgb' 
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      RGB
                    </button>
                  </div>
                </div>
                
                {colorInputType === 'hex' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Start Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                          placeholder="#3b82f6"
                        />
                        <button
                          onClick={() => copyColorToClipboard(customColor)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          title="Copy to clipboard"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        End Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customEndColor}
                          onChange={(e) => setCustomEndColor(e.target.value)}
                          className="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={customEndColor}
                          onChange={(e) => setCustomEndColor(e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                          placeholder="#1e3a8a"
                        />
                        <button
                          onClick={() => copyColorToClipboard(customEndColor)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          title="Copy to clipboard"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Start Color (RGB)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">R</label>
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={rgbStart.r}
                            onChange={(e) => setRgbStart({...rgbStart, r: parseInt(e.target.value) || 0})}
                            className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">G</label>
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={rgbStart.g}
                            onChange={(e) => setRgbStart({...rgbStart, g: parseInt(e.target.value) || 0})}
                            className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">B</label>
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={rgbStart.b}
                            onChange={(e) => setRgbStart({...rgbStart, b: parseInt(e.target.value) || 0})}
                            className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        End Color (RGB)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">R</label>
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={rgbEnd.r}
                            onChange={(e) => setRgbEnd({...rgbEnd, r: parseInt(e.target.value) || 0})}
                            className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">G</label>
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={rgbEnd.g}
                            onChange={(e) => setRgbEnd({...rgbEnd, g: parseInt(e.target.value) || 0})}
                            className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">B</label>
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={rgbEnd.b}
                            onChange={(e) => setRgbEnd({...rgbEnd, b: parseInt(e.target.value) || 0})}
                            className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Live Preview */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Live Preview
                  </label>
                  <div 
                    className="h-16 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-white font-medium"
                    style={{
                      background: colorInputType === 'hex' 
                        ? `linear-gradient(135deg, ${customColor}, ${customEndColor})`
                        : `linear-gradient(135deg, rgb(${rgbStart.r},${rgbStart.g},${rgbStart.b}), rgb(${rgbEnd.r},${rgbEnd.g},${rgbEnd.b}))`
                    }}
                  >
                    Your Wallet Summary
                  </div>
                </div>
                
                <button
                  onClick={handleCustomColorChange}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg font-medium mt-4 transition-all disabled:opacity-50"
                >
                  {loading ? "Applying..." : "Apply Custom Theme"}
                </button>
              </div>
            </div>
            
            {/* Footer - Fixed */}
            <div className="flex-shrink-0 p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Current: {currentTheme.start} → {currentTheme.end}
                </div>
                <div className="flex gap-2">
                  <button 
                    className="py-1.5 px-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    onClick={() => setShowThemeEditor(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Main summary card */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden">
        {/* Header with summary */}
        <div 
          className="p-4 text-white"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.start}, ${currentTheme.end})`
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Globe size={20} className="mr-2" />
              <h3 className="font-bold">Currency Balance</h3>
            </div>
            <div className="text-sm">
              <span className="font-medium">{currencyCount}</span> currencies
            </div>
          </div>
          
          {/* Primary currency highlight */}
          {primaryCurrency && (
            <div className="mt-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <Star size={14} className="text-yellow-300 mr-1.5" />
                    <div className="text-xs font-medium text-indigo-200">Primary Currency</div>
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {primaryCurrency}
                  </div>
                </div>
                
                {showBalance ? (
                  <div className="text-xl font-medium">
                    <CountUp
                      end={primaryAmount}
                      duration={1.2}
                      separator="," 
                      decimals={0}
                      prefix={formatCurrency(0, primaryCurrency).replace(/\d+([.,]\d+)?/, "")}
                    />
                  </div>
                ) : (
                  <div className="text-xl font-medium">••••••</div>
                )}
              </div>
              
              {showBalance && (
                <div className="mt-2 text-xs text-indigo-200">
                  {primaryCurrency} - Primary Currency
                </div>
              )}
            </div>
          )}
          
          {/* Quick totals */}
          {sortedCurrencies.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {sortedCurrencies
                .slice(1, 3)
                .map(([currency, total]) => (
                <div key={currency} className="bg-white/10 rounded-lg px-3 py-1.5 flex-1">
                  <div className="text-xs font-medium">{currency}</div>
                  {showBalance ? (
                    <div className="text-sm font-bold">
                      <CountUp
                        end={total}
                        duration={1.2}
                        separator="," 
                        decimals={0}
                        prefix={formatCurrency(0, currency).replace(/\d+([.,]\d+)?/, "")}
                      />
                    </div>
                  ) : (
                    <div className="text-sm font-bold">••••••</div>
                  )}
                </div>
              ))}
              
              {sortedCurrencies.length > 3 && (
                <div className="bg-white/10 rounded-lg px-3 py-1.5 flex-1">
                  <div className="text-xs font-medium">Others</div>
                  {showBalance ? (
                    <div className="text-sm font-bold">
                      <span>+{sortedCurrencies.length - 3}</span>
                    </div>
                  ) : (
                    <div className="text-sm font-bold">+{sortedCurrencies.length - 3}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Expandable details */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full p-4 text-left focus:outline-none"
          >
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <CreditCard size={18} className="mr-2" />
              <span className="font-medium">All Currencies</span>
            </div>
            {expanded ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </button>
          
          {expanded && (
            <div className="p-4 pt-0 space-y-2 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sortedCurrencies.map(([currency, total]) => {
                  const isPrimary = currency === primaryCurrency;
                  
                  return (
                    <div 
                      key={currency}
                      className={`flex justify-between items-center p-2 rounded-lg ${
                        isPrimary 
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          isPrimary
                            ? 'bg-indigo-500 text-white'
                            : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        }`}>
                          {isPrimary ? (
                            <Star size={16} />
                          ) : (
                            currency.slice(0, 1)
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white flex items-center">
                            {currency}
                            {!isPrimary && (
                              <button
                                className="ml-2 p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetPrimary(currency);
                                }}
                                title="Set as primary currency"
                              >
                                <StarOff size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {showBalance ? (
                          <CountUp
                            end={total}
                            duration={1.2}
                            separator="," 
                            decimals={0}
                            prefix={formatCurrency(0, currency).replace(/\d+([.,]\d+)?/, "")}
                          />
                        ) : (
                          "••••••"
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletTotalOverview;