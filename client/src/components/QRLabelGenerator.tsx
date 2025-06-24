import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { useSettings } from '../contexts/SettingsContext';
import './QRLabelGenerator.css';

// --- Komponent dla pojedynczej etykiety (wewnętrzny) ---
interface LabelProps {
  tableNumber: number;
  baseUrl: string;
  logo: string | null;
  background: string | null;
}

// --- Interfejs dla zapisywanego stanu ---
interface SavedQRState {
  fromTable: number;
  toTable: number;
  baseUrl: string;
  customBackground: string | null;
}

const Label: React.FC<LabelProps> = ({ tableNumber, baseUrl, logo, background }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      QRCode.toCanvas(canvas, `${baseUrl}/table/${tableNumber}`, {
        width: 256,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#0D1A2F',
          light: '#FFFFFFFF',
        },
      });
    }
  }, [tableNumber, baseUrl]);

  return (
    <div className="label-container">
      <div className="label-content">
        <div className="label-background" style={{ backgroundImage: background ? `url(${background})` : 'none' }}></div>
        <div className="label-inner-content">
          <div className="label-header">Helvetia Pub</div>
          {logo && <img src={logo} alt="Logo" className="label-logo" />}
          <div className="label-table">Tisch {tableNumber}</div>
          <div className="label-qr-code">
            <canvas ref={canvasRef} />
          </div>
          <div className="label-footer">
            SCAN QR CODE UND BESTELLEN
            <br />
            SCAN THE QR CODE AND ORDER
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Główny komponent generatora ---
const QRLabelGenerator: React.FC = () => {
  // --- Funkcje localStorage ---
  const saveQRState = (state: SavedQRState) => {
    try {
      // Sprawdź czy localStorage jest dostępny
      if (typeof localStorage === 'undefined') {
        console.log('⚠️ localStorage nie jest dostępny');
        return;
      }

      // Wyczyść stary stan przed zapisem nowego
      localStorage.removeItem('qrLabelState');
      
      // Zapisz tylko najważniejsze dane (bez customBackground jeśli jest duży)
      const minimalState = {
        fromTable: state.fromTable,
        toTable: state.toTable,
        baseUrl: state.baseUrl,
        // customBackground tylko jeśli nie jest null i nie jest za duży
        ...(state.customBackground && state.customBackground.length < 1000 && {
          customBackground: state.customBackground
        })
      };

      localStorage.setItem('qrLabelState', JSON.stringify(minimalState));
      console.log('✅ QR State saved:', minimalState);
    } catch (error: any) {
      if (error.name === 'QuotaExceededError') {
        console.warn('⚠️ localStorage pełny - czyszczenie starych danych...');
        // Wyczyść wszystkie dane QR i spróbuj ponownie
        try {
          localStorage.removeItem('qrLabelState');
          localStorage.removeItem('posterState');
          // Spróbuj zapisać tylko podstawowe dane
          const basicState = {
            fromTable: state.fromTable,
            toTable: state.toTable,
            baseUrl: state.baseUrl
          };
          localStorage.setItem('qrLabelState', JSON.stringify(basicState));
          console.log('✅ QR State saved (basic):', basicState);
        } catch (retryError) {
          console.error('❌ Nie udało się zapisać nawet podstawowych danych:', retryError);
        }
      } else {
        console.error('❌ Błąd podczas zapisywania stanu QR:', error);
      }
    }
  };

  const loadQRState = (): SavedQRState | null => {
    try {
      if (typeof localStorage === 'undefined') {
        console.log('⚠️ localStorage nie jest dostępny');
        return null;
      }

      const saved = localStorage.getItem('qrLabelState');
      console.log('📥 Loading QR state from localStorage:', saved);
      
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      console.log('📥 Parsed QR state:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ Błąd podczas ładowania stanu QR:', error);
      // Wyczyść uszkodzone dane
      try {
        localStorage.removeItem('qrLabelState');
      } catch (clearError) {
        console.error('❌ Nie udało się wyczyścić uszkodzonych danych:', clearError);
      }
      return null;
    }
  };

  // --- Wartości domyślne ---
  const defaultState: SavedQRState = {
    fromTable: 1,
    toTable: 2,
    baseUrl: window.location.origin,
    customBackground: null
  };

  // --- Ładowanie zapisanego stanu przy inicjalizacji ---
  const savedState = loadQRState();
  const initialState = savedState || defaultState;
  console.log('🚀 Initial QR state:', initialState);

  const [fromTable, setFromTable] = useState<number>(initialState.fromTable);
  const [toTable, setToTable] = useState<number>(initialState.toTable);
  const [baseUrl, setBaseUrl] = useState(initialState.baseUrl);
  const [customBackground, setCustomBackground] = useState<string | null>(initialState.customBackground);
  const [generatedLabels, setGeneratedLabels] = useState<React.ReactNode[][]>([]);
  const { settings, loading } = useSettings();
  const previewAreaRef = useRef<HTMLDivElement>(null);

  // --- Automatyczne zapisywanie stanu przy każdej zmianie ---
  useEffect(() => {
    const currentState: SavedQRState = {
      fromTable,
      toTable,
      baseUrl,
      customBackground
    };
    console.log('💾 Saving QR state:', currentState);
    saveQRState(currentState);
  }, [fromTable, toTable, baseUrl, customBackground]);

  const handleGenerate = () => {
    if (fromTable > toTable || fromTable < 1 || toTable - fromTable !== 1) {
      alert("Możesz wygenerować tylko 2 etykiety naraz (np. 1-2, 3-4, ...)");
      return;
    }
    
    // Generuj podwójne etykiety - każda etykieta jest duplikowana obok siebie
    const labels = [
      [
        // Pierwsza para: dwie identyczne etykiety dla pierwszego stołu
        <Label key={`${fromTable}-1`} tableNumber={fromTable} baseUrl={baseUrl} logo={settings.logo || null} background={customBackground || settings.background || null} />,
        <Label key={`${fromTable}-2`} tableNumber={fromTable} baseUrl={baseUrl} logo={settings.logo || null} background={customBackground || settings.background || null} />,
        // Druga para: dwie identyczne etykiety dla drugiego stołu
        <Label key={`${toTable}-1`} tableNumber={toTable} baseUrl={baseUrl} logo={settings.logo || null} background={customBackground || settings.background || null} />,
        <Label key={`${toTable}-2`} tableNumber={toTable} baseUrl={baseUrl} logo={settings.logo || null} background={customBackground || settings.background || null} />
      ]
    ];
    setGeneratedLabels(labels);
  };
  
  const handleExport = async () => {
    const previewElement = previewAreaRef.current;
    if (previewElement) {
      const pages = Array.from(previewElement.querySelectorAll('.qr-label-page')) as HTMLElement[];
      if (pages.length === 0) return;
      const scale = 3;
      const options = {
        scale,
        useCORS: true,
        backgroundColor: '#ffffff',
      } as any;
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        page.style.boxShadow = 'none';
        // eslint-disable-next-line no-await-in-loop
        const canvas = await html2canvas(page, options);
        const link = document.createElement('a');
        link.download = `qr-etiketten-${i + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        page.style.boxShadow = '';
      }
    }
  };

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomBackground(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Funkcja czyszczenia localStorage ---
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem('qrLabelState');
      localStorage.removeItem('posterState');
      console.log('🧹 localStorage wyczyszczony');
      alert('localStorage został wyczyszczony. Strona zostanie odświeżona.');
      window.location.reload();
    } catch (error) {
      console.error('❌ Błąd podczas czyszczenia localStorage:', error);
      alert('Nie udało się wyczyścić localStorage.');
    }
  };

  // --- Funkcja sprawdzania miejsca w localStorage ---
  const checkLocalStorageSpace = () => {
    try {
      const testKey = 'test_storage_space';
      const testData = 'x'.repeat(1024); // 1KB
      let usedSpace = 0;
      
      // Sprawdź ile miejsca zajmują obecne dane
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          usedSpace += localStorage.getItem(key)?.length || 0;
        }
      }
      
      console.log(`📊 Użyte miejsce w localStorage: ${usedSpace} znaków`);
      
      // Spróbuj zapisać testowe dane
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      console.log('✅ localStorage ma wystarczająco miejsca');
      return true;
    } catch (error: any) {
      if (error.name === 'QuotaExceededError') {
        console.warn('⚠️ localStorage jest pełny!');
        return false;
      }
      return true;
    }
  };

  // --- Sprawdź miejsce przy starcie ---
  useEffect(() => {
    checkLocalStorageSpace();
  }, []);

  if (loading) {
    return <div>Einstellungen werden geladen...</div>;
  }

  return (
    <div className="qr-label-generator">
      <h2>QR-Code Etiketten-Generator</h2>
      
      {/* Przycisk czyszczenia localStorage */}
      <div style={{ marginBottom: '10px', textAlign: 'right' }}>
        <button 
          onClick={clearLocalStorage}
          style={{
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
          title="Zapamiętane Einstellungen löschen"
        >
          🧹 Speicher löschen
        </button>
      </div>

      <div className="controls-section">
        <div className="control-group">
          <label htmlFor="fromTable">Von Tisch:</label>
          <input
            type="number"
            id="fromTable"
            value={fromTable}
            onChange={(e) => setFromTable(Math.max(1, parseInt(e.target.value, 10)))}
            min="1"
          />
        </div>
        <div className="control-group">
          <label htmlFor="toTable">Bis Tisch:</label>
          <input
            type="number"
            id="toTable"
            value={toTable}
            onChange={(e) => setToTable(Math.max(2, parseInt(e.target.value, 10)))}
            min={fromTable + 1}
          />
        </div>
        <div className="control-group full-width">
          <label htmlFor="baseUrl">Basis-URL (für QR-Codes):</label>
          <input
            type="text"
            id="baseUrl"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </div>
        <div className="control-group full-width">
            <label htmlFor="backgroundUpload">Eigenes Hintergrundbild:</label>
            <input 
                type="file" 
                id="backgroundUpload" 
                accept="image/*" 
                onChange={handleBackgroundUpload} 
            />
        </div>
        <div className="button-group">
            <button
              onClick={handleGenerate}
              className="generate-button"
              disabled={fromTable > toTable || toTable - fromTable !== 1}
            >
              Generieren
            </button>
            <button
                onClick={handleExport}
                className="generate-button"
                disabled={generatedLabels.length === 0}
            >
                Als PNG exportieren
            </button>
        </div>
      </div>

      {generatedLabels.length > 0 && (
        <div className="preview-area" ref={previewAreaRef}>
          <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#4a5568' }}>Druckvorschau</h3>
          {generatedLabels.map((pageLabels, pageIndex) => (
            <div
              className="qr-label-page"
              key={pageIndex}
              style={{
                width: '210mm',
                height: '297mm',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                pageBreakAfter: 'always',
                background: customBackground ? `url(${customBackground}) center/cover` : '#fff',
                position: 'relative',
                padding: '0',
                boxSizing: 'border-box',
                gap: '0',
              }}
            >
              {pageLabels.map((label, idx) => (
                <div
                  key={idx}
                  style={{
                    margin: '0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QRLabelGenerator; 