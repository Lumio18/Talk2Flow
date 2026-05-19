# Votre workflow de commandes — Guide utilisateur

**Destinataire** : Marc Dupont, fondateur de La Boîte Artisanale  
**Ce que ce document vous explique** : comment fonctionne votre nouveau workflow automatique, ce que vous n'avez plus à faire, et quand vous devez intervenir.

---

## Ce qui a changé

Avant, chaque matin vous passiez 30 à 45 minutes à :
- Lire les emails de commande
- Recopier les infos dans votre Google Sheet
- Envoyer une confirmation à chaque client

**Maintenant, le workflow s'en charge automatiquement, 24h/24.**

---

## Comment ça marche (sans jargon)

Toutes les 5 minutes, le système regarde si de nouveaux emails contenant les mots "commande" ou "commander" sont arrivés dans Gmail.

Quand il en trouve un, il :

1. **Lit le mail** et extrait les informations (nom, produit, quantité, adresse)
2. **Vérifie les stocks** dans votre onglet Stocks du Google Sheet
3. Selon ce qu'il trouve, **l'une de ces trois choses se passe** :

---

### Cas 1 — Tout est bon ✅

Le produit est disponible et l'adresse est présente.

→ Le workflow enregistre la commande dans votre tableau avec le statut **"Confirmée"**  
→ Un email de confirmation est envoyé automatiquement au client  
→ Vous n'avez rien à faire

---

### Cas 2 — Adresse manquante 📬

Le client n'a pas donné son adresse de livraison dans l'email.

→ Le workflow lui envoie automatiquement un email de relance  
→ La commande est enregistrée dans le tableau avec le statut **"En attente adresse"**  
→ Quand le client répond avec son adresse, vous mettez à jour le tableau manuellement et envoyez la confirmation

---

### Cas 3 — Rupture de stock ⚠️

Le produit commandé n'est pas disponible en quantité suffisante.

→ Le workflow **ne confirme pas** la commande au client  
→ Il vous envoie (à vous et à Julien) un email d'alerte avec les détails  
→ La commande est enregistrée avec le statut **"Rupture stock"**  
→ **Vous devez contacter le client** pour proposer un délai, un produit de remplacement, ou un remboursement

---

## Ce que vous devez continuer à faire

| Situation | Action requise | Temps estimé |
|---|---|---|
| Rupture de stock détectée | Contacter le client manuellement | ~15-20 min (vs 45 min avant) |
| Email de commande sans objet clair | Traiter manuellement si le workflow ne l'a pas capturé | 5 min |
| Mise à jour des stocks | Delphine continue de mettre à jour l'onglet Stocks dans Google Sheets | Inchangé |
| Commandes par téléphone ou SMS | Saisir manuellement dans le Google Sheet | Inchangé |

---

## Comment vérifier que tout fonctionne

Chaque matin, ouvrez votre Google Sheet et regardez les nouvelles lignes dans l'onglet "Commandes". Vous verrez :

- Les commandes confirmées automatiquement (statut "Confirmée")
- Les commandes en attente d'adresse (statut "En attente adresse")
- Les ruptures de stock à traiter (statut "Rupture stock")

Si vous voyez un email de commande dans Gmail qui n'est pas apparu dans le tableau, c'est probablement parce que l'objet du mail ne contenait pas "commande". Traitez-le manuellement et signalez-le à Romain pour qu'il ajuste le filtre si nécessaire.

---

## Modifier les emails automatiques

Si vous souhaitez changer le texte d'un email envoyé automatiquement (l'email de confirmation, l'email de demande d'adresse) :

1. Ouvrez l'interface n8n (l'adresse vous a été communiquée par Romain)
2. Cliquez sur le workflow "La Boîte Artisanale — Prise de commande email"
3. Double-cliquez sur le nœud "Gmail — Confirmation commande" (ou "Gmail — Demande adresse")
4. Modifiez le texte dans le champ "Message"
5. Cliquez sur "Save" puis fermez la fenêtre

**Important** : ne touchez pas aux `{{ }}` dans le texte — ce sont les champs qui se remplissent automatiquement (nom du client, numéro de commande, etc.).

---

## En cas de problème

| Symptôme | Que faire |
|---|---|
| Le workflow ne capte pas les nouvelles commandes | Vérifier que Gmail est connecté dans n8n (demander à Romain) |
| Un client dit ne pas avoir reçu de confirmation | Vérifier le statut dans Google Sheets — s'il est "Confirmée", l'email est parti. Vérifier les spams du client. |
| Une erreur apparaît dans n8n | Faire une capture d'écran et l'envoyer à Romain |
| Le stock est à zéro mais il reste des produits | Demander à Delphine de mettre à jour l'onglet Stocks |

---

## Ce que vous gagnez

- **~30 min/jour** récupérées sur le copier-coller et les confirmations manuelles
- **Zéro oubli** de confirmation : chaque commande reçoit une réponse automatique
- **Alertes de rupture avant que le client soit déçu** : vous êtes averti en temps réel

Sur un an, c'est environ **130 heures** que vous pouvez consacrer à développer votre boutique plutôt qu'à de l'administratif.

---

*Document généré par Talk2Flow — pipeline PME Order Management, mai 2026.*
