import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ApiErrorDto {
  @ApiProperty({
    type: String,
    description: 'Stable machine-readable error code',
  })
  code!: string;

  @ApiProperty({ type: String, description: 'Safe client-facing message' })
  message!: string;

  @ApiProperty({ type: Number, description: 'HTTP response status' })
  status!: number;

  @ApiProperty({ type: String, description: 'Correlated request ID' })
  requestId!: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Bounded validation details',
  })
  details?: string[];
}

export class ApiErrorResponseDto {
  @ApiProperty({ type: ApiErrorDto })
  error!: ApiErrorDto;
}
