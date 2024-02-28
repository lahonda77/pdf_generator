const express = require("express");
const PDFDocument = require("pdfkit");
const cors = require("cors");
const fs = require("fs");
const mysql = require("mysql");
const { start } = require("repl");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pdf_database",
});

db.query(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255),
    address VARCHAR(255),
    country VARCHAR(255),
    postalCode VARCHAR(10),
    dateGenerated DATETIME DEFAULT CURRENT_TIMESTAMP,
    pdfContent LONGBLOB
  );
`,
  (err) => {
    if (err) {
      console.error(err.message);
    }
  }
);

app.post("/generate-pdf", (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      address,
      country,
      postalCode,
      price,
      name,
    } = req.body;

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (selectErr, selectResults) => {
        if (selectErr) {
          console.error(selectErr.message);
          return res
            .status(500)
            .send(
              "Erreur lors de la vérification de l'utilisateur dans la base de données"
            );
        }

        const doc = new PDFDocument();
        const pdfChunks = [];

        doc.moveDown(2);
        doc.fontSize(20).text("Jean-Pierre", { align: "start" });

        doc.moveDown(2); 
        doc.fontSize(20).text("Facture", { align: "center" });

        doc.moveDown(); 
        doc.fontSize(16).text("Client", { underline: true });
        doc.fontSize(14).text(`Nom: ${firstName}`);
        doc.fontSize(14).text(`Prénom: ${lastName}`);

        doc.moveDown(); 
        doc.fontSize(16).text("Coordonnées", { underline: true });
        doc.fontSize(14).text(`Adresse postal: ${address}`);
        doc.fontSize(14).text(`Pays: ${country}`);
        doc.fontSize(14).text(`Code postal: ${postalCode}`);
        doc.fontSize(14).text(`Email: ${email}`);
        doc.text(`Prix: ${price}`);
        doc.text(`Nom: ${name}`);

        doc.on("data", (chunk) => pdfChunks.push(chunk));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(pdfChunks);
          const newPdfBuffer = Buffer.concat(pdfChunks);

          if (selectResults.length > 0) {
            const existingUser = selectResults[0];
            const existingPdfBuffer = existingUser.pdfContent;
            const combinedPdfBuffer = Buffer.concat([
              existingPdfBuffer,
              newPdfBuffer,
            ]);

            db.query(
              "UPDATE users SET pdfContent = ? WHERE email = ?",
              [combinedPdfBuffer, email],
              (updateErr) => {
                if (updateErr) {
                  console.error(updateErr.message);
                  return res
                    .status(500)
                    .send(
                      "Erreur lors de la mise à jour des données dans la base de données"
                    );
                }

                res.setHeader(
                  "Content-Disposition",
                  "attachment; filename=output.pdf"
                );
                res.setHeader("Content-Type", "application/pdf");
                res.send(newPdfBuffer);
              }
            );
          } else {
            db.query(
              "INSERT INTO users (firstName, lastName, email, address, country, postalCode, pdfContent) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [
                firstName,
                lastName,
                email,
                address,
                country,
                postalCode,
                newPdfBuffer,
              ],
              (insertErr) => {
                if (insertErr) {
                  console.error(insertErr.message);
                  return res
                    .status(500)
                    .send(
                      "Erreur lors de l'enregistrement des données dans la base de données"
                    );
                }

                res.setHeader(
                  "Content-Disposition",
                  "attachment; filename=output.pdf"
                );
                res.setHeader("Content-Type", "application/pdf");
                res.send(newPdfBuffer);
              }
            );
          }
        });

        doc.end();
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
});

app.get("/api/produits", (req, res) => {
  db.query("SELECT * FROM produits", (err, results) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Erreur du serveur");
    } else {
      res.json(results);
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
