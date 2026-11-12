// No React import here, so the React rules have nothing to say.
export type Tone = "neutral" | "positive" | "negative";

export function describeTone(tone: Tone): string {
  switch (tone) {
    case "neutral":
      return "No change";
    case "positive":
      return "Trending up";
    case "negative":
      return "Trending down";
  }
}

export function firstWord(sentence: string): string | undefined {
  return sentence.split(" ")[0];
}
