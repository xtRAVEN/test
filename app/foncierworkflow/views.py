from django.db import IntegrityError
from rest_framework.response import Response
from rest_framework import viewsets

from parcel.models import Parcel
from .models import FoncierDocument, FoncierWorkflow
from .serializers import FoncierDocumentSerializer, FoncierWorkflowSerializer
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from rest_framework import status

class FoncierWorkflowViewSet(viewsets.ViewSet):
    def retrieve(self, request, *args, **kwargs):
        parcel_id = kwargs.get('pk')  # Extract pk from kwargs
        workflow_id = request.query_params.get('parcelId')  # This is actually the workflow ID

        try:
            parcel = Parcel.objects.get(id=parcel_id)
            
            if workflow_id == '0' or workflow_id is None:
                # Create a new FoncierWorkflow if none exists
                workflow = FoncierWorkflow.objects.create(parcel=parcel, state=FoncierWorkflow.STEP_ONE)
            else:
                # Get the existing FoncierWorkflow instance
                workflow = get_object_or_404(FoncierWorkflow, pk=workflow_id, parcel=parcel)

            serializer = FoncierWorkflowSerializer(workflow)
            return Response({
                'workflow_id': workflow.id,
                'workflow': serializer.data,
                'fields': serializer.data.get('field_info', {})
            })

        except Parcel.DoesNotExist:
            return Response({'detail': 'Parcel not found.'}, status=status.HTTP_404_NOT_FOUND)
        except IntegrityError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        parcel_id = kwargs.get('pk')
        workflow_id = request.query_params.get('parcelId')  # This is actually the workflow ID
        
        try:
            parcel = Parcel.objects.get(pk=parcel_id)
            workflow = get_object_or_404(FoncierWorkflow, pk=workflow_id, parcel=parcel)
            
            action = request.data.get('action')
            if action == 'previous':
                workflow.step_previous()
                workflow.save()
                serializer = FoncierWorkflowSerializer(workflow)
                return Response(serializer.data)
            elif action == 'save':
                serializer = FoncierWorkflowSerializer(workflow, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    workflow.stepnext()
                    workflow.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'detail': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)

        except Parcel.DoesNotExist:
            return Response({'detail': 'Parcel not found.'}, status=status.HTTP_404_NOT_FOUND)
        except FoncierWorkflow.DoesNotExist:
            return Response({'detail': 'Workflow not found.'}, status=status.HTTP_404_NOT_FOUND)



class FoncierDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = FoncierDocumentSerializer

    # List documents by workflow and field_name (GET /documents/?workflow_id=1&field_name=example)
    def list(self, request):
        print("hhhhhh")
        workflow_id = request.query_params.get('workflow_id')
        field_name = request.query_params.get('field_name')


        if workflow_id and field_name:
            documents = FoncierDocument.objects.filter(workflow=workflow_id, document_type=field_name)
            serializer = self.get_serializer(documents, many=True)
            return Response(serializer.data)
        return Response({'error': 'Missing workflow_id or field_name'}, status=status.HTTP_400_BAD_REQUEST)

    # Upload a document (POST /documents/)
    def create(self, request):
        workflow_id = request.data.get('workflow_id')
        field_name = request.data.get('field_name')
        name = request.data.get('name')
        document = request.FILES.get('document')

        print(workflow_id)

        if not (workflow_id and field_name and name and document):
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        workflow = get_object_or_404(FoncierWorkflow, pk=workflow_id)
        FoncierDocument.objects.create(
            workflow=workflow,
            document=document,
            name=name,
            document_type=field_name
        )
        return Response({'status': 'Document uploaded'}, status=status.HTTP_201_CREATED)
    

    def destroy(self, request, pk=None):
        document = get_object_or_404(FoncierDocument, pk=pk)
        document.delete()
        return Response({'status': 'Document deleted'}, status=status.HTTP_204_NO_CONTENT)