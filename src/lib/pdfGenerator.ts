import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Incident, EvidenceItem, TimelineEvent } from '../types';

export interface PDFExportOptions {
  includeAiClassification?: boolean;
  includeRiskAssessment?: boolean;
  includeWitnessNotes?: boolean;
  officialInvestigatorName?: string;
}

export function generateIncidentPDF(
  incident: Incident,
  evidenceList: EvidenceItem[],
  timelineList: TimelineEvent[],
  options: PDFExportOptions = {}
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header / Title Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SAFEGUARD AI - OFFICIAL INCIDENT REPORT', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('CONFIDENTIAL & TAMPER-EVIDENT EVIDENCE LOG', 14, 21);

  const reportDate = new Date().toLocaleString();
  doc.text(`Generated: ${reportDate}`, pageWidth - 14, 21, { align: 'right' });

  let currentY = 36;

  // Case Metadata Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('CASE IDENTIFICATION & INCIDENT SUMMARY', 18, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  doc.text(`Case ID: ${incident.id}`, 18, currentY + 14);
  doc.text(`Title: ${incident.title}`, 18, currentY + 20);
  doc.text(`Category: ${incident.category.toUpperCase().replace('_', ' ')}`, 18, currentY + 26);

  doc.text(`Incident Date: ${new Date(incident.incident_date).toLocaleString()}`, 110, currentY + 14);
  doc.text(`Status: ${incident.status.toUpperCase()}`, 110, currentY + 20);
  doc.text(`Self-Reported Severity: ${incident.severity_self_rating.toUpperCase()}`, 110, currentY + 26);

  currentY += 36;

  // Perpetrator & Context Box
  doc.roundedRect(14, currentY, pageWidth - 28, 24, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('PERSON OF INTEREST & DIGITAL PLATFORM', 18, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Identified Name: ${incident.perpetrator_name || 'Unidentified / Unknown'}`, 18, currentY + 14);
  doc.text(`Online Handle/Number: ${incident.perpetrator_handle || 'N/A'}`, 18, currentY + 20);

  doc.text(`Platform/Location: ${incident.location_or_platform}`, 110, currentY + 14);
  doc.text(`Prior Relationship: ${incident.perpetrator_relationship || 'Not Disclosed'}`, 110, currentY + 20);

  currentY += 30;

  // Incident Narrative
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('DETAILED INCIDENT STATEMENT', 14, currentY);
  currentY += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const narrativeLines = doc.splitTextToSize(incident.narrative || 'No description provided.', pageWidth - 28);
  doc.text(narrativeLines, 14, currentY);
  currentY += narrativeLines.length * 4.5 + 4;

  if (incident.impact_description) {
    doc.setFont('helvetica', 'bold');
    doc.text('Reported Personal Impact:', 14, currentY);
    currentY += 4;
    doc.setFont('helvetica', 'normal');
    const impactLines = doc.splitTextToSize(incident.impact_description, pageWidth - 28);
    doc.text(impactLines, 14, currentY);
    currentY += impactLines.length * 4.5 + 4;
  }

  // Evidence Table with SHA-256 Hashing
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('SECURE EVIDENCE VAULT - CHAIN OF CUSTODY (SHA-256)', 14, currentY);
  currentY += 3;

  const relevantEvidence = evidenceList.filter(
    e => !e.incident_id || e.incident_id === incident.id
  );

  const evidenceRows = relevantEvidence.length > 0
    ? relevantEvidence.map((e, index) => [
        `#${index + 1}`,
        e.file_name,
        e.file_type.toUpperCase(),
        e.sha256_hash ? `${e.sha256_hash.slice(0, 16)}...${e.sha256_hash.slice(-8)}` : 'PENDING',
        new Date(e.created_at).toLocaleDateString(),
        'SECURE VAULT (PRIVATE)',
      ])
    : [['-', 'No evidence files linked to this incident record', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Filename', 'Type', 'SHA-256 Hash Checksum', 'Logged Date', 'Integrity Status']],
    body: evidenceRows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  const finalTableY = (doc as any).lastAutoTable?.finalY || currentY + 30;
  currentY = finalTableY + 8;

  // Timeline Section
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('CHRONOLOGICAL EVENT LOG', 14, currentY);
  currentY += 3;

  const timelineRows = timelineList.length > 0
    ? timelineList.map(t => [
        new Date(t.event_date).toLocaleDateString(),
        t.title,
        t.severity.toUpperCase(),
        t.description.length > 65 ? t.description.substring(0, 65) + '...' : t.description,
      ])
    : [[new Date(incident.incident_date).toLocaleDateString(), incident.title, 'MODERATE', 'Initial incident recorded']];

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Event Title', 'Severity', 'Description']],
    body: timelineRows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  // Footer & Legal Disclaimers
  const lastY = (doc as any).lastAutoTable?.finalY || currentY + 30;
  if (lastY > 230) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY = lastY + 10;
  }

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('LEGAL NOTICE & CITIZEN DECLARATION', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const legalDisclaimer =
    'This document is an evidence compilation created through SafeGuard AI. All digital media files retain SHA-256 cryptographic hashes calculated prior to cloud preservation for chain-of-custody verification. This report does not automatically transmit data to law enforcement. To initiate formal proceedings, submit this report directly to official law enforcement or legal counsel along with the original hashed evidence vault records.';
  const disclaimerLines = doc.splitTextToSize(legalDisclaimer, pageWidth - 36);
  doc.text(disclaimerLines, 18, currentY + 11);

  return doc;
}
