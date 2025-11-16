// Utilities for per-file and per-session insights used across charts, tables, and inspector.

export const pickCt = (row) => {
  if (!row || typeof row !== "object") return null;
  const v = row.ct_pred ?? row.kitab_ct ?? row.ct_proxy ?? null;
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
};

export function computeSessionStats(rows = [], domain = null) {
  const scoped = (rows || []).filter((row) => {
    if (!row || row.error) return false;
    if (domain && row.domain && row.domain !== domain) return false;
    return Number.isFinite(pickCt(row));
  });

  const values = scoped.map((row) => pickCt(row)).filter((v) => Number.isFinite(v));
  if (!values.length) {
    return {
      count: 0,
      meanCt: null,
      minCt: null,
      maxCt: null,
      stdCt: null,
      noisyCount: 0,
      outlierNames: [],
    };
  }

  const count = values.length;
  const meanCt = values.reduce((sum, v) => sum + v, 0) / count;
  const minCt = Math.min(...values);
  const maxCt = Math.max(...values);
  const stdCt =
    count > 1
      ? Math.sqrt(values.reduce((acc, v) => acc + (v - meanCt) ** 2, 0) / (count - 1))
      : 0;

  const noisyThreshold = 0.6;
  const noisyCount = scoped.filter((row) => Number(row.noise || 0) > noisyThreshold).length;

  const outlierNames = [];
  scoped.forEach((row) => {
    const ct = pickCt(row);
    if (!Number.isFinite(ct)) return;
    const z = stdCt > 1e-6 ? (ct - meanCt) / stdCt : 0;
    const ratio = meanCt ? ct / meanCt : 1;
    if (Math.abs(z) >= 2.5 || ratio <= 0.3 || ratio >= 3.0) {
      outlierNames.push(row.name || row.id || "file");
    }
  });

  return {
    count,
    meanCt,
    minCt,
    maxCt,
    stdCt,
    noisyCount,
    outlierNames,
  };
}

export function classifyRow(row, allRows = []) {
  if (!row) {
    return { label: "unknown", tone: "neutral", reason: "No data selected." };
  }
  if (row.error) {
    return {
      label: "error",
      tone: "error",
      reason: row.error_message || "Backend could not analyze this file.",
    };
  }

  const ct = pickCt(row);
  if (!Number.isFinite(ct)) {
    return {
      label: "pending",
      tone: "neutral",
      reason: "No collapse-time prediction available for this file.",
    };
  }

  const stats = computeSessionStats(allRows, row.domain);
  const { meanCt, stdCt } = stats;

  const noise = Number(row.noise || 0);
  const noisyThreshold = 0.6;

  let label = "stable";
  let tone = "good";
  let reason = "Collapse time is within the typical range for this session.";

  if (noise > noisyThreshold) {
    label = "noisy";
    tone = "warn";
    reason = "Noise level is higher than the recommended threshold for this session.";
  }

  if (Number.isFinite(meanCt) && meanCt > 0 && Number.isFinite(stdCt)) {
    const z = stdCt > 1e-6 ? (ct - meanCt) / stdCt : 0;
    const ratio = ct / meanCt;
    if (Math.abs(z) >= 2.5 || ratio <= 0.3 || ratio >= 3.0) {
      label = "outlier";
      tone = "error";
      reason =
        "Collapse time is far from the session mean; treat this capture as a potential outlier or special case.";
    }
  }

  return {
    label,
    tone,
    reason,
    ct,
    stats,
    noise,
  };
}

export function buildInspectorSummary(row, allRows = []) {
  const domain = row?.domain || "signal";
  const { label, tone, reason, ct, stats, noise } = classifyRow(row, allRows);
  const lines = [];

  if (Number.isFinite(ct)) {
    const mean = stats.meanCt;
    if (Number.isFinite(mean)) {
      const delta = ct - mean;
      const direction =
        Math.abs(delta) < 1e-3 ? "matches the session average" : delta > 0 ? "above" : "below";
      lines.push(
        `Collapse time: ${ct.toFixed(3)} s (${direction} the session mean${
          Number.isFinite(mean) ? ` of ${mean.toFixed(3)} s` : ""
        }).`,
      );
    } else {
      lines.push(`Collapse time: ${ct.toFixed(3)} s.`);
    }
  } else {
    lines.push("No reliable collapse-time estimate is available for this capture.");
  }

  if (Number.isFinite(noise)) {
    if (noise <= 0.3) {
      lines.push("Noise level: low — signal looks clean.");
    } else if (noise <= 0.6) {
      lines.push("Noise level: moderate — acceptable for most analyses.");
    } else {
      lines.push("Noise level: high — consider re-recording or applying stronger denoising.");
    }
  }

  lines.push(reason);

  const titleByLabel = {
    stable: "SignalForge note · Stable capture",
    noisy: "SignalForge note · Noisy capture",
    outlier: "SignalForge note · Possible outlier",
    error: "SignalForge note · Error",
    pending: "SignalForge note",
    unknown: "SignalForge note",
  };

  return {
    title: titleByLabel[label] || "SignalForge note",
    label,
    tone,
    lines,
    domain,
  };
}

