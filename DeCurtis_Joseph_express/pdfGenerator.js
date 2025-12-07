const PDFDocument = require("pdfkit");


function normalizeCalculations(rawCalcs) {
  if (!Array.isArray(rawCalcs)) return [];

  return rawCalcs
    .map((item) => {
      let calc = item;

      if (typeof calc === "string") {
        try {
          calc = JSON.parse(calc);
        } catch {
          return null;
        }
      }

      if (!calc || typeof calc !== "object") return null;

      if (!calc.input || typeof calc.input !== "object") {
        calc.input = {};
      }
      if (!calc.output || typeof calc.output !== "object") {
        calc.output = {};
      }

      return calc;
    })
    .filter(Boolean);
}


function addLabelValue(doc, label, value) {
  if (value === undefined || value === null || value === "") return;
  doc.text(`${label}: ${value}`);
}


function generateCasePdf(res, caseDoc) {
  const doc = new PDFDocument({ margin: 50 });


  doc.pipe(res);


  doc
    .fontSize(20)
    .text("Collision Reconstruction Report", { align: "center" });
  doc.moveDown();

  // Case metadata
  doc.fontSize(12);
  addLabelValue(doc, "Case Number", caseDoc.caseNumber);
  addLabelValue(doc, "Date Created", caseDoc.dateCreated);
  doc.moveDown();

  // Investigators
  doc.fontSize(14).text("Investigators", { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(12);

  (caseDoc.investigators || []).forEach((inv, idx) => {
    const nameParts = [
      inv.fname,
      inv.mname,
      inv.lname
    ].filter(Boolean).join(" ");

    const line = `${idx + 1}. ${nameParts}${inv.surname ? " (" + inv.surname + ")" : ""}`;
    doc.text(line);
  });

  if (!caseDoc.investigators || caseDoc.investigators.length === 0) {
    doc.text("None listed");
  }

  doc.moveDown();

  // Location
  doc.fontSize(14).text("Location", { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(12);

  (caseDoc.location || []).forEach((loc) => {
    const line = `${loc.numeric || ""} ${loc.streetAddress || ""}, ${loc.city || ""}, ${loc.state || ""}`;
    doc.text(line.trim());
  });

  if (!caseDoc.location || caseDoc.location.length === 0) {
    doc.text("None listed");
  }

  doc.moveDown();

  // Notes
  doc.fontSize(14).text("Notes", { underline: true });
  doc.moveDown(0.3);
  doc.fontSize(12);
  doc.text(caseDoc.notes || "No notes.");
  doc.moveDown();


  doc.moveDown();
  doc
    .fontSize(14)
    .text("Calculations", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12);

  const calculations = normalizeCalculations(caseDoc.calculations || []);

  if (calculations.length === 0) {
    doc.text("No calculations have been added to this case.");
  } else {
    calculations.forEach((calc, index) => {
      doc.moveDown();
      doc
        .fontSize(13)
        .text(`Calculation ${index + 1}: ${formatType(calc.type)}`, {
          underline: true
        });
      doc.moveDown(0.3);
      doc.fontSize(11);

      addLabelValue(doc, "Timestamp", calc.timestamp);

      
      switch (calc.type) {
        case "skid_to_stop":
          doc.moveDown(0.3);
          doc.text("Inputs:");
          doc.text(`  Skid Distance: ${calc.input.skidDistance_ft} ft`);
          doc.text(`  Drag Factor: ${calc.input.dragFactor} (unitless)`);
          doc.text(`  Brake Efficiency: ${calc.input.brakeEfficiency}`);
          doc.moveDown(0.3);
          doc.text("Outputs:");
          doc.text(`  Estimated Speed: ${calc.output.estimatedSpeed_mph} mph`);
          break;

        case "critical_speed_curve":
          doc.moveDown(0.3);
          doc.text("Inputs:");
          doc.text(`  Curve Radius: ${calc.input.radius_ft} ft`);
          doc.text(`  Superelevation: ${calc.input.superelevation}`);
          doc.text(`  Drag Factor: ${calc.input.dragFactor} (unitless)`);
          doc.moveDown(0.3);
          doc.text("Outputs:");
          doc.text(`  Critical Speed: ${calc.output.criticalSpeed_mph} mph`);
          break;

        case "momentum_two_vehicle":
          doc.moveDown(0.3);
          doc.text("Inputs:");
          doc.text(`  Vehicle 1 Mass: ${calc.input.vehicle1_mass_lb} lb`);
          doc.text(`  Vehicle 1 Post-Impact Speed: ${calc.input.vehicle1_postImpactSpeed_mph} mph`);
          doc.text(`  Vehicle 2 Mass: ${calc.input.vehicle2_mass_lb} lb`);
          doc.text(`  Vehicle 2 Post-Impact Speed: ${calc.input.vehicle2_postImpactSpeed_mph} mph`);
          doc.text(`  Approach Angle: ${calc.input.approachAngle_deg}°`);

          doc.moveDown(0.3);
          doc.text("Outputs:");
          doc.text(`  Vehicle 1 Pre-Impact Speed: ${calc.output.vehicle1_preImpactSpeed_mph} mph`);
          doc.text(`  Vehicle 2 Pre-Impact Speed: ${calc.output.vehicle2_preImpactSpeed_mph} mph`);
          break;

        case "delta_v":
          doc.moveDown(0.3);
          doc.text("Inputs:");
          doc.text(`  Longitudinal ΔV: ${calc.input.longitudinalDeltaV_mph} mph`);
          doc.text(`  Lateral ΔV: ${calc.input.lateralDeltaV_mph} mph`);
          doc.text(`  Source: ${calc.input.source}`);

          doc.moveDown(0.3);
          doc.text("Outputs:");
          doc.text(`  Total ΔV: ${calc.output.totalDeltaV_mph} mph`);
          break;

        case "drag_sled_test":
          doc.moveDown(0.3);
          doc.text("Inputs:");
          doc.text(`  Sled Weight: ${calc.input.sledWeight} lb`);

          // Runs 1–10
          doc.text("  Pulls (lbs):");
          for (let i = 1; i <= 10; i++) {
            const key = `run${i}`;
            if (calc.input[key] !== undefined) {
              doc.text(`    Run ${i}: ${calc.input[key]} lbs`);
            }
          }

          doc.moveDown(0.3);
          doc.text("Outputs:");
          if (calc.output.averagePull !== undefined) {
            doc.text(`  Average Pull: ${calc.output.averagePull} lbs`);
          }
          if (calc.output.dragFactor !== undefined) {
            doc.text(`  Drag Factor (f): ${calc.output.dragFactor}`);
          }
          break;

        default:

          doc.moveDown(0.3);
          doc.text("Inputs (raw):");
          doc.text(JSON.stringify(calc.input, null, 2), { width: 500 });
          doc.moveDown(0.2);
          doc.text("Outputs (raw):");
          doc.text(JSON.stringify(calc.output, null, 2), { width: 500 });
          break;
      }

      // Page breaks
      if ((index + 1) < calculations.length && doc.y > 650) {
        doc.addPage();
      }
    });
  }

  // Footer
  doc.moveDown(2);
  doc
    .fontSize(10)
    .text("Web App courtesy of Joseph L. DeCurtis Jr.", { align: "center" });

  doc.end();
}

function formatType(type) {
  if (!type) return "";
  switch (type) {
    case "skid_to_stop":
      return "Skid to Stop";
    case "critical_speed_curve":
      return "Critical Speed Curve";
    case "momentum_two_vehicle":
      return "Momentum (Two Vehicle)";
    case "delta_v":
      return "Delta-V";
    case "drag_sled_test":
      return "Drag Sled Test";
    default:
      return type.replace(/_/g, " ").toUpperCase();
  }
}

module.exports = {
  generateCasePdf
};
