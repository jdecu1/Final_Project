const express = require("express");
const { generateCasePdf } = require("../pdfGenerator");

module.exports = (client) => {
  const router = express.Router();
  const dbName = process.env.DB_NAME;

  // GET all cases
  router.get("/", async (req, res) => {
    try {
      const db = client.db(dbName);
      const cases = await db.collection("Cases").find({}).toArray();
      res.json(cases);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve cases" });
    }
  });

  // Fetch calculations for a case (JSON only)
  router.get("/:caseNumber/calculations", async (req, res) => {
    try {
      const db = client.db(dbName);
      const casesCollection = db.collection("Cases");

      const caseNumber = req.params.caseNumber;

      const caseDoc = await casesCollection.findOne(
        { caseNumber: caseNumber },
        { projection: { calculations: 1, _id: 0 } }
      );

      if (!caseDoc) {
        return res.status(404).json({ error: "Case not found" });
      }

      res.json(caseDoc.calculations || []);
    } catch (error) {
      console.error("Error retrieving calculations:", error);
      res.status(500).json({ error: "Failed to retrieve calculations" });
    }
  });

  // GET case by caseNumber (full case)
  router.get("/:caseNumber", async (req, res) => {
    try {
      const db = client.db(dbName);
      const result = await db
        .collection("Cases")
        .findOne({ caseNumber: req.params.caseNumber });

      if (!result) return res.status(404).json({ error: "Case not found" });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Error retrieving case" });
    }
  });

  // Create a new case
  router.post("/", async (req, res) => {
    try {
      const db = client.db(dbName);
      const casesCollection = db.collection("Cases");

      const year = new Date().getFullYear();

      // Determine latest case number for current year
      const latestCase = await casesCollection
        .find({ caseNumber: { $regex: `^${year}-` } })
        .sort({ caseNumber: -1 })
        .limit(1)
        .toArray();

      let nextNumber = 1;

      if (latestCase.length > 0) {
        const lastCaseNumber = latestCase[0].caseNumber;
        const lastDigits = parseInt(lastCaseNumber.split("-")[1]);
        nextNumber = lastDigits + 1;
      }

      const paddedDigits = String(nextNumber).padStart(4, "0");
      const newCaseNumber = `${year}-${paddedDigits}`;

      const newCase = {
        caseNumber: newCaseNumber,
        dateCreated: new Date().toISOString(),
        investigators: req.body.investigators || [],
        location: req.body.location || [],
        notes: req.body.notes || "",
        calculations: []
      };

      const result = await casesCollection.insertOne(newCase);

      res.status(201).json({
        message: "Case created successfully",
        caseNumber: newCaseNumber,
        id: result.insertedId
      });
    } catch (error) {
      console.error("Error creating case:", error);
      res.status(500).json({ error: "Failed to create case" });
    }
  });

  // Add new calculation to a case
  router.post("/:caseNumber/calculations", async (req, res) => {
    try {
      const db = client.db(dbName);
      const casesCollection = db.collection("Cases");

      const caseNumber = req.params.caseNumber;
      const calculation = req.body;

      calculation.timestamp = calculation.timestamp || new Date().toISOString();

      const updateResult = await casesCollection.updateOne(
        { caseNumber: caseNumber },
        { $push: { calculations: calculation } }
      );

      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ error: "Case not found" });
      }

      res.status(200).json({
        message: "Calculation added successfully",
        caseNumber: caseNumber
      });
    } catch (error) {
      console.error("Error adding calculation:", error);
      res.status(500).json({ error: "Failed to add calculation" });
    }
  });

  // NEW: Export case as PDF
  router.get("/:caseNumber/export", async (req, res) => {
    try {
      const db = client.db(dbName);
      const casesCollection = db.collection("Cases");

      const caseNumber = req.params.caseNumber;

      const caseDoc = await casesCollection.findOne({ caseNumber });

      if (!caseDoc) {
        return res.status(404).send("Case not found");
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Case_${caseDoc.caseNumber}.pdf"`
      );

      generateCasePdf(res, caseDoc);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Failed to generate PDF");
    }
  });

  return router;
};
