# Demo: PME Order Management

> **La Boîte Artisanale** — Automatisation de la prise de commande email  
> Status: **référence** — tous les artefacts sont présents et finalisés.

---

## Le scénario

Marc Dupont est fondateur d'une boutique en ligne de produits artisanaux (confitures, miels, savons). Son équipe de 5 personnes gère 8 à 12 commandes email par jour, entièrement à la main.

**Avant l'automatisation** : chaque matin, Marc passe 1h à trier ses mails, copier les infos dans un Google Sheet, envoyer des confirmations — et parfois découvrir trop tard qu'un produit est en rupture.

**Après** : le workflow traite les commandes standard automatiquement. Marc reçoit une alerte uniquement pour les cas qui nécessitent son jugement (rupture de stock, adresse manquante, email ambigu).

---

## Pourquoi ce scénario

- **Universel** : toute personne qui a déjà géré des commandes par email comprend immédiatement la douleur
- **Visuel** : le workflow n8n final est partageable sur LinkedIn et les réseaux — 12 nœuds, logique claire
- **Complet** : exerce les 6 phases du pipeline sans forcer
- **Réaliste** : budget contraint (50 €/mois max), fondateur non-technique, deployer freelance

---

## Artefacts

| Fichier | Étape Talk2Flow | Description |
|---|---|---|
| `transcript.md` | Input | Interview de Marc (38 min, 3 300 mots, français) |
| `gap-questions.md` | Phase 1 | 8 questions ciblées + réponses de Marc |
| `process-inventory.json` | process-extractor | 5 processus, 5 pain points, 2 pipeline breaks |
| `opportunities.json` | process-challenger | 4 opportunités, matrice effort/impact, ROI détaillé |
| `stack-profile.json` | stack-profiler | Gmail, Google Sheets, PrestaShop, budget 50 €/mois |
| `automation-spec.json` | automation-architect | Spec OPP01+OPP02+OPP04, 7 étapes, 3 templates email |
| `n8n-workflow.json` | n8n-builder | Workflow importable, 12 nœuds, prêt à configurer |
| `end-user-doc.md` | n8n-builder | Guide Marc : ce qui est automatisé, quand intervenir |
| `deployer-doc.md` | n8n-builder | Guide Romain : setup complet, tests, maintenance |

---

## Résultats du pipeline

### Processus identifiés (5)

| ID | Processus | Fréquence | Durée | Acteur |
|---|---|---|---|---|
| P01 | Tri et qualification des emails | Quotidienne | 15 min | Marc |
| P02 | Enregistrement d'une commande | 10×/jour | 3 min | Marc |
| P03 | Envoi de la confirmation | 10×/jour | 2 min | Marc |
| P04 | Gestion des ruptures de stock | 2-3×/mois | 45 min | Marc + Julien |
| P05 | Facturation hebdomadaire | 1×/semaine | 120 min | Marc |

### Opportunités d'automatisation (4)

| ID | Opportunité | Quadrant | ROI annuel net | Confiance |
|---|---|---|---|---|
| **OPP01** | Prise de commande automatique | Quick win | 5 800 € | Moyen |
| **OPP02** | Alerte rupture pre-confirmation | Quick win | 1 350 € | Élevé |
| **OPP03** | Facturation hebdomadaire auto | Major project | 3 760 € | Moyen |
| **OPP04** | Relance adresse manquante | Fill-in | 1 250 € | Moyen |

**Phase 1 (OPP01+02+04) : 7 900 € net la première année. Retour sur investissement en 3 semaines.**

### Pipeline breaks détectés

| ID | Problème | Sévérité | Recommandation |
|---|---|---|---|
| BREAK01 | Stocks mis à jour J-1 → confirmations envoyées sur données stables | Élevée | Marquer commandes "À valider stock" en attendant que Delphine mette à jour |
| BREAK02 | Numéros de commande incrémentés manuellement | Moyenne | Préfixe ML-YYYY-NNN pour différencier des commandes PrestaShop |

---

## Rôles dans ce scénario

| Rôle | Personne | Note |
|---|---|---|
| **End user** | Marc Dupont (fondateur) | S'auto-interviewe — mode Operator = self |
| **Operator** | Marc (pour la démo) | L'operator est Marc lui-même |
| **Deployer** | Romain (freelance) | Configure n8n, 4-6h de travail, ~300 € |

---

## Déploiement

**Builder recommandé** : n8n (pas d'entreprise, pas de données sensibles réglementées, budget compatible, Romain sait l'installer)

**Aucune validation `enterprise_deployment_required`** — la gate a été vérifiée et les 5 signaux sont absents.

**Instructions de déploiement** : voir `deployer-doc.md`

---

## Comment reproduire ce scénario avec Talk2Flow

1. Ouvrez une conversation Claude avec le skill Talk2Flow chargé
2. Collez le contenu de `transcript.md`
3. Talk2Flow détecte les lacunes et vous pose les questions de `gap-questions.md`
4. Répondez avec les réponses de Marc
5. Le pipeline génère les mêmes artefacts (avec des variations mineures selon le modèle)
