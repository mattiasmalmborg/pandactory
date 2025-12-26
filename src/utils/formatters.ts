export function formatNumber(num: number): string {
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum < 1000) {
    return sign + Math.floor(absNum).toString();
  } else if (absNum < 1_000_000) {
    // Thousands (K)
    const val = absNum / 1_000;
    return sign + (val >= 100 ? val.toFixed(0) : val.toFixed(1)) + 'K';
  } else if (absNum < 1_000_000_000) {
    // Millions (M)
    const val = absNum / 1_000_000;
    return sign + (val >= 100 ? val.toFixed(0) : val.toFixed(1)) + 'M';
  } else if (absNum < 1_000_000_000_000) {
    // Billions (B)
    const val = absNum / 1_000_000_000;
    return sign + (val >= 100 ? val.toFixed(0) : val.toFixed(1)) + 'B';
  } else if (absNum < 1_000_000_000_000_000) {
    // Trillions (T)
    const val = absNum / 1_000_000_000_000;
    return sign + (val >= 100 ? val.toFixed(0) : val.toFixed(1)) + 'T';
  } else if (absNum < 1_000_000_000_000_000_000) {
    // Quadrillions (Qa)
    const val = absNum / 1_000_000_000_000_000;
    return sign + (val >= 100 ? val.toFixed(0) : val.toFixed(1)) + 'Qa';
  } else {
    // Quintillions (Qi)
    const val = absNum / 1_000_000_000_000_000_000;
    return sign + (val >= 100 ? val.toFixed(0) : val.toFixed(1)) + 'Qi';
  }
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

export function formatProductionRate(rate: number): string {
  return `${formatNumber(rate)}/min`;
}

export function formatResourceAmount(amount: number, includeDecimals = false): string {
  if (includeDecimals && amount < 1000) {
    return amount.toFixed(1);
  }
  return formatNumber(amount);
}
