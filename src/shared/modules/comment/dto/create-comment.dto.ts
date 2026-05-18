import { IsString, Min, Max, Length, IsNumber } from 'class-validator';
import { CreateCommentMessages } from './create-comment.messages.js';

export class CreateCommentDto {
  @IsString({ message: CreateCommentMessages.text.invalidFormat })
  @Length(5, 1024, { message: CreateCommentMessages.text.lengthField })
  public text!: string;
  
  @IsNumber({}, { message: CreateCommentMessages.rating.invalidFormat })
  @Min(1, { message: CreateCommentMessages.rating.rangeField })
  @Max(5, { message: CreateCommentMessages.rating.rangeField })
  public rating!: number;
}

export class CreateCommentServiceDto extends CreateCommentDto {
  public offerId!: string;
  public authorId!: string;
}
