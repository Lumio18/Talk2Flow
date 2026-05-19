# Deployer Handoff — La Boîte Artisanale Order Workflow

**Project**: Email order automation for La Boîte Artisanale  
**Client contact**: Marc Dupont — marc@laboiteartisanale.fr  
**Workflow file**: `n8n-workflow.json` (this folder)  
**Estimated setup time**: 4–6 hours  
**Client budget for setup**: ~300 € (5h × 60 €/h)

---

## What you're deploying

A 12-node n8n workflow that:
1. Polls Gmail every 5 minutes for emails containing "commande" in the subject
2. Extracts order fields (name, product, qty, address) from free-text French email bodies using a JavaScript Code node
3. Checks stock levels in a Google Sheet tab
4. Routes to one of three branches: ✅ confirm, ⚠️ stock alert, 📬 request missing address
5. Appends every order to a Google Sheet with appropriate status

**Stack**: n8n + Gmail OAuth2 + Google Sheets OAuth2  
**No external APIs. No webhooks. No database.**

---

## Infrastructure decision

Two options — confirm with Marc before starting:

| Option | Cost | Maintenance | Uptime |
|---|---|---|---|
| **n8n Cloud Starter** (recommended) | ~20 €/mth | Zero infrastructure work | 99.9% SLA |
| **Self-hosted on VPS (OVH VPS Starter)** | ~6 €/mth (VPS) | You or Marc maintains the server | Your responsibility |

**Recommendation**: n8n Cloud. Marc is non-technical, and the 14 €/month difference is not worth the ops overhead for a 5-person shop. If he insists on self-hosting, use Docker on an OVH VPS (1 vCPU, 2 GB RAM is sufficient).

---

## Step-by-step setup

### 1. Create n8n account / instance

**Cloud**: Sign up at https://n8n.io → Starter plan  
**Self-hosted**: 
```
docker run -d --name n8n -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n
```

### 2. Create credentials in n8n

**Gmail OAuth2** (used by 3 nodes):
- In n8n: Settings → Credentials → New → Gmail OAuth2
- Use Marc's Google account (marc@laboiteartisanale.fr)
- Required scopes: `https://mail.google.com/` (covers read + send)
- Marc will need to authorize via Google OAuth consent screen — do this together
- Note the credential ID after creation

**Google Sheets OAuth2** (used by 4 nodes):
- Same Google account as Gmail
- n8n: Settings → Credentials → New → Google Sheets OAuth2
- Required scope: `https://www.googleapis.com/auth/spreadsheets`
- Note the credential ID after creation

### 3. Locate Marc's Google Sheet ID

Open Marc's Google Sheet (the one with "Commandes" and "Stocks" tabs).  
The URL looks like: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`  
Copy the `SHEET_ID_HERE` part.

### 4. Verify Google Sheet structure

The workflow expects these exact column headers:

**Tab "Commandes"**:
```
Date | Numéro | Nom client | Email | Produit | Quantité | Adresse | Statut | Source
```

**Tab "Stocks"**:
```
Produit | Stock_disponible | [other columns — ignored]
```

If the columns don't match, either rename them in the sheet or update the `columns.value` mappings in the Google Sheets nodes.

### 5. Import and configure the workflow

1. In n8n: Workflows → Import from file → select `n8n-workflow.json`
2. Open the imported workflow
3. Replace `REPLACE_WITH_CREDENTIAL_ID` in each node:
   - Select each Gmail node → Credentials → select "Gmail — La Boîte Artisanale"
   - Select each Google Sheets node → Credentials → select "Google Sheets — La Boîte Artisanale"
4. Replace `REPLACE_WITH_GOOGLE_SHEET_ID` in each Google Sheets node with the actual Sheet ID

Nodes to update (6 total):
- `Gmail — Nouvelles commandes` → Gmail credential
- `Gmail — Demande adresse` → Gmail credential
- `Gmail — Alerte rupture` → Gmail credential
- `Gmail — Confirmation commande` → Gmail credential
- `Sheets — En attente adresse` → Sheets credential + Sheet ID
- `Sheets — Vérifier stock` → Sheets credential + Sheet ID
- `Sheets — Rupture stock` → Sheets credential + Sheet ID
- `Sheets — Enregistrer commande` → Sheets credential + Sheet ID

### 6. Test on real emails

**Before activating**: use "Test workflow" mode (not active polling).

Collect 5–10 real past emails from Marc's Gmail that are actual orders. Run the workflow manually on each.

Check for each test run:
- [ ] Fields extracted correctly (name, product, qty, address)
- [ ] Stock lookup returns a row (not empty)
- [ ] IF branch routes correctly (address present/absent, stock ok/rupture)
- [ ] Google Sheet row appended with correct data
- [ ] Confirmation email text looks right (check {{variables}} resolved)
- [ ] No node shows a red error badge

**Common issues to anticipate**:

1. **Product name doesn't match sheet**: The Code node extracts a fuzzy product name from free text. The Sheets lookup uses "contains" — this usually works, but if Marc has product names like "Confiture de Fraises 370g", the email might say "confitures de fraises" (no size, plural). Test this case explicitly and adjust the `keyValue` expression if needed.

2. **Gmail trigger misses some orders**: Emails with subject "Bonjour, je voudrais..." won't be caught by the filter. Check with Marc which missed-order emails exist and consider adding more keywords to the Gmail filter (`q` parameter in the trigger node).

3. **Code node extraction fails on unusual email formats**: The regex patterns cover ~70% of cases per Marc's estimate. For the rest, the workflow degrades gracefully (null fields → manual review). This is acceptable for V1.

### 7. Activate

Once all tests pass:
1. Toggle the workflow to "Active" in n8n
2. Send a test order email to marc@laboiteartisanale.fr from an external account
3. Wait up to 5 minutes for the trigger to fire
4. Confirm the row appeared in Google Sheets and the confirmation email landed

### 8. Brief Marc

Walk Marc through:
- Where to see running workflows and execution history in n8n
- How to read the execution log when something fails (red node = error)
- How to edit email templates (double-click Gmail node → edit Message field)
- Who to call if something breaks (you, obviously)

Provide Marc with the login credentials for the n8n instance (or Cloud account).

---

## Architecture notes

**Why a Code node for extraction instead of an AI/LLM call?**

Deliberate choice for V1: regex-based extraction is deterministic, free, and doesn't require an API key. The 30% of emails that don't extract cleanly result in null fields and manual processing — this is acceptable. A future V2 could add an OpenAI/Claude call to improve extraction accuracy for ambiguous cases.

**Why read the last order number from Google Sheets instead of using n8n's built-in counter?**

Marc already has a sequence in his sheet. Using the sheet as the source of truth avoids drift between the sheet and n8n state if the workflow is reset or re-imported.

**Why no error workflow?**

For V1, unhandled errors will surface in the n8n execution log. Marc will check it occasionally, and you'll set up a weekly check in the first month. A proper error workflow (email Marc on failure) can be added in V2.

---

## Ongoing maintenance expectations

| Task | Frequency | Who |
|---|---|---|
| Check execution log for errors | Weekly (first month), monthly after | Marc (with your coaching) |
| Update Gmail filter keywords if orders are missed | As needed | You (30 min) |
| Update email templates | As needed | Marc (self-service) |
| Add new products to stock sheet | As needed | Delphine |
| n8n version updates (Cloud) | Automatic | n8n |
| n8n version updates (self-hosted) | Monthly | You |

---

## Credentials checklist

Before handing over:

- [ ] Gmail OAuth2 credential created and tested
- [ ] Google Sheets OAuth2 credential created and tested  
- [ ] Marc has access to the n8n instance (login + URL documented)
- [ ] Marc's Google Sheet ID recorded in a shared document
- [ ] All `REPLACE_WITH_CREDENTIAL_ID` placeholders replaced
- [ ] All `REPLACE_WITH_GOOGLE_SHEET_ID` placeholders replaced
- [ ] Workflow tested on 5+ real emails
- [ ] Workflow active and confirmed working
- [ ] Marc briefed and able to read the execution log

---

*Document generated by Talk2Flow — pipeline PME Order Management, May 2026.*  
*Source: `automation-spec.json` + `stack-profile.json`*
