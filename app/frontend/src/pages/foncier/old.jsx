import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/login/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import DocumentManager from './document'; // Adjust path as necessary

const FoncierWorkflowForm = () => {
    const { id } = useParams();
    const [workflow, setWorkflow] = useState(null);
    const [fields, setFields] = useState({});
    const [workflowId, setWorkflowId] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [errors, setErrors] = useState({});
    const totalSteps = 7;

    const stepMapping = {
        step_one: 1,
        step_two: 2,
        step_three: 3,
        step_four: 4,
        step_five: 5,
        step_six: 6,
        step_seven: 7,
    };

    const workflowIndex = workflow ? stepMapping[workflow.state.toLowerCase()] || 1 : 1;
    const currentPreviewUrlRef = useRef(null);

    useEffect(() => {
        const fetchWorkflowData = async () => {
            try {
                const response = await api.get(`/foncier/workflows/${id}/`);
                setWorkflow(response.data.workflow);
                setFields(response.data.fields);
                setWorkflowId(response.data.workflow_id);
            } catch (error) {
                console.error("Error fetching workflow data:", error);
            }
        };

        fetchWorkflowData();
    }, [id]);

    const handleAction = async (action) => {
        try {
            const formData = new FormData(document.querySelector('form'));
            const formObject = Object.fromEntries(formData.entries());
            const payload = {
                ...formObject,
                action,
            };

            await api.put(`/foncier/workflows/${id}/`, payload);

            const response = await api.get(`/foncier/workflows/${id}/`);
            setWorkflow(response.data.workflow);
            setFields(response.data.fields);
            setErrors({});
        } catch (error) {
            if (error.response) {
                setErrors(error.response.data);
            } else {
                console.error(`Error ${action === 'previous' ? 'moving to previous step' : 'updating workflow'}:`, error.message);
            }
        }
    };

    const handlePreview = (url) => {
        if (currentPreviewUrlRef.current && currentPreviewUrlRef.current.startsWith('blob:')) {
            URL.revokeObjectURL(currentPreviewUrlRef.current);
        }

        setPreviewUrl(url);
        currentPreviewUrlRef.current = url;
    };

    useEffect(() => {
        return () => {
            if (currentPreviewUrlRef.current && currentPreviewUrlRef.current.startsWith('blob:')) {
                URL.revokeObjectURL(currentPreviewUrlRef.current);
            }
        };
    }, []);

    const renderField = (fieldName, fieldInfo) => {
        const { type, required } = fieldInfo;

        return (
            <div key={fieldName}>
                <Label htmlFor={fieldName}>
                    {fieldName.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                </Label>
                <Input
                    className={`mt-2 ${errors[fieldName] ? 'border-red-500' : ''}`}
                    type={type === 'DecimalField' ? 'number' : 'text'}
                    id={fieldName}
                    name={fieldName}
                    step={type === 'DecimalField' ? '0.01' : undefined}
                    defaultValue={workflow ? workflow[fieldName] : ''}
                    aria-invalid={errors[fieldName] ? 'true' : 'false'}
                />
                {errors[fieldName] && (
                    <div className="text-red-500 text-sm mt-1">
                        {errors[fieldName].join(', ')}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="p-4">
                <h3 className="scroll-m-20 text-bg md:text-xl lg:text-xl font-semibold tracking-tight">
                    Foncier Workflow ({workflowIndex} / {totalSteps})
                </h3>
            </div>
            <div className="flex items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                    <form className="w-full h-full">
                        <div className="md:col-span-1 border border-dashed rounded p-4">
                            {workflow && (
                                <div>
                                    {Object.keys(fields).map((fieldName) => (
                                        <div key={fieldName}>
                                            {renderField(fieldName, fields[fieldName])}
                                            <DocumentManager
                                                workflowId={workflowId}
                                                fieldName={fieldName}
                                                onPreview={handlePreview}
                                            />
                                        </div>
                                    ))}
                                    <div className="mt-4 flex gap-2 justify-end p-4">
                                        <Button variant="destructive" size="sm" type="button" onClick={() => handleAction('previous')}>
                                            Previous Step
                                        </Button>
                                        <Button size="sm" type="button" onClick={() => handleAction('save')}>
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>

                    <div className="col-span-2 rounded border border-dashed p-4">
                        {previewUrl ? (
                            <div className="border border-gray-300 rounded p-4">
                                <h4 className="text-lg font-semibold mb-2">Document Preview</h4>
                                <iframe 
                                    src={previewUrl} 
                                    className="w-full h-[500px]" 
                                    title="Document Preview"
                                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                ></iframe>
                            </div>
                        ) : (
                            <div className="text-center">No document preview available</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default FoncierWorkflowForm;
