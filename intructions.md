# 📅 Planning Vacances (2 semaines)

## 🎯 Objectifs
- Révisions quotidiennes :
- 📚 Français : matin
- 🔢 Maths : soir
- 🏋️ Salle : 2h30 (mardi, mercredi, vendredi, samedi, dimanche)
- 📝 Devoirs supplémentaires : mercredi après-midi
- 🔬 Dimanche après-midi : spécialités (Physique-Chimie + SVT)

---

## 🗓️ Organisation Journalière (standard)

### 🌅 Matin
- 1h à 2h → Révisions Français

### 🌞 Après-midi
- Temps libre / récupération
- (Mercredi uniquement) → Devoirs supplémentaires

### 🌆 Soir
- 1h à 2h → Révisions Maths

### 🏋️ Sport (jours fixes)
- Mardi : 2h30
- Mercredi : 2h30
- Vendredi : 2h30
- Samedi : 2h30
- Dimanche : 2h30

---

## 📌 Organisation Spécifique

### 🧠 Dimanche
- Après-midi :
- Physique-Chimie
- SVT

---

## ❌ Exceptions (jours OFF complets)

### 🚫 25 avril
- Aucun travail possible
- → Rééquilibrer les révisions sur les jours avant/après

### 🚫 2 mai
- Aucun travail possible
- → Rééquilibrer les révisions sur les jours avant/après

---

## ⚖️ Ajustements recommandés

- Si un jour est sauté :
- Ajouter +30 min à +1h les jours suivants
- Possibilité d’augmenter :
- Français matin : jusqu’à 2h
- Maths soir : jusqu’à 2h

---

## 🔁 Exemple de journée type

- 10h00 – 11h30 → Français
- 16h00 – 18h30 → Salle (si jour concerné)
- 20h00 – 21h30 → Maths

---

## 🧩 Notes
- Priorité : régularité > intensité
- Garder du temps libre pour éviter surcharge
- Adapter selon fatigue

# 📅 Planning Période Scolaire (optimisé avec créneaux réels)

## 🎯 Objectif
- 2h de révisions par jour
- Français + Maths
- Adapté aux trous réels

---

## 🕒 Créneaux DISPONIBLES (trous réels)

### 🟦 Lundi

- 15h → soirée (libre)

👉 Placement :
- Français : 15h-16h
- Maths : soir (1h)

---

### 🟪 Mardi (SPORT)
- 
- Après 17h (libre)

👉 Placement :
- Français : 18h-19h
- Maths : soir léger (30-45min)

---

### 🟩 Mercredi (SPORT + GROS TROU)
- 12h → 17h (gros trou)

👉 Placement IDEAL :
- Français : 12h-13h30
- Maths : 15h-16h30

👉 Journée la plus importante

---

### 🟨 Jeudi
- Après 14h (libre partiel)

👉 Placement :
- Français : de 14h a 15h
- Maths : soir

---

### 🟥 Vendredi (SPORT)
- Après 17h

👉 Placement :
- Français : 18h-19h
- Maths : 20h-21h

---

### 🟫 Samedi (SPORT)
- Journée libre

👉 Placement :
- Français : matin
- Maths : avant ou après sport

---

### ⬛ Dimanche (SPORT)
- Journée libre

👉 Placement :
- Après-midi :
- Physique-Chimie
- SVT
- + Français léger matin

---

## 🏋️ Sport
- Mardi / Mercredi / Vendredi / Samedi / Dimanche
- 2h30

---

## ⚖️ Ajustement automatique

- Si jour chargé → déplacer vers :
- Mercredi (priorité)
- Lundi
- Jeudi

---

## 🧠 Règles intelligentes

- Toujours utiliser les trous en priorité
- Français = moments de concentration (journée)
- Maths = soir ou gros blocs

---

## 🔧 STRUCTURE JSON (EXPLOITABLE PAR TON APP)

```json
{
"monday": {
"sport": false,
"free_slots": [
{ "start": "12:00", "end": "13:00", "priority": "high" },
{ "start": "15:00", "end": "20:00", "priority": "medium" }
],
"target_hours": 2
},
"tuesday": {
"sport": true,
"free_slots": [
{ "start": "12:00", "end": "13:00", "priority": "high" },
{ "start": "17:00", "end": "20:00", "priority": "low" }
],
"target_hours": 1.5
},
"wednesday": {
"sport": true,
"free_slots": [
{ "start": "12:00", "end": "17:00", "priority": "max" }
],
"target_hours": 2
},
"thursday": {
"sport": false,
"free_slots": [
{ "start": "11:00", "end": "13:00", "priority": "high" },
{ "start": "15:00", "end": "18:00", "priority": "medium" }
],
"target_hours": 2
},
"friday": {
"sport": true,
"free_slots": [
{ "start": "12:00", "end": "13:00", "priority": "high" },
{ "start": "17:00", "end": "20:00", "priority": "low" }
],
"target_hours": 1.5
},
"saturday": {
"sport": true,
"free_slots": [
{ "start": "10:00", "end": "18:00", "priority": "flexible" }
],
"target_hours": 2
},
"sunday": {
"sport": true,
"free_slots": [
{ "start": "10:00", "end": "18:00", "priority": "flexible" }
],
"target_hours": 2
}
}