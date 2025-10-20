export function parseEmailReply(text = "") {
  if (!text) return { reply: "", repliedTo: "" };
``
  const normalized = text.replace(/\r\n/g, "\n");

  const [replyPart, quotedPart] = normalized.split(/\nOn .* wrote:\n?/s);

  const cleanedReply = replyPart
    .replace(/(--\s*\n[\s\S]*)?$/s, "") 
    .trim();

  const repliedTo = (quotedPart || "")
    .split("\n")
    .map(line => line.replace(/^>\s?/, "").trim())
    .filter(Boolean)
    .join(" ");
    
  return {
    reply: cleanedReply,
    repliedTo: repliedTo.trim(),
  };
}
