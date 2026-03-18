export interface AminoAcid {
  code1: string
  code3: string
  name: string
  mw: number // molecular weight (Da)
  charge: number // at pH 7
  hydrophobicity: number // Kyte-Doolittle scale
  pKa_sidechain: number | null
  color: string
}

export const AMINO_ACIDS: Record<string, AminoAcid> = {
  A: { code1: 'A', code3: 'Ala', name: 'Alanine', mw: 89.09, charge: 0, hydrophobicity: 1.8, pKa_sidechain: null, color: '#C8C8C8' },
  R: { code1: 'R', code3: 'Arg', name: 'Arginine', mw: 174.20, charge: 1, hydrophobicity: -4.5, pKa_sidechain: 12.48, color: '#145AFF' },
  N: { code1: 'N', code3: 'Asn', name: 'Asparagine', mw: 132.12, charge: 0, hydrophobicity: -3.5, pKa_sidechain: null, color: '#00DCDC' },
  D: { code1: 'D', code3: 'Asp', name: 'Aspartate', mw: 133.10, charge: -1, hydrophobicity: -3.5, pKa_sidechain: 3.65, color: '#E60A0A' },
  C: { code1: 'C', code3: 'Cys', name: 'Cysteine', mw: 121.16, charge: 0, hydrophobicity: 2.5, pKa_sidechain: 8.18, color: '#E6E600' },
  E: { code1: 'E', code3: 'Glu', name: 'Glutamate', mw: 147.13, charge: -1, hydrophobicity: -3.5, pKa_sidechain: 4.25, color: '#E60A0A' },
  Q: { code1: 'Q', code3: 'Gln', name: 'Glutamine', mw: 146.15, charge: 0, hydrophobicity: -3.5, pKa_sidechain: null, color: '#00DCDC' },
  G: { code1: 'G', code3: 'Gly', name: 'Glycine', mw: 75.03, charge: 0, hydrophobicity: -0.4, pKa_sidechain: null, color: '#EBEBEB' },
  H: { code1: 'H', code3: 'His', name: 'Histidine', mw: 155.16, charge: 0.1, hydrophobicity: -3.2, pKa_sidechain: 6.00, color: '#8282D2' },
  I: { code1: 'I', code3: 'Ile', name: 'Isoleucine', mw: 131.17, charge: 0, hydrophobicity: 4.5, pKa_sidechain: null, color: '#0F820F' },
  L: { code1: 'L', code3: 'Leu', name: 'Leucine', mw: 131.17, charge: 0, hydrophobicity: 3.8, pKa_sidechain: null, color: '#0F820F' },
  K: { code1: 'K', code3: 'Lys', name: 'Lysine', mw: 146.19, charge: 1, hydrophobicity: -3.9, pKa_sidechain: 10.53, color: '#145AFF' },
  M: { code1: 'M', code3: 'Met', name: 'Methionine', mw: 149.21, charge: 0, hydrophobicity: 1.9, pKa_sidechain: null, color: '#E6E600' },
  F: { code1: 'F', code3: 'Phe', name: 'Phenylalanine', mw: 165.19, charge: 0, hydrophobicity: 2.8, pKa_sidechain: null, color: '#3232AA' },
  P: { code1: 'P', code3: 'Pro', name: 'Proline', mw: 115.13, charge: 0, hydrophobicity: -1.6, pKa_sidechain: null, color: '#DC9682' },
  S: { code1: 'S', code3: 'Ser', name: 'Serine', mw: 105.09, charge: 0, hydrophobicity: -0.8, pKa_sidechain: null, color: '#FA9600' },
  T: { code1: 'T', code3: 'Thr', name: 'Threonine', mw: 119.12, charge: 0, hydrophobicity: -0.7, pKa_sidechain: null, color: '#FA9600' },
  W: { code1: 'W', code3: 'Trp', name: 'Tryptophan', mw: 204.23, charge: 0, hydrophobicity: -0.9, pKa_sidechain: null, color: '#B45AB4' },
  Y: { code1: 'Y', code3: 'Tyr', name: 'Tyrosine', mw: 181.19, charge: 0, hydrophobicity: -1.3, pKa_sidechain: 10.07, color: '#3232AA' },
  V: { code1: 'V', code3: 'Val', name: 'Valine', mw: 117.15, charge: 0, hydrophobicity: 4.2, pKa_sidechain: null, color: '#0F820F' },
}

const WATER_MW = 18.015

export function computeProperties(sequence: string) {
  const residues = sequence.toUpperCase().split('').filter(c => c in AMINO_ACIDS)
  if (residues.length === 0) return null

  const mw = residues.reduce((sum, r) => sum + AMINO_ACIDS[r].mw, 0) - (residues.length - 1) * WATER_MW
  const netCharge = residues.reduce((sum, r) => sum + AMINO_ACIDS[r].charge, 0)
  const avgHydrophobicity = residues.reduce((sum, r) => sum + AMINO_ACIDS[r].hydrophobicity, 0) / residues.length

  // Approximate isoelectric point (simple bisection)
  const pI = computePI(residues)

  // GRAVY (Grand Average of Hydropathy)
  const gravy = avgHydrophobicity

  // Instability index (simplified)
  const instabilityIndex = computeInstabilityIndex(residues)

  // Composition
  const composition: Record<string, number> = {}
  for (const r of residues) {
    composition[r] = (composition[r] || 0) + 1
  }

  return {
    sequence: residues.join(''),
    length: residues.length,
    molecularWeight: mw,
    netCharge,
    isoelectricPoint: pI,
    gravy,
    instabilityIndex,
    isStable: instabilityIndex < 40,
    composition,
  }
}

function computePI(residues: string[]): number {
  // Count ionizable groups
  const nTerm = 1
  const cTerm = 1
  const countD = residues.filter(r => r === 'D').length
  const countE = residues.filter(r => r === 'E').length
  const countC = residues.filter(r => r === 'C').length
  const countY = residues.filter(r => r === 'Y').length
  const countH = residues.filter(r => r === 'H').length
  const countK = residues.filter(r => r === 'K').length
  const countR = residues.filter(r => r === 'R').length

  // pKa values
  const pKa = {
    nTerm: 9.69, cTerm: 2.34,
    D: 3.65, E: 4.25, C: 8.18, Y: 10.07,
    H: 6.00, K: 10.53, R: 12.48,
  }

  function chargeAtPH(pH: number): number {
    const cr = (pKa: number, n: number, positive: boolean) => {
      const ratio = Math.pow(10, positive ? pKa - pH : pH - pKa)
      return n * (positive ? ratio / (ratio + 1) : -ratio / (ratio + 1))
    }
    return (
      cr(pKa.nTerm, nTerm, true) + cr(pKa.cTerm, cTerm, false) +
      cr(pKa.D, countD, false) + cr(pKa.E, countE, false) +
      cr(pKa.C, countC, false) + cr(pKa.Y, countY, false) +
      cr(pKa.H, countH, true) + cr(pKa.K, countK, true) + cr(pKa.R, countR, true)
    )
  }

  let low = 0, high = 14
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2
    if (chargeAtPH(mid) > 0) low = mid
    else high = mid
  }
  return Math.round((low + high) / 2 * 100) / 100
}

// Simplified instability index using DIWV weights
const DIWV_SIMPLIFIED: Record<string, number> = {
  'WW': 1, 'WC': 1, 'WM': 24.68, 'WH': 24.68, 'WY': 1,
  'DG': -7.49, 'DP': 1, 'DD': 1, 'DE': 1, 'DK': -7.49,
}

function computeInstabilityIndex(residues: string[]): number {
  let sum = 0
  for (let i = 0; i < residues.length - 1; i++) {
    const pair = residues[i] + residues[i + 1]
    sum += DIWV_SIMPLIFIED[pair] || 1
  }
  return (10.0 / residues.length) * sum
}

export function sequenceToSMILES(sequence: string): string | null {
  // Generate a linear peptide SMILES from sequence
  // This creates the backbone connectivity with amino acid side chains
  const smilesMap: Record<string, string> = {
    G: 'NCC(=O)', A: 'N[C@@H](C)C(=O)', V: 'N[C@@H](CC(C)C)C(=O)',
    L: 'N[C@@H](CC(C)C)C(=O)', I: 'N[C@@H]([C@@H](CC)C)C(=O)',
    P: 'N1CCC[C@@H]1C(=O)', F: 'N[C@@H](Cc1ccccc1)C(=O)',
    W: 'N[C@@H](Cc1c[nH]c2ccccc12)C(=O)', M: 'N[C@@H](CCSC)C(=O)',
    S: 'N[C@@H](CO)C(=O)', T: 'N[C@@H]([C@@H](O)C)C(=O)',
    C: 'N[C@@H](CS)C(=O)', Y: 'N[C@@H](Cc1ccc(O)cc1)C(=O)',
    H: 'N[C@@H](Cc1c[nH]cn1)C(=O)', D: 'N[C@@H](CC(=O)O)C(=O)',
    E: 'N[C@@H](CCC(=O)O)C(=O)', N: 'N[C@@H](CC(=O)N)C(=O)',
    Q: 'N[C@@H](CCC(=O)N)C(=O)', K: 'N[C@@H](CCCCN)C(=O)',
    R: 'N[C@@H](CCCNC(=N)N)C(=O)',
  }

  const residues = sequence.toUpperCase().split('').filter(c => c in smilesMap)
  if (residues.length === 0) return null

  // Build linear peptide: H-[AA1]-[AA2]-...-[AAn]-OH
  // Simplified: just return the first residue SMILES for RDKit 2D rendering
  // Full peptide SMILES generation is complex; for now return a representative structure
  if (residues.length === 1) {
    return smilesMap[residues[0]] + 'O'
  }

  // For short peptides, build the full chain
  const parts = residues.map(r => smilesMap[r])
  return parts.join('') + 'O'
}

export const EXAMPLE_PEPTIDES: Record<string, string> = {
  'GLP-1 (7-36)': 'HAEGTFTSDVSSYLEGQAAKEFIAWLVKGR',
  'Insulin B-chain': 'FVNQHLCGSHLVEALYLVCGERGFFYTPKT',
  'Oxytocin': 'CYIQNCPLG',
  'Bradykinin': 'RPPGFSPFR',
  'Angiotensin II': 'DRVYIHPF',
  'Met-enkephalin': 'YGGFM',
  'Substance P': 'RPKPQQFFGLM',
  'Somatostatin': 'AGCKNFFWKTFTSC',
}
