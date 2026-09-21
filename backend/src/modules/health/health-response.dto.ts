import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ type: String, enum: ['ok'], example: 'ok' })
  status!: string;

  @ApiProperty({
    type: String,
    enum: ['codequest-api'],
    example: 'codequest-api',
  })
  service!: string;

  @ApiProperty({ type: String, enum: ['1'], example: '1' })
  version!: string;
}
