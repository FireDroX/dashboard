import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateMonitorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  @MaxLength(2048)
  url: string;
}
