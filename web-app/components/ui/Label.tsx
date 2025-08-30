import { LabelHTMLAttributes, forwardRef } from 'react'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', required = false, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-gray-700 ${className}`}
        {...props}
      >
        {children}
        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>
    )
  }
)

Label.displayName = 'Label'

export { Label }