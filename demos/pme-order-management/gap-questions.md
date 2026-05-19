# Gap Detection — Post-interview supplements

> **Step**: Phase 1, Steps 2–4 — interview-guide (Mode 2 / existing transcript)
> **Transcript analysed**: `transcript.md`
> **Language detected**: English

---

## Gap analysis

After a full read of the transcript, 12 candidate gaps were identified. Filtered to 8 questions ranked by impact on ROI calculation accuracy and automation spec quality.

---

## Follow-up questions asked to Marc

I've read the transcript. Before extracting processes, I have 8 targeted questions — they will make the analysis more precise and the ROI figures more reliable.

**Volumes and frequencies**

1. You estimate between 8 and 12 email orders a day. On a typical week, is it closer to 8 or closer to 12 — and does it vary by season (Christmas, Easter, sales)?
   *— Annual ROI depends on actual volume, not a range.*

2. The 2–3 out-of-stock situations per month that require "crisis management" — you said each takes around 30 minutes. Is that really 30 minutes of your time, or can it go higher (multiple follow-ups, refund processing)?
   *— This hidden cost changes the priority score for the stock alert opportunity.*

**Tools and systems**

3. Your order tracking Google Sheet — is it shared with the team? Do Julien and Delphine have read/write access, or is it your personal table?
   *— If the sheet is shared, automation can notify Julien directly.*

4. For invoices, you mentioned a Word template. Do you send invoices as PDFs from Word, or directly by email? And do you have a VAT number — are you VAT registered?
   *— Determines whether a simple invoicing tool (Fresha, Pennylane free tier) will suffice or if VAT complexity is a blocker.*

5. The freelancer Romain — is he easily available (a few hours on request) or difficult to mobilise?
   *— Direct impact on deployment timeline and cost.*

**Process details**

6. Email orders — do customers send information in a roughly standard format (product + quantity + address in the email body) or is it highly variable? For example: do some people just write "hello, I'd like some jam" without giving their address?
   *— If the format is too variable, automatic extraction will require a human validation step.*

7. When you send the confirmation, do you include payment details? How do customers pay — bank transfer, PayPal, online on PrestaShop — or have they already paid before writing to you?
   *— Determines whether the confirmation workflow needs to include a payment link or just confirm the order.*

8. How many non-order emails do you receive per day? (Customer questions, suppliers, other) — yes/no question: is there an existing Gmail filter, or does everything arrive in the main inbox without labels?
   *— If everything is mixed, the Gmail trigger will need to filter by subject — important for workflow reliability.*

---

## Marc's answers

**Answer 1 — Volumes**

> "In a normal week it's more like 8 to 10. In December and before Easter it goes up to 20–25. Let's say 10 on average over the year, with peaks at 25."

→ **10 orders/day on average, 25 at peak.** ~50 weeks × 5 days × 10 = 2,500 email orders/year.

**Answer 2 — Stock outages**

> "30 minutes is often the minimum. Sometimes you have to go back and forth with the customer, it's more like 45–60 minutes when it goes badly. Let's say 45 minutes on average."

→ **2–3 outages × 45 min = 1h30 to 2h15/month lost to crisis management.**

**Answer 3 — Shared Google Sheet**

> "Yes, Julien has read-only access. Delphine can edit the Stock tab. It's shared in read mode with everyone but the Orders tab is mainly managed by me."

→ Julien can be automatically notified when an order is logged.

**Answer 4 — Invoicing and VAT**

> "I'm on the basic VAT exemption — below the threshold. So no VAT on my invoices. I generate the PDF from Word with Acrobat Reader, and send by email manually."

→ VAT exemption simplifies automation. No complex tax calculation needed.

**Answer 5 — Romain's availability**

> "He usually responds within the day, he's flexible. I give him work 2–3 times a year. For something simple he can turn it around in 1–2 days."

→ Deployment can happen quickly, Romain is the ideal deployer for this project.

**Answer 6 — Order email format**

> "It's variable but not catastrophic. 70% of customers give everything — product, quantity, address. The other 30% forget either the address or the exact quantity. I often have to follow up for the address."

→ The workflow must include a "missing address" check and an automatic follow-up in that case.

**Answer 7 — Payment**

> "Customers pay on delivery (bank transfer or cheque) or online on PrestaShop when they order through the website. Email orders are usually from regular customers who trust us — they pay on receipt. The confirmation just tells them it's been noted."

→ No payment link in the confirmation. Simplified workflow.

**Answer 8 — Email sorting**

> "Everything comes into the same inbox. I have no filter. Sometimes orders have 'Order' in the subject, sometimes not. There are maybe 30–40 non-order emails per day."

→ The Gmail trigger must use a subject heuristic (keywords: "order", "ordering", "would like to order") + human review for ambiguous cases.

---

## Remaining uncertainty areas (`unclear_areas`)

| Area | Reason | Impact |
|---|---|---|
| Exact format of order email bodies | Too variable to prototype without real examples | Automatic field extraction will need testing on real emails |
| Exact volume of phone/SMS orders | Not quantified in the interview | Out of scope for V1 — email orders only |
| Stock reorder threshold | Delphine updates stock manually | Workflow can alert on outage but cannot drive reordering |
