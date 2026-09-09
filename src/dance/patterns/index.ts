import type { DancePattern } from '../../domain/dance'
import { DOIS_PRA_LA_DOIS_PRA_CA } from './doisPraLaDoisPraCa'
import { FRENTE_E_TRAS } from './frenteETras'

export const XOTE_PATTERNS: DancePattern[] = [FRENTE_E_TRAS, DOIS_PRA_LA_DOIS_PRA_CA]
export const DEFAULT_XOTE_PATTERN = FRENTE_E_TRAS
