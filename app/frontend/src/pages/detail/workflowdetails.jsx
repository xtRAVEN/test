import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ChevronLeft, 
  AlertCircle, 
  Calendar,
  FileText,
  MapPin,
  Building,
} from "lucide-react";
import api from '@/login/api';
import { intl } from '@/i18n';

const formatDate = (dateString) => {
  if (!dateString) return intl.formatMessage({ id: "notAvailable" });
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(intl.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const formatValue = (value, type = 'text') => {
  if (value === null || value === undefined) {
    return intl.formatMessage({ id: "notAvailable" });
  }

  switch (type) {
    case 'date':
      return formatDate(value);
    case 'number':
      return new Intl.NumberFormat(intl.locale).format(value);
    case 'currency':
      return new Intl.NumberFormat(intl.locale, {
        style: 'currency',
        currency: 'MAD'
      }).format(value);
    default:
      return value.toString();
  }
};

const DocumentItem = ({ doc }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border">
      <div className="flex items-center gap-3">
        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div>
          <div className="font-medium">{doc.name}</div>
          <div className="text-sm text-muted-foreground">
            {doc.document_type}
          </div>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        {formatDate(doc.created_at)}
      </div>
    </div>
  );
};

const WorkflowDetailsPage = () => {
  const { workflowType, workflowId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkflowDetails();
  }, [workflowId, workflowType]);

  const fetchWorkflowDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/parcel/workflow-details/${workflowType}/${workflowId}/`);
      setDetails(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch workflow details';
      setError(errorMessage);
      console.error('Error fetching workflow details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-full sm:w-1/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-full sm:w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{intl.formatMessage({ id: "error" })}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!details) return null;

  const { workflow, field_groups, documents, yearly_data } = details;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <header className="mb-8">
        <Button 
          variant="ghost" 
          className="mb-2" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {intl.formatMessage({ id: "back" })}
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">
          {intl.formatMessage({ id: "workflowDetails" })}
        </h1>
      </header>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {intl.formatMessage({ id: "basicInformation" })}
              </CardTitle>
              <Badge variant={workflow.state === 'Completed' ? 'success' : 'warning'}>
                {workflow.state}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  {intl.formatMessage({ id: "createdAt" })}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(workflow.created_at)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  ID
                </div>
                <div>{workflow.id}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parcel Info */}
        {workflow.parcel && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {intl.formatMessage({ id: "parcelInformation" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(workflow.parcel).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      {intl.formatMessage({ id: key })}
                    </div>
                    <div>{formatValue(value, key === 'surface' ? 'number' : 'text')}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Field Groups */}
        {field_groups && Object.entries(field_groups).map(([groupName, fields]) => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle className="text-lg">
                {intl.formatMessage({ id: groupName })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(fields).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      {intl.formatMessage({ id: key })}
                    </div>
                    <div>
                      {formatValue(
                        value,
                        key.includes('date') ? 'date' : 
                        key.includes('prix') || key.includes('montant') ? 'currency' :
                        key.includes('surface') || key.includes('duration') ? 'number' : 
                        'text'
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Documents */}
        {documents && documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {intl.formatMessage({ id: "documents" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <DocumentItem key={doc.id} doc={doc} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Yearly Data */}
        {yearly_data && yearly_data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {intl.formatMessage({ id: "yearlyData" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  {yearly_data.map((yearData) => (
                    <Card key={yearData.id}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {intl.formatMessage(
                            { id: "yearTitle" },
                            { year: yearData.year }
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">
                                {intl.formatMessage({ id: "areaOccupation" })}
                              </div>
                              <div>
                                {formatValue(yearData.area_occupation, 'number')} m²
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-muted-foreground mb-1">
                                {intl.formatMessage({ id: "royaltyAmount" })}
                              </div>
                              <div>
                                {formatValue(yearData.royalty_amount, 'currency')}
                              </div>
                            </div>
                          </div>

                          {yearData.documents && yearData.documents.length > 0 && (
                            <div>
                              <div className="font-medium mb-2">
                                {intl.formatMessage({ id: "documents" })}
                              </div>
                              <div className="space-y-2">
                                {yearData.documents.map((doc) => (
                                  <DocumentItem key={doc.id} doc={doc} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkflowDetailsPage;