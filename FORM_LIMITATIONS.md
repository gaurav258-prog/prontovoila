# Verpflichtungserklärung Form Limitations

## Problem
This PDF form has combined AcroForm fields that **cannot be properly filled with space-padding**:
- `"Name Vorname"` — visually spans left (Name) and right (Vorname) columns
- `"Geburtsdatum Geburtsort"` — visually spans left and right
- `"Staatsangehörigkeit Beruf / Arbeitgeber"` — visually spans left and right
- `"Straße / Hausnummer Postleitzahl / Wohnort"` — visually spans left and right

## Why It Fails
1. These are **single AcroForm fields** with no separate field for the right column
2. PDF viewers render text left-to-right; spaces don't reliably position text into visual columns
3. Space-padding puts both values in one line, but Dinesh/Geburtsort/etc. appear in the middle, not aligned with the right column label

## Current Workaround
- Fill ONLY the left-column values (family name, date, nationality, street)
- Accept that right columns (Vorname, Geburtsort, Arbeitgeber, Postleitzahl/Wohnort) will be blank
- These fields need manual completion in a PDF viewer

## Proper Fix (Future)
Would require:
- **Path B (coordinate overlay)**: Use exact x,y positioning to draw right-column values
- **Complex calculation**: Determine exact pixel positions for each right column based on form layout
- **Not practical** for generic form handling across multiple PDFs

## Status
✗ Right-column fields cannot be auto-filled reliably
✓ Left-column fields fill correctly
