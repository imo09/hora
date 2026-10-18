# hora 1.2 - Grammatica per la voce (e per il testo)

Documento di controllo. Vale sia per la dettatura (microfono nel "Nuovo") sia per il testo scritto nello stesso campo. I numeri si possono dire a parole ("nove", "ventitré", "quarantacinque") o arrivare in cifre dal riconoscimento vocale ("9", "23", "45"): sono equivalenti.

Regola generale: si dice cosa, quando, e poi gli eventuali dettagli, in qualsiasi ordine. Quello che non viene riconosciuto diventa il titolo.

Formula consigliata:

```
[comando] [tipo] titolo  giorno  orario  [ripetizione] [avviso] [categoria] [indirizzo] [nota] [salva]
```

Esempio: `riunione cantiere giovedì dalle 9 alle 11 categoria lavoro avvisami mezz'ora prima salva`

## 1. Tipo di elemento

| Si dice | Risultato |
|---|---|
| `evento ...` oppure niente | Evento (predefinito) |
| `promemoria ...`, `ricordami di ...`, `ricorda di ...`, `devo ...`, `da fare ...` | Promemoria |
| `sveglia ...` (all'inizio) | Sveglia |
| `metti`, `mettimi`, `aggiungi`, `inserisci`, `segna`, `segnami` + eventuale `un/una` + eventuale tipo | Comando, tolto dal titolo |
| `crea`, `fissa`, `imposta`, `programma` + `un/una/la/il` + eventuale tipo | Comando, tolto dal titolo |
| `nuovo evento`, `nuovo promemoria`, `nuova sveglia` | Tipo indicato |

Esempi: `metti un evento riunione con Marco domani alle 10`, `nuovo promemoria comprare il latte domani`, `imposta la sveglia alle 7 tutti i giorni`.

Nota: `crea presentazione domani` resta con titolo "Crea presentazione" (senza articolo il verbo fa parte del titolo).

## 2. Giorno

| Si dice | Risultato |
|---|---|
| `oggi`, `domani`, `dopodomani` | Giorno relativo |
| `stamattina`, `stasera`, `stanotte` | Oggi, con la parte del giorno |
| `domani mattina`, `domani pomeriggio`, `domani sera`, `giovedì sera` | Giorno e parte del giorno |
| `lunedì` ... `domenica` (anche `lun`, `mar` ...) | Il prossimo giorno con quel nome (oggi compreso) |
| `prossimo venerdì`, `venerdì prossimo` | Il venerdì successivo (mai oggi) |
| `la prossima settimana`, `settimana prossima` | Lunedì della settimana che arriva |
| `tra 3 giorni`, `fra una settimana`, `tra due mesi` | Giorno calcolato da oggi |
| `il 15`, `il primo` | Giorno del mese (se è passato, il mese dopo) |
| `lunedì 19` | Giorno 19 |
| `15 ottobre`, `il primo novembre`, `il ventitré ottobre`, `15 ottobre 2027` | Data precisa |
| `15/10`, `15/10/2026` | Data precisa (scritta) |
| `dal 23 al 25 ottobre`, `dal primo al tre novembre` | Evento su più giorni |
| `tutto il giorno`, `tutta la giornata` | Senza orario |

Senza giorno: il giorno selezionato nel calendario.

## 3. Orario

### 3.1 Ora d'inizio

| Si dice | Risultato |
|---|---|
| `alle 9`, `alle nove`, `ore 9`, `alle ore 9` | 9:00 |
| `alle 9 e mezza`, `alle nove e trenta`, `alle 9:30` | 9:30 |
| `alle 9 e un quarto` / `e tre quarti` | 9:15 / 9:45 |
| `alle 10 meno un quarto`, `alle 10 meno 10` | 9:45 / 9:50 |
| `all'una`, `a mezzogiorno`, `a mezzanotte` | 13:00, 12:00, 0:00 |
| `15:30` da solo | 15:30 |
| `dalle 9`, `verso le 9`, `per le 9` | 9:00 |

### 3.2 Fascia (inizio e fine)

| Si dice | Risultato |
|---|---|
| `dalle 9 alle 11`, `dalle nove alle undici` | 9:00 - 11:00 |
| `dalle 9 e mezza alle 11 meno un quarto` | 9:30 - 10:45 |
| `dalle 9 fino alle 11`, `dalle 10 a mezzogiorno` | 9:00 - 11:00, 10:00 - 12:00 |
| `tra le 9 e le 11` | 9:00 - 11:00 |
| `9-11`, `9:00-11:30` (scritto) | Fascia |

### 3.3 Inizio e durata

| Si dice | Risultato |
|---|---|
| `dalle 18 per due ore`, `alle 18 per 2 ore` | 18:00 - 20:00 |
| `alle 18 per un'ora e mezza` | 18:00 - 19:30 |
| `alle 15 per 45 minuti`, `per tre quarti d'ora` | 15:00 - 15:45 |
| `per mezz'ora`, `per un quarto d'ora` | 30 / 15 minuti |
| `durata 2 ore` | Come "per 2 ore" |

Senza fine né durata un evento dura 1 ora.

### 3.4 Mattina, pomeriggio, sera (da controllare)

1. Con la parte del giorno detta: `alle 3 del pomeriggio` = 15:00, `alle 8 di sera` = 20:00, `alle 10 di notte` = 22:00, `alle 6 di mattina` = 6:00.
2. In una fascia, la parte del giorno detta alla fine vale per entrambe: `dalle 8 alle 10 di sera` = 20:00 - 22:00.
3. Regola automatica: senza indicazioni, **le ore da 1 a 6 sono del pomeriggio** (`alle 3` = 15:00, `dalle 2 alle 4` = 14:00 - 16:00). Non vale per le sveglie (`sveglia alle 6` = 6:00).
4. Se la fine è "prima" dell'inizio, passa al pomeriggio: `dalle 10 alle 2` = 10:00 - 14:00.
5. Per una mattina presto, dirlo: `alle 6 di mattina`.

## 4. Ripetizione

| Si dice | Risultato |
|---|---|
| `ogni giorno`, `tutti i giorni` | Ogni giorno |
| `ogni settimana`, `ogni mese`, `ogni anno` | Frequenza |
| `ogni lunedì`, `tutti i martedì`, `ogni lun, mer e ven` | Giorni della settimana |
| `dal lunedì al venerdì`, `ogni giorno feriale`, `nei giorni feriali` | Lun - ven |
| `ogni weekend`, `ogni fine settimana` | Sab e dom |
| `ogni 2 giorni`, `ogni due settimane`, `ogni tre mesi` | Ogni N |
| `... fino al 30 novembre` | Fine della ripetizione |

`fino al <data>` senza ripetizione allunga un evento fino a quel giorno.

## 5. Avviso

| Si dice | Risultato |
|---|---|
| `avvisami 10 minuti prima`, `ricordamelo un'ora prima` | Avviso |
| `avvisami mezz'ora prima`, `un quarto d'ora prima`, `due ore prima` | Avviso |
| `avviso il giorno prima`, `con avviso un giorno prima` | 1 giorno prima |
| `avvisami`, `con avviso` (senza tempo) | All'ora dell'evento |

## 6. Categoria

| Si dice | Risultato |
|---|---|
| `categoria lavoro`, `nella categoria casa` | Categoria esistente con quel nome |
| `categoria personale viaggio lisbona` | Sottocategoria (categoria + sottocategoria) |
| `#lavoro` (scritto) | Come prima, anche abbreviato |

Se il nome non esiste, le parole restano nel titolo (nessuna categoria nuova creata a voce).

## 7. Indirizzo e note

| Si dice | Risultato |
|---|---|
| `in via Roma 10`, `in piazza Garibaldi 3`, `in corso ...`, `in viale ...` | Indirizzo |
| `indirizzo via Roma 10` | Indirizzo |
| `con nota portare il vino`, `note: ...` | Note: tutto ciò che segue, fino alla fine |

L'indirizzo finisce alla parola chiave successiva (alle, dalle, domani, il, dal, per, ogni, avvisami, categoria, con, giorni della settimana) o alla virgola. Le note vanno dette per ultime.

## 8. Salvataggio a voce

Dire `salva` o `conferma` come ultima parola: l'elemento viene aggiunto subito, senza toccare il pulsante. Senza questa parola, la scheda resta aperta per controllare i campi.

## 9. Esempi completi

1. `dentista giovedì alle 15 e 30` - evento giovedì 15:30 - 16:30.
2. `riunione domani dalle 9 alle 11 categoria lavoro` - evento domani 9:00 - 11:00 in Lavoro.
3. `palestra dalle 18 per due ore ogni martedì` - evento ricorrente 18:00 - 20:00.
4. `ricordami di pagare le bollette lunedì avvisami un'ora prima` - promemoria lunedì con avviso.
5. `sveglia alle 6 e 45 dal lunedì al venerdì` - sveglia feriale 6:45.
6. `cena da Anna in via Roma 10 sabato alle 20 con nota portare il vino` - evento con indirizzo e note.
7. `cinema stasera alle 9` - oggi 21:00.
8. `Lisbona dal primo al tre novembre categoria personale` - evento di tre giorni.
9. `corso ogni lunedì alle 18 fino al 30 novembre salva` - ricorrente con fine, salvato subito.

## 10. Non previsto in questa versione (da decidere)

1. Più elementi in una sola frase ("... e poi ...").
2. Categorie nuove create a voce.
3. Link a voce (si incollano nel campo Link).
4. Durate oltre un giorno con orario (si usa "dal ... al ..." o il modulo).
5. Comandi per annullare o modificare un elemento esistente.
6. Grammatica in inglese: il microfono ascolta sempre in italiano, anche con l'interfaccia in inglese.
