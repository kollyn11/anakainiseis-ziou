/**
 * The five services. `name` is also the value used in a project's
 * `services` list (src/content/projects/<φάκελος>/index.md) and in the CMS,
 * so keep the spelling identical in all three places.
 */
export const services = [
  {
    id: 'anakainiseis',
    name: 'Ανακαινίσεις',
    detail: 'κατοικιών & επαγγελματικών χώρων',
    description:
      'Ολική ή μερική ανακαίνιση σπιτιού, γραφείου ή καταστήματος. Οργανώνουμε τις εργασίες από την αποξήλωση μέχρι το τελευταίο φινίρισμα.',
    icon: 'renovation',
  },
  {
    id: 'chromatismoi',
    name: 'Χρωματισμοί',
    detail: 'εσωτερικοί & εξωτερικοί',
    description:
      'Χρωματισμοί και ελαιοχρωματισμοί σε τοίχους, ταβάνια και κουφώματα, με σωστή προετοιμασία επιφάνειας ώστε το αποτέλεσμα να κρατάει.',
    icon: 'paint',
  },
  {
    id: 'gypsosanides',
    name: 'Γυψοσανίδες & ψευδοροφές',
    detail: 'χωρίσματα, επενδύσεις, κρυφός φωτισμός',
    description:
      'Γυψοσανίδες για νέους χώρους, επενδύσεις τοίχων και ψευδοροφές με σποτ ή κρυφό φωτισμό — γρήγορα και χωρίς βαριές οικοδομικές εργασίες.',
    icon: 'drywall',
  },
  {
    id: 'thermoprosopseis',
    name: 'Θερμοπροσόψεις',
    detail: 'εξωτερική θερμομόνωση κελύφους',
    description:
      'Θερμοπρόσοψη στο εξωτερικό του κτιρίου για λιγότερη απώλεια ενέργειας, χαμηλότερους λογαριασμούς και ανανεωμένη όψη.',
    icon: 'facade',
  },
  {
    id: 'monoseis',
    name: 'Μονώσεις',
    detail: 'ταράτσες, δώματα, υγρασία',
    description:
      'Μόνωση ταράτσας και στεγάνωση για υγρασία και διαρροές. Σταματάμε το νερό από την πηγή του, όχι μόνο το σημάδι στον τοίχο.',
    icon: 'insulation',
  },
] as const;

export type ServiceName = (typeof services)[number]['name'];
export const serviceNames = services.map((s) => s.name) as [ServiceName, ...ServiceName[]];
