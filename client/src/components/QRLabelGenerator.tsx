import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';

const QRLabelGenerator: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState(window.location.origin);
  const [startTable, setStartTable] = useState(1);
  const [endTable, setEndTable] = useState(10);
  const [logo, setLogo] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [pages, setPages] = useState<JSX.Element[][]>([]);
  const [tableCount, setTableCount] = useState(20);

  const generateQRCode = useCallback(async (canvasId: string, url: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    try {
      await QRCode.toCanvas(canvas, url, {
        width: 150,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error(`Fehler beim Generieren des QR-Codes für ${canvasId}:`, error);
    }
  }, []);

  const generateLabels = useCallback(() => {
    const allLabels = [];
    for (let i = startTable; i <= endTable; i++) {
      allLabels.push(
        <div 
          key={i} 
          className="qr-label"
          style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}
        >
          <div className="label-overlay">
            <h2 className="label-title">Helvetia PUB</h2>
            {logo && <img src={logo} alt="Logo" className="label-logo" />}
            <h3 className="label-tisch">TISCH {i}</h3>
            <canvas id={`qrCanvas${i}`} className="qr-canvas"></canvas>
            <p className="label-instruction">
              SCAN QR CODE UND BESTELLEN
              <br />
              SCAN THE QR CODE AND ORDER
            </p>
          </div>
        </div>
      );
    }

    const pagesData = [];
    for (let i = 0; i < allLabels.length; i += 4) {
      pagesData.push(allLabels.slice(i, i + 4));
    }
    setPages(pagesData);
  }, [startTable, endTable, logo, backgroundImage]);

  useEffect(() => {
    generateLabels();
  }, [generateLabels]);

  useEffect(() => {
    if (pages.length === 0) return;

    const timer = setTimeout(() => {
      for (let i = startTable; i <= endTable; i++) {
        const url = `${baseUrl}/table/${i}`;
        if (document.getElementById(`qrCanvas${i}`)) {
          generateQRCode(`qrCanvas${i}`, url);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pages, baseUrl, startTable, endTable, generateQRCode]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogo(URL.createObjectURL(file));
    }
  };

  const handleBackgroundImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackgroundImage(URL.createObjectURL(file));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="qr-generator-container">
      <div className="qr-controls">
        <div className="control-group">
          <div>
            <label>Von Tisch:</label>
            <input
              type="number"
              value={startTable}
              onChange={(e) => setStartTable(parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>
          <div>
            <label>Bis Tisch:</label>
            <input
              type="number"
              value={endTable}
              onChange={(e) => setEndTable(parseInt(e.target.value) || 1)}
              min={startTable}
            />
          </div>
        </div>

        <div className="control-group">
          <div>
            <label>Logo hochladen:</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} />
          </div>
          <div>
            <label>Hintergrundbild hochladen:</label>
            <input type="file" accept="image/*" onChange={handleBackgroundImageUpload} />
          </div>
        </div>
        
        <div className="control-group">
          <label>Basis-URL:</label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:3000"
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <button className="generate-btn" onClick={generateLabels}>
            Tischschilder generieren
          </button>
          <button className="generate-btn" onClick={handlePrint}>
            Drucken
          </button>
        </div>
      </div>

      <div className="qr-labels-container">
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className="a4-page">
            {page}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRLabelGenerator; 