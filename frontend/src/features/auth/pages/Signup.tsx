import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
    const navigate = useNavigate();

    // Redirect to onboarding wizard instead of showing old signup form
    useEffect(() => {
        navigate('/auth/onboarding', { replace: true });
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div>Redirecting to onboarding...</div>
        </div>
    );
}