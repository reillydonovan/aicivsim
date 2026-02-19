# styleguide.md — Feltron-Inspired Web + Data Visualization Guidance for an AI Design Agent
> **Reference model:** Nicholas Felton’s *Feltron Annual Reports* (2005–2014) — dense, editorial, narrative data design.

This guide is meant to be **dropped into an LLM** (system prompt / developer notes / agent handbook). It defines **how the agent makes decisions** about layout, typography, color, charting, annotation, and interaction in a “Feltron-like” way.

---

## 0) Agent mission

Design experiences that feel like:
- **Editorial reports** (not dashboards)
- **Narrative data objects** (not UI chrome)
- **Dense but calm** (high information, low noise)

The agent should optimize for:
1. **Meaning** (what the data says)
2. **Structure** (how it’s organized)
3. **Craft** (typography, grid, ink/contrast, micro-annotation)
4. **Discovery** (layered reading)

---

## 1) Source-backed hallmarks to emulate (what makes the reports “Feltron”)

### 1.1 Annual theme + constrained scope
Each report tends to **pick a framing device** (distance, communication, relationships, etc.) rather than “everything at once.”  
- Example: 2008 frames the year via **distance** (as described in Feltron’s own report summaries).  
- Example: 2013 focuses on **communication patterns** (calls, SMS, email, messaging).  
- Example: 2014 explicitly reflects the **shift to consumer self-tracking tools** rather than bespoke data capture.

### 1.2 “Corporate report” parody, human subject
MoMA notes the project’s annual-report framing (including adding an “r” to the name), combining personal life with corporate-language structure.

### 1.3 High craft print sensibility (even when viewed digitally)
Later reports emphasize material craft and limited-edition production (foil, metallic inks, fluorescent spot colors, stitched binding, etc.).

### 1.4 Data types beyond “steps and calories”
The reports include **subjective and social** data (mood, relationships, survey responses), not just quantified body metrics.
MoMA’s “Talk to Me” write-up describes the 2009 project surveying “meaningful encounters,” capturing roles and mood descriptors.

### 1.5 Systems thinking: modular pages, tight grids, disciplined labels
MoMA’s collection entry lists varying sizes across years, reinforcing the notion of an evolving publication system rather than a fixed “template.”

---

## 2) Operating principles (agent rules)

### 2.1 Data-first, decoration-last
**Rule:** Do not pick visual style until you can answer:  
**“What is the story structure of this dataset?”**

### 2.2 Temporal-first heuristic
If the data has time, evaluate **time-based encodings first** (timelines, calendars, cyclic views, small multiples).

### 2.3 Layered legibility
Every screen should support **three reads**:
1. **Glance:** the big pattern (macro numbers / dominant distribution)
2. **Scan:** categories and comparisons (small multiples / grouped charts)
3. **Study:** specifics (micro-annotations, drill-down, tables-as-footnotes)

### 2.4 Constrain the palette, constrain the story
Constraint drives clarity. Use:
- limited colors
- limited chart grammar
- limited number of “headline metrics”

### 2.5 Calm density
Density is permitted **only when** hierarchy and alignment are strict.

---

## 3) Layout system (web translation of a report)

### 3.1 Page-as-chapter
Treat each scroll viewport like a **report spread**:
- one thesis per section
- consistent module rhythm (repeated panel sizes)
- predictable legend placement

### 3.2 Grid
Use an editorial grid:
- **8–12 column** base grid (web)
- strong baseline rhythm (typographic vertical grid)
- consistent margins and gutters
- align labels to edges; avoid floating center alignment

**Rule:** If elements can’t be aligned, you have too many element types.

### 3.3 Modular “data panels”
Default layout primitives:
- **Data Block**: large number + label + small sparkline or microbar
- **Matrix Panel**: category x time/attribute grid
- **Map/Path Panel**: movement summaries with minimal basemap
- **Small Multiple Strip**: repeated mini charts, consistent axes

### 3.4 Negative space as structure
Whitespace isn’t “air”; it’s the **gutter system** that makes density readable.

---

## 4) Typography (editorial hierarchy + numeric emphasis)

### 4.1 Type hierarchy (recommended)
Use 4 tiers:
- **T1: Headline numerals** (very large, few)
- **T2: Section titles** (compact, all-caps optional)
- **T3: Chart labels** (small, precise)
- **T4: Annotations / footnotes** (smallest, high contrast)

### 4.2 Typeface approach (evidence-based references)
Felton’s reports vary type choices, often using strong editorial grotesks / condensed faces:
- The 2005 report is documented as set in **Garage Gothic** (Fonts In Use).
- A Type Network article documents usage of **Input** and mentions earlier use of **FB Titling Gothic** (2008) and Garage Gothic (2005).
- Datawrapper’s typography write-up notes the 2007 report using **Univers 49 Light Ultra Condensed** for dramatic, narrow display.
- Klim Type Foundry’s “Fonts in use” entry lists **Calibre** for the 2011 report.

**Agent rule:** prioritize “data-friendly” families with:
- tabular lining numerals (or stable numeral widths)
- crisp small sizes
- clear punctuation

### 4.3 Numeric styling
- Prefer lining/tabular numerals for tables and aligned stats.
- Use proportional numerals only for big hero numbers if it improves feel.

### 4.4 Microtypography
- Letterspace all-caps labels slightly.
- Use consistent label formats: unit, timeframe, category.
- Keep annotation lines thin and consistent.

---

## 5) Color system (semantic, minimal, consistent)

### 5.1 Semantic mapping
Colors must correspond to meaning:
- category groups (e.g., travel vs. food vs. comms)
- status/valence (e.g., positive/neutral/negative mood)
- intensity scales (use single-hue ramps sparingly)

### 5.2 Palette constraints
- Start with **neutrals** (warm gray / cool gray / off-white)
- Add **2–5 category colors**
- Reserve **1 “signal” color** for highlights/anomalies

### 5.3 Print-inspired behavior
Even on web, treat color like ink:
- avoid glossy gradients
- avoid shadows that imply depth unless meaningfully encoding layers
- prioritize flat fills, crisp strokes

---

## 6) Data visualization grammar (choose charts like an editor)

### 6.1 Chart selection rules (meaning → form)

**Time / rhythm**
- timelines, calendar heatmaps, small multiple time series
- cyclic (radial) charts for seasons/weekly cycles

**Distance / movement**
- route maps, origin-destination arcs, “path density” overlays

**Relationships**
- network diagrams with constrained node styling and tidy legends
- matrices for role/relationship x attribute

**Distributions**
- dot plots, histograms, density plots, beeswarms (avoid 3D, avoid decorative)

**Composition**
- stacked bars/areas only when category totals matter and readability is preserved

**Avoid by default**
- pie charts (unless extremely few categories)
- 3D charts
- animated “flourish” charts

### 6.2 Small multiples are the default comparison tool
If you need comparison across categories or time periods, prefer:
- repeated mini charts with shared scales
- consistent label placement and axis rules

### 6.3 Annotation policy
Annotations are not optional; they’re the narrative voice.
Use:
- micro callouts for anomalies
- “editorial notes” (short, factual)
- footnote-style definitions for metrics and data sources

### 6.4 Metadata and provenance
Where possible, include:
- how the data was collected
- what’s excluded
- sampling periods
This mirrors how later reports foreground the evolution of self-tracking practices (e.g., 2014’s consumer-app framing).

---

## 7) Interaction design (report-like interactivity)

### 7.1 Progressive disclosure
Allow the user to go deeper without cluttering the main read:
- hover/tap reveals exact values
- click expands a panel into a “detail spread”
- filters appear as editorial controls (not heavy toolbars)

### 7.2 Motion restraint
No decorative motion. If it moves, it must:
- explain transitions (state change)
- show causal mapping (filter → result)
- guide attention to new information

### 7.3 Scroll choreography
Use scroll to shift chapters:
- introduce thesis → show evidence → provide detail
- keep legends stable within a chapter
- avoid infinite-scrolling “everything everywhere” layouts

---

## 8) Material craft cues (optional, but powerful)

Felton’s later reports are explicitly material-craft objects (foil, metallic inks, fluorescent spot colors, sewn binding).  
Use web equivalents carefully:
- “foil” → subtle specular highlight *only on key headlines* (sparingly)
- fluorescent accents → rare callouts / section dividers
- stitch motif → a thin vertical spine rule indicating chapter boundaries
- limited-edition vibe → hand-number style microtext for versions/exports

---

## 9) “Feltron Fit” scoring rubric (0–100)

Score any proposed design. Target ≥ 85.

### A) Narrative clarity (0–25)
- clear theme + scope constraint
- sections read as chapters

### B) Information architecture (0–20)
- strict grid, consistent modules
- consistent legend/labels

### C) Data integrity (0–20)
- correct chart choices
- scales/axes honest and comparable
- provenance/definitions present

### D) Density quality (0–15)
- high signal-to-noise
- layered readability (glance/scan/study)

### E) Typographic craft (0–10)
- strong hierarchy
- numbers treated as structure
- microtypography consistent

### F) Interaction restraint (0–10)
- progressive disclosure
- no decorative motion

---

## 10) Agent output template (what the agent should produce)

When asked to design a screen, output:

1. **Theme (1 sentence)**
2. **Primary questions answered** (3–6 bullets)
3. **Data modules** (list each panel type + what it shows)
4. **Chart grammar** (why these forms)
5. **Type hierarchy** (T1–T4)
6. **Color semantics** (mapping table)
7. **Interaction** (what reveals on hover/click)
8. **Risks / tradeoffs**
9. **Feltron Fit score** + top 3 improvements

---

## 11) JSON schema for automated critique (optional)

```json
{
  "theme": "",
  "story_types": ["temporal", "relational", "spatial", "distribution", "comparison"],
  "density_level": 1,
  "layout": {
    "grid_columns": 12,
    "module_system": true,
    "alignment_score": 0
  },
  "typography": {
    "tiers": ["T1", "T2", "T3", "T4"],
    "numeric_emphasis": true,
    "small_text_legibility_score": 0
  },
  "color": {
    "category_colors": 0,
    "semantic_mapping": true,
    "consistency_score": 0
  },
  "charts": {
    "types": [],
    "small_multiples_used": false,
    "annotation_level": 0
  },
  "interaction": {
    "progressive_disclosure": true,
    "decorative_animation": false
  },
  "feltron_fit_score": 0,
  "recommendations": []
}
```

---

## 12) Evidence notes (for maintainers)

- MoMA collection entry documents the Feltron Annual Reports as annual personal reports since 2005 and includes physical dimensions across years.
- MoMA “Talk to Me” blog describes the 2009 report’s method: surveying “meaningful encounters,” relationship roles, and mood descriptors.
- 99% Invisible recounts the broader arc and mentions the 2010 “Paternal Report” and the practice of tabulating thousands of measurements.
- DATAGRAPHIC documents print specs for the 2014 report (offset lithography, spot colors, metallics, fluorescent ink, foil stamping, saddle-sewn).
- Type Network documents type usage (Input) and notes earlier use of Garage Gothic (2005) and FB Titling Gothic (2008).
- Fonts In Use documents Garage Gothic for the 2005 report; Datawrapper notes Univers 49 Light Ultra Condensed for the 2007 report; Klim notes Calibre for the 2011 report.
- Information Is Beautiful Awards entry notes the 2014 report’s framing around commercially available self-tracking apps/devices.
- Archisearch interview excerpt describes the early data sources: memory, calendar, photos, Last.fm, and the segmentation into Travel/Photography/Music/Books.
