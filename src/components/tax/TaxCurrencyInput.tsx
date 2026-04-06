interface TaxCurrencyInputProps {
  label: string;
  german: string;
  value: number;
  onChange: (val: number) => void;
  info?: string;
  placeholder?: string;
}

export default function TaxCurrencyInput({ label, german, value, onChange, info, placeholder }: TaxCurrencyInputProps) {
  const displayVal = value === 0 ? '' : String(value);

  return (
    <div className="tax-field">
      <label className="tax-field-label">{label}</label>
      <span className="tax-field-de">{german}</span>
      {info && <div className="tax-field-hint">{info}</div>}
      <div className="tax-currency-wrap">
        <span className="tax-currency-symbol">&euro;</span>
        <input
          className="tax-input tax-input-currency"
          type="text"
          inputMode="decimal"
          value={displayVal}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
            const num = parseFloat(raw);
            onChange(isNaN(num) ? 0 : Math.round(num * 100) / 100);
          }}
          placeholder={placeholder || '0'}
        />
      </div>
    </div>
  );
}
