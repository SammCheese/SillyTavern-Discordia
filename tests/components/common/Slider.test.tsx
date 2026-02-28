import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { setupGlobalImports } from '../../utils/mockImports';

let Slider: typeof import('../../../src/components/common/Slider/Slider').default;

describe('Slider', () => {
  beforeEach(async () => {
    setupGlobalImports();

    Slider = (await import('../../../src/components/common/Slider/Slider'))
      .default;
  });

  it('renders initial value into both range and number input', () => {
    render(<Slider min={0} max={100} step={1} value={42} />);

    const rangeInput = screen.getByRole('slider') as HTMLInputElement;
    const numberInput = screen.getByRole('spinbutton') as HTMLInputElement;

    expect(rangeInput.value).toBe('42');
    expect(numberInput.value).toBe('42');
  });

  it('clamps values below min and calls onChange with min', () => {
    const onChange = vi.fn();

    render(
      <Slider min={10} max={100} step={1} value={20} onChange={onChange} />,
    );

    const numberInput = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(numberInput, { target: { value: '3' } });

    expect(numberInput.value).toBe('10');
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('clamps values above max and calls onChange with max', () => {
    const onChange = vi.fn();

    render(<Slider min={0} max={50} step={1} value={30} onChange={onChange} />);

    const rangeInput = screen.getByRole('slider') as HTMLInputElement;
    fireEvent.change(rangeInput, { target: { value: '77' } });

    expect(rangeInput.value).toBe('50');
    expect(onChange).toHaveBeenCalledWith(50);
  });
});
