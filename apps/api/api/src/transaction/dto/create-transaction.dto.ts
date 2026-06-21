import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsNumber()
  qty: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  location?: string;
}