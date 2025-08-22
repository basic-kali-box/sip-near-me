import * as React from "react"
import { Coffee, Store } from "lucide-react"
import { cn } from "@/lib/utils"

export interface UserTypeToggleProps {
  value: 'buyer' | 'seller' | null
  onValueChange: (value: 'buyer' | 'seller') => void
  disabled?: boolean
  className?: string
  size?: 'default' | 'large'
  layout?: 'horizontal' | 'vertical'
  showIcons?: boolean
  showLabels?: boolean
  variant?: 'default' | 'card'
}

const UserTypeToggle = React.forwardRef<
  HTMLDivElement,
  UserTypeToggleProps
>(({ 
  value, 
  onValueChange, 
  disabled = false, 
  className,
  size = 'default',
  layout = 'horizontal',
  showIcons = true,
  showLabels = true,
  variant = 'default',
  ...props 
}, ref) => {
  const isLarge = size === 'large'
  const isCard = variant === 'card'
  
  const baseButtonClasses = cn(
    "flex items-center justify-center transition-all duration-300 touch-manipulation",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    isCard ? "rounded-xl border-2 p-4" : "rounded-lg border px-4 py-2",
    isLarge ? (isCard ? "min-h-[64px] p-5" : "min-h-[52px] px-5 py-3") : (isCard ? "min-h-[56px] p-4" : "min-h-[48px] px-4 py-2"),
    layout === 'vertical' ? "flex-col gap-2" : "flex-row gap-3"
  )

  const getBuyerClasses = () => cn(
    baseButtonClasses,
    value === 'buyer' 
      ? isCard 
        ? "border-coffee-500 bg-coffee-50 text-coffee-700 shadow-md ring-2 ring-coffee-200"
        : "border-coffee-500 bg-coffee-500 text-white shadow-md"
      : isCard
        ? "border-gray-200 hover:border-coffee-300 hover:bg-coffee-50 active:scale-[0.98]"
        : "border-gray-300 bg-white text-gray-700 hover:border-coffee-400 hover:bg-coffee-50 active:scale-[0.98]",
    "focus:ring-coffee-200"
  )

  const getSellerClasses = () => cn(
    baseButtonClasses,
    value === 'seller' 
      ? isCard 
        ? "border-matcha-500 bg-matcha-50 text-matcha-700 shadow-md ring-2 ring-matcha-200"
        : "border-matcha-500 bg-matcha-500 text-white shadow-md"
      : isCard
        ? "border-gray-200 hover:border-matcha-300 hover:bg-matcha-50 active:scale-[0.98]"
        : "border-gray-300 bg-white text-gray-700 hover:border-matcha-400 hover:bg-matcha-50 active:scale-[0.98]",
    "focus:ring-matcha-200"
  )

  const iconSize = isLarge ? "w-6 h-6" : "w-5 h-5"
  const textSize = isCard 
    ? isLarge ? "text-lg font-semibold" : "text-base font-semibold"
    : isLarge ? "text-base font-medium" : "text-sm font-medium"

  return (
    <div
      ref={ref}
      className={cn(
        "grid gap-3",
        layout === 'horizontal' ? "grid-cols-2" : "grid-cols-1",
        "sm:gap-4",
        className
      )}
      {...props}
    >
      <button
        type="button"
        onClick={() => onValueChange('buyer')}
        disabled={disabled}
        className={getBuyerClasses()}
        aria-label="Select buyer account type to find and order drinks"
        aria-pressed={value === 'buyer'}
      >
        {showIcons && (
          <Coffee className={cn(iconSize, layout === 'vertical' ? "mb-1" : "")} />
        )}
        {showLabels && (
          <div className={cn("flex flex-col", layout === 'horizontal' ? "text-left" : "text-center")}>
            <span className={textSize}>Buy Drinks</span>
            {isCard && (
              <span className="text-xs text-gray-500 mt-1">I'm a buyer</span>
            )}
          </div>
        )}
      </button>
      
      <button
        type="button"
        onClick={() => onValueChange('seller')}
        disabled={disabled}
        className={getSellerClasses()}
        aria-label="Select seller account type to sell drinks and manage your business"
        aria-pressed={value === 'seller'}
      >
        {showIcons && (
          <Store className={cn(iconSize, layout === 'vertical' ? "mb-1" : "")} />
        )}
        {showLabels && (
          <div className={cn("flex flex-col", layout === 'horizontal' ? "text-left" : "text-center")}>
            <span className={textSize}>Sell Drinks</span>
            {isCard && (
              <span className="text-xs text-gray-500 mt-1">I'm a seller</span>
            )}
          </div>
        )}
      </button>
    </div>
  )
})

UserTypeToggle.displayName = "UserTypeToggle"

export { UserTypeToggle }
