# 🧩 Universal Form Design System Specification (AI-Readable Reference)

This file defines a reusable and comprehensive UI form design system based on Austrian government UI patterns. It is intended for implementation in any modern frontend, and the examples here are tailored for **Angular** projects.

---

## 1. 📐 Layout Structure

### General Layout

- Two-column layout on desktop.
- Right column stacks below on smaller screens.
- Sticky toolbar/header with primary action buttons.

### Padding & Spacing

- Outer page margin: 20–40px.
- Field spacing: 20px vertical between inputs.
- Section spacing: 40px vertical between grouped elements.

---

## 2. 🧩 Components

### ✅ Text Input Field

- Label: Above input field.
- Width: 500px
- Height: 26px
- Font: Source Sans Pro Regular 12pt
- Placeholder: Optional
- Background:
  - 40% white transparency overlay if required but empty.
  - Full white on focus.
- Border color:
  - Default: #D4DCE0
  - Focused: #338E9C
  - Error: #963232

### ✅ Dropdown Select

- Label: Above field
- Widths: 160px or 500px depending on context.
- Font: Source Sans Pro Regular 12pt
- Background: white
- Border:
  - Normal: #D4DCE0
  - Focus: #338E9C
- Icon: ▼

### ✅ Radio Button Group

- Layout: Horizontal or vertical
- Options Example: männlich, weiblich, divers, keine Angabe
- Selected color: #338E9C
- Font: Source Sans Pro Regular 12pt

### ✅ Buttons

- Types: Primary, Warning, Danger
- Height: min 40px
- Font: Source Sans Pro Bold 15pt
- Colors:
  - Primary: #338E9C (text: #FFFFFF)
  - Warning: #CBBD00 (text: #1d1d1b)
  - Danger: #963232 (text: #FFFFFF)
- Examples: "Anfrage senden", "Niederschrift erzeugen", "Löschen"

### ✅ Tooltip

- Shape: Rounded speech bubble
- Font: Source Sans Pro Regular 15pt
- Shadow: 135°, offset 1mm, size 2mm, 50% black
- Background: Light grey
- Border: None

### ✅ Theme Toggle (Light/Dark)

- Label: DUNKEL / HELL
- Behavior:
  - Light Mode: White background, black text
  - Dark Mode: Dark background, white text and teal accents

---

## 3. 🎨 Style Guide

### Fonts

- Source Sans Pro
  - Regular: 12pt, 15pt
  - Bold: 10pt
  - Black: 50pt (titles)

### Colors

| Purpose             | Color Name | Hex Code              |
| ------------------- | ---------- | --------------------- |
| Primary Highlight   | Teal       | #338E9C               |
| Warning             | Yellow     | #CBBD00               |
| Error/Validation    | Red        | #963232               |
| Base Text           | Dark Grey  | #1d1d1b               |
| Background Neutral  | Light Grey | #D4DCE0               |
| Input Empty Overlay | White 40%  | rgba(255,255,255,0.4) |
| Active Background   | White      | #FFFFFF               |

---

## 4. 🧾 Form Structure (Universal)

### Sections (Groupings)

- Personal Information:
  - Vornamen, Früherer Vorname, Familiennamen (aktuell, früher)
  - Akad. Grad (davor, dahinter)
  - Geschlecht
  - Geburtsort, -datum, -staat
- Identity Document:
  - Art, Nummer, Ausgestellt von/in, Gültig bis, Nationale ID
- Request Purpose:
  - Bezug, BHZ, §10 (1), (1a), (1c), (1e) selections
- Delivery:
  - Anschrift, PLZ, Ort, Staat
  - Method: RSa Brief / Normalbrief

---

## 5. ⚙️ Interaction Rules

- Required fields show white 40% overlay until filled.
- On focus: background becomes full white.
- Validation errors turn the border red.
- Buttons highlight on hover with darker tone.
- Tooltip appears on hover or focus.
- Profile selection allowed from dropdown.
- "Anfrage an EU Strafregister wird verlangt!" appears based on country logic.

---

## 6. 📱 Responsive Design

- On mobile:
  - Right column stacks under left.
  - Bundesadler (logo) hidden.
  - Title moves under BMI logo.
  - Touch targets increased to minimum 40px.

---

## 7. 🔧 Example Angular Template + CSS Code

### Angular Template (HTML)

```html
<section class="form-section">
  <label for="firstName">Vornamen</label>
  <input type="text" id="firstName" class="input-field" required placeholder="Herbert" [(ngModel)]="formData.firstName" />

  <label for="formerLastName">Frühere Familiennamen</label>
  <input type="text" id="formerLastName" class="input-field" [(ngModel)]="formData.formerLastName" />

  <div class="radio-group">
    <label>Geschlecht:</label>
    <label><input type="radio" name="gender" value="männlich" [(ngModel)]="formData.gender" /> männlich</label>
    <label><input type="radio" name="gender" value="weiblich" [(ngModel)]="formData.gender" /> weiblich</label>
    <label><input type="radio" name="gender" value="divers" [(ngModel)]="formData.gender" /> divers</label>
  </div>
</section>

<div class="form-actions">
  <button class="btn btn-primary" (click)="submitForm()">Anfrage senden</button>
  <button class="btn btn-danger" (click)="resetForm()">Löschen</button>
</div>
```

### Angular CSS/SCSS

```css
.input-field {
  font-family: "Source Sans Pro", sans-serif;
  font-size: 12pt;
  width: 500px;
  height: 26px;
  background-color: rgba(255, 255, 255, 0.4);
  border: 1px solid #d4dce0;
  padding: 4px 8px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.input-field:focus {
  background-color: #ffffff;
  border-color: #338e9c;
  outline: none;
}

.input-field.ng-invalid.ng-touched {
  border-color: #963232;
}

.radio-group label {
  display: inline-block;
  margin-right: 20px;
  font-family: "Source Sans Pro", sans-serif;
}

.btn {
  font-family: "Source Sans Pro", sans-serif;
  font-size: 15pt;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.btn-primary {
  background-color: #338e9c;
  color: #ffffff;
}

.btn-danger {
  background-color: #963232;
  color: #ffffff;
}
```

---

## ✅ Summary

This design system is derived from Austrian government digital service design (BMI) and acts as the baseline for all form UI/UX patterns in your Angular application
