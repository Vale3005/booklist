# Booklist

Applicazione web per tenere traccia dei libri letti e da leggere.

## Funzionalità

- Registrazione, login (con email oppure nome utente) e logout
- Recupero password via email, con link che scade dopo 60 minuti
- Home con ricerca di libri per titolo o autore (Open Library)
- Libreria personale divisa in **Letto** e **Da leggere**, con spostamento e rimozione dei libri
- Voto da 1 a 5 (cuori) e recensione personale per ogni libro
- Scheda del singolo libro con copertina, autore, anno di uscita e trama
- Impostazioni account: cambio nome utente, email e password, eliminazione dell'account
- Assistente AI (DeepSeek) che consiglia libri in base a titoli apprezzati, generi e umore

## Tecnologie

| Parte | Tecnologie |
| --- | --- |
| Frontend | Next.js (App Router), React, Tailwind CSS, componenti shadcn/ui |
| Backend | Laravel (PHP 8.4) usato come API, autenticazione a token con Laravel Sanctum |
| Database | MySQL 8 |
| Infrastruttura | Docker Compose: nginx, php-fpm, MySQL, phpMyAdmin, Mailpit |
| Servizi esterni | Open Library API (nessuna chiave), DeepSeek API (chiave necessaria) |

## Struttura del progetto

```
booklist/
├── backend/             Laravel (API)
├── frontend/            Next.js
├── docker/              Dockerfile di PHP e configurazione di nginx
├── docker-compose.yaml
└── README.md
```

## Requisiti

- Git
- Docker Desktop (oppure Docker Engine con Compose)
- Node.js 20.9 o superiore (consigliata la versione 22 LTS)

PHP e Composer **non** vanno installati: stanno dentro il container `php`.

## Installazione

### 1. Scarica il progetto e avvia i container

```bash
git clone <url-del-repository>
cd booklist
docker compose up -d --build
```
### 2. Configura il backend

Il file `backend/.env` non è su Git: va creato a partire dall'esempio.

```bash
cp backend/.env.example backend/.env      # su Windows: copy backend\.env.example backend\.env
```

Apri `backend/.env` e controlla queste impostazioni:

| Variabile | Valore |
| --- | --- |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | `mysql` (nome del servizio nel compose, non `localhost`) |
| `DB_DATABASE` | `booklist` |
| `DB_USERNAME` | `laravel` |
| `DB_PASSWORD` | `secret` |
| `APP_LOCALE` | `it` (messaggi di errore in italiano) |
| `MAIL_MAILER` | `smtp` |
| `MAIL_HOST` | `mailpit` |
| `MAIL_PORT` | `1025` |
| URL del frontend | `http://localhost:3000` (la variabile letta in `app/Providers/AppServiceProvider.php`) |
| `DEEPSEEK_API_KEY` | la tua chiave personale (vedi sotto) |

I valori di database sono quelli di default del `docker-compose.yaml`.

Poi, dalla cartella `booklist`:

```bash
docker compose exec php composer install
docker compose exec php php artisan key:generate
docker compose exec php php artisan migrate
docker compose exec php php artisan config:clear
```

Su Linux, se compare l'errore `tempnam()` o un errore 500 senza motivo, sistema i permessi:

```bash
docker compose exec php chown -R www-data:www-data storage bootstrap/cache
```

### 3. Avvia il frontend

```bash
cd frontend
npm ci
npm run dev
```

## Indirizzi

| Servizio | Indirizzo |
| --- | --- |
| Applicazione (Next.js) | http://localhost:3000 |
| API (Laravel) | http://localhost:8000/api |
| phpMyAdmin | http://localhost:8080 |
| Mailpit (email di prova) | http://localhost:8025 |

Gli indirizzi del backend sono scritti direttamente nei file del frontend, quindi l'API deve rispondere su `localhost:8000`.

## Chiave di DeepSeek

L'assistente AI usa l'API di DeepSeek, e serve una chiave personale:

1. crea un account sulla piattaforma di DeepSeek e genera una chiave API;
2. scrivila in `backend/.env` come `DEEPSEEK_API_KEY=...`;
3. esegui `docker compose exec php php artisan config:clear`.

La chiave è un segreto: va solo nel file `.env`, **mai** su GitHub, nei file di esempio o nel frontend. Senza chiave tutto il resto funziona, e solo la pagina dei consigli restituisce un errore.

## Email di recupero password

In sviluppo le email non vengono spedite davvero: le intercetta Mailpit. Dopo aver richiesto il link da `/forgot-password`, apri http://localhost:8025, apri il messaggio e clicca "Reimposta password". L'email deve appartenere a un utente registrato **su quel computer**, perché ogni installazione ha il proprio database.

## Database

- `users`: utenti. Il campo `name` è unico e funziona da nome utente.
- `books`: libri salvati, con la chiave di Open Library (`open_library_key`, unica).
- `readings`: collega un utente a un libro, con `status` (`to_read`, `reading`, `read`), `rating` (1-5) e `review`. La coppia utente-libro è unica, e la cancellazione dell'utente elimina anche le sue letture.
- `personal_access_tokens`: token di accesso di Sanctum.
- `password_reset_tokens`: token per il recupero della password.

Il database non viaggia con Git: su un nuovo computer si ricrea con `php artisan migrate`.

## API

Le rotte contrassegnate con "token" richiedono l'header `Authorization: Bearer <token>`.

| Metodo | Percorso | Token | Descrizione |
| --- | --- | --- | --- |
| POST | `/api/register` | no | Registrazione |
| POST | `/api/login` | no | Login con email o nome utente |
| POST | `/api/logout` | sì | Elimina il token in uso |
| POST | `/api/forgot-password` | no | Invia il link di recupero (risposta sempre uguale) |
| POST | `/api/reset-password` | no | Imposta la nuova password con il token del link |
| GET | `/api/user` | sì | Utente loggato |
| PUT | `/api/account` | sì | Modifica nome utente ed email |
| PUT | `/api/account/password` | sì | Cambia la password |
| DELETE | `/api/account` | sì | Elimina l'account |
| GET | `/api/books` | sì | Letture dell'utente |
| POST | `/api/books` | sì | Aggiunge un libro alla libreria |
| PUT | `/api/books/{id}` | sì | Modifica stato, voto o recensione (id della lettura) |
| DELETE | `/api/books/{id}` | sì | Rimuove una lettura |
| GET | `/api/books/search?q=` | sì | Cerca libri su Open Library |
| GET | `/api/books/details/{olid}` | sì | Dettagli di un libro |
| POST | `/api/recensione` | sì | Consigli dell'assistente AI |

## Pagine del frontend

`/` (home e ricerca), `/login`, `/register`, `/forgot-password`, `/reset-password`, `/profilo`, `/libri/[olid]`, `/impostazioni`, `/consigli`.

Le pagine riservate controllano il token salvato nel browser, e senza token reindirizzano a `/login`.

## Lavorare su più computer

1. A fine sessione: `git add .`, `git commit`, `git push`.
2. All'inizio della sessione successiva: `git pull origin main`.
3. Dopo il pull, se serve:
   - `docker compose up -d` (container nuovi);
   - `docker compose exec php composer install` se è cambiato `composer.lock`;
   - `docker compose exec php php artisan migrate` se ci sono migration nuove;
   - `npm ci` in `frontend` se è cambiato `package-lock.json`.
4. I file `.env` non viaggiano con Git: le modifiche vanno ripetute a mano su ogni computer, seguite da `docker compose exec php php artisan config:clear`.

## Comandi utili

```bash
docker compose ps                                 # stato dei container
docker compose logs --tail=40 php nginx           # ultimi messaggi dei container
docker compose exec php php artisan route:list    # elenco delle rotte
docker compose exec php php artisan config:clear  # ricarica il .env
docker compose exec php tail -n 40 storage/logs/laravel.log
docker compose down                               # ferma i container
```
