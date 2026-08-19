/** Curated prompts for the "Surprise me" button - broad enough for all three agents to have something to say. */
const SURPRISE_TOPICS = [
  "The current state of nuclear fusion energy",
  "How CRISPR gene editing is being used today",
  "The economics of the global shipping industry",
  "Quantum computing's real-world progress vs. hype",
  "The rise of humanoid robots in manufacturing",
  "How submarine internet cables actually work",
  "The James Webb Space Telescope's biggest discoveries",
  "Lab-grown meat: where the industry stands now",
  "The history and future of vertical farming",
  "How central bank digital currencies are being piloted",
  "The state of autonomous vehicle deployment worldwide",
  "Deep-sea mining and its environmental tradeoffs",
  "The competitive landscape of reusable rockets",
  "How mRNA vaccine technology is expanding beyond COVID",
  "The global race for solid-state EV batteries",
  "What's driving the current AI chip shortage",
  "The resurgence of nuclear power in energy policy",
  "How wildfire prediction models use machine learning",
  "The business model behind low-earth-orbit satellite internet",
  "Longevity research and the science of aging",
] as const;

/** Picks a random topic, different from a `previous` one when possible. */
export function randomSurpriseTopic(previous?: string): string {
  const pool = previous ? SURPRISE_TOPICS.filter((t) => t !== previous) : SURPRISE_TOPICS;
  return pool[Math.floor(Math.random() * pool.length)];
}