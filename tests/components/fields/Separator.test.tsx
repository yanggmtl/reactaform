import { describe, it, expect } from 'vitest';
import FieldSeparator from '../../../src/components/fields/ui-elements/Separator';
import { renderWithProvider } from '../../test-utils';

describe('Separator', () => {
  it('renders separator line', () => {
    const field = { color: '#ccc', thickness: 1, margin: '8px 0', alignment: 'center' as const };
    const { container } = renderWithProvider(
      <FieldSeparator field={field} t={(text: string) => text} />
    );

    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
  });

  it('applies custom color', () => {
    const field = { 
      color: '#ff0000', 
      thickness: 1, 
      margin: '8px 0',
    };
    const { container } = renderWithProvider(
      <div id="sep-test">
        <FieldSeparator field={field} t={(text: string) => text} />
      </div>
    );

    const hr = container.querySelector('#sep-test div');
    expect(hr).toHaveStyle({ borderTop: '1px solid #ff0000' });
  });

  it('applies custom thickness', () => {
    const field = { 
      color: '#ccc', 
      thickness: 3, 
      margin: '8px 0',
    };
    const { container } = renderWithProvider(
      <div id="sep-test">
        <FieldSeparator field={field} t={(text: string) => text} />
      </div>
    );

    const hr = container.querySelector('#sep-test div');
    expect(hr).toHaveStyle({ borderTop: '3px solid #ccc' });
  });

  it('applies custom margin', () => {
    const field = { 
      color: '#ccc', 
      thickness: 1, 
      margin: '16px 0',
    };
    const { container } = renderWithProvider(
      <div id="sep-test">
        <FieldSeparator field={field} t={(text: string) => text} />
      </div>
    );

    const hr = container.querySelector('#sep-test div');
    expect(hr).toHaveStyle({ margin: '16px 0' });
  });
});
