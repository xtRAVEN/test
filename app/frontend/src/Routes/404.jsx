import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HomeIcon, ArrowLeftIcon } from 'lucide-react';

const NotFound = () => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <Card className="w-[400px] p-6">
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="text-7xl font-bold ">404</div>
          <h2 className="text-2xl font-semibold ">Page Not Found</h2>
          <p className="text-center ">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
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

export default NotFound;