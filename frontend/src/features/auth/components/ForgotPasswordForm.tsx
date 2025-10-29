import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/shared/components/ui/form';

import { useForgotPasswordForm } from '../hooks/useAuthForm';

export default function ForgotPasswordForm() {
    const { form, onSubmit, isSubmitting, isSubmitted, resetForm } = useForgotPasswordForm();

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md p-6">
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
                        <p className="text-muted-foreground mb-6">
                            We've sent a password reset link to{' '}
                            <span className="font-medium">{form.getValues('email')}</span>
                        </p>
                        <div className="space-y-3">
                            <Button asChild className="w-full">
                                <Link to="/auth/login">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Sign In
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={resetForm}
                                className="w-full"
                            >
                                Try different email
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md p-6">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                            <Mail className="h-6 w-6 text-primary-foreground" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
                    <p className="text-muted-foreground">
                        No worries, we'll send you reset instructions
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Enter your email"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the email associated with your account
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.formState.errors.root && (
                            <div className="text-sm text-red-600 text-center">
                                {form.formState.errors.root.message}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Reset Link
                                </>
                            )}
                        </Button>
                    </form>
                </Form>

                <div className="mt-6 text-center">
                    <Link
                        to="/auth/login"
                        className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Sign In
                    </Link>
                </div>
            </Card>
        </div>
    );
}