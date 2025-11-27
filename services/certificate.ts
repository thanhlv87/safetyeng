import { jsPDF } from "jspdf";
import { UserProgress } from "../types";

export const generateCertificate = (user: UserProgress) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  // Background
  doc.setFillColor(11, 61, 145); // Safety Blue
  doc.rect(0, 0, 297, 210, "F");
  
  doc.setFillColor(255, 255, 255);
  doc.rect(10, 10, 277, 190, "F");

  // Border
  doc.setLineWidth(2);
  doc.setDrawColor(253, 196, 0); // Safety Yellow
  doc.rect(15, 15, 267, 180, "S");

  // Header
  doc.setTextColor(11, 61, 145);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.text("CERTIFICATE OF COMPLETION", 148.5, 50, { align: "center" });

  // Subtitle
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("This is to certify that", 148.5, 70, { align: "center" });

  // Name
  doc.setFontSize(32);
  doc.setTextColor(0, 0, 0);
  doc.text(user.name.toUpperCase(), 148.5, 90, { align: "center" });

  // Course Info
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text("Has successfully completed the 30-Day Challenge:", 148.5, 110, { align: "center" });
  
  doc.setFontSize(22);
  doc.setTextColor(11, 61, 145);
  doc.text("English for Occupational Safety", 148.5, 125, { align: "center" });

  // Stats
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  const avgScore = Object.values(user.quizScores).reduce((a, b) => a + b, 0) / (Object.values(user.quizScores).length || 1);
  doc.text(`Completed on: ${new Date().toLocaleDateString()}`, 148.5, 145, { align: "center" });
  doc.text(`Average Score: ${Math.round(avgScore)}%`, 148.5, 155, { align: "center" });

  // Footer/Signature Area
  doc.setLineWidth(1);
  doc.setDrawColor(0, 0, 0);
  doc.line(70, 180, 130, 180); // Line for signature
  doc.line(170, 180, 230, 180); // Line for signature

  doc.setFontSize(12);
  doc.text("Program Director", 100, 185, { align: "center" });
  doc.text("SafetySpeak AI", 200, 185, { align: "center" });

  doc.save("SafetySpeak_Certificate.pdf");
};