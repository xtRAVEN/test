import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HomeIcon, ArrowLeftIcon, ShieldAlertIcon } from 'lucide-react';

const UnauthorizedPage = () => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[400px] p-6">
        <CardContent className="flex flex-col items-center space-y-6">
          <ShieldAlertIcon className="h-16 w-16 text-red-500" />
          <div className="text-4xl font-bold text-red-500">403</div>
          <h2 className="text-2xl font-semibold">Unauthorized Access</h2>
          <p className="text-center">
            Sorry, you don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Go Back
            </Button>
            <Button onClick={handleGoHome}>
              <HomeIcon className="mr-2 h-4 w-4" /> Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;