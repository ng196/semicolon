import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

const ClubPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Club Details</h1>
                <p className="text-gray-600">Club ID: {id}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        Individual club pages are currently under development.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">
                        This page will show detailed information about the club, its members, activities, and allow you to join or interact with the club.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default ClubPage;