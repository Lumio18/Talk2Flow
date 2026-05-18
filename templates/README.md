# Templates

Reusable templates consumed by Talk2Flow skills to produce rich artifacts.

## `bpmn-viewer.html`

Self-contained HTML page that renders any BPMN 2.0 XML diagram with interactive zoom, pan, and download (SVG + .bpmn). Used by `process-modeler` and any other skill that outputs BPMN.

### How to use

1. Take the template file
2. Find the `<script id="bpmn-source" type="application/xml">` block
3. Replace its contents with your BPMN 2.0 XML
4. Optionally edit `<span class="title" id="diagram-title">` to give the diagram a name
5. Open in any browser — no server required

### Dependencies

- `bpmn-js@17.11.1` from unpkg (CDN)
- No build step, no npm install, no bundler

### Compatibility

The template renders any BPMN 2.0 XML that bpmn-js can read. Tested with diagrams produced by:
- Camunda Modeler
- bpmn.io
- draw.io BPMN export

If a diagram lacks layout coordinates (`BPMNDiagram` section), bpmn-js will fail to render it. Consider passing through `bpmn-auto-layout` before injecting.

## Adding new templates

When a future skill needs a different rich-artifact format (e.g., n8n workflow visualization, RACI matrix interactive editor), add the template here following the same self-contained, CDN-only pattern.
