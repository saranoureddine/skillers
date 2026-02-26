import { Controller } from '@nestjs/common';
import { ProfFollowService } from '../services/prof-follow.service';
import { ProfFollowControllerDocs } from '../docs/prof-follow.swagger';

/**
 * Shared Prof Follow Controller — common endpoints accessible by authenticated users.
 * All routes prefixed with /prof-follow
 */
@Controller('prof-follow')
@ProfFollowControllerDocs.controller()
export class ProfFollowController {
  constructor(
    private readonly followService: ProfFollowService,
  ) {}
}
