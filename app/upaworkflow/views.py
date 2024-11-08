from django.db import IntegrityError
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from rest_framework import status
from .models import AutorisationUrbanismeWorkflow, Document
from .serializers import AutorisationUrbanismeWorkflowSerializer, DocumentSerializer
from parcel.models import Parcel  # Assuming you need to link with Parcel model





class AutorisationUrbanismeWorkflowViewSet(viewsets.ViewSet):
    def retrieve(self, request, *args, **kwargs):
        parcel_id = kwargs.get('pk')  # Extract pk from kwargs
        pk = request.query_params.get('parcelId')

    
        try:
            parcel = Parcel.objects.get(id=parcel_id)

            if pk == '0':
                workflow = AutorisationUrbanismeWorkflow.objects.create(parcel=parcel, state=AutorisationUrbanismeWorkflow.STEP_ONE)
            else:
            # Correctly handle get_or_create
                workflow = get_object_or_404(AutorisationUrbanismeWorkflow, id=pk,parcel=parcel)  # Get the first FoncierWorkflow instance if it exists

                # Create a new FoncierWorkflow if none exists
                

        except Parcel.DoesNotExist:
            return Response({'detail': 'Parcel not found.'}, status=status.HTTP_404_NOT_FOUND)
        except IntegrityError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = AutorisationUrbanismeWorkflowSerializer(workflow)
        
        return Response({
            'workflow_id': workflow.id,
            'workflow': serializer.data,
            'fields': serializer.data.get('field_info', {})
        })

    def update(self, request, *args, **kwargs):
        parcel_id = kwargs.get('pk')
        pk = request.query_params.get('parcelId')
        try:
            parcel = Parcel.objects.get(id=parcel_id)
            workflow = get_object_or_404(AutorisationUrbanismeWorkflow, id=pk,parcel=parcel)
            if not workflow:
                return Response({'detail': 'Workflow not found.'}, status=status.HTTP_404_NOT_FOUND)

        except Parcel.DoesNotExist:
            return Response({'detail': 'Parcel not found.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')

        if action == 'previous':
            workflow.step_previous()
            workflow.save()
            serializer = AutorisationUrbanismeWorkflowSerializer(workflow)
            return Response(serializer.data)
        elif action == 'save':
            serializer = AutorisationUrbanismeWorkflowSerializer(workflow, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                workflow.stepnext()
                workflow.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'detail': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer

    # List documents by workflow and document_type (GET /documents/?workflow_id=1&document_type=example)
    def list(self, request):
        workflow_id = request.query_params.get('workflow_id')
        document_type = request.query_params.get('field_name')
        print(document_type)

        if workflow_id and document_type:
            
            documents = Document.objects.filter(workflow=workflow_id, document_type=document_type)
            print(documents)
            serializer = self.get_serializer(documents, many=True)
            return Response(serializer.data)
        return Response({'error': 'Missing workflow_id or document_type'}, status=status.HTTP_400_BAD_REQUEST)

    # Upload a document (POST /documents/)
    def create(self, request):
        workflow_id = request.data.get('workflow_id')
        document_type = request.data.get('field_name')
        name = request.data.get('name')
        document = request.FILES.get('document')

        if not (workflow_id and document_type and name and document):
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            workflow = get_object_or_404(AutorisationUrbanismeWorkflow, pk=workflow_id)
            Document.objects.create(
                workflow=workflow,
                document=document,
                name=name,
                document_type=document_type
            )
            return Response({'status': 'Document uploaded'}, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # Delete a document (DELETE /documents/{pk}/)
    def destroy(self, request, pk=None):
        document = get_object_or_404(Document, pk=pk)
        document.delete()
        return Response({'status': 'Document deleted'}, status=status.HTTP_204_NO_CONTENT)
