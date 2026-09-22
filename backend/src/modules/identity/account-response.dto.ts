import { ApiProperty } from '@nestjs/swagger';

export class AccountResponseDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Current application user ID',
  })
  id!: string;

  @ApiProperty({
    type: String,
    example: 'UTC',
    description: 'Learner IANA timezone',
  })
  timezone!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}
