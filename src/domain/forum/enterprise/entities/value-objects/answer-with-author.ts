import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ValueObject } from '@/core/entities/value-object';
import { Attachment } from '../attachment';

export interface AnswerWithAuthorProps {
  answerId: UniqueEntityID;
  content: string;
  attachments: Attachment[];
  author: {
    id: UniqueEntityID;
    name: string;
  };
  createdAt: Date;
  updatedAt?: Date | null;
}

export class AnswerWithAuthor extends ValueObject<AnswerWithAuthorProps> {
  get answerId() {
    return this.props.answerId;
  }

  get content() {
    return this.props.content;
  }

  get attachments() {
    return this.props.attachments;
  }

  get author() {
    return this.props.author;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: AnswerWithAuthorProps) {
    return new AnswerWithAuthor(props);
  }
}
