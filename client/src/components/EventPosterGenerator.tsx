import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useSettings } from '../contexts/SettingsContext';

// --- Typy danych ---
interface SportEvent {
    id: number;
    teamA: string;
    teamB: string;
    time: string;
    competition: string;
}

// --- Interfejs dla zapisywanego stanu ---
interface SavedPosterState {
    pubName: string;
    date: string;
    events: SportEvent[];
    promotion: string;
    background: string | null;
    eventFontColor: string;
    eventTextColor: string;
    eventBorderColor: string;
    eventOpacity: number;
    backgroundOpacity: number;
    eventTimeBgColor: string;
    pubNameColor: string;
    promoColor: string;
}

// --- Komponent Podglądu Plakatu ---
const PosterPreview: React.FC<{
    pubName: string, date: string, events: SportEvent[], promotion: string, logo: string | null, background: string | null,
    eventFontColor: string, eventTextColor: string, eventBorderColor: string, eventOpacity: number, backgroundOpacity: number,
    pubNameColor: string, promoColor: string, eventTimeBgColor: string
}> = ({ pubName, date, events, promotion, logo, background, eventFontColor, eventTextColor, eventBorderColor, eventOpacity, backgroundOpacity, pubNameColor, promoColor, eventTimeBgColor }) => {
    const formattedDate = new Date(date).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
    const eventGridClass = `event-grid event-grid-count-${events.length}`;

    return (
        <div className="poster-preview-area">
            <div className="a4-poster" data-poster="true">
                <div className="poster-background" style={{ backgroundImage: background ? `url(${background})` : 'none', opacity: backgroundOpacity }}></div>
                <div className="poster-content">
                    <header className="poster-header">
                        {logo && <img src={logo} alt="Pub Logo" className="poster-logo poster-logo-left" />}
                        <div className="poster-header-text">
                            <h1 style={{ color: pubNameColor }}>{pubName}</h1>
                            <p className="poster-date" style={{ color: eventFontColor }}>{formattedDate}</p>
                        </div>
                        {logo && <img src={logo} alt="Pub Logo" className="poster-logo poster-logo-right" />}
                    </header>
                    <main className={eventGridClass}>
                        {events.map(event => (
                            <div key={event.id} className="event-card" style={{
                                color: eventFontColor,
                                borderColor: eventBorderColor,
                                opacity: eventOpacity,
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                background: 'rgba(0,0,0,0.15)',
                                boxSizing: 'border-box',
                            }}>
                                <div className="event-details">
                                    <span className="event-matchup">
                                        <span className="team" style={{ color: eventTextColor }}>{event.teamA || 'Team A'}</span>
                                        <span className="vs" style={{ color: eventTimeBgColor }}> vs </span>
                                        <span className="team" style={{ color: eventTextColor }}>{event.teamB || 'Team B'}</span>
                                    </span>
                                    <span className="event-competition" style={{ color: eventTextColor }}>{event.competition || 'Wettbewerb'}</span>
                                </div>
                                <span className="event-time" style={{ backgroundColor: eventTimeBgColor }}>{event.time || '00:00'}</span>
                            </div>
                        ))}
                    </main>
                    <footer className="poster-footer" style={{ borderTop: `3px solid ${eventBorderColor}` }}>
                        <p style={{ color: promoColor }}>{promotion}</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

// --- Główny komponent ---
const EventPosterGenerator: React.FC = () => {
    // Stan dla danych plakatu
    const { settings } = useSettings();
    
    // Debug log dla logo
    console.log('Settings logo:', settings.logo);
    console.log('Full settings:', settings);
    
    // --- Funkcje localStorage ---
    const savePosterState = (state: SavedPosterState) => {
        try {
            localStorage.setItem('eventPosterState', JSON.stringify(state));
        } catch (error) {
            console.error('Błąd podczas zapisywania stanu:', error);
        }
    };

    const loadPosterState = (): SavedPosterState | null => {
        try {
            const saved = localStorage.getItem('eventPosterState');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Błąd podczas ładowania stanu:', error);
            return null;
        }
    };

    // --- Wartości domyślne ---
    const defaultState: SavedPosterState = {
        pubName: 'Helvetia PUB',
        date: new Date().toISOString().split('T')[0],
        events: [],
        promotion: 'Happy Hour während der Spiele!',
        background: null,
        eventFontColor: '#ffffff',
        eventTextColor: '#ffffff',
        eventBorderColor: '#FFD700',
        eventOpacity: 0.7,
        backgroundOpacity: 0.5,
        eventTimeBgColor: '#222222',
        pubNameColor: '#ffffff',
        promoColor: '#ffffff'
    };

    // --- Ładowanie zapisanego stanu przy inicjalizacji ---
    const savedState = loadPosterState();
    const initialState = savedState || defaultState;

    const [pubName, setPubName] = useState(initialState.pubName);
    const [date, setDate] = useState(initialState.date);
    const [events, setEvents] = useState<SportEvent[]>(initialState.events);
    const [promotion, setPromotion] = useState(initialState.promotion);
    const [background, setBackground] = useState<string | null>(initialState.background);
    const [isExporting, setIsExporting] = useState(false);

    // --- Nowe stany personalizacji ---
    const [eventFontColor, setEventFontColor] = useState(initialState.eventFontColor);
    const [eventTextColor, setEventTextColor] = useState(initialState.eventTextColor);
    const [eventBorderColor, setEventBorderColor] = useState(initialState.eventBorderColor);
    const [eventOpacity, setEventOpacity] = useState(initialState.eventOpacity);
    const [backgroundOpacity, setBackgroundOpacity] = useState(initialState.backgroundOpacity);
    const [eventTimeBgColor, setEventTimeBgColor] = useState(initialState.eventTimeBgColor);
    const [pubNameColor, setPubNameColor] = useState(initialState.pubNameColor);
    const [promoColor, setPromoColor] = useState(initialState.promoColor);

    // --- Automatyczne zapisywanie stanu przy każdej zmianie ---
    useEffect(() => {
        const currentState: SavedPosterState = {
            pubName,
            date,
            events,
            promotion,
            background,
            eventFontColor,
            eventTextColor,
            eventBorderColor,
            eventOpacity,
            backgroundOpacity,
            eventTimeBgColor,
            pubNameColor,
            promoColor
        };
        savePosterState(currentState);
    }, [
        pubName, date, events, promotion, background,
        eventFontColor, eventTextColor, eventBorderColor, eventOpacity, backgroundOpacity,
        eventTimeBgColor, pubNameColor, promoColor
    ]);

    // --- Funkcje pomocnicze ---
    const handleAddEvent = () => {
        if (events.length < 6) {
            const newEvent: SportEvent = { id: Date.now(), teamA: '', teamB: '', time: '', competition: '' };
            setEvents([...events, newEvent]);
        }
    };

    const handleEventChange = (index: number, field: keyof SportEvent, value: string) => {
        const updatedEvents = [...events];
        updatedEvents[index] = { ...updatedEvents[index], [field]: value };
        setEvents(updatedEvents);
    };

    const handleRemoveEvent = (id: number) => {
        setEvents(events.filter(event => event.id !== id));
    };

    const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const fileUrl = URL.createObjectURL(e.target.files[0]);
            setBackground(fileUrl);
        }
    };
    
    const exportToPNG = async () => {
        setIsExporting(true);
        
        try {
            const posterElement = document.querySelector('[data-poster="true"]') as HTMLElement;
            
            if (posterElement) {
                // Create a canvas for the poster
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    // Set canvas size to A4 dimensions (210mm x 297mm at 300 DPI)
                    canvas.width = 2480; // 210mm * 300 DPI / 25.4
                    canvas.height = 3508; // 297mm * 300 DPI / 25.4
                    
                    // Fill with white background
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Convert the poster element to an image
                    const posterImage = await html2canvas(posterElement, {
                        background: '#ffffff'
                    });
                    
                    // Draw the poster image onto the canvas
                    ctx.drawImage(posterImage, 0, 0, canvas.width, canvas.height);
                    
                    // Convert canvas to blob and download
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            const formattedDate = new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                            a.download = `helvetia-poster-${formattedDate.replace(/\./g, '-')}.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }
                    }, 'image/png');
                }
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Fehler beim Exportieren. Bitte versuchen Sie es erneut.');
        } finally {
            setIsExporting(false);
        }
    };
    
    return (
        <div className="event-poster-generator-page">
            <div className="event-poster-generator-container">
                <div className="customization-form-row" style={{display:'flex', flexDirection:'row', alignItems:'flex-start', gap:'2.5rem'}}>
                  <div style={{display:'flex', flexDirection:'column', gap:'2.2rem', flex:'0 0 660px', minWidth:0, maxWidth:720}}>
                    <div className="control-section customization-section">
                        <h4>Individuelle Gestaltung</h4>
                        <div className="customization-grid">
                            <div className="customization-col">
                                <label>Pub Name</label>
                                <input type="color" value={pubNameColor} onChange={e => setPubNameColor(e.target.value)} />
                                <label>Datum</label>
                                <input type="color" value={eventFontColor} onChange={e => setEventFontColor(e.target.value)} />
                                <label>Event-Text</label>
                                <input type="color" value={eventTextColor} onChange={e => setEventTextColor(e.target.value)} />
                                <label>Linie</label>
                                <input type="color" value={eventBorderColor} onChange={e => setEventBorderColor(e.target.value)} />
                                <label>Zeit-Feld</label>
                                <input type="color" value={eventTimeBgColor} onChange={e => setEventTimeBgColor(e.target.value)} />
                                <label>Happy Hours</label>
                                <input type="color" value={promoColor} onChange={e => setPromoColor(e.target.value)} />
                            </div>
                            <div className="customization-col">
                                <div style={{fontWeight:600, marginBottom:'0.3em', fontSize:'1em'}}>Transparenz</div>
                                <label>Events</label>
                                <input type="range" min="0.2" max="1" step="0.01" value={eventOpacity} onChange={e => setEventOpacity(Number(e.target.value))} />
                                <span style={{fontSize:'0.95em', marginBottom:'0.7em'}}>{Math.round(eventOpacity*100)}%</span>
                                <label>Hintergrund</label>
                                <input type="range" min="0.1" max="1" step="0.01" value={backgroundOpacity} onChange={e => setBackgroundOpacity(Number(e.target.value))} />
                                <span style={{fontSize:'0.95em'}}>{Math.round(backgroundOpacity*100)}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="poster-generator-form">
                        <div className="control-section">
                            <h4>Allgemein</h4>
                            <label>Name des Pubs</label>
                            <input type="text" value={pubName} onChange={e => setPubName(e.target.value)} />
                            <label>Datum</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                            <label>Aktionstext</label>
                            <textarea value={promotion} onChange={e => setPromotion(e.target.value)} rows={3} placeholder="z.B. Happy Hour 18-20 Uhr" />
                        </div>

                        <div className="control-section">
                            <h4>Grafiken</h4>
                            <label htmlFor="background-upload">Hintergrund auswählen:</label>
                            <input id="background-upload" type="file" onChange={handleBackgroundUpload} accept="image/*" />
                        </div>

                        <div className="control-section events-section">
                            <h4>Veranstaltungen ({events.length}/6)</h4>
                            <div className="event-form-list">
                                {events.map((event, index) => (
                                     <div key={event.id} className="event-form-row">
                                        <input type="text" value={event.teamA} onChange={e => handleEventChange(index, 'teamA', e.target.value)} placeholder="Team A" />
                                        <input type="text" value={event.teamB} onChange={e => handleEventChange(index, 'teamB', e.target.value)} placeholder="Team B" />
                                        <input type="time" value={event.time} onChange={e => handleEventChange(index, 'time', e.target.value)} />
                                        <input type="text" value={event.competition} onChange={e => handleEventChange(index, 'competition', e.target.value)} placeholder="Wettbewerb" />
                                        <button onClick={() => handleRemoveEvent(event.id)} className="remove-event-btn">✖</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleAddEvent} disabled={events.length >= 6} className="add-event-btn">+ Veranstaltung hinzufügen</button>
                        </div>

                         <div className="form-actions">
                            <button 
                                className="btn btn-info" 
                                onClick={exportToPNG}
                                disabled={isExporting}
                            >
                                {isExporting ? 'Exportiere...' : 'Als PNG exportieren'}
                            </button>
                         </div>
                    </div>
                  </div>
                  <div className="poster-preview-container" style={{flex:1, minWidth:0}}>
                    <PosterPreview 
                        pubName={pubName} 
                        date={date} 
                        events={events} 
                        promotion={promotion} 
                        logo={settings.logo || null} 
                        background={background} 
                        eventFontColor={eventFontColor}
                        eventTextColor={eventTextColor}
                        eventBorderColor={eventBorderColor}
                        eventOpacity={eventOpacity}
                        backgroundOpacity={backgroundOpacity}
                        pubNameColor={pubNameColor}
                        promoColor={promoColor}
                        eventTimeBgColor={eventTimeBgColor}
                    />
                  </div>
                </div>
            </div>
        </div>
    );
};

export default EventPosterGenerator; 