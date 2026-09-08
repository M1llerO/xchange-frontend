# Feature 3 — Gestione oggetti personali (inventario)

Documento di riferimento: cosa fa la feature, come e' stata realizzata,
il workflow utente e il dialogo col backend.

Progetto: xchange-frontend (Angular 22, standalone components + signals)
Backend: demoXChange (Spring Boot, JWT)


## 1. A cosa serve

Ogni utente autenticato ha un "magazzino" personale di oggetti (entita' Item
nel backend). Sono la roba che possiede e che potra' poi mettere in un annuncio
pubblico (Listing, Feature 4) per proporla in scambio.

La Feature 3 copre tutto il ciclo di vita di un oggetto:

    - vedere la lista dei propri oggetti, con ricerca e filtri
    - crearne di nuovi
    - modificarli
    - archiviarli ("eliminarli" dal punto di vista dell'utente)
    - gestire le foto di ogni oggetto: caricarle, riordinarle, cancellarle

Tutto cio' che riguarda gli Item e' privato: un utente vede e tocca solo i
propri. Questo NON e' gestito dal frontend: e' il backend che ricava il
proprietario dal token JWT e lo impone in ogni query.


## 2. Dove si inserisce nell'app

L'app era gia' predisposta con:

    - autenticazione JWT (AuthService: login, salvataggio token in localStorage,
      decodifica claims, check scadenza)
    - authGuard: blocca le rotte protette se non si e' loggati, redirige a /login
    - authInterceptor: aggiunge "Authorization: Bearer <token>" a ogni richiesta
    - errorInterceptor: su 401 fa logout + redirect a /login, su 403 va a /forbidden
    - il layer di modelli e servizi per il backend (item.model.ts, item.ts,
      item-image.ts erano gia' scritti, insieme a quelli delle altre feature)

La Feature 3 ha aggiunto SOPRA questo layer i tre schermi (componenti) e due
utility, piu' le rotte.


## 3. File del progetto

### Creati per questa feature (non ancora committati)

    src/app/features/items/
        item-list/     item-list.ts / .html / .css     -> lista + filtri
        item-form/     item-form.ts / .html / .css      -> crea e modifica
        item-images/   item-images.ts / .html / .css    -> galleria foto
        item.constants.ts                               -> le 6 condizioni

    src/app/core/asset-url.util.ts                       -> URL assoluti per le foto

### Modificati

    src/app/app.routes.ts   -> aggiunte 4 rotte sotto authGuard

### Gia' esistenti, usati dalla feature

    src/app/models/item.model.ts     interfacce ItemDto, ItemImageDto,
                                     CreateItemRequest, UpdateItemRequest,
                                     ItemQueryParams, tipo ItemCondition
    src/app/services/item.ts         ItemService: getAll, getById, create,
                                     update, delete
    src/app/services/item-image.ts   ItemImageService: list, upload, reorder,
                                     remove
    src/app/services/category.ts     CategoryService.getAll (per i menu categoria)
    src/app/core/http-params.util.ts buildParams: costruisce la query string
                                     saltando i valori null/undefined
    src/app/core/api-error.util.ts   extractErrorMessage: pesca "message" dal
                                     corpo ApiError del backend


## 4. Le rotte

    /items                lista oggetti          -> ItemList
    /items/new            nuovo oggetto          -> ItemForm  (modalita' create)
    /items/:id/edit       modifica oggetto       -> ItemForm  (modalita' edit)
    /items/:id/images     foto dell'oggetto      -> ItemImages

Tutte con canActivate: [authGuard]. Sono lazy: loadComponent con import()
dinamico, quindi ogni schermo e' un chunk separato caricato solo quando serve.

Dopo il merge con il lavoro del compagno, queste 4 rotte sono figlie della
rotta radice che monta LayoutComponent (il guscio con la navbar). Quindi gli
schermi Item vengono renderizzati dentro il layout comune, non a pagina piena.
La rotta segnaposto "items" -> ItemsComponent che c'era nel branch del compagno
e' stata rimossa e sostituita da queste.


## 5. Workflow utente, passo per passo

### 5a. Vedere i propri oggetti

    1. L'utente apre /items.
    2. ngOnInit chiama due cose:
       - CategoryService.getAll()  -> popola il menu a tendina "Categoria" del
         filtro. Se fallisce non e' un problema bloccante: la lista funziona lo
         stesso, semplicemente il menu resta vuoto.
       - load()  -> carica gli oggetti.
    3. load() legge i valori correnti del form filtri, li trasforma in
       ItemQueryParams (i campi vuoti diventano undefined cosi' non finiscono
       nella query string), e chiama ItemService.getAll(params).
    4. Il risultato viene messo nel signal items(). Il template mostra:
       - "Caricamento..." finche' loading() e' true
       - il messaggio di errore se errorMessage() e' valorizzato
       - "Nessun oggetto trovato" se la lista e' vuota
       - altrimenti la griglia di card

Ogni card mostra: foto principale (la prima per displayOrder, o un placeholder),
titolo, categoria, etichetta condizione, valore stimato formattato, e il badge
"Archiviato" se e' il caso. Le card archiviate sono mostrate in trasparenza.

### 5b. Filtrare

Il form filtri (Reactive Form) ha: parola chiave, categoria, condizione,
valore minimo, valore massimo, checkbox "includi archiviati".

    - "Applica filtri" (submit del form) richiama load().
    - "Azzera" resetta il form ai valori di default e richiama load().

I filtri NON sono reattivi al singolo tasto: si applicano solo al submit. E'
una scelta voluta, evita una raffica di chiamate HTTP mentre si digita.

### 5c. Creare un oggetto

    1. Da /items il pulsante "Nuovo oggetto" porta a /items/new.
    2. ItemForm si accorge che non c'e' :id nella rotta -> isEdit = false.
    3. Carica le categorie (solo quelle attive: category.active === true) per il
       menu a tendina.
    4. L'utente compila il form. Validazioni lato client (Reactive Forms):
       - categoria obbligatoria
       - titolo obbligatorio, max 120 caratteri
       - descrizione obbligatoria, max 2000 caratteri
       - valore stimato opzionale, ma se presente >= 0
       - condizione obbligatoria
    5. Al submit, se il form e' valido, si costruisce un CreateItemRequest.
       Nota: estimatedValue viene incluso nel payload solo se l'utente l'ha
       davvero inserito (altrimenti si omette, non si manda null).
    6. ItemService.create() -> POST /api/items.
    7. Al successo si viene rediretti a /items/:id/images del nuovo oggetto:
       il flusso naturale dopo aver creato una cosa e' aggiungerle le foto.

### 5d. Modificare un oggetto

    1. Da una card, "Modifica" porta a /items/:id/edit.
    2. ItemForm vede :id -> isEdit = true, loading parte a true.
    3. ItemService.getById(id) -> GET /api/items/:id. I dati tornati vengono
       riversati nel form con patchValue.
    4. In modalita' edit compare in piu' la checkbox "Oggetto archiviato".
    5. Al submit si costruisce un UpdateItemRequest (come il create, ma con in
       piu' il campo archived) e si chiama ItemService.update() -> PUT /api/items/:id.
    6. Al successo si torna a /items (non alle immagini: l'oggetto esiste gia').

Lo stesso componente ItemForm serve sia "nuovo" sia "modifica": la differenza
e' solo la presenza di :id nella rotta.

### 5e. "Eliminare" un oggetto

    1. Da una card, "Elimina" apre un confirm() del browser.
    2. Se confermato: ItemService.delete(id) -> DELETE /api/items/:id.
    3. Al successo la card viene tolta dalla lista in memoria (items.update
       che filtra via l'elemento).

ATTENZIONE: lato backend delete() NON cancella la riga, fa soft-delete
(item.setArchived(true)). Quindi l'oggetto "eliminato" ricompare se poi si
spunta "Includi archiviati". Il testo del confirm ("operazione non
reversibile") e' quindi impreciso: da rivedere.

### 5f. Gestire le foto

Schermata /items/:id/images, componente ItemImages.

    Caricamento (upload):
    1. "Aggiungi immagine" e' una <label> che nasconde un <input type="file">.
    2. onFileSelected controlla PRIMA di inviare:
       - tipo MIME in [image/jpeg, image/png, image/webp]
       - dimensione <= 5 MB
       - non piu' di 10 immagini in totale
       Se un controllo fallisce, mostra un messaggio e non invia nulla.
    3. Se ok: ItemImageService.upload(itemId, file) costruisce un FormData con
       campo "file" e fa POST /api/items/:itemId/images (multipart).
    4. L'immagine tornata viene aggiunta in coda al signal images().
    5. input.value viene svuotato dopo ogni scelta, cosi' si puo' ri-selezionare
       lo stesso file dopo un errore.

    Riordino:
    - Due modi: bottoni "Su"/"Giu'" su ogni riga, oppure drag & drop nativo
      HTML5 (draggable="true", eventi dragstart/dragover/drop/dragend).
    - In entrambi i casi si riordina subito l'array in memoria (ottimistico) e
      poi si chiama persistOrder().
    - persistOrder manda la lista ordinata di id a
      PATCH /api/items/:itemId/images/order (corpo { imageIds: [...] }).
    - Il backend risponde con la lista aggiornata e la si ri-ordina per
      displayOrder. Se la chiamata fallisce, si mostra l'errore e si ricarica
      dal server l'ordine vero (reloadImages), annullando lo spostamento.

    Cancellazione:
    - "Elimina" su una riga -> ItemImageService.remove(itemId, imageId) ->
      DELETE /api/items/:itemId/images/:imageId, poi reloadImages().


## 6. Dialogo col backend

### Endpoint usati

    GET    /api/items                          lista (search) con filtri
    GET    /api/items/{id}                     dettaglio
    POST   /api/items                          crea
    PUT    /api/items/{id}                     modifica
    DELETE /api/items/{id}                     archivia (soft-delete)
    GET    /api/items/{itemId}/images          lista foto
    POST   /api/items/{itemId}/images          carica foto (multipart, campo "file")
    PATCH  /api/items/{itemId}/images/order    riordina (body { imageIds: [...] })
    DELETE /api/items/{itemId}/images/{imageId} cancella foto

### Autenticazione

Il frontend non passa mai un "ownerId". Ogni richiesta esce con l'header
Authorization messo dall'authInterceptor. Il backend legge il claim "uid" dal
JWT e:

    - in search() filtra SEMPRE per owner.id = uid (e' hardcoded nella query
      del repository, non e' un parametro opzionale)
    - in getById/update/delete usa findByIdAndOwnerId: se l'oggetto non e' tuo,
      risponde 404

Quindi GET /api/items senza parametri restituisce gia' e solo i propri oggetti.
Non serve nessun parametro "mine" ne' un endpoint dedicato.

### Filtri (query string)

buildParams costruisce la query saltando null e undefined. Parametri possibili:
categoryId, condition, minValue, maxValue, q, includeArchived.
Il backend, se riceve minValue > maxValue, risponde 400 con codice
"invalid_price_range". Il frontend non fa questo controllo prima dell'invio:
si affida al messaggio del backend.

### Condizioni

Tipo TypeScript ItemCondition e enum Java ItemCondition hanno gli stessi 6
valori, con lo stesso nome:

    nuovo, come_nuovo, ottime, buone, discrete, da_riparare

item.constants.ts tiene la coppia valore -> etichetta leggibile
(CONDITION_OPTIONS per i menu, CONDITION_LABELS per mostrare la condizione di un
oggetto salvato).

### URL delle immagini

Il backend restituisce path relativi tipo "/files/items/5/foo.jpg".
resolveAssetUrl() li trasforma in URL assoluti verso il backend, ricavando
l'origine da environment.apiUrl togliendo il suffisso "/api"
(es. http://localhost:8080/api -> http://localhost:8080). Gli URL gia' assoluti
li lascia intatti.

### Gestione errori

Ogni chiamata gestisce l'errore nel blocco error della subscribe, passando la
HttpErrorResponse a extractErrorMessage(err, fallback): se il corpo e' un
ApiError con un campo "message", usa quello; altrimenti il testo di fallback.
Il messaggio finisce nel signal errorMessage() e viene mostrato nel template.
I 401 e 403 sono gestiti a monte dall'errorInterceptor (logout / forbidden).


## 7. Note tecniche trasversali

    - Stato con signals: items(), categories(), loading(), errorMessage(),
      uploading(), savingOrder(), dragIndex()... aggiornati con .set() e
      .update(). Il template si aggiorna da solo.
    - Standalone components: niente NgModule. Ogni componente dichiara i propri
      import (CommonModule, RouterLink, ReactiveFormsModule).
    - Dependency injection con inject() invece del costruttore.
    - Reactive Forms tipizzati (FormBuilder, nonNullable dove ha senso).
    - Il flag submitting()/uploading()/savingOrder() serve a disabilitare i
      pulsanti ed evitare doppi invii.
    - CSS: file per componente, usa variabili CSS globali (--color-*, --space-*,
      --radius-*) definite altrove nel progetto. Target touch: min-height 44px
      sui controlli. Media query per il mobile.
    - Accessibilita': label collegate agli input, alt sulle immagini,
      aria-label sui bottoni icona del riordino.


## 8. Cosa manca / da rifinire

    1. (fatto) Committata e mergiata col branch del compagno.
    2. Navigazione: LayoutComponent (dal merge) ha la navbar. Verificare che ci
       sia una voce di menu verso /items e che punti alla rotta giusta.
    3. Il confirm di "Elimina" dice "non reversibile" ma il backend archivia.
       Meglio: parlare di "archiviazione" e ricaricare la lista invece di
       togliere la card a mano.
    4. Nessun test .spec.ts per i tre componenti (le altre feature ne hanno).
    5. Il controllo minValue <= maxValue si potrebbe fare anche lato client
       per dare feedback immediato.
