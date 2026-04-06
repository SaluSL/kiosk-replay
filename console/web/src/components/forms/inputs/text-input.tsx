import { FieldLabel } from "@/components/ui/field"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { FieldError } from "@/components/ui/field"

type TextInputProps = {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  isInvalid: boolean
  error?: string
  type?: string
  autoComplete?: string
}

export function TextInput({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  isInvalid,
  error,
  type,
  autoComplete,
}: TextInputProps) {
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel>{label}</FieldLabel>

      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={isInvalid}
        autoComplete={autoComplete}
      />

      {isInvalid && error && <FieldError errors={[{ message: error }]} />}
    </Field>
  )
}
