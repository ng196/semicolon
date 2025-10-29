import { LogOut } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '../hooks/useAuth';

interface LogoutButtonProps {
    variant?: 'default' | 'ghost' | 'outline';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    showIcon?: boolean;
    showText?: boolean;
}

/**
 * LogoutButton component
 * Can be used anywhere in the app to provide logout functionality
 * 
 * Usage:
 * <LogoutButton /> - Default button with icon and text
 * <LogoutButton variant="ghost" size="sm" /> - Small ghost button
 * <LogoutButton showIcon={false} /> - Text only
 */
export const LogoutButton: React.FC<LogoutButtonProps> = ({
    variant = 'ghost',
    size = 'default',
    className = '',
    showIcon = true,
    showText = true,
}) => {
    const { logout } = useAuth();

    return (
        <Button
            variant={variant}
            size={size}
            onClick={logout}
            className={className}
        >
            {showIcon && <LogOut className={showText ? 'mr-2 h-4 w-4' : 'h-4 w-4'} />}
            {showText && 'Logout'}
        </Button>
    );
};