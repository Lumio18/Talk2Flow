# n8n Workflow JSON Schema — Talk2Flow Reference

This document defines the import format for n8n workflows (n8n >= 1.0.0). Use it as the structural contract when assembling the workflow JSON in `n8n-builder`.

---

## Top-level structure

```jsonc
{
  "name": "string",          // Human-readable workflow name — use spec.name
  "nodes": [ ... ],          // Array of node objects
  "connections": { ... },    // Node wiring
  "active": false,           // Always false on export — deployer activates manually
  "settings": {
    "executionOrder": "v1"   // Always "v1" for n8n >= 1.0
  },
  "versionId": "string",     // UUID — any valid UUID, regenerated on import
  "id": "string",            // UUID — any valid UUID, regenerated on import
  "meta": {
    "instanceId": ""         // Leave empty — filled by n8n on import
  }
}
```

---

## Node object

```jsonc
{
  "id": "string",             // UUID — use deterministic pattern from SKILL.md
  "name": "string",           // Readable label shown on the canvas — in operator's language
  "type": "string",           // n8n type name — always English, always "n8n-nodes-base.X"
  "typeVersion": number,      // From the node catalog — use the version listed there
  "position": [number, number], // [x, y] — from the layout grid in SKILL.md
  "parameters": { ... },      // Node-specific — see node catalog
  "credentials": { ... },     // Optional — only when the node requires credentials
  "continueOnFail": false,    // true only for steps where error_handling.response = "skip"
  "notes": "string",          // Optional — deployer-facing note shown as sticky on canvas
  "notesInFlow": false        // Set true if notes should be visible inline
}
```

### `credentials` object

```jsonc
"credentials": {
  "credentialTypeName": {
    "id": "REPLACE_WITH_CREDENTIAL_ID",
    "name": "Descriptive credential name"
  }
}
```

The `id` is a placeholder — n8n links credentials by name on import. The deployer creates the credential in Settings → Credentials and the workflow finds it by name.

---

## Connections object

Maps source node names to their outgoing connections.

```jsonc
{
  "SourceNodeName": {
    "main": [
      // Output 0
      [
        { "node": "TargetNodeName", "type": "main", "index": 0 }
      ],
      // Output 1 (only for branching nodes: IF, Switch)
      [
        { "node": "AlternativeNodeName", "type": "main", "index": 0 }
      ]
    ]
  }
}
```

**Rules:**
- Keys are **node names** (string), not IDs
- Each output is an array of connection objects (inner `[]`)
- Multiple connections from the same output (fan-out) → multiple objects in the same inner array
- Nodes with no outgoing connection → absent from connections
- Empty output (e.g. Switch fallback with no connection) → `[]`

---

## Complete annotated example

**Scenario**: classify incoming email → route to Lucca API query or send attestation reply → send auto-reply → human checkpoint for unrecognized emails.

```jsonc
{
  "name": "Classement emails RH — Sophie",
  "nodes": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "name": "Nouvelle demande reçue",
      "type": "n8n-nodes-base.microsoftOutlookTrigger",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "pollTimes": { "item": [{ "mode": "everyMinute" }] },
        "options": { "folderId": "inbox" }
      },
      "credentials": {
        "microsoftOutlookOAuth2Api": {
          "id": "REPLACE_WITH_CREDENTIAL_ID",
          "name": "Outlook Sophie RH"
        }
      }
    },
    {
      "id": "00000000-0000-0001-0000-000000000001",
      "name": "Classifier le type de demande",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [470, 300],
      "parameters": {
        "mode": "runOnceForEachItem",
        "jsCode": "const subject = ($input.item.json.subject || '').toLowerCase();\nconst body = ($input.item.json.bodyPreview || '').toLowerCase();\nlet type = 'autre';\nif (subject.includes('congé') || body.includes('solde')) type = 'solde_conges';\nelse if (subject.includes('attestation') || body.includes('attestation')) type = 'attestation_salaire';\nreturn [{ json: { ...$input.item.json, email_type: type } }];"
      }
    },
    {
      "id": "00000000-0000-0002-0000-000000000002",
      "name": "Router par type",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 3.2,
      "position": [690, 300],
      "parameters": {
        "mode": "rules",
        "rules": {
          "values": [
            {
              "outputKey": "0",
              "conditions": {
                "conditions": [{ "leftValue": "={{ $json.email_type }}", "rightValue": "solde_conges", "operator": { "type": "string", "operation": "equals" } }],
                "combinator": "and"
              }
            },
            {
              "outputKey": "1",
              "conditions": {
                "conditions": [{ "leftValue": "={{ $json.email_type }}", "rightValue": "attestation_salaire", "operator": { "type": "string", "operation": "equals" } }],
                "combinator": "and"
              }
            }
          ]
        },
        "fallbackOutput": "extra"
      }
    },
    {
      "id": "00000000-0000-0003-0000-000000000003",
      "name": "Interroger Lucca API",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [910, 200],
      "parameters": {
        "method": "GET",
        "url": "https://TODO_LUCCA_INSTANCE.ilucca.net/api/v3/leaves/balance",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpHeaderAuth"
      },
      "credentials": {
        "httpHeaderAuth": {
          "id": "REPLACE_WITH_CREDENTIAL_ID",
          "name": "Lucca API key"
        }
      },
      "notes": "INTEGRATION_BLOCKER — Verify Lucca API access is enabled. Token must be configured in the httpHeaderAuth credential as Authorization header."
    },
    {
      "id": "00000000-0000-0004-0000-000000000004",
      "name": "Préparer réponse attestation",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [910, 400],
      "parameters": {
        "mode": "manual",
        "fields": {
          "values": [
            {
              "name": "reply_body",
              "type": "stringValue",
              "stringValue": "Bonjour,\n\nVotre demande d'attestation de salaire a bien été reçue. Le document vous sera transmis sous 2 jours ouvrés.\n\nCordialement,\nSophie — RH"
            }
          ]
        }
      }
    },
    {
      "id": "00000000-0000-0005-0000-000000000005",
      "name": "Envoyer réponse automatique",
      "type": "n8n-nodes-base.microsoftOutlook",
      "typeVersion": 2,
      "position": [1130, 300],
      "parameters": {
        "operation": "sendEmail",
        "resource": "message",
        "subject": "={{ 'RE: ' + $json.subject }}",
        "bodyContent": "={{ $json.reply_body }}",
        "toRecipients": "={{ $json['from'].emailAddress.address }}"
      },
      "credentials": {
        "microsoftOutlookOAuth2Api": {
          "id": "REPLACE_WITH_CREDENTIAL_ID",
          "name": "Outlook Sophie RH"
        }
      }
    },
    {
      "id": "00000000-0000-0006-0000-000000000006",
      "name": "Attente validation Sophie",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [910, 600],
      "parameters": {
        "resume": "webhook",
        "options": { "webhookSuffix": "/approve" }
      },
      "notes": "URL d'approbation envoyée par email à Sophie. Nécessite une URL n8n accessible depuis l'extérieur (pas localhost)."
    },
    {
      "id": "eeeeeeee-0000-0000-0000-000000000001",
      "name": "Erreur workflow",
      "type": "n8n-nodes-base.errorTrigger",
      "typeVersion": 1,
      "position": [250, 700],
      "parameters": {}
    },
    {
      "id": "eeeeeeee-0000-0000-0000-000000000002",
      "name": "Notifier Sophie — Erreur",
      "type": "n8n-nodes-base.microsoftOutlook",
      "typeVersion": 2,
      "position": [470, 700],
      "parameters": {
        "operation": "sendEmail",
        "resource": "message",
        "subject": "={{ 'Erreur workflow — ' + $json.workflow.name }}",
        "bodyContent": "={{ 'Nœud en erreur : ' + $json.node.name + '\\n\\nDétail : ' + $json.error.message }}",
        "toRecipients": "sophie@company.com"
      },
      "credentials": {
        "microsoftOutlookOAuth2Api": {
          "id": "REPLACE_WITH_CREDENTIAL_ID",
          "name": "Outlook Sophie RH"
        }
      }
    }
  ],
  "connections": {
    "Nouvelle demande reçue": {
      "main": [
        [{ "node": "Classifier le type de demande", "type": "main", "index": 0 }]
      ]
    },
    "Classifier le type de demande": {
      "main": [
        [{ "node": "Router par type", "type": "main", "index": 0 }]
      ]
    },
    "Router par type": {
      "main": [
        [{ "node": "Interroger Lucca API", "type": "main", "index": 0 }],
        [{ "node": "Préparer réponse attestation", "type": "main", "index": 0 }],
        [{ "node": "Attente validation Sophie", "type": "main", "index": 0 }]
      ]
    },
    "Interroger Lucca API": {
      "main": [
        [{ "node": "Envoyer réponse automatique", "type": "main", "index": 0 }]
      ]
    },
    "Préparer réponse attestation": {
      "main": [
        [{ "node": "Envoyer réponse automatique", "type": "main", "index": 0 }]
      ]
    },
    "Attente validation Sophie": {
      "main": [
        [{ "node": "Envoyer réponse automatique", "type": "main", "index": 0 }]
      ]
    },
    "Erreur workflow": {
      "main": [
        [{ "node": "Notifier Sophie — Erreur", "type": "main", "index": 0 }]
      ]
    }
  },
  "active": false,
  "settings": { "executionOrder": "v1" },
  "versionId": "11111111-1111-1111-1111-111111111111",
  "id": "22222222-2222-2222-2222-222222222222",
  "meta": { "instanceId": "" }
}
```

---

## Common layout patterns

### Linear flow (no branches)
```
[Trigger] → [Step 1] → [Step 2] → [Step 3]
  x=250       x=470      x=690      x=910
  y=300       y=300      y=300      y=300
```

### Single IF branch
```
[Trigger] → [IF] → [True path] → [Merge] → [Step N]
  x=250      x=470   x=690         x=1130    x=1350
  y=300      y=300   y=300         y=300     y=300
                  ↘ [False path]
                     x=690
                     y=500
```

### Switch with 3 routes
```
[Trigger] → [Switch] → [Branch A]    y=200
  x=250       x=470     x=690

                      → [Branch B]   y=400
                         x=690

                      → [Fallback]   y=600
                         x=690
```

### Error sub-workflow (always at y=700+)
```
[ErrorTrigger] → [Notify]
  x=250           x=470
  y=700           y=700
```

---

## Import instructions (for deployer doc)

1. Open n8n → Workflows → Import from file / Import from clipboard
2. Paste the JSON or select the `.json` file
3. n8n will regenerate all node IDs and the workflow ID — this is expected
4. Open each node marked `REPLACE_WITH_CREDENTIAL_ID` and link the appropriate credential
5. Replace all `TODO_*` values in node parameters with actual values
6. Test with the "Test workflow" button (manual trigger) or a real event in staging
7. Activate the workflow only after the full test plan passes

---

## n8n expression cheatsheet

| What you want | Expression |
|---|---|
| Field from current item | `{{ $json.fieldName }}` |
| Field from a named previous node | `{{ $node["NodeName"].json["fieldName"] }}` |
| Today's date | `{{ $now.format('yyyy-MM-dd') }}` |
| Current timestamp | `{{ $now.toISO() }}` |
| String concatenation | `{{ 'Hello ' + $json.name }}` |
| Conditional | `{{ $json.type === 'a' ? 'value A' : 'value B' }}` |
| Array item count | `{{ $items().length }}` |
| Environment variable | `{{ $env.MY_VAR }}` |
