import { inject, injectable } from 'inversify';
import { CommentService } from './comment-service.interface.js';
import { Component, SortType } from '../../types/index.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { CommentEntity } from './comment.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { DEFAULT_COMMENT_COUNT } from './comment.constant.js';

@injectable()
export class DefaultCommentService implements CommentService {
  constructor(
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
  ) { }

  public async create(dto: CreateCommentDto): Promise<DocumentType<CommentEntity>> {
    const result = await this.commentModel.create(dto);
    return result.populate('authorId');
  }

  public async findByOfferId(offerId: string): Promise<DocumentType<CommentEntity>[]> {
    return this.commentModel.find({ offerId }).populate('authorId').sort({ createdAt: SortType.Down }).limit(DEFAULT_COMMENT_COUNT).exec();
  }

  public async deleteByOfferId(offerId: string): Promise<number | null> {
    const result = await this.commentModel.deleteMany({ offerId }).exec();
    return result.deletedCount;
  }
}
