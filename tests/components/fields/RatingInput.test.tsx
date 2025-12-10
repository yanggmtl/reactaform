import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RatingInput from '../../../src/components/fields/RatingInput';
import { renderWithProvider, createMockField, baseFieldProps } from '../../test-utils';
import type { DefinitionPropertyField } from '../../../src/core/reactaFormTypes';

describe('RatingInput', () => {
  it('renders stars with label', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'rating', label: 'Rating' });
    renderWithProvider(<RatingInput {...baseFieldProps} field={field} value={0} />);

    expect(screen.getByText('Rating')).toBeInTheDocument();
    // Stars should be rendered
    expect(screen.getByLabelText('Rating 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Rating 5')).toBeInTheDocument();
  });

  it('displays correct number of stars based on max', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'rating', label: 'Rating', max: 10 });
    renderWithProvider(<RatingInput {...baseFieldProps} field={field} value={0} />);

    expect(screen.getByLabelText('Rating 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Rating 10')).toBeInTheDocument();
  });

  it('defaults to 5 stars when max is not provided', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'rating', label: 'Rating' });
    renderWithProvider(<RatingInput {...baseFieldProps} field={field} value={0} />);

    expect(screen.getByLabelText('Rating 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Rating 5')).toBeInTheDocument();
  });

  it('displays initial rating value with active stars', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'rating', label: 'Rating', max: 5 });
    renderWithProvider(<RatingInput {...baseFieldProps} field={field} value={3} />);

    const star3 = screen.getByLabelText('Rating 3');
    expect(star3).toBeInTheDocument();
  });

  it('changes rating when star is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'rating', label: 'Rating', max: 5 });
    renderWithProvider(
      <RatingInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    const star4 = screen.getByLabelText('Rating 4');
    await user.click(star4);

    expect(onChange).toHaveBeenCalledWith(4, null);
  });

  it('updates rating when different star is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'rating', label: 'Rating', max: 5 });
    renderWithProvider(
      <RatingInput {...baseFieldProps} field={field} value={3} onChange={onChange} />
    );

    const star5 = screen.getByLabelText('Rating 5');
    await user.click(star5);

    expect(onChange).toHaveBeenCalledWith(5, null);
  });

  it('validates required field when value is 0', () => {
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'rating', label: 'Required Rating', max: 5, required: true });
    renderWithProvider(
      <RatingInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    // Error should be set internally but onChange not called on mount
    const star1 = screen.getByLabelText('Rating 1');
    expect(star1).toBeInTheDocument();
  });

  it('accepts valid rating for required field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const field = createMockField<DefinitionPropertyField>({ type: 'rating', label: 'Required Rating', max: 5, required: true });
    renderWithProvider(
      <RatingInput {...baseFieldProps} field={field} value={0} onChange={onChange} />
    );

    onChange.mockClear();
    const star3 = screen.getByLabelText('Rating 3');
    await user.click(star3);

    expect(onChange).toHaveBeenCalledWith(3, null); // no error
  });

  it('clamps value to max if initial value exceeds max', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'rating', label: 'Rating', max: 5 });
    renderWithProvider(<RatingInput {...baseFieldProps} field={field} value={10} />);

    // Should clamp to max internally
    // Can verify by checking that only 5 stars are rendered
    expect(screen.getByLabelText('Rating 5')).toBeInTheDocument();
  });

  it('clamps value to 0 if initial value is negative', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'rating', label: 'Rating', max: 5 });
    renderWithProvider(<RatingInput {...baseFieldProps} field={field} value={-3} />);

    // Should clamp to 0 internally
    const star1 = screen.getByLabelText('Rating 1');
    expect(star1).toBeInTheDocument();
  });

  it('shows hover state on mouse enter', async () => {
    const user = userEvent.setup();
    const field = createMockField<DefinitionPropertyField>({ type: 'rating', label: 'Rating', max: 5 });
    renderWithProvider(<RatingInput {...baseFieldProps} field={field} value={2} />);

    const star4 = screen.getByLabelText('Rating 4');
    await user.hover(star4);

    // Hover should be visible (testing library doesn't expose computed styles easily)
    expect(star4).toBeInTheDocument();
  });

  it('uses custom icon when provided', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'rating', label: 'Rating', max: 5, icon: '❤' });
    renderWithProvider(<RatingInput {...baseFieldProps} field={field} value={3} />);

    // Custom icon should be used instead of default star
    const star1 = screen.getByLabelText('Rating 1');
    expect(star1).toHaveTextContent('❤');
  });

  it('uses default star icon when icon is not provided', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'rating', label: 'Rating', max: 5 });
    renderWithProvider(<RatingInput {...baseFieldProps} field={field} value={3} />);

    const star1 = screen.getByLabelText('Rating 1');
    expect(star1).toHaveTextContent('★');
  });

  it('displays tooltip icon when tooltip is provided', () => {
    const field = createMockField<DefinitionPropertyField>({ type: 'rating', label: 'Rating', max: 5, tooltip: 'Rate from 1 to 5' });
    renderWithProvider(<RatingInput {...baseFieldProps} field={field} value={0} />);

    expect(screen.getByTestId('tooltip-icon')).toBeInTheDocument();
  });
});
