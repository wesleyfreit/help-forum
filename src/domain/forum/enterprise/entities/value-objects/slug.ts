export class Slug {
  public value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Receives a string and normalizes it as a slug.
   *
   * Example: "An example title" => "an-example-title"
   *
   * @param text {string}
   */

  static create(value: string) {
    return new Slug(value);
  }

  static createFromText(text: string) {
    const slugText = text
      .normalize('NFKD')
      .toLocaleLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/_/g, '-')
      .replace(/--+/g, '-')
      .replace(/-$/g, '');

    return new Slug(slugText);
  }
}
