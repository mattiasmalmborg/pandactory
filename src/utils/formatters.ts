export function formatNumber(num: number): string {
  if (num < 1000) {
    return Math.floor(num).toString();
  } else if (num < 1000000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (num < 1000000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else {
    return (num / 1000000000).toFixed(1) + 'B';
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
