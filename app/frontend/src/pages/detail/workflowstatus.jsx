import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Download, Trash2, AlertCircle, ChevronLeft, Plus, Map, FileText, Copy, LockIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from '@/login/api';
import { USER_PERMISSIONS } from '@/login/constants';
import { Textarea } from "@/components/ui/textarea";
import { intl } from '@/i18n';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const DeleteAlert = ({ onConfirm }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button size="sm" variant="outline">
        <Trash2 className="h-4 w-4 mr-2" />
        {intl.formatMessage({ id: "delete" })}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent className="max-w-[90vw] w-full sm:max-w-lg">
      <AlertDialogHeader>
        <AlertDialogTitle>{intl.formatMessage({ id: "areYouAbsolutelySure" })}</AlertDialogTitle>
        <AlertDialogDescription>
          {intl.formatMessage({ id: "deleteWorkflowWarning" })}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{intl.formatMessage({ id: "cancel" })}</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>{intl.formatMessage({ id: "delete" })}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
const WorkflowTable = ({ 
  title, 
  workflows, 
  workflowType, 
  onExport, 
  onDelete, 
  onUpdate, 
  onExportAll, 
  onCreateNew,
  onViewDetails, 
  showNewWorkflowButton, 
  permissions 
}) => (
  <Card>
    <CardHeader>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <div className="flex flex-wrap gap-2">
          {workflows.length > 0 && permissions.view && (
            <Button size="sm" variant="outline" onClick={() => onExportAll(workflowType)}>
              <Download className="mr-2 h-4 w-4" />
              {intl.formatMessage({ id: "exportAll" })}
            </Button>
          )}
          {showNewWorkflowButton && permissions.change && (
            <Button size="sm" onClick={() => onCreateNew(workflowType)}>
              <Plus className="mr-2 h-4 w-4" />
              {intl.formatMessage({ id: "newWorkflow" })}
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[300px]">
        {workflows.length > 0 ? (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="bg-card border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{intl.formatMessage({ id: "id" })}: {workflow.id}</span>
                  <Badge variant={workflow.state === 'completed' ? 'success' : 'warning'}>
                    {intl.formatMessage({ id: workflow.state })}
                  </Badge>
                </div>
                <div>{intl.formatMessage({ id: "documents" })}: {workflow.documents.length}</div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onViewDetails(workflowType, workflow.id)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {intl.formatMessage({ id: "viewDetails" })}
                  </Button>
                  {permissions.view && (
                    <Button size="sm" variant="outline" onClick={() => onExport(workflow.id, workflowType)}>
                      <Download className="h-4 w-4 mr-2" />
                      {intl.formatMessage({ id: "export" })}
                    </Button>
                  )}
                  {permissions.delete && (
                    <DeleteAlert onConfirm={() => onDelete(workflow.id, workflowType)} />
                  )}
                  {permissions.change && (
                    <Button size="sm" variant="outline" onClick={() => onUpdate(workflowType, workflow.id)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {intl.formatMessage({ id: "edit" })}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{intl.formatMessage({ id: "noWorkflows" })}</AlertTitle>
            <AlertDescription>
              {intl.formatMessage({ id: "noWorkflowsAvailable" }, { workflowType })}
            </AlertDescription>
          </Alert>
        )}
      </ScrollArea>
    </CardContent>
  </Card>
);
const WorkflowStatusChart = ({ workflows }) => {
  const data = Object.entries(workflows).map(([key, value]) => ({
    name: key,
    [intl.formatMessage({ id: "completed" })]: value.filter(w => w.state === 'completed').length,
    [intl.formatMessage({ id: "inProgress" })]: value.filter(w => w.state !== 'completed').length,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={intl.formatMessage({ id: "completed" })} stackId="a" fill={COLORS[0]} />
        <Bar dataKey={intl.formatMessage({ id: "inProgress" })} stackId="a" fill={COLORS[1]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const PermissionDenied = ({ workflowType }) => (
  <Card className="mt-4">
    <CardContent className="flex flex-col items-center justify-center py-10">
      <LockIcon className="h-12 w-12 text-yellow-500 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{intl.formatMessage({ id: "permissionDenied" })}</h3>
      <p className="text-center text-gray-600 dark:text-gray-400">
        {intl.formatMessage({ id: "noPermissionToViewWorkflows" }, { workflowType })}
      </p>
    </CardContent>
  </Card>
);

export default function ParcelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [parcel, setParcel] = useState(null);
  const [workflows, setWorkflows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState({
    combustible: { view: false, change: false, delete: false },
    urbanAuthorisation: { view: false, change: false, delete: false },
    occupationTemp: { view: false, change: false, delete: false },
    foncier: { view: false, change: false, delete: false },
  });

  const copyToClipboard = (text) => {
    // Clean up any extra spaces and newlines for point coordinates
    const cleanText = text.replace(/\s+/g, ' ').trim();
    navigator.clipboard.writeText(cleanText).then(() => {
      toast({
        title: intl.formatMessage({ id: "copied" }),
        description: intl.formatMessage({ id: "coordinatesCopied" }),
      });
    }, (err) => {
      console.error('Could not copy text: ', err);
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "error" }),
        description: intl.formatMessage({ id: "failedToCopyCoordinates" }),
      });
    });
  };
  useEffect(() => {
    fetchData();
    loadPermissions();
  }, [id]);

  const loadPermissions = () => {
    const userPermissions = JSON.parse(localStorage.getItem(USER_PERMISSIONS) || '[]');
    setPermissions({
      combustible: {
        view: userPermissions.includes('combustibleworkflow.view_combustibleworkflow'),
        change: userPermissions.includes('combustibleworkflow.change_combustibleworkflow'),
        delete: userPermissions.includes('combustibleworkflow.delete_combustibleworkflow'),
      },
      urbanAuthorisation: {
        view: userPermissions.includes('upaworkflow.view_autorisationurbanismeworkflow'),
        change: userPermissions.includes('upaworkflow.change_autorisationurbanismeworkflow'),
        delete: userPermissions.includes('upaworkflow.delete_autorisationurbanismeworkflow'),
      },
      occupationTemp: {
        view: userPermissions.includes('occupationtempworkflow.view_occupationworkflow'),
        change: userPermissions.includes('occupationtempworkflow.change_occupationworkflow'),
        delete: userPermissions.includes('occupationtempworkflow.delete_occupationworkflow'),
      },
      foncier: {
        view: userPermissions.includes('foncierworkflow.view_foncierworkflow'),
        change: userPermissions.includes('foncierworkflow.change_foncierworkflow'),
        delete: userPermissions.includes('foncierworkflow.delete_foncierworkflow'),
      },
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const parcelResponse = await api.get(`/parcel/parceldetails/${id}/`);
      const workflowsResponse = await api.get(`/parcel/parceldetails/${id}/workflows/`);
      setParcel(parcelResponse.data);
      setWorkflows(workflowsResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.status === 404 ? intl.formatMessage({ id: "parcelNotFound" }) : intl.formatMessage({ id: "failedToFetchData" }));
      setLoading(false);
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "error" }),
        description: err.response?.status === 404 ? intl.formatMessage({ id: "parcelNotFound" }) : intl.formatMessage({ id: "failedToFetchData" }),
      });
    }
  };

  const handleExport = async (workflowId, workflowType) => {
    if (!permissions[workflowType].view) {
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "permissionDenied" }),
        description: intl.formatMessage({ id: "noPermissionToExportWorkflows" }, { workflowType }),
      });
      return;
    }
    try {
      const response = await api.get(`/parcel/workflows/${workflowId}/export/${workflowType}/`, {
        responseType: 'blob',
      });
      downloadFile(response.data, `${workflowType}_workflow_${workflowId}_export.zip`);
      toast({
        title: intl.formatMessage({ id: "exportSuccessful" }),
        description: intl.formatMessage({ id: "workflowExportedSuccessfully" }),
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "exportFailed" }),
        description: intl.formatMessage({ id: "failedToExportWorkflow" }),
      });
    }
  };

  const desiredOrder = ['foncier', 'urbanAuthorisation', 'combustible', 'occupationTemp'];

  // Update the visibleWorkflowTypes calculation
  const visibleWorkflowTypes = desiredOrder.filter(
    workflowType => workflows && workflows[workflowType] && permissions[workflowType]?.view
  );


  const handleExportAll = async (workflowType) => {
    if (!permissions[workflowType].view) {
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "permissionDenied" }),
        description: intl.formatMessage({ id: "noPermissionToExportWorkflows" }, { workflowType }),
      });
      return;
    }
    try {
      const response = await api.get(`/parcel/parceldetails/${id}/export-workflow/${workflowType}/`, {
        responseType: 'blob',
      });
      downloadFile(response.data, `${workflowType}_all_export.zip`);
      toast({
        title: intl.formatMessage({ id: "exportSuccessful" }),
        description: intl.formatMessage({ id: "allWorkflowsExportedSuccessfully" }, { workflowType }),
      });
    } catch (error) {
      console.error('Export all failed:', error);
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "exportFailed" }),
        description: intl.formatMessage({ id: "failedToExportAllWorkflows" }),
      });
    }
  };

  const downloadFile = (data, fileName) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const handleDelete = async (workflowId, workflowType) => {
    if (!permissions[workflowType].delete) {
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "permissionDenied" }),
        description: intl.formatMessage({ id: "noPermissionToDeleteWorkflows" }, { workflowType }),
      });
      return;
    }
    try {
      const response = await api.delete(`/parcel/workflows/${workflowId}/`);
      if (response.data.success) {
        setWorkflows(prevWorkflows => {
          const updatedWorkflows = { ...prevWorkflows };
          updatedWorkflows[workflowType] = updatedWorkflows[workflowType].filter(w => w.id !== workflowId);
          return updatedWorkflows;
        });
        toast({
          title: intl.formatMessage({ id: "workflowDeleted" }),
          description: intl.formatMessage({ id: "workflowDeletedSuccessfully" }),
        });
      } else {
        throw new Error(response.data.error || intl.formatMessage({ id: "deleteFailed" }));
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "deleteFailed" }),
        description: intl.formatMessage({ id: "failedToDeleteWorkflow" }),
      });
    }
  };

  const workflowEditRoutes = {
    combustible: (workflowId, parcelId) => `/combustible/${parcelId}?parcelId=${workflowId}`,
    urbanAuthorisation: (workflowId, parcelId) => `/urban_autorisation/${parcelId}?parcelId=${workflowId}`,
    occupationTemp: (workflowId, parcelId) => `/occupation/${parcelId}?parcelId=${workflowId}`,
    foncier: (workflowId, parcelId) => `/foncier/${parcelId}?parcelId=${workflowId}`,
  };

  const handleViewDetails = (workflowType, workflowId) => {
    navigate(`/workflow-details/${workflowType}/${workflowId}`);
  };
  
  
  const handleUpdate = (workflowType, workflowId) => {
    if (!permissions[workflowType].change) {
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "permissionDenied" }),
        description: intl.formatMessage({ id: "noPermissionToEditWorkflows" }, { workflowType }),
      });
      return;
    }
    const editRoute = workflowEditRoutes[workflowType];
    if (editRoute) {
      const route = editRoute(workflowId, id);
      navigate(route);
      toast({
        title: intl.formatMessage({ id: "navigatingToEditPage" }),
        description: intl.formatMessage({ id: "openingEditPageForWorkflow" }, { workflowType, workflowId }),
      });
    } else {
      console.error(`Unknown workflow type: ${workflowType}`);
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "error" }),
        description: intl.formatMessage({ id: "cannotEditUnknownWorkflowType" }, { workflowType }),
      });
    }
  };

  const workflowCreateRoutes = {
    combustible: (parcelId) => `/combustible/${parcelId}?parcelId=0`,
    urbanAuthorisation: (parcelId) => `/urban_autorisation/${parcelId}?parcelId=0`,
    occupationTemp: (parcelId) => `/occupation/${parcelId}?parcelId=0`,
    foncier: (parcelId) => `/foncier/${parcelId}?parcelId=0`,
  };
  
  const handleCreateNewWorkflow = (workflowType) => {
    if (!permissions[workflowType].change) {
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "permissionDenied" }),
        description: intl.formatMessage({ id: "noPermissionToCreateNewWorkflows" }, { workflowType }),
      });
      return;
    }
    const createRoute = workflowCreateRoutes[workflowType];
    if (createRoute) {
      const route = createRoute(id);
      navigate(route);
      toast({
        title: intl.formatMessage({ id: "creatingNewWorkflow" }),
        description: intl.formatMessage({ id: "openingCreationPageForWorkflow" }, { workflowType }),
      });
    } else {
      console.error(`Unknown workflow type: ${workflowType}`);
      toast({
        variant: "destructive",
        title: intl.formatMessage({ id: "error" }),
        description: intl.formatMessage({ id: "cannotCreateUnknownWorkflowType" }, { workflowType }),
      });
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-full sm:w-1/4 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-[300px] w-full" />
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

  if (!parcel || !workflows) return null;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="mb-8">
        <Button variant="ghost" className="mb-2" onClick={() => navigate('/parcel')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {intl.formatMessage({ id: "backToParcels" })}
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">{intl.formatMessage({ id: "parcel" })}: {parcel.name}</h1>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Map className="mr-2 h-5 w-5" />
              {intl.formatMessage({ id: "generalInformation" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(parcel).map(([key, value]) => {
  if (key === 'coordinates' && value) {
    // Format point coordinates as [longitude, latitude]
    const formattedCoordinates = `${value[0]}, ${value[1]}`;
    return (
      <div key={key} className="space-y-1 sm:col-span-2">
        <div className="flex justify-between items-center">
          <Label htmlFor={key} className="text-sm font-medium text-gray-500">
            {intl.formatMessage({ id: "coordinates" })}
          </Label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => copyToClipboard(formattedCoordinates)}
          >
            <Copy className="h-4 w-4 mr-2" />
            {intl.formatMessage({ id: "copy" })}
          </Button>
        </div>
        <Textarea
          id={key}
          value={formattedCoordinates}
          readOnly
          className="w-full h-16 font-mono text-sm" // Reduced height since it's just one point
        />
      </div>
    );
  }
  return (
    <div key={key} className="space-y-1">
      <Label htmlFor={key} className="text-sm font-medium text-gray-500">
        {intl.formatMessage({ id: key.replace('_', ' ').charAt(0).toUpperCase() + key.slice(1) })}
      </Label>
      <Input id={key} value={value || intl.formatMessage({ id: "notAvailable" })} readOnly className="w-full" />
    </div>
  );
})}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              {intl.formatMessage({ id: "workflowStatus" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visibleWorkflowTypes.length > 0 ? (
              <div className="h-[300px] w-full">
                <WorkflowStatusChart 
                  workflows={Object.fromEntries(
                    visibleWorkflowTypes.map(type => [type, workflows[type]])
                  )} 
                />
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{intl.formatMessage({ id: "noWorkflows" })}</AlertTitle>
                <AlertDescription>
                  {intl.formatMessage({ id: "noViewableWorkflows" })}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {visibleWorkflowTypes.length > 0 ? (
        <Tabs defaultValue={visibleWorkflowTypes[0]} className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="w-full justify-start dark:bg-primary-foreground flex-wrap">
              {visibleWorkflowTypes.map((workflowType) => (
                <TabsTrigger 
                  key={workflowType} 
                  value={workflowType} 
                  className="capitalize whitespace-nowrap text-xs sm:text-sm px-2 py-1 sm:px-4 sm:py-2"
                >
                  {intl.formatMessage({ id: workflowType })}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
          {visibleWorkflowTypes.map((workflowType) => (
            <TabsContent key={workflowType} value={workflowType}>
             <WorkflowTable 
  title={intl.formatMessage({ id: `${workflowType}Workflows` })}
  workflows={workflows[workflowType]}
  workflowType={workflowType}
  onExport={handleExport}
  onExportAll={handleExportAll}
  onDelete={handleDelete}
  onUpdate={handleUpdate}
  onCreateNew={handleCreateNewWorkflow}
  onViewDetails={handleViewDetails}  // Add this line
  showNewWorkflowButton={workflowType !== 'foncier' || workflows[workflowType].length === 0}
  permissions={permissions[workflowType]}
/>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <PermissionDenied workflowType={intl.formatMessage({ id: "any" })} />
      )}
    </div>
  );
}