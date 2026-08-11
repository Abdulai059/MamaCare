/**
 * Milestone Status Utility
 * Consistent status calculation across the care journey system
 *
 * Status Flow:
 * - PENDING: due_date is in the future
 * - DUE: due_date is today
 * - MISSED: due_date is in the past AND not completed (marked with red ✗)
 * - COMPLETED: has completed_date (marked with green ✓)
 */

export type MilestoneStatus = "PENDING" | "DUE" | "MISSED" | "COMPLETED";

export interface MilestoneStatusInfo {
  status: MilestoneStatus;
  icon: string;
  color: string;
  label: string;
  description: string;
}

/**
 * Calculate milestone status based on due_date, completed_date, and today
 */
export function calculateMilestoneStatus(
  dueDate: string,
  completedDate?: string | null,
  today: Date = new Date()
): MilestoneStatus {
  // If completed, always return COMPLETED (regardless of date)
  if (completedDate) {
    return "COMPLETED";
  }

  const dueDateObj = new Date(dueDate);
  const todayObj = new Date(today);

  // Normalize dates to start of day for comparison
  dueDateObj.setHours(0, 0, 0, 0);
  todayObj.setHours(0, 0, 0, 0);

  // If due date is in the past and not completed, it's MISSED
  if (dueDateObj < todayObj) {
    return "MISSED";
  }

  // If due date is today and not completed, it's DUE
  if (dueDateObj.getTime() === todayObj.getTime()) {
    return "DUE";
  }

  // If due date is in the future, it's PENDING
  return "PENDING";
}

/**
 * Get status display information (icon, color, label)
 */
export function getStatusInfo(status: MilestoneStatus): MilestoneStatusInfo {
  switch (status) {
    case "COMPLETED":
      return {
        status: "COMPLETED",
        icon: "checkmark-circle",
        color: "#22c55e", // Green
        label: "✓",
        description: "Completed",
      };

    case "MISSED":
      return {
        status: "MISSED",
        icon: "close-circle",
        color: "#dc2626", // Red
        label: "✗",
        description: "Missed",
      };

    case "DUE":
      return {
        status: "DUE",
        icon: "alert-circle-outline",
        color: "#f59e0b", // Orange/Amber
        label: "🟠",
        description: "Due Today",
      };

    case "PENDING":
    default:
      return {
        status: "PENDING",
        icon: "ellipse-outline",
        color: "#d1d5db", // Gray
        label: "○",
        description: "Pending",
      };
  }
}

/**
 * Format milestone status for display
 */
export function formatMilestoneStatus(status: MilestoneStatus): string {
  const info = getStatusInfo(status);
  return info.description;
}

/**
 * Check if milestone can be marked as completed
 * (i.e., it's not already completed)
 */
export function canMarkAsCompleted(
  status: MilestoneStatus,
  completedDate?: string | null
): boolean {
  return !completedDate && status !== "COMPLETED";
}

/**
 * Determine if milestone needs urgent attention
 * (DUE or MISSED status)
 */
export function isUrgent(status: MilestoneStatus): boolean {
  return status === "DUE" || status === "MISSED";
}

/**
 * Determine if milestone is overdue/missed
 */
export function isMissed(status: MilestoneStatus): boolean {
  return status === "MISSED";
}

/**
 * Get color for milestone status
 */
export function getStatusColor(status: MilestoneStatus): string {
  return getStatusInfo(status).color;
}

/**
 * Get icon name for milestone status
 */
export function getStatusIcon(status: MilestoneStatus): string {
  return getStatusInfo(status).icon;
}
