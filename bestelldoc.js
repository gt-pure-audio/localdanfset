import docxmarks from "docxmarks";
import fs from "fs";

import { runInThisContext } from "vm";

export async function docxErstellen(docfills) {
  let replacements = {};
  replacements.BestDat = docfills.Dichtsatz.BestDat;
  replacements.fepaNr = docfills.Dichtsatz.fepaNr;
  replacements.BestNr = docfills.Dichtsatz.BestNr;
  replacements.fepaNr = docfills.Dichtsatz.fepaNr;
  replacements.internNr = docfills.Dichtsatz.internNr;
  replacements.Menge = docfills.Dichtsatz.Menge;
  replacements.Lieferdat = docfills.Dichtsatz.Lieferdat;
  replacements.OrderNr = docfills.Dichtsatz.OrderNr;
  replacements.Sachbearbeiter = docfills.Dichtsatz.Sachbearbeiter;
  replacements.SachbearbeiterDanfoss = docfills.Dichtsatz.SachbearbeiterDanfoss;
  replacements.SatzID = docfills.Dichtsatz.SatzID;
  replacements.Einzelpreis = docfills.Dichtsatz.fepaPreis;
  replacements.Staffelpreis = docfills.Dichtsatz.Staffelpreis;
  replacements.Auftragswert = docfills.Dichtsatz.Auftragswert;

  console.log("Ausfülldaten: ", JSON.parse(JSON.stringify(replacements)));
  const docx = fs.readFileSync("./public/print/druckvorlage/bfd.docx"); //docx file laden

  //bookmarks anspringen und Inhalt einfügen: replacements Variable in Bestellung

  // Ausführen und speichern (neuer Name und Pfad)
  let docxname =
    "./" + replacements.BestDat + "-" + replacements.internNr + ".docx";
  console.log(docxname);
  docxmarks(docx, replacements).then((data) => {
    fs.writeFileSync("./public/print/" + docxname, data);
  });
  return docxname;
}
