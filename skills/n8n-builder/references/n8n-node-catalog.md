# n8n Node Catalog — Talk2Flow Reference

Version: n8n >= 1.0.0 (stable core nodes only — no community nodes in V1)

This catalog lists every n8n node used by `n8n-builder`. For each node: type name, version to use, what it does, key parameters, and credential type required.

---

## Trigger nodes

### Manual Trigger
```
type: n8n-nodes-base.manualTrigger
typeVersion: 1
credentials: none
```
Starts the workflow when the operator clicks "Test workflow" or "Run". Use for: `trigger.type: "manual"` specs, or as a testing entry point alongside a real trigger.

Parameters: none.

---

### Schedule Trigger
```
type: n8n-nodes-base.scheduleTrigger
typeVersion: 1.2
credentials: none
```
Runs the workflow on a time-based schedule. Use for: `trigger.type: "cron"`.

Key parameters:
```jsonc
{
  "rule": {
    "interval": [
      { "field": "cronExpression", "expression": "0 9 * * 1-5" }
    ]
  }
}
```

Cron format: `minute hour day-of-month month day-of-week`. Common expressions:
- Every 15 min: `*/15 * * * *`
- Daily 9am weekdays: `0 9 * * 1-5`
- Monthly 1st at 8am: `0 8 1 * *`

Always include `timezone` in a note if the end user is not in UTC.

---

### Webhook
```
type: n8n-nodes-base.webhook
typeVersion: 2
credentials: none
```
Receives HTTP POST/GET from an external system. Use for: `trigger.type: "webhook"`, `"api_call"`, `"form_submitted"` (Tally, Typeform), `"event"` (Slack events API, Stripe, etc.).

Key parameters:
```jsonc
{
  "httpMethod": "POST",
  "path": "my-workflow",
  "responseMode": "onReceived",
  "responseData": "allEntries"
}
```

Deployer note: requires an externally reachable n8n URL. Localhost won't work without a tunnel (ngrok, cloudflared).

---

### Gmail Trigger
```
type: n8n-nodes-base.gmailTrigger
typeVersion: 1
credentials: gmailOAuth2
```
Polls Gmail for new emails matching a filter. Use for: `trigger.type: "email_received"` when source_tool is Gmail.

Key parameters:
```jsonc
{
  "pollTimes": { "item": [{ "mode": "everyMinute" }] },
  "filters": {
    "subject": "Commande",
    "sender": ""
  },
  "simple": true
}
```

Output: `$json.subject`, `$json.from`, `$json.to`, `$json.snippet`, `$json.textPlain`, `$json.textHtml`.

---

### Microsoft Outlook Trigger
```
type: n8n-nodes-base.microsoftOutlookTrigger
typeVersion: 1
credentials: microsoftOutlookOAuth2Api
```
Polls Outlook inbox for new messages. Use for: `trigger.type: "email_received"` when source_tool is Outlook / Microsoft 365.

Key parameters:
```jsonc
{
  "pollTimes": { "item": [{ "mode": "everyMinute" }] },
  "options": { "folderId": "inbox" }
}
```

Output: `$json.subject`, `$json.from.emailAddress.address`, `$json.bodyPreview`, `$json.body.content`.

---

### Email Read (IMAP)
```
type: n8n-nodes-base.emailReadImap
typeVersion: 2
credentials: imap
```
Polls any IMAP mailbox. Use for: `trigger.type: "email_received"` with generic or on-premises mail servers.

Key parameters:
```jsonc
{
  "mailbox": "INBOX",
  "action": "read",
  "download": false,
  "options": { "allowUnauthorizedCerts": false }
}
```

Credential requires: host, port, user, password, TLS setting.

---

### Google Drive Trigger
```
type: n8n-nodes-base.googleDriveTrigger
typeVersion: 1
credentials: googleDriveOAuth2Api
```
Watches a Google Drive folder for new files. Use for: `trigger.type: "file_created"` when source_tool is Google Drive.

Key parameters:
```jsonc
{
  "triggerOn": "specificFolder",
  "event": "fileCreated",
  "folderId": { "value": "FOLDER_ID_HERE", "mode": "id" }
}
```

---

## Action nodes

### Set
```
type: n8n-nodes-base.set
typeVersion: 3.4
credentials: none
```
Creates or transforms fields on the current item. Use for: extracting, renaming, or formatting data without code.

Key parameters:
```jsonc
{
  "mode": "manual",
  "fields": {
    "values": [
      { "name": "output_field", "type": "stringValue", "stringValue": "={{ $json.input_field }}" }
    ]
  },
  "options": { "stripAll": false }
}
```

Types available: `stringValue`, `numberValue`, `booleanValue`, `objectValue`, `arrayValue`.

---

### Code (JavaScript)
```
type: n8n-nodes-base.code
typeVersion: 2
credentials: none
```
Run arbitrary JavaScript. Use for: regex extraction, complex transformation, multi-field logic, anything Set can't express.

Key parameters:
```jsonc
{
  "mode": "runOnceForAllItems",
  "jsCode": "// Process all items\nreturn items.map(item => {\n  // TODO: implement\n  return item;\n});"
}
```

For single-item mode: `"mode": "runOnceForEachItem"`.

Common patterns:
```js
// Extract email type from subject
const subject = $input.item.json.subject || '';
const type = subject.toLowerCase().includes('congé') ? 'leave_request'
           : subject.toLowerCase().includes('attestation') ? 'attestation'
           : 'other';
return [{ json: { ...items[0].json, email_type: type } }];
```

---

### HTTP Request
```
type: n8n-nodes-base.httpRequest
typeVersion: 4.2
credentials: httpHeaderAuth | httpBasicAuth | oAuth2Api (varies)
```
Make any REST API call. Use for: any `source_tool` or `target_tool` that has a REST API and no dedicated n8n node.

Key parameters:
```jsonc
{
  "method": "POST",
  "url": "https://api.example.com/v1/endpoint",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [{ "name": "Content-Type", "value": "application/json" }]
  },
  "sendBody": true,
  "bodyContentType": "json",
  "jsonBody": "={{ JSON.stringify({ field: $json.value }) }}"
}
```

Always reference credentials by type — never hardcode API keys.

---

### Gmail (send)
```
type: n8n-nodes-base.gmail
typeVersion: 2.1
credentials: gmailOAuth2
```
Send emails via Gmail. Use for: `step` targeting Gmail when source_tool is Gmail.

Key parameters:
```jsonc
{
  "operation": "sendEmail",
  "resource": "message",
  "toList": "={{ $json.recipient_email }}",
  "subject": "={{ $json.email_subject }}",
  "message": "={{ $json.email_body }}",
  "options": {}
}
```

---

### Microsoft Outlook (send)
```
type: n8n-nodes-base.microsoftOutlook
typeVersion: 2
credentials: microsoftOutlookOAuth2Api
```
Send emails via Outlook. Use for: `step` targeting Outlook when source_tool is Outlook / Microsoft 365.

Key parameters:
```jsonc
{
  "operation": "sendEmail",
  "resource": "message",
  "subject": "={{ $json.email_subject }}",
  "bodyContent": "={{ $json.email_body }}",
  "toRecipients": "={{ $json.recipient_email }}"
}
```

---

### Email Send (SMTP)
```
type: n8n-nodes-base.emailSend
typeVersion: 2.1
credentials: smtp
```
Send email via any SMTP server. Use for: generic email when no Gmail/Outlook OAuth is available.

Key parameters:
```jsonc
{
  "fromEmail": "noreply@company.com",
  "toEmail": "={{ $json.recipient }}",
  "subject": "={{ $json.subject }}",
  "text": "={{ $json.body }}"
}
```

---

### Slack
```
type: n8n-nodes-base.slack
typeVersion: 2.3
credentials: slackApi | slackOAuth2Api
```
Send Slack messages or interact with channels.

Key parameters:
```jsonc
{
  "resource": "message",
  "operation": "post",
  "channel": "#notifications",
  "text": "={{ $json.message }}"
}
```

---

### Google Sheets
```
type: n8n-nodes-base.googleSheets
typeVersion: 4.5
credentials: googleSheetsOAuth2Api
```
Read or write Google Sheets. Use for: any step interacting with a Google Sheets spreadsheet.

Key parameters (read):
```jsonc
{
  "operation": "read",
  "documentId": { "value": "SPREADSHEET_ID", "mode": "id" },
  "sheetName": { "value": "Sheet1", "mode": "name" },
  "filtersUI": {}
}
```

Key parameters (append/update):
```jsonc
{
  "operation": "appendOrUpdate",
  "documentId": { "value": "SPREADSHEET_ID", "mode": "id" },
  "sheetName": { "value": "Sheet1", "mode": "name" },
  "columns": { "mappingMode": "autoMapInputData" }
}
```

---

### Airtable
```
type: n8n-nodes-base.airtable
typeVersion: 2.1
credentials: airtableTokenApi
```
Read or write Airtable bases.

Key parameters (list):
```jsonc
{
  "operation": "search",
  "base": { "value": "BASE_ID", "mode": "id" },
  "table": { "value": "TABLE_ID", "mode": "id" }
}
```

Key parameters (create):
```jsonc
{
  "operation": "create",
  "base": { "value": "BASE_ID", "mode": "id" },
  "table": { "value": "TABLE_ID", "mode": "id" },
  "columns": { "mappingMode": "autoMapInputData" }
}
```

---

### Notion
```
type: n8n-nodes-base.notion
typeVersion: 2.2
credentials: notionApi
```
Read or write Notion databases.

Key parameters (create page):
```jsonc
{
  "resource": "databasePage",
  "operation": "create",
  "databaseId": { "value": "DATABASE_ID", "mode": "id" },
  "propertiesUi": { "propertyValues": [] }
}
```

---

## Logic nodes

### IF
```
type: n8n-nodes-base.if
typeVersion: 2.2
credentials: none
```
Routes items to one of two outputs based on a condition. Output 0 = true, output 1 = false.

Key parameters:
```jsonc
{
  "conditions": {
    "options": { "caseSensitive": true, "leftValue": "", "typeValidation": "strict" },
    "conditions": [
      {
        "id": "c1",
        "leftValue": "={{ $json.email_type }}",
        "rightValue": "leave_request",
        "operator": { "type": "string", "operation": "equals" }
      }
    ],
    "combinator": "and"
  }
}
```

Available operators: `equals`, `notEquals`, `contains`, `notContains`, `startsWith`, `endsWith`, `isEmpty`, `isNotEmpty`, `regex`, `greater`, `less`.

---

### Switch
```
type: n8n-nodes-base.switch
typeVersion: 3.2
credentials: none
```
Routes items to one of multiple outputs. Use when 3+ branches are needed.

Key parameters:
```jsonc
{
  "mode": "rules",
  "rules": {
    "values": [
      { "outputKey": "0", "conditions": { "conditions": [{ "leftValue": "={{ $json.type }}", "rightValue": "leave_request", "operator": { "type": "string", "operation": "equals" } }], "combinator": "and" } },
      { "outputKey": "1", "conditions": { "conditions": [{ "leftValue": "={{ $json.type }}", "rightValue": "attestation", "operator": { "type": "string", "operation": "equals" } }], "combinator": "and" } }
    ]
  },
  "fallbackOutput": "extra"
}
```

Output 0 = first rule match, output 1 = second, … last output = fallback.

---

### Merge
```
type: n8n-nodes-base.merge
typeVersion: 3
credentials: none
```
Combines items from multiple branches. Use after an IF or Switch to rejoin branches.

Key parameters:
```jsonc
{
  "mode": "combine",
  "combinationMode": "multiplex"
}
```

Common modes:
- `"append"` — all items from all inputs in sequence
- `"combine"` + `"multiplex"` — pair items from each input

---

### Wait
```
type: n8n-nodes-base.wait
typeVersion: 1.1
credentials: none
```
Pauses execution until a webhook is called. Use for: `actor: "human"` steps (approval flows).

Key parameters:
```jsonc
{
  "resume": "webhook",
  "options": {
    "webhookSuffix": "/approve",
    "responseData": "firstEntryJson",
    "responsePropertyName": "approval"
  }
}
```

**Deployer note**: the approval URL is `[n8n-base-url]/webhook/[workflow-webhook-id]/approve`. Include approve/reject links in the preceding notification email.

---

### Stop and Error
```
type: n8n-nodes-base.stopAndError
typeVersion: 1
credentials: none
```
Immediately stops the workflow and triggers the error workflow. Use for: unrecoverable errors (auth failure, missing critical field).

Key parameters:
```jsonc
{
  "errorMessage": "={{ 'Error in step: ' + $json.failed_step + ' — ' + $json.error_detail }}"
}
```

---

### Error Trigger
```
type: n8n-nodes-base.errorTrigger
typeVersion: 1
credentials: none
```
Entry point for the error sub-workflow. Fires when any node in the main workflow throws an error.

Parameters: none.

Output: `$json.workflow.name`, `$json.execution.id`, `$json.node.name`, `$json.error.message`, `$json.error.stack`.

---

### No Operation (pass-through)
```
type: n8n-nodes-base.noOp
typeVersion: 1
credentials: none
```
Does nothing — passes items through unchanged. Use for: marking "end of happy path" in a branch, or as a placeholder for a future node.

Parameters: none.

---

## Credential types reference

| Credential name in n8n | Used by |
|---|---|
| `gmailOAuth2` | gmailTrigger, gmail |
| `microsoftOutlookOAuth2Api` | microsoftOutlookTrigger, microsoftOutlook |
| `imap` | emailReadImap |
| `smtp` | emailSend |
| `googleSheetsOAuth2Api` | googleSheets |
| `googleDriveOAuth2Api` | googleDriveTrigger |
| `airtableTokenApi` | airtable |
| `notionApi` | notion |
| `slackApi` | slack |
| `httpHeaderAuth` | httpRequest (API key in header) |
| `httpBasicAuth` | httpRequest (basic auth) |
| `oAuth2Api` | httpRequest (generic OAuth2) |
