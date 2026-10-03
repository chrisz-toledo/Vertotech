import { INDUSTRY_PROFILES, type TermKey } from '../types/industry';
import { useCurrentIndustryId } from './stores/useIndustryStore';

/**
 * Hook returning the current industry profile's label for a canonical term key
 * (e.g. tTerm('jobsite') -> 'Obra' in construcción, 'Sucursal' in retail).
 * Falls back to the construcción profile when the industry id is unknown.
 *
 * Usage: const label = tTerm('jobsite');
 */
export const tTerm = (key: TermKey): string => {
    const industryId = useCurrentIndustryId();
    const profile = INDUSTRY_PROFILES[industryId] ?? INDUSTRY_PROFILES.construccion;
    return profile.terms[key];
};
