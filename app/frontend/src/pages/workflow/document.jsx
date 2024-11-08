import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/login/api';
import { XIcon, EyeIcon } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { renderAsync } from 'docx-preview';
import { intl } from '@/i18n';

const DocumentManager = ({ workflowId, fieldName, type, year_id = null, onPreview }) => {
    const [documents, setDocuments] = useState([]);
    const [newDocument, setNewDocument] = useState(null);
    const [docName, setDocName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedParcelId, setSelectedParcelId] = useState();
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/${type}/documents/?workflow_id=${workflowId}&field_name=${fieldName}&occ_year=${year_id}`);
                setDocuments(response.data);
            } catch (error) {
                setError(intl.formatMessage({ id: "errorFetchingDocuments" }));
                console.error(intl.formatMessage({ id: "errorFetchingDocuments" }), error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [workflowId, fieldName, type, year_id]);

    const handleFileChange = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            setNewDocument(file);
            setDocName(file.name);
            
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
            
            handlePreview(fileUrl, file.type, true);
        }
    }, []);

    const handlePreview = async (url, fileType) => {
        if (fileType === 'application/pdf') {
            onPreview({
                type: 'pdf',
                url: url,
            });
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            try {
                const arrayBuffer = await fetch(url).then(res => res.arrayBuffer());
                const container = document.createElement('div');
                await renderAsync(arrayBuffer, container);
                onPreview({
                    type: 'docx',
                    content: container.innerHTML,
                });
            } catch (error) {
                console.error(intl.formatMessage({ id: "errorPreviewingDOCX" }), error);
                setError(intl.formatMessage({ id: "errorPreviewingDOCXFile" }));
            }
        }
    };

    const handleShow = async (docUrl, docName) => {
        setLoading(true);
        try {
            const response = await api.get(docUrl, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = URL.createObjectURL(blob);
            handlePreview(url, blob.type);
        } catch (error) {
            setError(intl.formatMessage({ id: "errorFetchingDocumentForPreview" }));
            console.error(intl.formatMessage({ id: "errorFetchingDocumentForPreview" }), error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleDocumentUpload = async () => {
        if (!newDocument || !docName) {
            setError(intl.formatMessage({ id: "documentAndNameRequired" }));
            return;
        }

        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('workflow_id', workflowId);
        formData.append('document', newDocument);
        formData.append('name', docName);
        formData.append('field_name', fieldName);
        formData.append('occ_year', year_id);

        try {
            await api.post(`/${type}/documents/`, formData, { timeout: 10000 });
            const response = await api.get(`/${type}/documents/?workflow_id=${workflowId}&field_name=${fieldName}&occ_year=${year_id}`);
            setDocuments(response.data);
            setNewDocument(null);
            setDocName('');
            setPreviewUrl(null);
        } catch (error) {
            setError(intl.formatMessage({ id: "errorUploadingDocument" }));
            console.error(intl.formatMessage({ id: "errorUploadingDocument" }), error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (docId) => {
        setLoading(true);
        try {
            await api.delete(`/${type}/documents/${docId}/`);
            const response = await api.get(`/${type}/documents/?workflow_id=${workflowId}&field_name=${fieldName}&occ_year=${year_id}`);
            setDocuments(response.data);
        } catch (error) {
            setError(intl.formatMessage({ id: "errorDeletingDocument" }));
            console.error(intl.formatMessage({ id: "errorDeletingDocument" }), error);
        } finally {
            setLoading(false);
        }
    };

    const isUploadButtonDisabled = !newDocument || !docName;

    return (
        <div>
            <Label>
  {intl.formatMessage(
    { id: "documentsFor" },
    {
      fieldName: intl.formatMessage(
        { id: fieldName },
        {
          defaultMessage: fieldName
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase())
        }
      )
    }
  )}
</Label>

            
            <div className='my-2 flex gap-2 items-center'>
                <Input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="w-1/3 placeholder-white"
                    accept=".pdf,.docx"
                />
                <Input 
                    type="text" 
                    value={docName}
                    placeholder={intl.formatMessage({ id: "documentName" })}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-2/3"
                />
                <Button 
                    size="sm" 
                    onClick={handleDocumentUpload} 
                    disabled={isUploadButtonDisabled || loading}
                >
                    {loading ? intl.formatMessage({ id: "uploading" }) : intl.formatMessage({ id: "upload" })}
                </Button>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            {loading && <div>{intl.formatMessage({ id: "loading" })}</div>}
            
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">{intl.formatMessage({ id: "documentName" })}</TableHead>
                        <TableHead>{intl.formatMessage({ id: "status" })}</TableHead>
                        <TableHead className="text-right">{intl.formatMessage({ id: "actions" })}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan="3" className="text-center">{intl.formatMessage({ id: "noDocumentsFound" })}</TableCell>
                        </TableRow>
                    ) : (
                        documents.map(doc => (
                            <TableRow key={doc.id}>
                                <TableCell className="font-medium">{doc.name}</TableCell>
                                <TableCell>{doc.status || intl.formatMessage({ id: "available" })}</TableCell>
                                <TableCell className="text-right flex gap-2 justify-end">
                                    <EyeIcon 
                                        onClick={() => handleShow(doc.document, doc.name)} 
                                        className="cursor-pointer"
                                    />
                                    <div className="cursor-pointer">
                                        <AlertDialog>
                                            <AlertDialogTrigger
                                                onClick={() => setSelectedParcelId(doc.id)}
                                            >
                                                <XIcon />
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{intl.formatMessage({ id: "areYouAbsolutelySure" })}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {intl.formatMessage({ id: "deleteDocumentWarning" })}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{intl.formatMessage({ id: "cancel" })}</AlertDialogCancel>
                                                    <AlertDialogAction className="bg-red-500 hover:bg-red-600 dark:text-white"
                                                        onClick={() => handleDelete(selectedParcelId)}
                                                    >
                                                        {intl.formatMessage({ id: "delete" })}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default DocumentManager;