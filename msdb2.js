import sql from "mssql";
import dotenv from "dotenv";

// Konfigurationsobjekt
const config = {
  user: "SA",
  //user: process.env.MSSQL_USER,
  password: "tger-1962",
  server: "localdanfset-db-1", // Container IP DB
  database: "testom",
  options: {
    //encrypt: true, // Verwende dies, wenn du eine verschlüsselte Verbindung benötigst
    trustServerCertificate: true, // Verwende dies, wenn du ein selbstsigniertes Zertifikat hast
  },
};

// Verbindung herstellen und Abfrage ausführen
export async function getDbTab() {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query("select table_name from information_schema.tables");
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

/*
dotenv.config();

// Connect to SQL Server 
const pool = new sql.ConnectionPool({
  connectionString: process.env.MSSQL_CONNECTION,
});
*/

export async function getColTab(id) {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query(
        "select column_name from information_schema.columns where table_name = '" +
          id +
          "'"
      );
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function getBodyTab(id) {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool.request().query("select * from " + id);
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function getNoteStBe(id) {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query(
        "SELECT * FROM artikelbearbeiten where ArtikelNrKunde = '" + id + "'"
      );
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function getNotePreis(id) {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query(
        "SELECT Verkaufspreis FROM preislistefepa where Artikel_Nr_FEPA = '" +
          id +
          "'"
      );
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function createNoteBestanl(values) {
  console.log("Uebergabewerte", values);
  values.Sachbearbeiter = "'" + values.Sachbearbeiter + "'";
  values.SachbearbeiterDanfoss = "'" + values.SachbearbeiterDanfoss + "'";
  values.BestDat = "'" + values.BestDat + "'";
  values.Lieferdat = "'" + values.Lieferdat + "'";
  values.BestNr = "'" + values.BestNr + "'";
  values.OrderNr = "'" + values.OrderNr + "'";
  values.SatzID = "'" + values.SatzID + "'";
  values.fepaNr = "'" + values.fepaNr + "'";
  values.fepAuftrag = "'" + values.fepAuftrag + "'";
  console.log("endevalues: ", values);
  values = Object.values(values);
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query("INSERT INTO danfbestellung VALUES (" + values + ")");
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function getNoteBestanl(id) {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query("SELECT * FROM danfbestellung where DanfBestNr = '" + id + "'");
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function getTabdataDanfbestellung() {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query(
        "SELECT TOP 20 * FROM danfbestellung ORDER BY BestDat DESC, numInt DESC"
      );
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function getTabheadDanfbestellung(ID) {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query(
        "select column_name from information_schema.columns where table_name = '" +
          ID +
          "'"
      );
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function createNoteStLi(values) {
  console.log("Uebergabewerte", values);

  values.BestNr = "'" + values.BestNr + "'";
  values.Stand = "'" + values.Stand + "'";
  values.Mattext = "'" + values.Mattext + "'";
  console.log("endevalues: ", values);
  values = Object.values(values);

  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query("INSERT INTO stueckliste VALUES (" + values + ")");
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function getNoteStLi(id) {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query("SELECT * FROM stueckliste where DanfMatId = '" + id + "'");
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function getNoteStLis(id) {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query("SELECT * FROM stueckliste where DanfMatId = '" + id + "'");
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function getNoteSucheBestellung(col, colvalue, dbname) {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query(
        "SELECT * FROM " + dbname + " where " + col + "=" + "'" + colvalue + "'"
      );
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function getNotecalc(id) {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool.request().query("SELECT * FROM zeitpreismat");
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function getNotedanffep(id) {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query(
        "SELECT * FROM artikelbearbeiten where ArtikelNrKunde = '" + id + "'"
      );
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function getNotefeppreis(id) {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query(
        "SELECT * FROM preislistefepa where Artikel_Nr_FEPA = '" + id + "'"
      );
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function getNoteEtMail(id) {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query(
        "select numInt, DanfOrdNr, DanfBestNr, SatzID, Max(BestDat)as besdat from danfbestellung where numInt = " +
          id +
          " group by numInt, DanfOrdNr, DanfBestNr, SatzID order by besdat desc"
      );
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}

export async function getNotelastnumint() {
  try {
    // Verbindung herstellen
    let pool = await sql.connect(config);
    console.log("Connected to SQL Server successfully");

    // Abfrage ausführen
    let result = await pool
      .request()
      .query(
        "select max(BestDat) as BestDat , max(numint) as numint from danfbestellung  group by BestDat order by BestDat desc"
      );
    console.log("SQL query done");
    const rows = result.recordset;
    // Verbindung schließen
    sql.close();
    console.log("Closed SQL Server successfully");
    return rows;
  } catch (err) {
    console.error("SQL error", err);
    sql.close();
  }
}
