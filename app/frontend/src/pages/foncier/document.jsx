import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/login/api';
import { XIcon, EyeIcon } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const DocumentManager = ({ workflowId, fieldName, onPreview }) => {
    const [documents, setDocuments] = useState([]);
    const [newDocument, setNewDocument] = useState(null);
    const [docName, setDocName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch documents when workflowId or fieldName changes
    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/foncier/documents/?workflow_id=${workflowId}&field_name=${fieldName}`);
                setDocuments(response.data);
            } catch (error) {
                setError("Error fetching documents.");
                console.error("Error fetching documents:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [workflowId, fieldName]);

    // Handle file selection and preview
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setNewDocument(file);
            // Create an object URL for the selected file
            const url = URL.createObjectURL(file);
            onPreview(url);
        }
    };

    // Handle document upload
    const handleDocumentUpload = async () => {
        if (!newDocument || !docName) {
            setError("Document and name are required.");
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('workflow_id', workflowId);
        formData.append('document', newDocument);
        formData.append('name', docName);
        formData.append('field_name', fieldName);

        try {
            await api.post(`/foncier/documents/`, formData, { timeout: 10000 });
            // Re-fetch documents to show the newly uploaded one
            const response = await api.get(`/foncier/documents/?workflow_id=${workflowId}&field_name=${fieldName}`);
            setDocuments(response.data);
            setNewDocument(null);
            setDocName('');
        } catch (error) {
            setError("Error uploading document.");
            console.error("Error uploading document:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle document deletion
    const handleDelete = async (docId) => {
        setLoading(true);
        try {
            await api.delete(`/foncier/documents/${docId}/`);
            const response = await api.get(`/foncier/documents/?workflow_id=${workflowId}&field_name=${fieldName}`);
            setDocuments(response.data);
        } catch (error) {
            setError("Error deleting document.");
            console.error("Error deleting document:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle document preview from existing documents
    const handleShow = async (docUrl) => {
        setLoading(true);
        try {
            const response = await api.get(docUrl, { responseType: 'blob' });
            const url = URL.createObjectURL(response.data);
            onPreview(url);
        } catch (error) {
            setError("Error fetching document for preview.");
            console.error("Error fetching document for preview:", error);
        } finally {
            setLoading(false);
        }
    };

    // Determine if the upload button should be enabled
    const isUploadButtonDisabled = !newDocument || !docName;

    return (
        <div>
            <Label>
                Documents for {fieldName.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
            </Label>
            
            <div className='my-2 flex gap-2 items-center'>
                <Input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="w-1/3" 
                    accept=".pdf,image/*" // Adjust as necessary
                />
                <Input 
                    type="text" 
                    value={docName}
                    placeholder="Document Name"
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-2/3"
                />
                <Button 
                    size="sm" 
                    onClick={handleDocumentUpload} 
                    disabled={isUploadButtonDisabled || loading}
                >
                    {loading ? "Uploading..." : "Upload"}
                </Button>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            {loading && <div>Loading...</div>}
            
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">Document Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan="3" className="text-center">No documents found</TableCell>
                        </TableRow>
                    ) : (
                        documents.map(doc => (
                            <TableRow key={doc.id}>
                                <TableCell className="font-medium">{doc.name}</TableCell>
                                <TableCell>{doc.status || 'Available'}</TableCell>
                                <TableCell className="text-right flex gap-2 justify-end">
                                    <EyeIcon 
                                        onClick={() => handleShow(doc.document)} 
                                        className="cursor-pointer"
                                    />
                                    <XIcon 
                                        onClick={() => handleDelete(doc.id)} 
                                        color="red" 
                                        className="cursor-pointer"
                                    />
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
