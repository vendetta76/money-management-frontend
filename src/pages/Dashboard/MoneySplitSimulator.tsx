import React, { useState, useMemo } from "react";
import { Plus, Trash2, Calculator, RotateCcw, Check, AlertTriangle, Edit3, MoreHorizontal } from "lucide-react";

interface Category {
  id: string;
  name: string;
  percent: number;
}

const QUICK_PRESETS = [
  { name: "50/30/20", data: [50, 30, 20], labels: ["Needs", "Wants", "Savings"] },
  { name: "60/20/20", data: [60, 20, 20], labels: ["Needs", "Savings", "Investments"] },
  { name: "40/30/30", data: [40, 30, 30], labels: ["Needs", "Wants", "Future"] },
  { name: "70/20/10", data: [70, 20, 10], labels: ["Living", "Saving", "Fun"] },
  { name: "80/10/10", data: [80, 10, 10], labels: ["Essentials", "Savings", "Fun"] }
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' }
];

export default function MoneySplitSimulator() {
  // Core state
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Needs', percent: 50 },
    { id: '2', name: 'Wants', percent: 30 },
    { id: '3', name: 'Savings', percent: 20 }
  ]);
  
  // UI state
  const [showMenu, setShowMenu] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  // Calculations
  const numericAmount = useMemo(() => {
    return parseFloat(amount.replace(/[^\d]/g, '')) || 0;
  }, [amount]);

  const totalPercent = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.percent, 0);
  }, [categories]);

  const isBalanced = totalPercent === 100;
  const remaining = 100 - totalPercent;

  const results = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      amount: (numericAmount * cat.percent) / 100
    }));
  }, [categories, numericAmount]);

  // Handlers
  const updateCategory = (id: string, field: keyof Category, value: string | number) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const addCategory = () => {
    const newId = Date.now().toString();
    setCategories(prev => [...prev, {
      id: newId,
      name: 'New Category',
      percent: Math.max(0, remaining)
    }]);
  };

  const removeCategory = (id: string) => {
    if (categories.length > 1) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    const newCategories = preset.data.map((percent, index) => ({
      id: (index + 1).toString(),
      name: preset.labels[index],
      percent
    }));
    setCategories(newCategories);
    setShowMenu(false);
  };

  const resetAll = () => {
    setAmount('');
    setCategories([
      { id: '1', name: 'Needs', percent: 50 },
      { id: '2', name: 'Wants', percent: 30 },
      { id: '3', name: 'Savings', percent: 20 }
    ]);
    setShowMenu(false);
  };

  const autoBalance = () => {
    if (categories.length === 0) return;
    const evenPercent = Math.floor(100 / categories.length);
    const extra = 100 - (evenPercent * categories.length);
    
    setCategories(prev => prev.map((cat, i) => ({
      ...cat,
      percent: i === 0 ? evenPercent + extra : evenPercent
    })));
    setShowMenu(false);
  };

  const getCurrentCurrency = () => {
    return CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  };

  const formatCurrency = (value: number, currencyCode: string) => {
    const curr = CURRENCIES.find(c => c.code === currencyCode);
    if (!curr) return value.toString();
    
    // Remove decimals - format as whole numbers
    const wholeValue = Math.floor(value);
    
    // Format based on currency
    if (['IDR', 'VND', 'KRW', 'JPY'].includes(currencyCode)) {
      return `${curr.symbol} ${new Intl.NumberFormat('en-US').format(wholeValue)}`;
    }
    
    if (currencyCode === 'INR') {
      return `${curr.symbol} ${new Intl.NumberFormat('en-IN').format(wholeValue)}`;
    }
    
    return `${curr.symbol}${new Intl.NumberFormat('en-US').format(wholeValue)}`;
  };

  const formatAmountInput = (value: string) => {
    // Remove non-numeric characters
    const numeric = value.replace(/[^\d]/g, '');
    if (!numeric) return '';
    
    // Format with thousand separators
    return new Intl.NumberFormat('en-US').format(Number(numeric));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmountInput(e.target.value);
    setAmount(formatted);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    setShowCurrencyMenu(false);
  };

  const handleCategoryNameChange = (id: string, newName: string) => {
    updateCategory(id, 'name', newName);
  };

  const startEditing = (id: string) => {
    setEditingCategory(id);
  };

  const stopEditing = () => {
    setEditingCategory(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      stopEditing();
    }
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '24px',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '800',
          margin: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          💰 Money Split Simulator
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b', 
          margin: '8px 0 0 0',
          fontWeight: '500'
        }}>
          Split your budget across categories with precision
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Amount Input Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.5rem', 
              fontWeight: '700',
              color: '#1e293b'
            }}>
              💳 Enter Your Amount
            </h2>
            
            {/* Currency Selector */}
            <div style={{ position: 'relative', marginLeft: 'auto' }}>
              <button
                onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#374151',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <span style={{ fontSize: '1.2rem' }}>{getCurrentCurrency().symbol}</span>
                <span>{getCurrentCurrency().code}</span>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>▼</span>
              </button>
              
              {showCurrencyMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  zIndex: 20,
                  maxWidth: '280px',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  {CURRENCIES.map(curr => (
                    <button
                      key={curr.code}
                      onClick={() => handleCurrencyChange(curr.code)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        backgroundColor: currency === curr.code ? '#eff6ff' : 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        borderRadius: currency === curr.code ? '8px' : '0',
                        margin: currency === curr.code ? '4px' : '0'
                      }}
                      onMouseEnter={(e) => {
                        if (currency !== curr.code) {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currency !== curr.code) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span style={{ fontSize: '1.2rem', minWidth: '24px' }}>{curr.symbol}</span>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{curr.code}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{curr.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#3b82f6',
              zIndex: 1
            }}>
              {getCurrentCurrency().symbol}
            </div>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter your total amount"
              style={{
                width: '100%',
                padding: '20px 20px 20px 80px',
                fontSize: '2rem',
                fontWeight: '700',
                textAlign: 'center',
                border: '3px solid #e2e8f0',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                backgroundColor: '#fafbfc'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#fafbfc';
              }}
            />
          </div>
        </div>

        {/* Results Section */}
        {numericAmount > 0 && (
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 10px 32px rgba(59, 130, 246, 0.15)',
            border: '2px solid #3b82f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                💡 Your Money Split
              </h2>
              {isBalanced ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check color="#10b981" size={24} />
                  <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.9rem' }}>Balanced</span>
                </div>
              ) : (
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  backgroundColor: totalPercent > 100 ? '#fef2f2' : '#fef3c7',
                  color: totalPercent > 100 ? '#dc2626' : '#d97706',
                  border: `1px solid ${totalPercent > 100 ? '#fecaca' : '#fde68a'}`
                }}>
                  {totalPercent}%
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {results.map(result => (
                <div 
                  key={result.id}
                  style={{ 
                    padding: '20px',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    borderRadius: '12px',
                    border: '2px solid rgba(59, 130, 246, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '600', color: '#1e293b' }}>
                      {result.name}
                    </h3>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>
                        {formatCurrency(result.amount, currency)}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>
                        {result.percent}% of total
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!isBalanced && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: totalPercent > 100 ? '#fef2f2' : '#fef3c7',
                border: `2px solid ${totalPercent > 100 ? '#fecaca' : '#fde68a'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertTriangle color={totalPercent > 100 ? '#dc2626' : '#d97706'} size={24} />
                <span style={{ 
                  color: totalPercent > 100 ? '#dc2626' : '#d97706', 
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>
                  {totalPercent > 100 
                    ? `⚠️ Over budget by ${totalPercent - 100}% - reduce some percentages`
                    : `📝 ${remaining}% remaining - adjust your categories`
                  }
                </span>
              </div>
            )}

            {isBalanced && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#f0fdf4',
                border: '2px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Check color="#10b981" size={24} />
                <span style={{ color: '#059669', fontWeight: '600', fontSize: '1rem' }}>
                  🎉 Perfect! Your budget is perfectly balanced at 100%.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>
              Total Allocation: {totalPercent}%
            </span>
            {!isBalanced && (
              <span style={{ 
                color: totalPercent > 100 ? '#dc2626' : '#d97706',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                {remaining > 0 ? `${remaining}% remaining` : `${Math.abs(remaining)}% over budget`}
              </span>
            )}
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(totalPercent, 100)}%`,
              height: '100%',
              background: isBalanced 
                ? 'linear-gradient(90deg, #10b981, #059669)' 
                : totalPercent > 100 
                  ? 'linear-gradient(90deg, #ef4444, #dc2626)' 
                  : 'linear-gradient(90deg, #3b82f6, #2563eb)',
              transition: 'all 0.5s ease',
              borderRadius: '6px'
            }} />
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
            🚀 Quick Budget Templates
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {QUICK_PRESETS.map(preset => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                style={{
                  padding: '12px 20px',
                  border: '2px solid #3b82f6',
                  borderRadius: '24px',
                  backgroundColor: 'transparent',
                  color: '#3b82f6',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.95rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
              📊 Budget Categories
            </h2>
            
            <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
              <button
                onClick={autoBalance}
                style={{
                  padding: '12px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Auto Balance All Categories"
              >
                <Calculator size={20} />
              </button>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  padding: '12px',
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(107, 114, 128, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.2)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="More Options"
              >
                <MoreHorizontal size={20} />
              </button>
              
              {showMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  zIndex: 10,
                  minWidth: '200px'
                }}>
                  <button
                    onClick={autoBalance}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      borderRadius: '8px',
                      margin: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Calculator size={18} />
                    <span style={{ fontWeight: '500' }}>Auto Balance Categories</span>
                  </button>
                  <button
                    onClick={resetAll}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      borderRadius: '8px',
                      margin: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <RotateCcw size={18} />
                    <span style={{ fontWeight: '500' }}>Reset Everything</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {categories.map((category) => (
              <div 
                key={category.id}
                style={{ 
                  padding: '24px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '16px',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Category Name Section */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      {editingCategory === category.id ? (
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                          onBlur={stopEditing}
                          onKeyPress={handleKeyPress}
                          autoFocus
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            border: '3px solid #3b82f6',
                            borderRadius: '8px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            backgroundColor: 'white'
                          }}
                        />
                      ) : (
                        <div 
                          onClick={() => startEditing(category.id)}
                          style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          title="Click to rename category"
                        >
                          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', flex: 1, color: '#1e293b' }}>
                            {category.name}
                          </h3>
                          <Edit3 size={18} color="#64748b" />
                        </div>
                      )}
                    </div>
                    
                    {categories.length > 1 && (
                      <button 
                        onClick={() => removeCategory(category.id)}
                        style={{
                          padding: '8px',
                          border: 'none',
                          borderRadius: '8px',
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Delete Category"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  {/* Percentage and Amount */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={category.percent}
                        onChange={(e) => updateCategory(category.id, 'percent', Number(e.target.value) || 0)}
                        style={{
                          width: '120px',
                          padding: '12px 36px 12px 16px',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          border: '2px solid #e2e8f0',
                          borderRadius: '8px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      />
                      <span style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748b',
                        fontSize: '1rem',
                        fontWeight: '600'
                      }}>
                        %
                      </span>
                    </div>
                    
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontSize: '2rem', fontWeight: '800', color: '#3b82f6', margin: 0 }}>
                        {formatCurrency((numericAmount * category.percent) / 100, currency)}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>
                        {category.percent}% of {formatCurrency(numericAmount, currency)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Category Button */}
          <button
            onClick={addCategory}
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '20px',
              border: '3px dashed #cbd5e1',
              borderRadius: '16px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#64748b',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.borderStyle = 'solid';
              e.currentTarget.style.color = '#3b82f6';
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.borderStyle = 'dashed';
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={24} />
            Add New Category
          </button>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showMenu || showCurrencyMenu) && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5
          }}
          onClick={() => {
            setShowMenu(false);
            setShowCurrencyMenu(false);
          }}
        />
      )}
    </div>
  );
}