# Gap Detection — Compléments post-entretien

> **Étape** : Phase 1, Step 2–4 — interview-guide (Mode 2 / transcription existante)  
> **Transcript analysé** : `transcript.md`  
> **Langue détectée** : Français

---

## Analyse des lacunes détectées

Après lecture complète du transcript, 12 lacunes candidates ont été identifiées. Filtrées à 8 questions par ordre d'impact sur la précision des calculs de ROI et la qualité de la spec d'automatisation.

---

## Questions complémentaires posées à Marc

J'ai lu la transcription. Avant d'extraire les processus, j'ai 8 questions ciblées — elles rendront l'analyse plus précise et les chiffres de ROI plus fiables.

**Volumes et fréquences**

1. Vous estimez entre 8 et 12 commandes mail par jour. Sur une semaine type, c'est plutôt 8 ou plutôt 12 — et est-ce que ça varie selon les saisons (Noël, fêtes, soldes) ?  
   *— Le ROI annuel dépend du volume réel, pas d'une fourchette.*

2. Les 2-3 ruptures de stock par mois qui nécessitent une "gestion de crise" — chacune vous prend environ 30 minutes selon vous. C'est bien 30 min de votre temps, ou ça peut monter plus haut (relances multiples, remboursement) ?  
   *— Ce coût caché change le score de priorité de l'opportunité stock.*

**Outils et systèmes**

3. Votre Google Sheet de suivi commandes — il est partagé avec l'équipe ? Julien et Delphine y ont accès en lecture/écriture, ou c'est votre tableau personnel ?  
   *— Si le Sheet est partagé, l'automatisation peut aussi notifier Julien directement.*

4. Pour les factures, vous avez mentionné un modèle Word. Vous envoyez les factures en PDF depuis Word, ou par mail directement ? Et vous avez un numéro de TVA — vous êtes assujetti à la TVA ?  
   *— Détermine si un outil de facturation simple (Fresha, Pennylane free) peut suffire ou si la complexité TVA bloque.*

5. Le freelance Romain — il est disponible facilement (quelques heures sur commande) ou c'est compliqué de le mobiliser ?  
   *— Impact direct sur le délai et le coût de mise en place du déploiement.*

**Détails de processus**

6. Les commandes mail — les clients envoient les infos dans un format à peu près standard (produit + quantité + adresse dans le corps du mail) ou c'est très variable ? Par exemple : est-ce que certains envoient juste "bonjour, je voudrais de la confiture" sans donner leur adresse ?  
   *— Si le format est trop variable, l'extraction automatique nécessite une étape de validation humaine.*

7. Quand vous envoyez la confirmation, vous incluez un moyen de paiement ? Les clients paient comment — virement, PayPal, en ligne sur PrestaShop — ou ils ont déjà payé avant de vous écrire ?  
   *— Détermine si le workflow de confirmation doit inclure un lien de paiement ou juste confirmer.*

8. Vous recevez combien de mails non-commande par jour ? (Questions clients, fournisseurs, autres) — question oui/non : est-ce qu'il y a un filtre Gmail existant, ou tout arrive dans la boîte principale sans étiquette ?  
   *— Si tout est mélangé, le trigger Gmail devra filtrer sur l'objet — important pour la fiabilité du workflow.*

---

## Réponses de Marc

**Réponse 1 — Volumes**

> "En semaine normale c'est plutôt 8 à 10. En décembre et avant Pâques ça monte à 20-25. On va dire 10 en moyenne sur l'année, avec des pointes à 25."

→ **10 commandes/jour en moyenne, 25 en pic.** ~50 semaines × 5 jours × 10 = 2 500 commandes mail/an.

**Réponse 2 — Ruptures de stock**

> "30 minutes c'est souvent le minimum. Parfois il faut aller et venir avec le client, c'est plutôt 45-60 minutes quand ça part mal. Mettons 45 minutes en moyenne."

→ **2-3 ruptures × 45 min = 1h30 à 2h15/mois perdues en gestion de crise.**

**Réponse 3 — Google Sheet partagé**

> "Oui, Julien est en lecture seule. Delphine peut modifier l'onglet Stocks. C'est partagé en lecture avec tout le monde mais l'onglet Commandes c'est moi qui le gère principalement."

→ Julien peut être notifié automatiquement quand une commande est enregistrée.

**Réponse 4 — Facturation TVA**

> "Je suis en franchise de base TVA — en dessous du seuil. Donc pas de TVA sur mes factures. Je génère le PDF depuis Word avec Acrobat Reader, et j'envoie par mail manuellement."

→ Franchise TVA simplifie l'automatisation. Pas de calcul complexe.

**Réponse 5 — Disponibilité Romain**

> "Il répond en général dans la journée, il est flexible. Je lui donne du travail 2-3 fois par an. Pour un truc simple il peut intervenir en 1-2 jours."

→ Déploiement possible rapidement, Romain = deployer idéal pour ce projet.

**Réponse 6 — Format des mails commande**

> "C'est variable mais pas catastrophique. 70% des clients donnent tout — produit, quantité, adresse. Les 30% restants oublient soit l'adresse soit la quantité exacte. J'ai souvent à les relancer pour l'adresse."

→ Le workflow devra inclure une vérification "adresse manquante" et une relance automatique dans ce cas.

**Réponse 7 — Paiement**

> "Les clients paient au moment de la livraison (virement ou chèque) ou en ligne sur PrestaShop quand ils commandent par le site. Les commandes mail c'est souvent des clients réguliers qui font confiance — ils paient à réception. La confirmation leur dit juste que c'est bien noté."

→ Pas de lien de paiement dans la confirmation. Workflow simplifié.

**Réponse 8 — Tri des mails**

> "Tout arrive dans la même boîte. J'ai pas de filtre. Parfois les commandes ont 'Commande' dans l'objet, parfois non. Il y a peut-être 30-40 mails non-commande par jour."

→ Le trigger Gmail doit utiliser une heuristique sur l'objet (keywords: "commande", "commander", "order") + confirmation humaine pour les cas ambigus.

---

## Zones d'incertitude restantes (`unclear_areas`)

| Zone | Raison | Impact |
|---|---|---|
| Format exact du corps des mails commande | Trop variable pour prototyper sans exemples réels | L'extraction automatique des champs devra être testée sur des vrais mails |
| Volume exact des commandes téléphone/SMS | Non quantifié dans l'entretien | Hors scope V1 — uniquement les commandes mail |
| Seuil de déclenchement du réassort | Delphine met à jour les stocks manuellement | Le workflow peut alerter sur rupture mais pas piloter le réassort |
