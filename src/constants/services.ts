export type ServicePreset = {
  key: string;
  name: string;
  amountHint: number;
  currencyHint: string;
};

export const SERVICE_PRESETS: ServicePreset[] = [
  { key: 'netflix', name: 'Netflix', amountHint: 199, currencyHint: 'INR' },
  { key: 'spotify', name: 'Spotify', amountHint: 119, currencyHint: 'INR' },
  { key: 'youtube-premium', name: 'YouTube Premium', amountHint: 129, currencyHint: 'INR' },
  { key: 'prime-video', name: 'Prime Video', amountHint: 299, currencyHint: 'INR' },
  { key: 'disney-plus', name: 'Disney+', amountHint: 899, currencyHint: 'INR' },
  { key: 'chatgpt', name: 'ChatGPT Plus', amountHint: 20, currencyHint: 'USD' },
  { key: 'github-copilot', name: 'GitHub Copilot', amountHint: 10, currencyHint: 'USD' },
];
