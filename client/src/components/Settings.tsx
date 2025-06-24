import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const Settings: React.FC = () => {
    const { settings, updateSettings, loading } = useSettings();
    const [maxTables, setMaxTables] = useState<number>(settings.maxTables ?? 20);
    const [message, setMessage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [logo, setLogo] = useState<string>(settings.logo ?? "");

    useEffect(() => {
        if (settings.maxTables !== undefined) setMaxTables(settings.maxTables);
        if (settings.logo !== undefined) {
            setLogo(settings.logo);
        }
    }, [settings.maxTables, settings.logo]);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        await updateSettings({ maxTables });
        setMessage('Einstellungen erfolgreich gespeichert!');
        setSaving(false);
    };

    const handleToggle = async (key: 'pizzeriaMenuEnabled' | 'pubEssenEnabled' | 'pubClosed', value: boolean) => {
        if (key === 'pubClosed') {
            if (value) {
                await updateSettings({ 
                    pubClosed: true, 
                    pizzeriaMenuEnabled: false, 
                    pubEssenEnabled: false 
                });
            } else {
                await updateSettings({ pubClosed: false });
            }
        } else {
            await updateSettings({ [key]: value });
        }
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // Sprawdź rozmiar pliku (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage('Logo ist zu groß. Maximale Größe: 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            setLogo(base64);
            setSaving(true);
            setMessage(null);
            
            try {
                await updateSettings({ logo: base64 });
                setMessage('Logo erfolgreich gespeichert!');
            } catch (error) {
                console.error('Error saving logo:', error);
                setMessage('Fehler beim Speichern des Logos. Bitte versuchen Sie es erneut.');
                setLogo(settings.logo || ""); // Przywróć poprzednie logo
            } finally {
                setSaving(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleLogoRemove = async () => {
        setSaving(true);
        setMessage(null);
        
        try {
            await updateSettings({ logo: "" });
            setLogo("");
            setMessage('Logo entfernt!');
        } catch (error) {
            console.error('Error removing logo:', error);
            setMessage('Fehler beim Entfernen des Logos. Bitte versuchen Sie es erneut.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="settings-loading">Lade Einstellungen...</div>;
    }

    return (
        <div className="settings-page">
            <div className="settings-card">
                <h1 className="settings-title">Einstellungen</h1>
                
                <div className="settings-section">
                    <h2 className="settings-section-title">Logo der Kneipe</h2>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} />
                    {logo && (
                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                            <img src={logo} alt="Aktuelles Logo" style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain', borderRadius: 8, border: '1px solid #eee', background: '#fff', padding: 8 }} />
                            <br />
                            <button onClick={handleLogoRemove} style={{ marginTop: 8, color: '#c00', background: 'none', border: 'none', cursor: 'pointer' }}>Logo entfernen</button>
                        </div>
                    )}
                </div>

                <div className="settings-section">
                    <h2 className="settings-section-title">Anzahl der Tische</h2>
                    <input
                        type="number"
                        value={maxTables}
                        onChange={(e) => setMaxTables(parseInt(e.target.value) || 1)}
                        min="1"
                        max="50"
                    />
                    <button onClick={handleSave} disabled={saving}>
                        {saving ? 'Speichern...' : 'Speichern'}
                    </button>
                    {message && <div className="save-message">{message}</div>}
                </div>

                <div className="settings-section">
                    <h2 className="settings-section-title">Betriebsstatus</h2>
                    <div className="toggle-row">
                        <span className="toggle-label">
                            {settings.pizzeriaMenuEnabled ? 'Pizzeria geöffnet' : 'Pizzeria geschlossen'}
                        </span>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.pizzeriaMenuEnabled}
                                onChange={e => handleToggle('pizzeriaMenuEnabled', e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="toggle-row">
                        <span className="toggle-label">
                            {settings.pubEssenEnabled ? 'Küche PUB geöffnet' : 'Küche PUB geschlossen'}
                        </span>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.pubEssenEnabled}
                                onChange={e => handleToggle('pubEssenEnabled', e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="toggle-row">
                        <span className="toggle-label">
                            {settings.pubClosed ? 'PUB geschlossen' : 'PUB geöffnet'}
                        </span>
                        <label className={`toggle-switch ${!settings.pubClosed ? 'on' : 'off'}`}>
                            <input
                                type="checkbox"
                                checked={!settings.pubClosed}
                                onChange={e => handleToggle('pubClosed', !e.target.checked)}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings; 