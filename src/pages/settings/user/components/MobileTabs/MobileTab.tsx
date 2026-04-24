import { memo, type ReactNode, useCallback, useMemo } from 'react';

export interface MobileTabItem {
  id?: string;
  label: string;
  description?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: 'default' | 'danger' | 'separator';
  disabled?: boolean;
  className?: string;
  isFirst?: boolean;
  isLast?: boolean;
  hasSubMenu?: boolean;
}

const MobileTab = ({
  label,
  description,
  onClick,
  icon,
  variant = 'default',
  disabled = false,
  isFirst,
  isLast,
  className,
  hasSubMenu = true,
}: MobileTabItem) => {
  const variantClasses = {
    default: 'text-white',
    danger: 'text-red-500 hover:bg-red-600/20',
  };

  const getRoundingClasses = useMemo(() => {
    // Single Item in a group
    if (isFirst && isLast) return 'rounded-xl';

    if (isFirst) return 'rounded-t-xl';
    // Border to continue legacy
    if (isLast) return 'rounded-b-xl border-t border-gray-500/50';

    // No rounding for middle items, but add a separator  ;)
    return 'border-t border-gray-500/50';
  }, [isFirst, isLast]);

  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  return (
    <div
      role="menuitem"
      className={`px-4 py-3 flex items-center space-x-3 select-none bg-base-discordia-lighter transition-colors text-base
        ${variantClasses[variant]}
        ${getRoundingClasses}
        ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer active:scale-[0.98] transition-transform hover:bg-lighter'
        }
        ${className || ''}`}
      onClick={handleClick}
    >
      {icon && <div className="text-lg opacity-80">{icon}</div>}
      <div className="min-w-0">
        <div className="font-medium">{label}</div>
        {description && (
          <div className="text-xs opacity-70 mt-0.5 truncate">
            {description}
          </div>
        )}
      </div>
      {hasSubMenu && <div className="ml-auto text-2xl opacity-80">›</div>}
    </div>
  );
};

export default memo(MobileTab);
