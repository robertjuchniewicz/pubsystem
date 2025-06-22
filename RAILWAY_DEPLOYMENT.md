# Railway Deployment Guide

## Wdrożenie aplikacji Helvetia PUB Order na Railway

### Krok 1: Przygotowanie repozytorium
1. Upewnij się, że wszystkie zmiany są zacommitowane:
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push
   ```

### Krok 2: Utworzenie konta na Railway
1. Przejdź na [railway.app](https://railway.app)
2. Zaloguj się przez GitHub
3. Kliknij "New Project"

### Krok 3: Wdrożenie z GitHub
1. Wybierz "Deploy from GitHub repo"
2. Wybierz repozytorium `helvetiapub-order`
3. Railway automatycznie wykryje konfigurację

### Krok 4: Konfiguracja (opcjonalna)
1. W ustawieniach projektu możesz zmienić nazwę
2. Railway automatycznie ustawi zmienne środowiskowe

### Krok 5: Dostęp do aplikacji
1. Po wdrożeniu Railway wygeneruje URL
2. Aplikacja będzie dostępna pod tym adresem
3. Możesz ustawić custom domain w ustawieniach

### Struktura aplikacji
- **Frontend:** React aplikacja w `/client`
- **Backend:** Node.js/Express serwer w `/server`
- **API:** Dostępne pod `/api`
- **Statyczne pliki:** Serwowane z `/client/build`

### Automatyczne wdrożenia
Railway automatycznie wdroży nową wersję przy każdym push do main branch. 