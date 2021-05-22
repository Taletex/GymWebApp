export enum MESSAGES {
    // Success
    NOTIFICATION_SENT = "Richiesta correttamente inviata!",
    NOTIFICATION_ACCEPTED = "Richiesta correttamente accettata!",
    NOTIFICATION_REFUSED = "Richiesta correttamente rifiutata!",
    NOTIFICATION_DISMISSED = "Richiesta visualizzata!",
    NOTIFICATION_LINK_DISMISSED = "Richiesta di collegamento correttamente eliminata!",
    NOTIFICATIONS_DISMISSED = "Tutte le richieste sono state visualizzate!",
    NOTIFICATION_CANCELED = "Richiesta cancellata!",
    NOTIFICATIONS_CANCELED = "Tutte le richieste (visualizzate) sono state cancellate!",
    FORGOT_PASSWORD = "Verifica le tue email per le istruzioni di reset password",
    REGISTER_SUCCESS = "Registrazione confermata, controlla le tue email per le istruzioni di verifica",
    PASSWORD_RESET_SUCCESS = "Password reimpostata con successo, puoi effettuare il login",
    VERIFICATION_SUCCESS = "Verifica avvenuta con successo, puoi effettuare il login",
    ACCOUNT_CREATE_SUCCESS = "Account creato con successo!",
    ACCOUNT_UPDATE_SUCCESS = "Account aggiornato con successo!",
    ACCOUNT_DELETE_SUCCESS = "Account cancellato con successo!",
    EXERCISE_CREATE_SUCCESS = "Esercizio creato con successo!",
    EXERCISE_UPDATE_SUCCESS = "Esercizio aggiornato con successo!",
    EXERCISE_DELETE_SUCCESS = "Esercizio cancellato con successo!",
    TRAINING_CREATE_SUCCESS = "Allenamento creato con successo!",
    TRAINING_UPDATE_SUCCESS = "Allenamento aggiornato con successo!",
    TRAINING_DELETE_SUCCESS = "Allenamento cancellato con successo!",
    TRAINING_EXPORT_SUCCESS = "Allenamento esportato con successo!",
    TRAININGS_EXPORT_SUCCESS = "Allenamenti esportati con successo!",
    TRAINING_IMPORT_SUCCESS = "Allenamento importato con successo! Effettua il salvataggio per mantenere le modifiche",
    TRAINING_NOTIFICATION_SUCCESS = "Notifica inviata correttamente agli atleti ",
    TRAINING_NOTIFICATION_ALL_SUCCESS = "Notifica inviata correttamente a tutti gli atleti dell'allenamento!",
    TRAINING_EMAIL_SENT_SUCCESS = "Email correttamente inviate agli utenti",
    USER_CREATE_SUCCESS = "Utente creato con successo!",
    USER_UPDATE_SUCCESS = "Utente aggiornato con successo!",
    USER_DELETE_SUCCESS = "Utente cancellato con successo!",

    // Warning
    REGISTER_FAIL = "Registrazione non riuscita: sono presenti degli errori nella compilazione del form",
    SAVE_FAIL_CAUSE_FORM = "Salvataggio non riuscito: sono presenti degli errori nella compilazione del form",
    IMAGE_NUMBER_LIMIT_EXCEED = "",
    IMAGE_TYPE_WRONG = "",
    IMAGE_SIZE_EXCEED = "",
    TRAINING_FORM_WARNING = "Salvataggio non riuscito: sono presenti degli errori nella compilazione dell'allenamento!",
    EXERCISE_CONVERSION_WARNING = "Nota: il valore di conversione delle precentuali è stato fatto usando l'1RM dell'esercizio che più corrisponde in termini di nome esercizio e nome variante",
    USER_FORM_WARNING = "Salvataggio non riuscito: sono presenti degli errori nella compilazione dell'utente",
    PR_FORM_WARNING = "Salvataggio non riuscito: sono presenti degli errori nella compilazione dei personal record",
    SETTINGS_FORM_WARNING = "Salvataggio non riuscito: sono presenti degli errori nella compilazione delle impostazioni",
    ACCOUNT_FORM_WARNING = "Salvataggio non riuscito: sono presenti degli errori nella compilazione dell'account",

    // Error
    GENERIC_ERROR = "Si è verificato un errore generico",
    HOMEPAGE_LOAD_ERROR = "Si è verificato un errore durante il caricamento della homepage",
    NOTIFICATION_SENT_FAIL = "Si è verificato un errore durante l'invio della richiesta",
    NOTIFICATION_REFUSED_FAIL = "Si è verificato un errore durante l'invio di rifiuto richiesta",
    NOTIFICATION_ACCEPTED_FAIL = "Si è verificato un errore durante l'invio di accettazione richiesta",
    NOTIFICATION_DISMISSED_FAIL = "Si è verificato un errore durante l'invio di visualizzazione richiesta",
    NOTIFICATIONS_DISMISSED_FAIL = "Si è verificato un errore durante l'invio di visualizzazione di tutte le richieste",
    NOTIFICATION_DELETE_FAIL = "Si è verificato un errore durante l'invio di cancellazione della richiesta",
    NOTIFICATIONS_DELETE_FAIL = "Si è verificato un errore durante l'invio di cancellazione di tutte le richieste",
    NOTIFICATIONS_CANCEL_LINK_FAIL = "Si è verificato un errore durante la cancellazione del collegamento utente",
    NOTIFICATIONS_CANCEL_LINK_REQUEST_FAIL = "Si è verificato un errore durante la cancellazione della richiesta collegamento utente",
    FORGOT_PASSWORD_FAIL = "Si è verificato un errore durante l'invio di richiesta password dimenticata",
    LOGIN_FAIL = "Si è verificato un errore durante il login",
    RESET_PSW_FAIL = "Si è verificato un errore durante il ripristino della password",
    ACCOUNT_GET_FAIL = "Si è verificato un errore durante il caricamento della dell'account",
    ACCOUNTS_GET_FAIL = "Si è verificato un errore durante il caricamento della lista account",
    ACCOUNT_CREATE_FAIL = "Si è verificato un errore durante la creazione dell'account",
    ACCOUNT_DELETE_FAIL = "Si è verificato un errore durante l'eliminazione dell'account",
    ACCOUNT_UPDATE_FAIL = "Si è verificato un errore durante l'aggiornamento dell'account",
    EXERCISE_GET_FAIL = "Si è verificato un errore durante il caricamento dell'esercizio",
    EXERCISES_GET_FAIL = "Si è verificato un errore durante il caricamento della lista di esercizi",
    EXERCISE_CREATE_FAIL = "Si è verificato un errore durante la creazione dell'esercizio",
    EXERCISE_DELETE_FAIL = "Si è verificato un errore durante l'eliminazione dell'esercizio",
    EXERCISE_UPDATE_FAIL = "Si è verificato un errore durante l'aggiornamento dell'esercizio",
    TRAINING_GET_FAIL = "Si è verificato un errore durante il caricamento dell'esercizio",
    TRAININGS_GET_FAIL = "Si è verificato un errore durante il caricamento della lista di allenamenti",
    TRAINING_CREATE_FAIL = "Si è verificato un errore durante la creazione dell'allenamento",
    TRAINING_DELETE_FAIL = "Si è verificato un errore durante l'eliminazione dell'allenamento",
    TRAINING_UPDATE_FAIL = "Si è verificato un errore durante l'aggiornamento dell'allenamento",
    TRAINING_IMPORT_FAIL = "Si è verificato un errore durante l'importazione dell'allenamento",
    TRAINING_EXPORT_FAIL = "Si è verificato un errore durante l'esportazione dell'allenamento",
    TRAINING_NOTIFICATION_FAIL = "Si è verificato un errore durante l'invio delle notifiche agli atleti dell'allenamentoo",
    TRAINING_EMAIL_FAIL = "Si è verificato un errore durante l'invio delle email agli atleti dell'allenamento. Verifica che gli utenti destinatari abbiano configurato una email",
    TRAINING_ATHLETE_GET_FAIL = "Si è verificato un errore durante il caricamento della lista di allenamenti e atleti",
    USER_GET_FAIL = "Si è verificato un errore durante il caricamento dell'utente",
    USERS_GET_FAIL = "Si è verificato un errore durante il caricamento della lista di utenti",
    USER_CREATE_FAIL = "Si è verificato un errore durante la creazione dell'utente",
    USER_DELETE_FAIL = "Si è verificato un errore durante l'eliminazione dell'utente",
    USER_UPDATE_FAIL = "Si è verificato un errore durante l'aggiornamento dell'utente",
    ATHLETE_GET_FAIL = "Si è verificato un errore durante il caricamento della lista di atleti",
    COACH_GET_FAIL = "Si è verificato un errore durante il caricamento della lista di coach",

    // From Backend
    UNAUTHORIZED = "Non autorizzato",
    TOKEN_REQUIRED = "Token obbligatorio",
    TOKEN_REVOKED = "Token revocato",
    TOKEN_VALID = "Token valido",
    
    EXERCISE_NOT_FOUND_ID = "Esercizio non trovato, id ",
    EXERCISE_ERROR_FOUND_ID = "Si è verifiato un errore durante la ricerca dell'esercizio con id ",
    EXERCISE_ERROR_UPDATE_ID = "Si è verifiato un errore durante l'aggiornamento dell'esercizio con id ",
    EXERCISE_CONTENT_EMPTY = "Il contenuto dell'esercizio non può essere vuoto",
    EXERCISE_CONTENT_INVALID = "L'esercizio contiene valori non validi",
    EXERCISE_CREATE_GENERIC_ERROR = "Si è verificato un errore durante la creazione dell'esercizio",
    EXERCISE_IMAGE_ERROR = "Si è verificato un errore durante il salvataggio delle immagini dell'esercizio",
    EXERCISE_DELETE_FAIL_ID = "Si è verificato un errore durante l'eliminazione dell'esercizio con id ",

    TRAINING_NOT_FOUND_ID = "Allenamento non trovato, id ",
    TRAINING_ERROR_FOUND_ID = "Si è verifiato un errore durante la ricerca dell'allenamento con id ",
    TRAINING_ERROR_UPDATE_ID = "Si è verifiato un errore durante l'aggiornamento dell'allenamento con id ",
    TRAINING_CONTENT_EMPTY = "Il contenuto dell'allenamento non può essere vuoto",
    TRAINING_CONTENT_INVALID = "L'allenamento contiene valori non validi",
    TRAINING_CREATE_GENERIC_ERROR = "Si è verificato un errore durante la creazione dell'allenamento",
    TRAINING_DELETE_FAIL_ID = "Si è verificato un errore durante l'eliminazione dell'allenamento con id ",
    TRAINING_EMAIL_LIST_EMPTY_ERROR = "La lista di email destinatarie è vuota",
    TRAINING_EMAIL_BODY_EMPTY_ERROR = "Il corpo dell'email è vuoto",
    PDF_CREATION_ERROR = "Si è verificato un errore durante la creazione del pdf",

    USER_NOT_FOUND = "Utente non trovato",
    USER_NOT_FOUND_ID = "Utente non trovato, id ",
    USER_ERROR_FOUND_ID = "Si è verifiato un errore durante la ricerca dell'utente con id ",
    USER_ERROR_UPDATE_ID = "Si è verifiato un errore durante l'aggiornamento dell'utente con id ",
    USER_CONTENT_EMPTY = "Il contenuto dell'utente non può essere vuoto",
    USER_CONTENT_INVALID = "L'utente contiene valori non validi",
    USER_CREATE_GENERIC_ERROR = "Si è verificato un errore durante la creazione dell'utente",
    USER_IMAGE_ERROR = "Si è verificato un errore durante il salvataggio dell'immagine del profilo",
    USER_DELETE_FAIL_ID = "Si è verificato un errore durante l'eliminazione dell'utente con id ",

    NOTIFICATION_CONTENT_EMPTY = "Il contenuto della notifica non può essere vuoto",
    NOTIFICATION_SENT_GENERIC_ERROR = "Si è verificato un errore durante l'invio della notifica (tipo notifica non riconosciuto, collegamento tra atleta e coach già esiste o richiesta già inviata)",
    NOTIFICATION_LINK_YET_EXISTS_ERROR = "Si è verificato un errore durante l'aggiornamento degli utenti nella notifica di conferma: il collegamento tra atleta e coach esiste già",
    NOTIFICATION_ACCEPT_UPDATE_USER_ERROR = "Si è verificato un errore durante l'aggiornamento dell'utente nella conferma della richiesta",
    NOTIFICATION_ACCEPT_UPDATE_USER_ERROR_SPECIFIC = "Si è verificato un errore durante l'aggiornamento dell'utente nella conferma della richiesta: notifica da accettare non trovata",
    NOTIFICATION_REFUSE_UPDATE_USER_ERROR = "Si è verificato un errore durante l'aggiornamento dell'utente nel rifiuto della richiesta",
    NOTIFICATION_REFUSE_UPDATE_USER_ERROR_SPECIFIC = "Si è verificato un errore durante l'aggiornamento dell'utente nel rifiuto della richiesta: notifica da rifiutare non trovata",
    NOTIFICATION_DISMISS_UPDATE_USER_ERROR = "Si è verificato un errore durante l'aggiornamento dell'utente nella visualizzazione della notifica",
    NOTIFICATION_DISMISS_UPDATE_USER_ERROR_SPECIFIC = "Si è verificato un errore durante l'aggiornamento dell'utente nella visualizzazione della notifica: notifica da visualizzare non trovata",
    NOTIFICATION_CANCEL_LINK_UPDATE_USER_ERROR = "Si è verificato un errore durante l'aggiornamento dell'utente nella richiesta di cancellazione collegamento utente",
    NOTIFICATION_CANCEL_LINK_UPDATE_USER_ERROR_SPECIFIC = "Si è verificato un errore durante l'aggiornamento degli utenti nella richiesta di cancellazione collegamento utente: collegamento tra atleta e coach non esistente",
    NOTIFICATIONS_DISMISS_UPDATE_USER_ERROR = "Si è verificato un errore durante l'aggiornamento dell'utente nella visualizzazione di tutte le notifiche",
    NOTIFICATIONS_DISMISS_UPDATE_USER_ERROR_SPECIFIC = "Si è verificato un errore durante l'aggiornamento dell'utente nella visualizzazione tutte le notifiche: non ci sono notifiche da visualizzare",
    NOTIFICATIONS_DELETE_UPDATE_USER_ERROR = "Si è verificato un errore durante l'aggiornamento dell'utente nella eliminazione di tutte le notifiche",
    NOTIFICATIONS_DELETE_UPDATE_USER_ERROR_SPECIFIC = "Si è verificato un errore durante l'aggiornamento dell'utente nella eliminazione tutte le notifiche: non ci sono notifiche da eliminare",
    NOTIFICATION_DELETE_UPDATE_USER_ERROR = "Si è verificato un errore durante l'aggiornamento dell'utente nella eliminazione della notifica",
    NOTIFICATION_DELETE_UPDATE_USER_ERROR_SPECIFIC = "Si è verificato un errore durante l'aggiornamento dell'utente nella eliminazione della notifica: notifica da eliminare non trovata",
    
}