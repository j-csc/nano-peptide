import { AMINO_ACIDS } from './aminoAcids'

// ── Receptor target database ──────────────────────────────────────────────
// Each receptor has:
//   - known ligand motifs (subsequences that bind)
//   - preferred physicochemical properties
//   - biological effect description

export interface ReceptorTarget {
  id: string
  name: string
  fullName: string
  category: 'metabolic' | 'growth' | 'hormonal' | 'immune' | 'neuro'
  effect: string
  phenotype: string // what it does to the body
  knownLigands: string[] // example peptide sequences that bind
  motifs: string[] // short binding motifs
  preferredProperties: {
    minLength?: number
    maxLength?: number
    chargePreference: 'positive' | 'negative' | 'neutral' | 'any'
    hydrophobicityRange: [number, number] // GRAVY range
    keyResidues: string[] // amino acids important for binding
  }
}

export const RECEPTOR_TARGETS: ReceptorTarget[] = [
  {
    id: 'glp1r',
    name: 'GLP-1R',
    fullName: 'Glucagon-Like Peptide-1 Receptor',
    category: 'metabolic',
    effect: 'Appetite suppression, insulin secretion, gastric emptying delay',
    phenotype: 'Fat loss, reduced appetite, improved blood sugar',
    knownLigands: [
      'HAEGTFTSDVSSYLEGQAAKEFIAWLVKGR', // GLP-1 (7-36)
      'HGEGTFTSDLSKQMEEEAVRLFIEWLKNGGPSSGAPPPS', // semaglutide-like
    ],
    motifs: ['HAEGTF', 'FTSDV', 'FIAWL', 'EFIAW', 'TSDVS'],
    preferredProperties: {
      minLength: 20,
      maxLength: 45,
      chargePreference: 'any',
      hydrophobicityRange: [-1.5, 0.5],
      keyResidues: ['H', 'A', 'E', 'F', 'T', 'W', 'L'],
    },
  },
  {
    id: 'gipr',
    name: 'GIPR',
    fullName: 'Glucose-dependent Insulinotropic Polypeptide Receptor',
    category: 'metabolic',
    effect: 'Insulin secretion, fat metabolism, bone formation',
    phenotype: 'Fat loss (with GLP-1R co-activation), metabolic improvement',
    knownLigands: [
      'YAEGTFISDYSIAMDKIHQQDFVNWLLAQKGKKNDWKHNITQ', // GIP
    ],
    motifs: ['YAEGT', 'FISDY', 'VNWLL', 'AEGT'],
    preferredProperties: {
      minLength: 25,
      maxLength: 50,
      chargePreference: 'positive',
      hydrophobicityRange: [-1.5, 0.3],
      keyResidues: ['Y', 'A', 'E', 'F', 'W', 'L', 'K'],
    },
  },
  {
    id: 'gcgr',
    name: 'GCGR',
    fullName: 'Glucagon Receptor',
    category: 'metabolic',
    effect: 'Glycogenolysis, gluconeogenesis, lipolysis, thermogenesis',
    phenotype: 'Fat burning, energy expenditure, weight loss',
    knownLigands: [
      'HSQGTFTSDYSKYLDSRRAQDFVQWLMNT', // glucagon
    ],
    motifs: ['HSQGT', 'FTSDY', 'QDFVQ', 'WLMNT'],
    preferredProperties: {
      minLength: 20,
      maxLength: 40,
      chargePreference: 'positive',
      hydrophobicityRange: [-1.2, 0.2],
      keyResidues: ['H', 'S', 'Q', 'F', 'T', 'D', 'W', 'L'],
    },
  },
  {
    id: 'ghsr',
    name: 'GHSR',
    fullName: 'Growth Hormone Secretagogue Receptor (Ghrelin-R)',
    category: 'growth',
    effect: 'Growth hormone release, appetite stimulation, muscle growth',
    phenotype: 'Muscle gain, increased appetite, recovery, anti-aging',
    knownLigands: [
      'GSSFLSPEHQRVQQRKESKKPPAKLQPR', // ghrelin
    ],
    motifs: ['GSSFL', 'FLSPE', 'SSFL'],
    preferredProperties: {
      minLength: 5,
      maxLength: 30,
      chargePreference: 'positive',
      hydrophobicityRange: [-2.0, 0.5],
      keyResidues: ['G', 'S', 'F', 'L', 'P', 'E'],
    },
  },
  {
    id: 'ghr',
    name: 'GHR',
    fullName: 'Growth Hormone Receptor',
    category: 'growth',
    effect: 'IGF-1 production, protein synthesis, bone growth',
    phenotype: 'Muscle growth, recovery, tissue repair',
    knownLigands: [
      'FPTIPLSRLFDNAMLRAHRLHQLAFDTYQEFEEAYIPKEQKYSFLQNPQTSLCFSESIPTPSNREETQQKSNLELLRISLLLIQSWLEPVQFLRSVFANSLVYGASDSNVYDLLKDLEEGIQTLMGRLEDGSPRTGQIFKQTYSKFDTNSHNDDALLKNYGLLYCFRKDMDKVETFLRIVQCRSVEGSCGF', // hGH
    ],
    motifs: ['FPTIP', 'LSRLF', 'KYSFL'],
    preferredProperties: {
      minLength: 10,
      maxLength: 200,
      chargePreference: 'any',
      hydrophobicityRange: [-1.0, 0.5],
      keyResidues: ['F', 'L', 'K', 'Y', 'S', 'R'],
    },
  },
  {
    id: 'mc4r',
    name: 'MC4R',
    fullName: 'Melanocortin-4 Receptor',
    category: 'metabolic',
    effect: 'Appetite regulation, energy homeostasis, metabolism',
    phenotype: 'Appetite suppression, weight loss, energy balance',
    knownLigands: [
      'SYSMEHFRWGKPV', // alpha-MSH
    ],
    motifs: ['HFRW', 'MEHF', 'FRWG'],
    preferredProperties: {
      minLength: 5,
      maxLength: 20,
      chargePreference: 'positive',
      hydrophobicityRange: [-2.0, 0.5],
      keyResidues: ['H', 'F', 'R', 'W'],
    },
  },
  {
    id: 'oprm',
    name: 'MOR',
    fullName: 'Mu-Opioid Receptor',
    category: 'neuro',
    effect: 'Analgesia, euphoria, respiratory depression',
    phenotype: 'Pain relief, mood elevation',
    knownLigands: [
      'YGGFM', // met-enkephalin
      'YGGFL', // leu-enkephalin
      'YGGFMTSEKSQTPLVTLFKNAIIKNAYKKGE', // beta-endorphin
    ],
    motifs: ['YGGF', 'YGGFM', 'YGGFL'],
    preferredProperties: {
      minLength: 4,
      maxLength: 35,
      chargePreference: 'any',
      hydrophobicityRange: [-1.0, 1.5],
      keyResidues: ['Y', 'G', 'F', 'M', 'L'],
    },
  },
  {
    id: 'nk1r',
    name: 'NK1R',
    fullName: 'Neurokinin-1 Receptor (Substance P Receptor)',
    category: 'neuro',
    effect: 'Pain transmission, inflammation, nausea',
    phenotype: 'Pain signaling, inflammatory response',
    knownLigands: [
      'RPKPQQFFGLM', // substance P
    ],
    motifs: ['FFGLM', 'QQFFG', 'PQQFF'],
    preferredProperties: {
      minLength: 5,
      maxLength: 15,
      chargePreference: 'positive',
      hydrophobicityRange: [-1.0, 0.5],
      keyResidues: ['R', 'P', 'F', 'G', 'L', 'M'],
    },
  },
  {
    id: 'at1r',
    name: 'AT1R',
    fullName: 'Angiotensin II Type 1 Receptor',
    category: 'hormonal',
    effect: 'Vasoconstriction, aldosterone release, blood pressure regulation',
    phenotype: 'Blood pressure increase, fluid retention',
    knownLigands: [
      'DRVYIHPF', // angiotensin II
    ],
    motifs: ['DRVY', 'YIHPF', 'IHPF'],
    preferredProperties: {
      minLength: 5,
      maxLength: 12,
      chargePreference: 'any',
      hydrophobicityRange: [-1.5, 1.0],
      keyResidues: ['D', 'R', 'V', 'Y', 'I', 'H', 'P', 'F'],
    },
  },
  {
    id: 'sstr',
    name: 'SSTR',
    fullName: 'Somatostatin Receptor',
    category: 'hormonal',
    effect: 'Inhibits GH, insulin, glucagon release',
    phenotype: 'Hormone regulation, anti-proliferative',
    knownLigands: [
      'AGCKNFFWKTFTSC', // somatostatin-14
    ],
    motifs: ['FFWK', 'KNFFWK', 'NFFWKT'],
    preferredProperties: {
      minLength: 5,
      maxLength: 20,
      chargePreference: 'positive',
      hydrophobicityRange: [-1.0, 0.5],
      keyResidues: ['F', 'W', 'K', 'T', 'C'],
    },
  },
]

// ── Scoring engine ────────────────────────────────────────────────────────

export interface DockingResult {
  receptor: ReceptorTarget
  overallScore: number // 0-100
  motifScore: number
  propertyScore: number
  similarityScore: number
  confidence: 'high' | 'medium' | 'low'
  explanation: string
}

// Longest common subsequence length (not substring - allows gaps)
function lcsLength(a: string, b: string): number {
  const m = a.length
  const n = b.length
  // Optimize: use 1D DP for memory
  const prev = new Array(n + 1).fill(0)
  const curr = new Array(n + 1).fill(0)
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1] + 1
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1])
      }
    }
    for (let j = 0; j <= n; j++) {
      prev[j] = curr[j]
      curr[j] = 0
    }
  }
  return prev[n]
}

// Check if sequence contains a motif (with up to 1 mismatch)
function fuzzyMotifMatch(sequence: string, motif: string): number {
  if (sequence.includes(motif)) return 1.0

  // Sliding window with mismatch tolerance
  let bestScore = 0
  for (let i = 0; i <= sequence.length - motif.length; i++) {
    const window = sequence.slice(i, i + motif.length)
    let matches = 0
    for (let j = 0; j < motif.length; j++) {
      if (window[j] === motif[j]) matches++
    }
    const score = matches / motif.length
    if (score > bestScore) bestScore = score
  }
  return bestScore
}

function computeMotifScore(sequence: string, receptor: ReceptorTarget): number {
  if (receptor.motifs.length === 0) return 0
  const scores = receptor.motifs.map(m => fuzzyMotifMatch(sequence, m))
  // Weight: best match counts most, but having multiple matches helps
  const sorted = scores.sort((a, b) => b - a)
  const best = sorted[0]
  const avgOthers = sorted.length > 1
    ? sorted.slice(1).reduce((s, v) => s + v, 0) / (sorted.length - 1)
    : 0
  return best * 0.7 + avgOthers * 0.3
}

function computePropertyScore(sequence: string, receptor: ReceptorTarget): number {
  const residues = sequence.split('').filter(c => c in AMINO_ACIDS)
  if (residues.length === 0) return 0
  const prefs = receptor.preferredProperties

  let score = 0
  let factors = 0

  // Length match
  const len = residues.length
  const minL = prefs.minLength || 3
  const maxL = prefs.maxLength || 200
  if (len >= minL && len <= maxL) {
    score += 1.0
  } else {
    const dist = len < minL ? (minL - len) / minL : (len - maxL) / maxL
    score += Math.max(0, 1 - dist)
  }
  factors++

  // Hydrophobicity range
  const gravy = residues.reduce((s, r) => s + (AMINO_ACIDS[r]?.hydrophobicity || 0), 0) / residues.length
  const [hLow, hHigh] = prefs.hydrophobicityRange
  if (gravy >= hLow && gravy <= hHigh) {
    score += 1.0
  } else {
    const dist = gravy < hLow ? (hLow - gravy) : (gravy - hHigh)
    score += Math.max(0, 1 - dist / 3)
  }
  factors++

  // Charge preference
  const netCharge = residues.reduce((s, r) => s + (AMINO_ACIDS[r]?.charge || 0), 0)
  if (prefs.chargePreference === 'any') {
    score += 0.8
  } else if (prefs.chargePreference === 'positive' && netCharge > 0) {
    score += 1.0
  } else if (prefs.chargePreference === 'negative' && netCharge < 0) {
    score += 1.0
  } else if (prefs.chargePreference === 'neutral' && Math.abs(netCharge) < 1) {
    score += 1.0
  } else {
    score += 0.3
  }
  factors++

  // Key residue overlap
  const uniqueResidues = new Set(residues)
  const keyMatches = prefs.keyResidues.filter(r => uniqueResidues.has(r)).length
  score += keyMatches / prefs.keyResidues.length
  factors++

  return score / factors
}

function computeSimilarityScore(sequence: string, receptor: ReceptorTarget): number {
  if (receptor.knownLigands.length === 0) return 0

  let bestSim = 0
  for (const ligand of receptor.knownLigands) {
    const lcs = lcsLength(sequence, ligand)
    const sim = (2 * lcs) / (sequence.length + ligand.length)
    if (sim > bestSim) bestSim = sim
  }
  return bestSim
}

export function screenAgainstTargets(sequence: string): DockingResult[] {
  const clean = sequence.toUpperCase().replace(/[^ACDEFGHIKLMNPQRSTVWY]/g, '')
  if (clean.length < 3) return []

  return RECEPTOR_TARGETS.map(receptor => {
    const motifScore = computeMotifScore(clean, receptor)
    const propertyScore = computePropertyScore(clean, receptor)
    const similarityScore = computeSimilarityScore(clean, receptor)

    // Weighted overall: similarity matters most, then motifs, then properties
    const overallScore = Math.round(
      (similarityScore * 45 + motifScore * 35 + propertyScore * 20) * 100
    ) / 100

    const confidence: DockingResult['confidence'] =
      overallScore >= 60 ? 'high' :
      overallScore >= 30 ? 'medium' : 'low'

    // Generate explanation
    const parts: string[] = []
    if (motifScore > 0.7) parts.push('Strong motif match')
    else if (motifScore > 0.4) parts.push('Partial motif match')
    if (similarityScore > 0.5) parts.push(`High similarity to known ligand`)
    if (propertyScore > 0.7) parts.push('Good physicochemical fit')

    const explanation = parts.length > 0
      ? parts.join('. ') + '.'
      : 'Low predicted binding affinity.'

    return {
      receptor,
      overallScore: Math.min(overallScore, 100),
      motifScore: Math.round(motifScore * 100),
      propertyScore: Math.round(propertyScore * 100),
      similarityScore: Math.round(similarityScore * 100),
      confidence,
      explanation,
    }
  }).sort((a, b) => b.overallScore - a.overallScore)
}
