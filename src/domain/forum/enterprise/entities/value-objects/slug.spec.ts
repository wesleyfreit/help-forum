import { Slug } from './slug';

it('should be able to create a new slug from text', () => {
  const slug = Slug.createFromText('A new slug');
  expect(slug.value).toEqual('a-new-slug');
});
