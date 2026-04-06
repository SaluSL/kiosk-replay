import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form"
import { TextInput } from "../inputs/text-input"

type FormTextFieldProps<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
  label: string
  placeholder?: string
  type?: string
  autoComplete?: string
}

export function FormTextField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type,
  autoComplete,
}: FormTextFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextInput
          label={label}
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}
