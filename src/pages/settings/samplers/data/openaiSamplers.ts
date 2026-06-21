export const generationSliders = (maxContextCap: number) => [
  {
    id: 'openai_max_context',
    label: 'Context Size (tokens)',
    min: 512,
    max: maxContextCap,
    step: 1,
  },
  {
    id: 'openai_max_tokens',
    label: 'Max Response Length (tokens)',
    min: 1,
    max: 128000,
    step: 1,
  },
  {
    id: 'n',
    label: 'Multiple swipes per generation',
    min: 1,
    max: 32,
    step: 1,
  },
  {
    id: 'seed',
    label: 'Seed',
    min: -1,
    max: 999999999,
    step: 1,
  },
];

export const samplerSliders = [
  {
    id: 'temp_openai',
    label: 'Temperature',
    min: 0,
    max: 2,
    step: 0.01,
  },
  {
    id: 'freq_pen_openai',
    label: 'Frequency Penalty',
    min: -2,
    max: 2,
    step: 0.01,
  },
  {
    id: 'pres_pen_openai',
    label: 'Presence Penalty',
    min: -2,
    max: 2,
    step: 0.01,
  },
  {
    id: 'top_p_openai',
    label: 'Top P',
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    id: 'top_k_openai',
    label: 'Top K',
    min: 0,
    max: 500,
    step: 1,
  },
  {
    id: 'top_a_openai',
    label: 'Top A',
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    id: 'min_p_openai',
    label: 'Min P',
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    id: 'repetition_penalty_openai',
    label: 'Repetition Penalty',
    min: 0,
    max: 2,
    step: 0.01,
  },
];
