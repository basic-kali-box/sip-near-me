import * as React from "react"
import { Phone, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validateAndNormalizeMoroccanPhone, formatMoroccanPhoneForDisplay } from "@/utils/moroccanPhoneValidation"

export interface MoroccanPhoneInputProps {
  value: string
  onChange: (value: string) => void
  onValidationChange?: (isValid: boolean, normalizedNumber: string) => void
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  showValidationFeedback?: boolean
  showFormattedPreview?: boolean
  size?: 'default' | 'sm' | 'lg'
}

const MoroccanPhoneInput = React.forwardRef<
  HTMLInputElement,
  MoroccanPhoneInputProps
>(({ 
  value, 
  onChange, 
  onValidationChange,
  label = "Phone Number",
  placeholder = "0606060606 or 212606060606",
  required = false,
  disabled = false,
  className,
  showValidationFeedback = true,
  showFormattedPreview = true,
  size = 'default',
  ...props 
}, ref) => {
  const [validationResult, setValidationResult] = React.useState(() => 
    validateAndNormalizeMoroccanPhone(value)
  )

  // Update validation when value changes
  React.useEffect(() => {
    const result = validateAndNormalizeMoroccanPhone(value)
    setValidationResult(result)
    
    // Notify parent of validation changes
    if (onValidationChange) {
      onValidationChange(result.isValid, result.normalizedNumber)
    }
  }, [value, onValidationChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const hasValue = value.trim().length > 0
  const showError = hasValue && !validationResult.isValid && showValidationFeedback
  const showSuccess = hasValue && validationResult.isValid && showValidationFeedback

  const inputSizeClasses = {
    sm: "h-9 px-3 text-sm",
    default: "h-10 px-4",
    lg: "h-12 px-5 text-lg"
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      {label && (
        <Label className={cn(
          "text-sm font-medium",
          required && "after:content-['*'] after:ml-0.5 after:text-red-500"
        )}>
          {label}
          {required && (
            <span className="text-xs text-gray-500 ml-2">(Required for WhatsApp contact)</span>
          )}
        </Label>
      )}

      {/* Input with icon */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Phone className={cn(
            "text-gray-400",
            size === 'sm' ? "w-4 h-4" : size === 'lg' ? "w-6 h-6" : "w-5 h-5"
          )} />
        </div>
        
        <Input
          ref={ref}
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(
            "pl-10",
            inputSizeClasses[size],
            showError && "border-red-400 focus:ring-red-500 bg-red-50",
            showSuccess && "border-green-400 focus:ring-green-500 bg-green-50"
          )}
          {...props}
        />

        {/* Validation icon */}
        {showValidationFeedback && hasValue && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {validationResult.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Formatted preview for valid numbers */}
      {showFormattedPreview && validationResult.isValid && hasValue && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-green-700 text-sm">
              <span className="font-medium">WhatsApp format:</span>{" "}
              <span className="font-mono font-semibold">{validationResult.displayNumber}</span>
            </p>
            <p className="text-green-600 text-xs mt-0.5">
              Ready for WhatsApp messaging
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {showError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 text-sm font-medium">
              {validationResult.errorMessage}
            </p>
            <p className="text-red-600 text-xs mt-0.5">
              Enter a valid Moroccan mobile number (06XXXXXXXX or 07XXXXXXXX)
            </p>
          </div>
        </div>
      )}

      {/* Help text for empty input */}
      {!hasValue && showValidationFeedback && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Phone className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-blue-700 text-sm font-medium">
              Supported formats:
            </p>
            <ul className="text-blue-600 text-xs mt-1 space-y-0.5">
              <li>• <span className="font-mono">0606060606</span> (local with 0)</li>
              <li>• <span className="font-mono">606060606</span> (local without 0)</li>
              <li>• <span className="font-mono">212606060606</span> (international)</li>
              <li>• <span className="font-mono">+212 606 060 606</span> (formatted)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
})

MoroccanPhoneInput.displayName = "MoroccanPhoneInput"

export { MoroccanPhoneInput }
