import express from "express";
import moment from "moment";
import bodyParser from "body-parser";
import path from "path";

import {
  getNotelastnumint,
  getNoteStLi,
  getNoteStLis,
  getDbTab,
  getBodyTab,
  getColTab,
  getNoteStBe,
  getNotePreis,
  getNoteBestanl,
  getTabdataDanfbestellung,
  getTabheadDanfbestellung,
  getNoteSucheBestellung,
  createNoteBestanl,
  createNoteStLi,
  getNotefeppreis,
  getNotecalc,
  getNotedanffep,
  getNoteEtMail,
} from "./msdb2.js";

import { docxErstellen } from "./bestelldoc.js";
import { staffelrechner } from "./staffelrechner.js";

var uebergabe;
var docfills = {};
var suchData = [];
var boddat = [];
var fepaBestNr = "nn";
var fepaPreis;
var docxname = "";
var maildat = {};

const app = express();

//middleware

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("./public"));

app.set("view engine", "ejs");

//Routes

app.get("/index", (req, res) => {
  res.render("./index");
});

app.get("/fehlTeilBest", (req, res) => {
  res.render("./fehlTeilBest");
});

app.post("/stueck", async (req, res) => {
  const parcel = req.body;
  if (!parcel) {
    res.status(400).send({ status: "failed" });
    return;
  }
  let dbwert = parcel.Bestuecker.BestNr;
  console.log("DB Wert: ", dbwert); //ID für Suchzwecke
  let befehl2 = JSON.parse(JSON.stringify(parcel.Bestuecker));

  console.log("Datsatzvalues: ", befehl2); //Dateisatz Inhalte zum Einfügen in die Tabelle
  const ausgabedb = await createNoteStLi(befehl2);
  console.log(ausgabedb);
  const dbantwort = await getNoteStLi(dbwert);
  let rüdbantwort = JSON.parse(JSON.stringify(dbantwort));
  console.log(rüdbantwort);
  res.json(rüdbantwort);
});

app.post("/mailform", async (req, res) => {
  const parcel = req.body;
  if (!parcel) {
    res.status(400).send({ status: "failed" });
    return;
  }
  let dbwert = parcel.Mailinhalt;
  console.log("Mailinhalt Wert: ", dbwert); //ID für Suchzwecke
  let befehl2 = JSON.parse(JSON.stringify(parcel.Mailinhalt));

  console.log("Datsatzvalues: ", befehl2); //Dateisatz Inhalte zum Einfügen in die Tabelle
  const ausgabedb = await getNoteEtMail(befehl2.Intnr);

  ausgabedb.ETnr = dbwert.ETnr;
  ausgabedb.Sollmenge = dbwert.Sollmenge;
  ausgabedb.Istmenge = dbwert.Istmenge;
  ausgabedb.Fehlmenge = dbwert.Fehlmenge;
  console.log("DB A U S G A B E : ", ausgabedb);
  // ausgabedb.intbestnr = dbwert;
  maildat = ausgabedb;
  res.json(ausgabedb);
});

app.get("/mailform", (req, res) => {
  console.log("MailDat in mailform: ", maildat);
  let best_nr = maildat[0].DanfBestNr;
  let ord_nr = maildat[0].DanfOrdNr;
  let satz_nr = maildat[0].SatzID;
  let ETnr = maildat.ETnr;
  let Sollmenge = maildat.Sollmenge;
  let Istmenge = maildat.Istmenge;
  let Fehlmenge = maildat.Fehlmenge;
  console.log("TestbestNr: ", best_nr);
  res.render("./mailform", {
    best_nr,
    ord_nr,
    satz_nr,
    ETnr,
    Sollmenge,
    Istmenge,
    Fehlmenge,
  });
});

app.post("/bestellung", async (req, res) => {
  const parcel = req.body;
  if (!parcel) {
    return res.status(400).send({ status: "failed" });
  }
  //res.json(parcel);
  console.log(typeof parcel);
  console.log(parcel);
  let dbwert = parcel.Dichtsatz.BestNr;
  console.log("DB Wert:: ", dbwert); //ID für Suchzwecke

  docfills = JSON.parse(JSON.stringify(parcel));
  console.log("komplett: ", docfills);

  const Staffelmenge = docfills.Dichtsatz.Menge;
  console.log("Staffelmenge ", Staffelmenge);
  const staffelPreis = staffelrechner(Staffelmenge, fepaPreis);
  docfills.Dichtsatz.Staffelpreis = staffelPreis;
  docfills.Dichtsatz.fepaNr = fepaBestNr;
  docfills.Dichtsatz.fepaPreis = fepaPreis;
  let Auftragswert = staffelPreis * Staffelmenge;
  Auftragswert = Auftragswert.toFixed(2);
  docfills.Dichtsatz.Auftragswert = Auftragswert;

  parcel.Dichtsatz.fepaNr = docfills.Dichtsatz.fepaNr;
  parcel.Dichtsatz.einzelPreis = docfills.Dichtsatz.fepaPreis;
  parcel.Dichtsatz.Staffelpreis = staffelPreis;
  parcel.Dichtsatz.Auftragswert = docfills.Dichtsatz.Auftragswert;
  parcel.Dichtsatz.fepAuftrag = 199999;

  let befehl2;
  befehl2 = parcel.Dichtsatz;
  //befehl2 = JSON.parse(JSON.stringify(parcel.Dichtsatz));
  console.log("Datensatz fuer db ", befehl2); //Dateisatz Inhalte zum Einfügen in die Tabelle

  const ausgabedb = await createNoteBestanl(befehl2);
  console.log(ausgabedb);

  const dbantwort = await getNoteBestanl(dbwert);
  let rüdbantwort = JSON.parse(JSON.stringify(dbantwort));
  console.log("Antwot von Datenbank nach anlegen: ", rüdbantwort);

  res.json(rüdbantwort);
  docxname = await docxErstellen(docfills, fepaBestNr, fepaPreis);
  console.log("download file: ", docxname);
});

app.get("/download", (req, res) => {
  res.download(path.resolve("./public/print/" + docxname));
});

app.get("/anlegen", async (req, res) => {
  let ausgabe1 =
    "Datensatz ist in Tabelle angelegt, ich befinde mich am Endpunkt -anlegen-";
  console.log(ausgabe1);

  // Table head
  const tabhead = await getTabheadDanfbestellung("danfbestellung");
  let ergebnis = JSON.parse(JSON.stringify(tabhead));
  let end = ergebnis.length;
  let headName = [];
  for (let i = 0; i < ergebnis.length; i++) {
    headName[i] = ergebnis[i].Field;
  }

  //Table body

  const tabdata = await getTabdataDanfbestellung();
  let datErgebnis = JSON.parse(JSON.stringify(tabdata));
  let datSatz = Object.values(datErgebnis[1]);
  let datLength = datErgebnis.length;
  res.render("./anlegen", {
    headName,
    end,
    datErgebnis,
    datSatz,
    datLength,
  });
});

app.get("/stuecklneu", (req, res) => {
  res.render("./stuecklneu");
});

app.get("/info", async (req, res) => {
  const ergebnis = await getDbTab();
  console.log(ergebnis);
  const end = ergebnis.length;
  console.log(end);
  res.render("./infos", { ergebnis, end });
});

app.get("/calc", async (req, res) => {
  let id = uebergabe;
  console.log(uebergabe);
  let stuecklistcall = await getNoteStLis(id);
  let calcdata = await getNotecalc(id);
  let parsfepa = await getNotedanffep(id);
  let idfep = await parsfepa[0];
  idfep = idfep.ArtikelNr;
  let feppreis = await getNotefeppreis(idfep);
  let vkfep = feppreis[0];
  vkfep = vkfep.Verkaufspreis;

  //Berechnungs-Eckdaten aus Tabelle in Variablen umwandeln

  let Stundenlohn = calcdata[0];
  Stundenlohn;
  Stundenlohn = Stundenlohn.stdLohn;
  console.log("Sundenlohn: ", Stundenlohn);

  let stückteile = stuecklistcall[0];
  stückteile = stückteile.Teile;
  console.log("stückteile: ", stückteile);

  let stücktüten = stuecklistcall[0];
  stücktüten = stücktüten.Tüten;
  console.log("stücktüten: ", stücktüten);

  let stückpappen = stuecklistcall[0];
  stückpappen = stückpappen.Pappen;
  console.log("stückpappen: ", stückpappen);

  let stückkopien = stuecklistcall[0];
  stückkopien = stückkopien.Kopien;
  console.log("stückkopien: ", stückkopien);

  let zeitdichtung = calcdata[0];
  zeitdichtung = zeitdichtung.ztDichtung;
  console.log("zeitdichtung: ", zeitdichtung);
  let zeitbetragteile = ((zeitdichtung * stückteile) / 3600) * Stundenlohn;
  //zeitbetragteile = zeitbetragteile.toFixed(2);
  console.log("Zeitaufwandbetrag für Dichtungen in Euro: ", zeitbetragteile);
  let zeittüten = calcdata[0];
  zeittüten = zeittüten.ztTueten;
  console.log("zeittüten: ", zeittüten);
  let zeitbetragtüten = ((zeittüten * stücktüten) / 3600) * Stundenlohn;
  //zeitbetragtüten = zeitbetragtüten.toFixed(2);
  console.log("Zeitaufwandbetrag für Tüten in Euro: ", zeitbetragtüten);

  let zeitpappen = calcdata[0];
  zeitpappen = zeitpappen.ztPappen;
  console.log("zeitpappen: ", zeitpappen);
  let zeitbetragpappen = ((zeitpappen * stückpappen) / 3600) * Stundenlohn;
  //zeitbetragpappen = zeitbetragpappen.toFixed(2);
  console.log("Zeitaufwandbetrag für Pappen in Euro: ", zeitbetragpappen);

  let zeitkopien = calcdata[0];
  zeitkopien = zeitkopien.ztKopien;
  console.log("zeitkopien: ", zeitkopien);
  let zeitbetragkopien = ((zeitkopien * stückkopien) / 3600) * Stundenlohn;
  //zeitbetragkopien = zeitbetragkopien.toFixed(2);
  console.log("Zeitaufwandbetrag für Kopien in Euro: ", zeitbetragkopien);
  let zeitfolien = calcdata[0];
  zeitfolien = zeitfolien.ztUmverp;
  console.log("zeitfolien: ", zeitfolien);
  let zeitbetragfolien = (zeitfolien / 3600) * Stundenlohn;
  //zeitbetragfolien = zeitbetragfolien.toFixed(2);
  console.log("Zeitaufwandbetrag für Folie in Euro: ", zeitbetragfolien);

  let zeitsumme =
    zeitbetragkopien +
    zeitbetragfolien +
    zeitbetragtüten +
    zeitbetragpappen +
    zeitbetragteile;
  let zeitsummeout = zeitsumme.toFixed(2);
  console.log("Summe Zeitaufwand: ", zeitsummeout);

  let stTüten = calcdata[0];
  stTüten = stTüten.mpTueten;
  console.log("stTüten: ", stTüten);
  let stbetragtüten = stTüten * stücktüten;
  console.log("Mattüten: ", stbetragtüten);

  let stFolien = calcdata[0];
  stFolien = stFolien.mpUmverp;
  console.log("stFolien: ", stFolien);

  let stbetragFolien = stFolien;
  console.log("MatFolie: ", stbetragFolien);

  let stPapier = calcdata[0];
  stPapier = stPapier.mpPapier;
  console.log("stPapier: ", stPapier);
  let stbetragKopien = stPapier * stückkopien;
  console.log("Matkopien: ", stbetragKopien);

  let Zuschlag = calcdata[0];
  Zuschlag = Zuschlag.Zuschlag;
  console.log("Zuschlag: ", Zuschlag);

  let Materialanteil = stbetragtüten + stbetragKopien + stbetragFolien;
  let Materialanteilout = Materialanteil.toFixed(2);
  console.log("Materialanteil: ", Materialanteilout);

  let komplettpreis = zeitsumme + Materialanteil;
  let komplettpreisout = komplettpreis.toFixed(2);
  console.log("Komplettpreis ohne Zuschlag: ", komplettpreisout);

  let calcPreis = (zeitsumme + Materialanteil) * Zuschlag;
  let calcPreisout = calcPreis.toFixed(2);
  console.log("kalkulierter Preis: ", calcPreisout);

  //-----------------------------------------

  //Zeitberechnung:

  // Testausgaben db
  console.log(stuecklistcall);
  console.log(calcdata);

  // console.log ("parsfepa: ",parsfepa);
  console.log("idfep: ", idfep);
  //console.log (parsfepa);
  //console.log (feppreis);
  console.log("fepa Preis: ", vkfep);

  res.render("./calc", {
    vkfep,
    id,
    zeitsummeout,
    Materialanteilout,
    komplettpreisout,
    calcPreisout,
  });
});

app.get("/calcnew", async (req, res) => {
  let id = uebergabe;
  console.log(uebergabe);
  let stuecklistcall = await getNoteStLis(id);
  let calcdata = await getNotecalc(id);

  //Berechnungs-Eckdaten aus Tabelle in Variablen umwandeln

  let Stundenlohn = calcdata[0];
  Stundenlohn;
  Stundenlohn = Stundenlohn.stdLohn;
  console.log("Sundenlohn: ", Stundenlohn);

  let stückteile = stuecklistcall[0];
  stückteile = stückteile.Teile;
  console.log("stückteile: ", stückteile);

  let stücktüten = stuecklistcall[0];
  stücktüten = stücktüten.Tüten;
  console.log("stücktüten: ", stücktüten);

  let stückpappen = stuecklistcall[0];
  stückpappen = stückpappen.Pappen;
  console.log("stückpappen: ", stückpappen);

  let stückkopien = stuecklistcall[0];
  stückkopien = stückkopien.Kopien;
  console.log("stückkopien: ", stückkopien);

  let zeitdichtung = calcdata[0];
  zeitdichtung = zeitdichtung.ztDichtung;
  console.log("zeitdichtung: ", zeitdichtung);
  let zeitbetragteile = ((zeitdichtung * stückteile) / 3600) * Stundenlohn;
  //zeitbetragteile = zeitbetragteile.toFixed(2);
  console.log("Zeitaufwandbetrag für Dichtungen in Euro: ", zeitbetragteile);
  let zeittüten = calcdata[0];
  zeittüten = zeittüten.ztTueten;
  console.log("zeittüten: ", zeittüten);
  let zeitbetragtüten = ((zeittüten * stücktüten) / 3600) * Stundenlohn;
  //zeitbetragtüten = zeitbetragtüten.toFixed(2);
  console.log("Zeitaufwandbetrag für Tüten in Euro: ", zeitbetragtüten);

  let zeitpappen = calcdata[0];
  zeitpappen = zeitpappen.ztPappen;
  console.log("zeitpappen: ", zeitpappen);
  let zeitbetragpappen = ((zeitpappen * stückpappen) / 3600) * Stundenlohn;
  //zeitbetragpappen = zeitbetragpappen.toFixed(2);
  console.log("Zeitaufwandbetrag für Pappen in Euro: ", zeitbetragpappen);

  let zeitkopien = calcdata[0];
  zeitkopien = zeitkopien.ztKopien;
  console.log("zeitkopien: ", zeitkopien);
  let zeitbetragkopien = ((zeitkopien * stückkopien) / 3600) * Stundenlohn;
  //zeitbetragkopien = zeitbetragkopien.toFixed(2);
  console.log("Zeitaufwandbetrag für Kopien in Euro: ", zeitbetragkopien);
  let zeitfolien = calcdata[0];
  zeitfolien = zeitfolien.ztUmverp;
  console.log("zeitfolien: ", zeitfolien);
  let zeitbetragfolien = (zeitfolien / 3600) * Stundenlohn;
  //zeitbetragfolien = zeitbetragfolien.toFixed(2);
  console.log("Zeitaufwandbetrag für Folie in Euro: ", zeitbetragfolien);

  let zeitsumme =
    zeitbetragkopien +
    zeitbetragfolien +
    zeitbetragtüten +
    zeitbetragpappen +
    zeitbetragteile;
  let zeitsummeout = zeitsumme.toFixed(2);
  console.log("Summe Zeitaufwand: ", zeitsummeout);

  let stTüten = calcdata[0];
  stTüten = stTüten.mpTueten;
  console.log("stTüten: ", stTüten);
  let stbetragtüten = stTüten * stücktüten;
  console.log("Mattüten: ", stbetragtüten);

  let stFolien = calcdata[0];
  stFolien = stFolien.mpUmverp;
  console.log("stFolien: ", stFolien);

  let stbetragFolien = stFolien;
  console.log("MatFolie: ", stbetragFolien);

  let stPapier = calcdata[0];
  stPapier = stPapier.mpPapier;
  console.log("stPapier: ", stPapier);
  let stbetragKopien = stPapier * stückkopien;
  console.log("Matkopien: ", stbetragKopien);

  let Zuschlag = calcdata[0];
  Zuschlag = Zuschlag.Zuschlag;
  console.log("Zuschlag: ", Zuschlag);

  let Materialanteil = stbetragtüten + stbetragKopien + stbetragFolien;
  let Materialanteilout = Materialanteil.toFixed(2);
  console.log("Materialanteil: ", Materialanteilout);

  let komplettpreis = zeitsumme + Materialanteil;
  let komplettpreisout = komplettpreis.toFixed(2);
  console.log("Komplettpreis ohne Zuschlag: ", komplettpreisout);

  let calcPreis = (zeitsumme + Materialanteil) * Zuschlag;
  let calcPreisout = calcPreis.toFixed(2);
  console.log("kalkulierter Preis: ", calcPreisout);

  //-----------------------------------------

  //Zeitberechnung:

  // Testausgaben db
  console.log(stuecklistcall);
  console.log(calcdata);
  let vkfep = 0;
  // console.log ("parsfepa: ",parsfepa);
  //console.log("idfep: ", idfep);
  //console.log (parsfepa);
  //console.log (feppreis);
  //console.log("fepa Preis: ", vkfep);

  res.render("./calc", {
    vkfep,
    id,
    zeitsummeout,
    Materialanteilout,
    komplettpreisout,
    calcPreisout,
  });
});

app.get("/dbsuchergebnis", async (req, res) => {
  const ergebnis = await getDbTab();
  const end = ergebnis.length;
  res.render("./dbsuchergebnis", { ergebnis, end });
});

app.get("/fepalist", (req, res) => {
  res.render("./fepalist");
});

app.get("/satzid", (req, res) => {
  res.render("./satzid");
});

app.get("/inputmail", (req, res) => {
  res.render("./inputmail");
});

app.get("/calcid", (req, res) => {
  res.render("./calcid");
});

app.get("/calcidneu", (req, res) => {
  res.render("./calcidneu");
});

app.get("/calcauswahl", (req, res) => {
  res.render("./calcauswahl");
});

app.post("/satzid", async (req, res) => {
  console.log(req.body);
  const parcel = req.body;
  if (!parcel) {
    return res.status(400).send({ status: "failed" });
  }
  //res.json(parcel);
  console.log("gesendeter Typ: ", typeof parcel);
  console.log("Postergebnis: ", parcel);
  const dbwert = parcel.Dichtsatz.SatzID;
  console.log("DB Wert:: ", dbwert); //ID für Suchzwecke
  console.log("Typ dbwert: ", typeof dbwert); //ID für Suchzwecke
  uebergabe = dbwert;
  /*console.log(
    "ab hier wird der Wert an die Datenbank Tab artikelbearbeiten übergeben und die Daten zurückggegeben"
  );*/
  const ausgabedb = await getNoteStBe(dbwert);
  console.log("Antwort von db: ", ausgabedb);
  if (ausgabedb.length < 1) {
    return res.json("kein Datenbankeintrag vorhanden");
  }

  const rueck = JSON.parse(JSON.stringify(ausgabedb));
  const rueck1 = rueck[0];
  let rueck2 = JSON.parse(JSON.stringify(rueck1));
  console.log("Rückgabewert2: ", rueck2);
  fepaBestNr = rueck2.ArtikelNr;
  console.log("solo: ", fepaBestNr);

  const dbpreis = await getNotePreis(fepaBestNr);
  console.log("FepaPreis: ", dbpreis);
  if (dbpreis.length < 1) {
    return res.json("kein Preis vorhanden");
  }
  const preisrueck = JSON.parse(JSON.stringify(dbpreis));
  const preisrueck1 = preisrueck[0];
  let preisrueck2 = JSON.parse(JSON.stringify(preisrueck1));
  console.log(preisrueck2);
  fepaBestNr = rueck2.ArtikelNr;
  fepaPreis = preisrueck2.Verkaufspreis;
  rueck2.Verkaufspreis = preisrueck2.Verkaufspreis;
  console.log("fepaBestNr: ", fepaBestNr, "fepaPreis: ", fepaPreis);
  console.log("Alles in rueck2: ", rueck2);

  res.json(rueck2);
});

app.post("/satzid01", async (req, res) => {
  console.log(req.body);
  const parcel = req.body;
  if (!parcel) {
    return res.status(400).send({ status: "failed" });
  }
  //res.json(parcel);
  console.log("gesendeter Typ: ", typeof parcel);
  console.log("Postergebnis: ", parcel);
  const dbwert = parcel.Dichtsatz.SatzID;
  console.log("DB Wert:: ", dbwert); //ID für Suchzwecke
  console.log("Typ dbwert: ", typeof dbwert); //ID für Suchzwecke
  uebergabe = dbwert;
  /*console.log(
    "ab hier wird der Wert an die Datenbank Tab artikelbearbeiten übergeben und die Daten zurückggegeben"
  );*/
  const ausgabedb = await getNoteStLi(dbwert);
  console.log("Antwort von db: ", ausgabedb);
  if (ausgabedb.length < 1) {
    return res.json("kein Datenbankeintrag vorhanden");
  }

  const rueck = JSON.parse(JSON.stringify(ausgabedb));
  const rueck1 = rueck[0];
  let rueck2 = JSON.parse(JSON.stringify(rueck1));
  rueck2.ArtikelNr = fepaBestNr;
  console.log("Rückgabewert2: ", rueck2);
  fepaBestNr = "0000";
  console.log("solo: ", fepaBestNr);

  const dbpreis = 0;

  //const preisrueck = JSON.parse(JSON.stringify(dbpreis));
  //const preisrueck1 = preisrueck[0];
  //let preisrueck2 = JSON.parse(JSON.stringify(preisrueck1));
  //console.log(preisrueck2);

  //fepaPreis = preisrueck2.Verkaufspreis;
  //rueck2.Verkaufspreis = preisrueck2.Verkaufspreis;
  //console.log("fepaBestNr: ", fepaBestNr, "fepaPreis: ", fepaPreis);
  console.log("Alles in rueck2: ", rueck2);

  res.json(rueck2);
});

app.post("/auswahl", async (req, res) => {
  console.log("body: ", req.body);
  const parcel = req.body;
  if (!parcel) {
    return res.status(400).send({ status: "failed" });
  }
  //console.log("parcel: ", parcel);
  // Daten zur db Abfrage vorbereiten:

  let suchName = parcel.sqlsend.sqlwert1;
  //console.log("SuchName aus parcel: ",suchName);
  let suchValue = parcel.sqlsend.suchwert;
  //console.log("suchValue aus parcel: ",suchValue);
  //console.log("suchdaten für Datenbank: ", suchName, suchValue);
  console.log("inhalt der globalen variablen: ");
  //Datensatz suchen
  boddat = await getNoteSucheBestellung(suchName, suchValue, suchData.id);
  console.log("DB Ausgabe direkt nach Aufruf!!!!!:", boddat);
  let dbwerte = Object.values(boddat);
  let colwerte = Object.values(await suchData.Column);
  console.log("dbwerte: ", dbwerte);
  console.log("colwerte: ", colwerte);
  let ende = dbwerte.length;
  console.log("ende ", ende);
  suchData.ende = ende;

  let ID = await suchData.id;

  //console.log("Suchdat: ",suchData);
  res.json(boddat);
});

app.get("/suchDat", async (req, res) => {
  let dbergebnis = boddat;
  console.log("DB Ergebnis am Eingang suchDat:", dbergebnis);

  let globVar = suchData;
  console.log("U E B E R G A B E : ", globVar);
  let ID = await globVar.id;
  let headName = await globVar.Column;
  console.log("headname oben: ", headName);
  let end = await Object.keys(globVar.Column).length;
  console.log("E N D : ", end);
  for (let i = 0; i < end; i++) {
    headName[i] = await headName[i].column_name;
    // console.log ("headname i: ", headName[i]);
  }
  //console.log("headname:",headName);

  let datLength = await suchData.ende;
  let datErgebnis = dbergebnis;

  console.log(
    "Infill Suchausgabe: ",
    await ID,
    await headName,
    end,
    datErgebnis,
    await datLength
  );

  res.render("./ausgabe", { ID, headName, end, datErgebnis, datLength });
});
app.get("/bestell", async (req, res) => {
  let dbwert = {};
  dbwert.danfid = uebergabe;
  dbwert.fepaPreis = fepaPreis;
  dbwert.fepaBestNr = fepaBestNr;
  let lastintnum = await getNotelastnumint();
  lastintnum = lastintnum[0];
  lastintnum = lastintnum.numint;
  let newintnum = lastintnum + 1;
  dbwert.newintnum = newintnum;
  console.log(dbwert);
  res.render("./bestellung", { dbwert });
});

app.get("/auswahl/:id", async (req, res) => {
  const ID = req.params.id;
  console.log(ID);

  console.log("suchdata ", suchData);
  console.log("suchdata.id ", suchData.id);
  const ergebnis = await getColTab(ID);
  console.log("dbrück: ", ergebnis);

  const datErgebnis = await getBodyTab(ID);
  console.log("Datenbank Ausgabe: ", datErgebnis);

  let datLength = datErgebnis.length; //Datenbankvariable tab body
  const end = ergebnis.length; //Datenbankvariable tab head
  //Schleife für Datum parsing
  for (let a = 0; a < datLength; a++) {
    datErgebnis[a].BestDat = moment(datErgebnis[a].BestDat).format(
      "DD.MM.YYYY"
    );
    datErgebnis[a].LieferDat = moment(datErgebnis[a].Lieferdat).format(
      "DD.MM.YYYY"
    );
    datErgebnis[a].datum = moment(datErgebnis[a].datum).format("DD.MM.YYYY");
  }

  //console.log(datErgebnis);

  let headName = [];
  for (let i = 0; i < end; i++) {
    headName[i] = ergebnis[i].column_name;
  }
  console.log(headName);
  console.log("infill allgemein: ", ID, headName, end, datErgebnis, datLength);
  res.render("./ausgabe", { ID, headName, end, datErgebnis, datLength });
});

app.get("/edit/:id", async (req, res) => {
  // console.log("Tabellen id: ", req.params.id);
  const ID = req.params.id;
  // console.log("paramsid_ ", ID);
  suchData.id = req.params.id;
  // Columne auswählen
  suchData.Column = await getTabheadDanfbestellung(ID);
  let Column = await suchData.Column;
  let end = Column.length;
  let cols = [];
  for (let i = 0; i < end; i++) {
    cols[i] = Column[i].column_name;

    // console.log("Position: ", i, " Spaltenname: ", cols[i]);
  }
  //console.log(cols);
  let headName = cols;
  res.render("./edittab", { end, headName });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Server auf local host port env
app.listen(3000, () => {
  console.log("Server is running on Port 3000");
});
