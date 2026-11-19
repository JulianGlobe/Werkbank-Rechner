# Werkbank-Rechner

Statische Website mit 37 Rezepten aus den Screenshots und ergänzten Angaben. Stand 19.11.2026.

## Lokal starten

`index.html` im Browser öffnen. Keine Installation, kein eigener Server und keine Datenbank nötig. Alle Dateien im selben Ordner lassen.

## Funktionen

- Rezept- und Materialsuche, Kategorien und gewünschte Stückzahlen.
- Gemeinsamer Herstellungsplan mit Grundmaterialien oder direkten Zutaten.
- Ganze Herstellvorgänge, gemeinsame Vorprodukte, Restmengen und Herstellzeit inklusive Vorprodukten.
- Materialbedarf und Herstellzeit direkt pro Rezept und als Gesamtübersicht; Plan im lokalen Browserspeicher behalten.
- Responsive Oberfläche für PC und Handy. Keine externen Schriften, Tracker oder Bibliotheken.

Die Wunschmenge ist die Zahl der Gegenstände, die am Ende vorhanden sein sollen. Beispiel: 6 Laborgläser brauchen 2 Vorgänge und ergeben 10 Gläser; 4 bleiben übrig. Für 1 GPS und 1 Racing Tablet werden gemeinsam 14 Kupfer benötigt. Vorräte werden nicht abgezogen. Alle Zeiten sind die Summe der einzelnen Vorgänge bei Herstellung nacheinander; Reisen und Bedienung sind nicht enthalten.

## GitHub Pages

Diese Dateien im Hauptverzeichnis eines Repositorys ablegen. Unter **Settings → Pages → Build and deployment** die Quelle **Deploy from a branch**, den Branch **main** und **/(root)** wählen und speichern. Die angezeigte Pages-Adresse öffnet die Website. Kein Build-Schritt nötig.

## Rezepte ändern

`data.js` enthält die Rezepte in der Reihenfolge ID, Name, Kategorie, Ausgabemenge, Zeit in Sekunden, Materialien und optional Voraussetzung. Die Rezeptnamen verknüpfen Vorprodukte miteinander.

Die Werte dienen ausschließlich der Spielplanung in GTA RP und beschreiben keine realen Herstellungsverfahren.

Ergänzte Rezepte: 10 Metallerz → 1 Metall; 8 Kevlarfasern → 1 Kevlarmaterial; 6 Kevlarmaterial → 1 schusssichere Weste. Die nicht angegebenen Herstellzeiten werden als unbekannt ausgewiesen.
