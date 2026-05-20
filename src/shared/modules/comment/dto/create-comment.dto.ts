import { IsString, Min, Max, Length, IsInt } from 'class-validator';
import { CreateCommentMessages } from './create-comment.messages.js';

export class CreateCommentDto {
  @IsString({ message: CreateCommentMessages.text.invalidFormat })
  @Length(5, 1024, { message: CreateCommentMessages.text.lengthField })
  public text!: string;

  @IsInt({ message: CreateCommentMessages.rating.invalidFormat })
  @Min(1, { message: CreateCommentMessages.rating.rangeField })
  @Max(5, { message: CreateCommentMessages.rating.rangeField })
  public rating!: number;
}

export type CreateCommentServiceDto = CreateCommentDto & {
  offerId: string;
  authorId: string;
};
