<!-- implement The send email node for now  -->
<!-- add LRU CACHE (least recently used cache in executor for transporters in order to maintain a min amount of transporter) -->
1.start implementing for gmail trigger (first learn from gemini and implement it)

-for gmail trigger here's what im gonna do create a entry in the db and keep listening -to the gmail if there is a reply with the same token or messageId then im gonna push
-the events to the kafka which will trigger the workflow again 





//  const parsed = await simpleParser(source);
//   const subject = parsed.subject || "";
//   const text = parsed.text || "";
//   const headers = parsed.headers;
//   const inReplyTo = (headers.get && headers.get("in-reply-to")) || headers["in-reply-to"] || headers.get?.("In-Reply-To");

//   // 1) token from subject like code:abc123
//   let token: string | null = null;
//   const subMatch = subject.match(/code:([A-Za-z0-9]+)/i);
//   if (subMatch) token = subMatch[1];
