# hora 1.3

Calendario calmo e locale di nautargo (prima "marea"). File sorgente unico: `src/hora.jsx` (React, generato da `src/parts/`), stile in `src/style.css`.

## Novità della 1.3

1. Durata dal calendario: con le maniglie visibili si trascinano subito (prima si perdeva il primo tocco); un elemento già selezionato si sposta senza pressione lunga.
2. Intestazione dei giorni su una riga, secondo lo spazio: "giovedì 22 ottobre 2026" nella vista Giorno, "gio 22/10" in 3 giorni e Settimana, "gio 22" o "G 22" se stretta; oggi in evidenza. Sopra, il mese o i mesi guardati.
3. Barra in alto: marchio a sinistra, viste solo con icone quando i nomi non ci stanno, Attività scura con barre ottone, comandi della seconda riga uniformi (filtro, Oggi, frecce accoppiate).
4. Attività: scorrimento infinito, senza frecce; Oggi e Vai a data. Il titolo segue il periodo visibile.
5. Sovrapposizioni: eventi e promemoria alla stessa ora si dividono la colonna e si allargano negli spazi liberi; se la colonna è stretta vanno a cascata, con titolo e ora su una riga. Gli eventi di più giorni senza orario sono una barra continua.

## Novità della 1.2

1. Alba e tramonto: la notte è velata d'azzurro con bordo a puntini; la sveglia è una riga prugna con l'icona; l'ora attuale resta ottone.
2. Pizzico: 1, 3, 5, 7 giorni sempre (prima il 5 giorni mancava nel fine settimana); nel fine settimana il 5 giorni parte dal lunedì che arriva.
3. Scorrimento: di base si passa al periodo precedente o successivo (anche nei 5 giorni). Impostazioni > Calendario > Scorrimento continuo lo rende uno scroll libero in Giorno, 3, 5, Settimana (orizzontale) e Mese (verticale, per settimane). Attività scorre sempre.
4. Impostazioni in blocchi staccati con fondo tenue e icone.
5. Attività è un pulsante a sé, scuro (il negativo delle viste), accanto alle viste del calendario. Sul telefono le viste mostrano solo l'icona, tranne quella attiva.
6. Icone nei campi del Nuovo / Modifica.
7. Voce: grammatica semplice descritta in `VOCE.md` (fasce orarie, durate, numeri a parole, parti del giorno, categoria, indirizzo, note, "salva" finale). Esempi toccabili in "Come dettare".

## Dove stanno i file

1. Radice del repository `imo09/hora`: il sito pubblicato (index.html, manifest, sw.js, icone, CNAME, `.nojekyll`).
2. Cartella `sorgenti/` dello stesso repository: questi sorgenti. Dopo una modifica: `cd sorgenti`, `npm test`, poi copia il contenuto di `dist/` nella radice (tranne CNAME).

## Comandi

1. `npm install` una volta sola.
2. `npm run build` crea la cartella `dist/` pronta per GitHub Pages.
3. `npm test` rifà il build ed esegue i test (motore, rendering, gesti touch, 5 giorni).

## Pubblicazione su hora.nautargo.com

1. Crea su GitHub il repository `hora`.
2. Carica nella radice del repository tutti i file del pacchetto `hora-sito-1.3.zip` (index.html, manifest, sw.js, icone, CNAME).
3. In Settings > Pages scegli il ramo `main` e la cartella `/ (root)`.
4. Su Aruba aggiungi un record CNAME: nome `hora`, valore `imo09.github.io`.
5. Torna in Settings > Pages, attendi il controllo del dominio e attiva "Enforce HTTPS".

I dati di un indirizzo restano su quell'indirizzo: se usavi marea su marea.nautargo.com, esporta il backup (.json) da lì e ripristinalo in hora.

## Formato del blocco per Claude

Prima riga `#hora` (`#marea` è ancora accettato), poi una riga per elemento, campi separati da `|`:

```
#hora
13/10 07:00-07:45 | Corsa | evento | Personale | ripete mar gio sab
14/10 18:30 | Spesa | promemoria | Casa | avviso 30 minuti
23/10-25/10 | Lisbona | evento | Personale › Viaggio Lisbona | link: https://...
23/10-24/10 22:00-08:30 | Volo notturno | evento | Personale
13/10 06:45 | Sveglia | sveglia | ripete lun mar mer gio ven
```

1. Campo 1: data `GG/MM` (anno facoltativo), intervallo `GG/MM-GG/MM` per più giorni, poi l'ora `HH:MM` o `HH:MM-HH:MM`. Con intervallo e orario, l'evento va dal primo giorno all'ora di inizio fino all'ultimo giorno all'ora di fine.
2. Campo 2: titolo. Campo 3: `evento`, `promemoria` o `sveglia`. Campo 4: categoria, con `›` per la sottocategoria (le sveglie non hanno categoria).
3. Campi facoltativi: `ripete ...`, `avviso ...`, `indirizzo: ...`, `link: ...`, `note: ...`.
4. Una riga senza `|` viene letta come testo naturale (es. `dentista giovedì 15:30 #casa`).
5. Link diretto: `https://hora.nautargo.com/#aggiungi=` seguito dal blocco codificato (encodeURIComponent).

## Importare da Google Calendar

Impostazioni > Importa calendario: accetta il singolo `.ics` oppure il `.zip` scaricato da Google (Takeout o "Esporta" nelle impostazioni di Google Calendar). Ogni calendario diventa una categoria; il calendario principale (con l'indirizzo email come nome) va in "Non assegnate". Gli elementi già presenti sono proposti spenti.
