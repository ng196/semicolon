import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

const ClubsPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Clubs</h1>
                <p className="text-gray-600">Discover and join student clubs on campus</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        The clubs feature is currently under development.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">
                        This page will allow you to browse and join student clubs, view club activities, and manage your memberships.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default ClubsPage;