import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '@/login/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import DocumentManager from './document';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Document, Page, pdfjs } from 'react-pdf';
import { intl } from '@/i18n';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DynamicWorkflowForm = ({ workflowType, steps, mapping, workflowname }) => {
    const { id: parcelId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [workflowId, setWorkflowId] = useState(null);
    const [workflow, setWorkflow] = useState(null);
    const [fields, setFields] = useState({});
    const [yearid, setYearId] = useState(null);
    const [errors, setErrors] = useState({});
    const [yearlyData, setYearlyData] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const totalSteps = steps;
    const [progress, setProgress] = useState(0);
    const stepMapping = mapping;
    const workflowIndex = workflow ? stepMapping[workflow.state.toLowerCase()] || 1 : 1;
    const fetchLock = useRef(false);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pdfWidth, setPdfWidth] = useState(600);
    const containerRef = useRef(null);
    const searchParams = new URLSearchParams(location.search);
    const urlWorkflowId = searchParams.get('parcelId');

    useEffect(() => {
        const fetchOrCreateWorkflow = async () => {
            if (fetchLock.current) return;
            if (!parcelId) {
                console.error(intl.formatMessage({ id: "noParcelIdProvided" }));
                setIsLoading(false);
                return;
            }

            fetchLock.current = true;
            setIsLoading(true);

            try {
                const response = await api.get(`/${workflowType}/workflows/${parcelId}/`, {
                    params: { parcelId: urlWorkflowId || '0' }
                });

                const newWorkflowId = response.data.workflow_id.toString();
                setWorkflowId(newWorkflowId);
                setWorkflow(response.data.workflow);
                setFields(response.data.fields);

                if (response.data.all_yearly_data) {
                    setYearlyData(response.data.all_yearly_data);
                }
                if (response.data.year_id) {
                    setYearId(response.data.year_id);
                }

                if (!urlWorkflowId || urlWorkflowId === '0') {
                    if (workflowType === 'upaworkflow'){
                        navigate(`/urban_autorisation/${parcelId}?parcelId=${newWorkflowId}`, { replace: true });
                    } else {
                        navigate(`/${workflowType}/${parcelId}?parcelId=${newWorkflowId}`, { replace: true });
                    }
                }

                const currentStep = stepMapping[response.data.workflow.state.toLowerCase()] || 1;
                setProgress((currentStep / totalSteps) * 100);

                setIsCompleted(response.data.workflow.state === 'completed');
            } catch (error) {
                console.error(intl.formatMessage({ id: "errorFetchingCreatingWorkflowData" }), error);
                setErrors({ general: intl.formatMessage({ id: "failedToFetchOrCreateWorkflow" }) });
            } finally {
                setIsLoading(false);
                fetchLock.current = false;
            }
        };

        fetchOrCreateWorkflow();
    }, [parcelId, urlWorkflowId, workflowType, stepMapping, totalSteps, navigate]);

    const handleAction = async (action) => {
        try {
            let payload = { action, parcelId };

            const form = document.querySelector('form');
            if (form && action !== 'previous') {
                const formData = new FormData(form);
                const formObject = Object.fromEntries(formData.entries());
                payload = {
                    ...formObject,
                    ...payload
                };
            }

            await api.put(`/${workflowType}/workflows/${parcelId}/?parcelId=${workflowId}`, payload);
            const response = await api.get(`/${workflowType}/workflows/${parcelId}/?parcelId=${workflowId}`);
            setWorkflow(response.data.workflow);
            setFields(response.data.fields);
            if (response.data.all_yearly_data) {
                setYearlyData(response.data.all_yearly_data);
            }
            if (response.data.year_id) {
                setYearId(response.data.year_id);
            }
            setErrors({});

            const currentStep = stepMapping[response.data.workflow.state.toLowerCase()] || 1;
            setProgress((currentStep / totalSteps) * 100);

            setIsCompleted(response.data.workflow.state === 'completed');

            setPreviewDocument(null);

        } catch (error) {
            if (error.response) {
                setErrors(error.response.data);
            } else {
                console.error(intl.formatMessage({ id: action === 'previous' ? "errorMovingToPreviousStep" : "errorUpdatingWorkflow" }), error.message);
            }
        }
    };

    const handlePreview = (document) => {
        setPreviewDocument(document);
    };
    const renderField = (fieldName, fieldInfo) => {
        const { type, required, choices } = fieldInfo;
      
        const getTranslatedFieldName = (name) => {
          return intl.formatMessage({ id: name }, { defaultMessage: name });
        };
      
        if (type === 'dropdown') {
          return (
            <div key={fieldName}>
              <Label htmlFor={fieldName}>
                {getTranslatedFieldName(fieldName)}
              </Label>
              <Select
                defaultValue={workflow ? workflow[fieldName] : ''}
                id={fieldName}
                name={fieldName}
                className={`mt-2 ${errors[fieldName] ? 'border-red-500' : ''}`}
                aria-invalid={errors[fieldName] ? 'true' : 'false'}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={intl.formatMessage({ id: "selectA" }, { field: getTranslatedFieldName(fieldName) })} />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(choices) ? choices.map(choice => (
                    <SelectItem key={choice.value} value={choice.value}>
                      {getTranslatedFieldName(choice.label)}
                    </SelectItem>
                  )) : (
                    <>
                      <SelectItem value="urban">{getTranslatedFieldName("urban")}</SelectItem>
                      <SelectItem value="rural">{getTranslatedFieldName("rural")}</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {errors[fieldName] && (
                <div className="text-red-500 text-sm mt-1">
                  {errors[fieldName].map(error => getTranslatedFieldName(error)).join(', ')}
                </div>
              )}
            </div>
          );
        }
      
        if (type === 'document') {
          return (
            <DocumentManager
              key={fieldName}
              workflowId={workflowId}
              fieldName={fieldName}
              onPreview={handlePreview}
              type={workflowType}
              year_id={yearid}
            />
          );
        }
      
        return (
          <div key={fieldName}>
            <Label htmlFor={fieldName}>
              {getTranslatedFieldName(fieldName)}
            </Label>
            <Input
              className={`mt-2 ${errors[fieldName] ? 'border-red-500' : ''}`}
              type={
                type === 'DecimalField' ? 'number' :
                type === 'DateField' ? 'date' :
                'text'
              }
              id={fieldName}
              name={fieldName}
              step={type === 'DecimalField' ? '0.01' : undefined}
              placeholder={intl.formatMessage({ id: "enter" }, { field: getTranslatedFieldName(fieldName) })}
              defaultValue={workflow ? workflow[fieldName] : ''}
              aria-invalid={errors[fieldName] ? 'true' : 'false'}
            />
            {errors[fieldName] && (
              <div className="text-red-500 text-sm mt-1">
                {errors[fieldName].map(error => getTranslatedFieldName(error)).join(', ')}
              </div>
            )}
          </div>
        );
      };

    const zoomLevel = 1.3;

    useEffect(() => {
        const updatePdfWidth = () => {
            if (containerRef.current) {
                const newWidth = (containerRef.current.offsetWidth - 40) / zoomLevel;
                setPdfWidth(newWidth > 600 ? 600 : newWidth);
            }
        };

        window.addEventListener('resize', updatePdfWidth);
        updatePdfWidth();

        return () => window.removeEventListener('resize', updatePdfWidth);
    }, []);

    const handlePdfLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const renderPreview = () => {
        if (!previewDocument) {
            return (
                <div className="border border-gray-200 rounded-lg flex items-center justify-center" style={{ height: 'calc(100vh - 200px)' }}>
                    <p className="text-gray-500">{intl.formatMessage({ id: "noDocumentPreviewAvailable" })}</p>
                </div>
            );
        }

        if (previewDocument.type === 'pdf') {
            return (
                <div className="border border-gray-200 rounded-lg overflow-auto flex justify-center" style={{ height: 'calc(100vh - 200px)' }}>
                    <Document
                        file={previewDocument.url}
                        options={{ workerSrc: "/pdf.worker.min.js" }}
                    >
                        <Page pageNumber={1} width={600} />
                    </Document>
                </div>
            );
        } else if (previewDocument.type === 'docx') {
            return (
                <div 
                    className="border border-gray-200 rounded-lg overflow-auto" 
                    style={{ height: 'calc(100vh - 200px)' }}
                    dangerouslySetInnerHTML={{ __html: previewDocument.content }}
                />
            );
        }
    };

    if (isCompleted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen ">
                <div className=" p-8 rounded-lg shadow-md text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4">{intl.formatMessage({ id: "workflowCompleted" })}</h2>
                    <p className=" mb-6">
                        {intl.formatMessage({ id: "congratulationsWorkflowCompleted" }, { workflowName: workflowname })}
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Button onClick={() => navigate(`/parcelsdetail/${parcelId}`)}>
                            {intl.formatMessage({ id: "viewParcelDetails" })}
                        </Button>
                        <Button variant="outline" onClick={() => handleAction('previous')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> {intl.formatMessage({ id: "goBackToPreviousStep" })}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <div>{intl.formatMessage({ id: "loading" })}</div>;
    }

    return (
        <>
            <div className="p-4">
                <h3 className="scroll-m-20 text-bg md:text-xl lg:text-xl font-semibold tracking-tight">
                    {intl.formatMessage({ id: "workflowProgress" }, { workflowName: workflowname, current: workflowIndex, total: totalSteps })}
                </h3>
                <Progress value={progress} className="w-full mt-2" />
            </div>
            <div className="flex items-center justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
                    <form className="w-full h-full">
                        <div className="md:col-span-1 border rounded p-4">
                            {workflow && (
                                <div>
                                    {Object.keys(fields).map((fieldName) => renderField(fieldName, fields[fieldName]))}
                                    {errors._form && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors._form}
                                        </div>
                                    )}
                                    <div className="mt-4 flex gap-2 justify-end p-4">
                                        {workflowIndex > 1 && (
                                            <Button variant="destructive" size="sm" type="button" onClick={() => handleAction('previous')}>
                                                {intl.formatMessage({ id: "previousStep" })}
                                            </Button>
                                        )}
                                        <Button size="sm" type="button" onClick={() => handleAction('save')}>
                                            {workflowIndex < totalSteps ? intl.formatMessage({ id: "saveAndContinue" }) : intl.formatMessage({ id: "completeWorkflow" })}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>

                    <div className="lg:col-span-2 rounded border p-4">
                        {renderPreview()}
                    </div>

                    {yearlyData && (
                        <div className="rounded border p-2">
                            <h4 className="text-md font-semibold mb-2">{intl.formatMessage({ id: "yearlyData" })}</h4>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {Object.keys(yearlyData[0]).map((header) => (
                                            <TableHead key={header} className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {intl.formatMessage({ id: header.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) })}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {yearlyData.map((data, rowIndex) => (
                                        <TableRow key={rowIndex}>
                                            {Object.values(data).map((value, cellIndex) => (
                                                <TableCell key={cellIndex} className="px-2 py-2 border whitespace-nowrap text-xs font-medium">
                                                    {value}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DynamicWorkflowForm;