import type { APIRoute } from 'astro';
import { site } from '../../config/site';
import { serviceNames } from '../../data/services';

/**
 * Sveltia CMS config, generated from src/config/site.ts so the site URL,
 * repo and service list are never duplicated by hand.
 */
const yaml = `
# Sveltia CMS (Decap-compatible) — https://sveltiacms.app
# Lets the owner add projects with photos from the browser at /admin.
# Each save is a commit to GitHub; Netlify rebuilds the site automatically.

backend:
  name: github
  repo: ${site.repo}
  branch: main
  commit_messages:
    create: 'Νέο έργο: {{slug}}'
    update: 'Ενημέρωση έργου: {{slug}}'
    delete: 'Διαγραφή έργου: {{slug}}'
    uploadMedia: 'Φωτογραφία: {{path}}'
    deleteMedia: 'Διαγραφή φωτογραφίας: {{path}}'

site_url: ${site.url}
display_url: ${site.url}
logo_url: /icon-192.png
locale: el

# Folder names (URLs) are converted to Latin characters: "Ανακαίνιση Ελευσίνα" → "anakainisi-elefsina"
slug:
  encoding: ascii
  clean_accents: true
  sanitize_replacement: '-'
  lowercase: true

media_folder: src/assets/uploads
public_folder: /src/assets/uploads

collections:
  - name: projects
    label: Έργα
    label_singular: Έργο
    description: Κάθε έργο εμφανίζεται στην αρχική σελίδα (έως 6) και στη σελίδα /erga.
    folder: src/content/projects
    path: '{{slug}}/index'
    media_folder: ''
    public_folder: ''
    create: true
    delete: true
    extension: md
    format: frontmatter
    identifier_field: title
    slug:
      template: '{{slug}}'
      editable: [create]
      hint: 'Η διεύθυνση της σελίδας, π.χ. anakainisi-elefsina. Μόνο λατινικά πεζά, αριθμοί και παύλες.'
      pattern: ['^[a-z0-9]+(-[a-z0-9]+)*$', 'Μόνο λατινικά πεζά γράμματα, αριθμοί και παύλες.']
    filter:
      field: title
      pattern: '.+'
    sortable_fields:
      fields: [date, title, featured]
      default:
        field: date
        direction: descending
    summary: '{{title}} — {{location}}'
    fields:
      - name: title
        label: Τίτλος
        widget: string
        hint: 'π.χ. Ανακαίνιση διαμερίσματος – Ελευσίνα'
      - name: location
        label: Περιοχή
        widget: string
        hint: 'π.χ. Ελευσίνα'
      - name: date
        label: Ημερομηνία ολοκλήρωσης
        widget: datetime
        time_format: false
        date_format: DD/MM/YYYY
        format: YYYY-MM-DD
      - name: services
        label: Εργασίες
        widget: select
        multiple: true
        min: 1
        options:
${serviceNames.map((s) => `          - ${s}`).join('\n')}
      - name: cover
        label: Κεντρική φωτογραφία
        widget: image
        hint: 'Η φωτογραφία που φαίνεται στην κάρτα του έργου. Οριζόντια φωτογραφία ταιριάζει καλύτερα.'
      - name: coverAlt
        label: Περιγραφή κεντρικής φωτογραφίας
        widget: string
        hint: 'Τι δείχνει η φωτογραφία, π.χ. «Σαλόνι μετά την ανακαίνιση». Βοηθά τους τυφλούς επισκέπτες και τη Google.'
      - name: summary
        label: Σύντομη περιγραφή
        widget: text
        hint: '1–2 προτάσεις. Εμφανίζεται και στα αποτελέσματα της Google.'
      - name: gallery
        label: Φωτογραφίες
        label_singular: Φωτογραφία
        widget: list
        required: false
        collapsed: true
        summary: '{{alt}}'
        fields:
          - { name: image, label: Φωτογραφία, widget: image }
          - { name: alt, label: Περιγραφή φωτογραφίας, widget: string }
      - name: before
        label: Φωτογραφία «πριν» (προαιρετικό)
        widget: image
        required: false
        hint: 'Για τον συγκριτικό πριν/μετά. Βάλτε και τις δύο ή καμία, από την ίδια γωνία λήψης.'
      - name: after
        label: Φωτογραφία «μετά» (προαιρετικό)
        widget: image
        required: false
      - name: beforeAfterAlt
        label: Περιγραφή πριν/μετά (προαιρετικό)
        widget: string
        required: false
        hint: 'π.χ. «Το μπάνιο πριν και μετά την ανακαίνιση»'
      - name: featured
        label: Προβολή πρώτο στην αρχική
        widget: boolean
        default: false
        required: false
      - name: body
        label: Αναλυτική περιγραφή (προαιρετικό)
        widget: markdown
        required: false
        buttons: [bold, italic, link, heading-two, heading-three, bulleted-list, numbered-list]
        editor_components: []
`;

export const GET: APIRoute = () =>
  new Response(yaml, { headers: { 'Content-Type': 'text/yaml; charset=utf-8' } });
