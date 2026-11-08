# Formule 1

Toute la saison de Formule 1 dans NeoDex : le calendrier avec l'horaire de chaque séance à l'heure de Paris, un compte à rebours jusqu'au prochain Grand Prix, les résultats de chaque manche et les classements pilotes et écuries.

*English version: [README.en.md](README.en.md)*

## Les onglets

- **Calendrier** : le prochain Grand Prix en grand, avec le compte à rebours (J-…, ou « En cours » pendant le week-end) et toutes ses séances : essais libres 1, 2 et 3, sprint, qualifications et course, à l'heure de Paris. En dessous, chaque manche de la saison avec sa date, son pays et son vainqueur une fois courue ; les week-ends sprint sont signalés.
- **Résultats** : pour n'importe quelle manche courue, le classement de la **course** (position, pilote, écurie, temps ou écart, points, place sur la grille, meilleur tour ⏱, abandons AB, tours de retard), des **qualifications** et du **sprint**.
- **Pilotes** : le classement du championnat, avec les points en barres aux couleurs des écuries, après la dernière manche.
- **Écuries** : le classement des constructeurs, de la même façon.

## Ton pilote

L'**étoile** à côté d'un pilote en fait ton pilote : sa ligne est mise en avant dans les résultats et les classements. Un nouveau clic sur l'étoile le retire.

## Emploi du temps

Coche **Ajouter les qualifications et les courses à mon emploi du temps** : les qualifications, sprints et courses à venir sont ajoutés à l'agenda de NeoDex, avec leur heure. La liste est remise à jour toutes les 6 heures ; décocher la case retire tout.

## Les données

Les résultats viennent de **Jolpica**, la suite libre de l'ancienne base Ergast, mise à jour après chaque séance. Chaque page n'est demandée qu'une fois toutes les 10 minutes ; si le service est saturé, le plugin réessaie tout seul puis te prévient. Sans connexion, un message l'indique.

## Données et synchronisation

Ton pilote et le choix de l'emploi du temps sont enregistrés par NeoDex, sauvegardés et synchronisés entre tes PC si la synchro est activée. Le plugin ne contacte que `api.jolpi.ca`.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Formule 1 → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
