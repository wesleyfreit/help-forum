import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ValueObject } from '@/core/entities/value-object';
import { Attachment } from '../attachment';
import { Slug } from './slug';

export interface QuestionDetailsProps {
  questionId: UniqueEntityID;
  title: string;
  slug: Slug;
  content: string;
  bestAnswerId?: UniqueEntityID | null;
  attachments: Attachment[];
  author: {
    id: UniqueEntityID;
    name: string;
  };
  createdAt: Date;
  updatedAt?: Date | null;
}

export class QuestionDetails extends ValueObject<QuestionDetailsProps> {
  get questionId() {
    return this.props.questionId;
  }

  get title() {
    return this.props.title;
  }

  get slug() {
    return this.props.slug;
  }

  get content() {
    return this.props.content;
  }

  get bestAnswerId() {
    return this.props.bestAnswerId;
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

  static create(props: QuestionDetailsProps) {
    return new QuestionDetails(props);
  }
}
