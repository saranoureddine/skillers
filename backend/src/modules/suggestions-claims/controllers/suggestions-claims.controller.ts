import { Controller } from '@nestjs/common';
import { SuggestionsClaimsControllerDocs } from '../docs/suggestions-claims.swagger';

/**
 * Shared SuggestionsClaims Controller — common endpoints accessible by authenticated users.
 * All routes prefixed with /suggestions-claims
 * Currently empty - all endpoints are in public/admin controllers
 */
@Controller('suggestions-claims')
@SuggestionsClaimsControllerDocs.controller()
export class SuggestionsClaimsController {
  // Shared/common endpoints can be added here if needed
}
