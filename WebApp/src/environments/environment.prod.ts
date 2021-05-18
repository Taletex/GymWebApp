export const environment = {
  production: true,
  apiUrl: 'https://www.mytrainingplatform.it:4000', //Nota: bisogna usare questo e non l'ip perchè altrimenti il refresh quando si accede usando il domain non funziona e da errore di cross-site nell'header http!
  socketConfig: { url: 'https://www.mytrainingplatform.it:4000', options: {} }

};
