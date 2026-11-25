// Have You Tried Turning It Off?
// make.fun bounty: u-motasimfuad-have-you-tried-turning-it-off-154a938b
//
// Writes one funny line to /output/entry.txt: a single reply from a
// hopeless tech support agent to a desperate customer. The program keeps
// three hand-written candidates, scores each against the judge's own
// rubric, and writes the winner.
//
// Judge rubric (most important first):
//   1. On-subject: a funny single-line reply from a hopeless tech support
//      agent to a desperate customer; loses to any reply off the subject.
//   2. Lands the joke: the twist is unexpected, the agent's cheerful
//      uselessness is where the humour comes from, and the customer is
//      never the butt of it.
//   3. Sounds like one line a real support agent would actually say, with
//      the customer's desperation felt rather than explained.
//   4. Stays tight: every word earns its place, clear on a first read.
//   5. Feels fresh rather than a stock line, and if it leans on the
//      classic "turn it off and on again", it twists it.
//
// Deterministic, stdlib only, no network. Run: node main.ts
import { mkdirSync, writeFileSync } from "node:fs";

type Candidate = {
  text: string;
  // Rubric scores, 0-5 each, in the judge's own order. Hand-scored with a
  // one-line reason per candidate so the pick is auditable, not magic.
  scores: { subject: number; funny: number; voice: number; tight: number; fresh: number };
  why: string;
};

const CANDIDATES: Candidate[] = [
  {
    text: "Have you tried turning it off and on again? If that doesn't work, I'll escalate your case to a senior agent — who will ask you the exact same thing, only slower.",
    scores: { subject: 5, funny: 5, voice: 5, tight: 4, fresh: 5 },
    why: "The classic line is the setup, not the punchline: the twist is that escalation is just the same question again, slower. 'Escalate your case' is real support phrasing, the agent is cheerfully useless, and the customer is never mocked.",
  },
  {
    text: "Turning it off and on again fixed it for my last caller. He never rang back, and I am choosing to count that as a success.",
    scores: { subject: 5, funny: 4, voice: 4, tight: 5, fresh: 4 },
    why: "The agent's delusional optimism is the joke, and 'choosing to count that as a success' is a fresh turn — the line now opens straight on the claim instead of warming up with 'Good news'.",
  },
  {
    text: "My script ends right after 'turn it off and on again'. The rest of the page just says 'good luck' in bold.",
    scores: { subject: 5, funny: 4, voice: 4, tight: 5, fresh: 4 },
    why: "Tight and in-voice — the script literally runs out — but the 'good luck in bold' punch is a familiar behind-the-curtain gag, so it feels slightly less fresh than the escalation twist.",
  },
];

// The judge weighs its criteria in order, so the weights fall in that order.
const WEIGHTS = { subject: 5, funny: 4, voice: 3, tight: 2, fresh: 1 };

function total(c: Candidate): number {
  const s = c.scores;
  return (
    s.subject * WEIGHTS.subject +
    s.funny * WEIGHTS.funny +
    s.voice * WEIGHTS.voice +
    s.tight * WEIGHTS.tight +
    s.fresh * WEIGHTS.fresh
  );
}

function pick(): Candidate {
  // Highest weighted total wins; ties break toward the smaller text in
  // bytes, which is also the final tie-break the bounty itself uses.
  return [...CANDIDATES].sort(
    (a, b) =>
      total(b) - total(a) ||
      Buffer.byteLength(a.text, "utf8") - Buffer.byteLength(b.text, "utf8"),
  )[0];
}

const winner = pick();
const text = winner.text;
// Count characters as code points, not UTF-16 units, so the gate matches
// how the bounty counts the 1-199 character limit.
const charCount = [...text].length;

// Gate (from the bounty rules): UTF-8 text of 1 to 199 characters, not
// only white space. Refuse to write anything that fails it.
if (charCount < 1 || charCount > 199 || text.trim().length === 0) {
  throw new Error(`Gate failed: entry is ${charCount} characters`);
}
if (text.includes("\n")) {
  throw new Error("Gate failed: entry must be a single line");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", text, "utf8");

console.log(`Winner (${total(winner)} pts): ${winner.why}`);
console.log(`Wrote /output/entry.txt (${charCount} chars):`);
console.log(text);
