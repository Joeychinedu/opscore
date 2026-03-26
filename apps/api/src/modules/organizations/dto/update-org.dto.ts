import { PartialType } from '@nestjs/mapped-types';
import { CreateOrgDto } from './create-org.dto.js';

export class UpdateOrgDto extends PartialType(CreateOrgDto) {}
