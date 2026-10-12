// One piece of a legal document, in reading order
export interface LegalBlock {
  kind: 'heading' | 'subheading' | 'paragraph' | 'bullet'
  text: string
}
