export interface ClinicalAssessment {
  id: string;
  milestone_id: string;
  blood_pressure?: string;
  weight?: number;
  temperature?: number;
  hemoglobin?: number;
  symptoms?: string;
  notes?: string;
}

export interface RiskFlag {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  recommendation: string;
  requiresReferral: boolean;
}

/**
 * Detect risks from clinical assessment data
 * Returns array of risk flags if any are detected
 */
export function detectRisks(
  assessment: ClinicalAssessment,
  milestoneType?: string
): RiskFlag[] {
  const risks: RiskFlag[] = [];

  // Parse blood pressure if present
  if (assessment.blood_pressure) {
    const [systolic, diastolic] = assessment.blood_pressure
      .split("/")
      .map((v) => parseInt(v, 10));

    // High BP detection
    if (systolic >= 160 || diastolic >= 110) {
      risks.push({
        level: "CRITICAL",
        title: "Severe Hypertension",
        description: `Blood pressure ${assessment.blood_pressure} mmHg is critically high`,
        recommendation:
          "Immediate referral to hospital for evaluation of pre-eclampsia/eclampsia",
        requiresReferral: true,
      });
    } else if (systolic >= 140 || diastolic >= 90) {
      risks.push({
        level: "HIGH",
        title: "High Blood Pressure",
        description: `Blood pressure ${assessment.blood_pressure} mmHg exceeds normal limits`,
        recommendation:
          "Close monitoring and consider referral if accompanied by other symptoms (headache, vision changes)",
        requiresReferral: false,
      });
    }
  }

  // Hemoglobin detection (anemia)
  if (assessment.hemoglobin) {
    if (assessment.hemoglobin < 7) {
      risks.push({
        level: "CRITICAL",
        title: "Severe Anemia",
        description: `Hemoglobin ${assessment.hemoglobin} g/dL is dangerously low`,
        recommendation: "Urgent blood transfusion and hospital referral",
        requiresReferral: true,
      });
    } else if (assessment.hemoglobin < 10.5) {
      risks.push({
        level: "HIGH",
        title: "Anemia",
        description: `Hemoglobin ${assessment.hemoglobin} g/dL suggests anemia`,
        recommendation:
          "Increase iron supplementation and dietary iron-rich foods; monitor closely",
        requiresReferral: false,
      });
    }
  }

  // Temperature detection (fever)
  if (assessment.temperature) {
    if (assessment.temperature >= 39) {
      risks.push({
        level: "HIGH",
        title: "High Fever",
        description: `Temperature ${assessment.temperature}°C indicates significant fever`,
        recommendation:
          "Evaluate for infection; consider antibiotics if accompanied by other symptoms",
        requiresReferral: false,
      });
    } else if (assessment.temperature >= 38.5) {
      risks.push({
        level: "MEDIUM",
        title: "Fever",
        description: `Temperature ${assessment.temperature}°C is elevated`,
        recommendation:
          "Monitor for infection signs; ensure adequate hydration and rest",
        requiresReferral: false,
      });
    }
  }

  // Weight loss detection (if we have history)
  if (assessment.weight) {
    // This would need comparison with previous weights
    if (assessment.weight < 40) {
      risks.push({
        level: "MEDIUM",
        title: "Low Body Weight",
        description: `Weight ${assessment.weight}kg may indicate malnutrition`,
        recommendation:
          "Assess nutritional status and provide counseling on maternal nutrition",
        requiresReferral: false,
      });
    }
  }

  // Symptom-based risks
  if (assessment.symptoms) {
    const symptomsLower = assessment.symptoms.toLowerCase();

    if (
      symptomsLower.includes("bleeding") ||
      symptomsLower.includes("hemorrhage")
    ) {
      risks.push({
        level: "CRITICAL",
        title: "Abnormal Bleeding",
        description: "Vaginal bleeding reported",
        recommendation:
          "Urgent hospital referral to assess for hemorrhage, miscarriage, or placental abruption",
        requiresReferral: true,
      });
    }

    if (symptomsLower.includes("severe headache") || symptomsLower.includes("headache")) {
      risks.push({
        level: "HIGH",
        title: "Severe Headache",
        description: "Severe headache reported",
        recommendation:
          "If accompanied by visual changes or high BP, consider pre-eclampsia",
        requiresReferral: false,
      });
    }

    if (symptomsLower.includes("abdominal pain") || symptomsLower.includes("pain")) {
      risks.push({
        level: "HIGH",
        title: "Abdominal Pain",
        description: "Abdominal pain reported",
        recommendation:
          "Evaluate for placental abruption, appendicitis, or other acute conditions",
        requiresReferral: false,
      });
    }
  }

  return risks;
}

/**
 * Determine overall risk level from multiple flags
 */
export function getOverallRiskLevel(flags: RiskFlag[]): string {
  if (flags.some((f) => f.level === "CRITICAL")) return "CRITICAL";
  if (flags.some((f) => f.level === "HIGH")) return "HIGH";
  if (flags.some((f) => f.level === "MEDIUM")) return "MEDIUM";
  return "LOW";
}

/**
 * Get AI-friendly summary of risks for Claude/ChatGPT
 */
export function getRiskSummaryForAI(
  assessment: ClinicalAssessment,
  flags: RiskFlag[]
): string {
  if (flags.length === 0) {
    return "No significant clinical risks detected. Mother appears to be in good health with vital signs within normal limits.";
  }

  const riskSummary = flags.map((flag) => {
    return `${flag.level}: ${flag.title} - ${flag.description}. Recommendation: ${flag.recommendation}`;
  });

  return `Clinical Assessment Summary:\n\nVital Signs:\n- Blood Pressure: ${assessment.blood_pressure || "Not recorded"}\n- Temperature: ${assessment.temperature || "Not recorded"}°C\n- Weight: ${assessment.weight || "Not recorded"}kg\n- Hemoglobin: ${assessment.hemoglobin || "Not recorded"}g/dL\n\nDetected Risks:\n${riskSummary.join("\n\n")}`;
}
