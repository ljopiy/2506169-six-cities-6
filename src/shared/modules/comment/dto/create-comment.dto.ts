import { IsDefined, IsString, Min, Max, Length, IsInt, IsMongoId } from 'class-validator';
import { CreateCommentMessages } from './create-comment.messages.js';
import { CommentRating, CommentText } from '../comment.constant.js';

export class CreateCommentDto {
  @IsDefined({ message: CreateCommentMessages.text.requiredField })
  @IsString({ message: CreateCommentMessages.text.invalidFormat })
  @Length(CommentText.MIN_LENGTH, CommentText.MAX_LENGTH, { message: CreateCommentMessages.text.lengthField })
  public text!: string;

  @IsDefined({ message: CreateCommentMessages.rating.requiredField })
  @IsInt({ message: CreateCommentMessages.rating.invalidFormat })
  @Min(CommentRating.MIN, { message: CreateCommentMessages.rating.rangeField })
  @Max(CommentRating.MAX, { message: CreateCommentMessages.rating.rangeField })
  public rating!: number;
}

export class CreateCommentServiceDto extends CreateCommentDto {
  @IsDefined({ message: CreateCommentMessages.offerId.requiredField })
  @IsMongoId({ message: CreateCommentMessages.offerId.invalidFormat })
  public offerId!: string;

  @IsDefined({ message: CreateCommentMessages.authorId.requiredField })
  @IsMongoId({ message: CreateCommentMessages.authorId.invalidFormat })
  public authorId!: string;
}
