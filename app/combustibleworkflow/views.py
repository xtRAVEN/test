from django.db import IntegrityError
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from parcel.models import Parcel
from .models import CombustibleDocument, CombustibleWorkflow
from .serializers import CombustibleDocumentSerializer, CombustibleWorkflowSerializer



class CombustibleWorkflowViewSet(viewsets.ViewSet):
    def retrieve(self, request, *args, **kwargs):
        parcel_id = kwargs.get('pk')  # Extract pk from kwargs
        workflow_id = request.query_params.get('parcelId')  # This is actually the workflow ID

        try:
            parcel = Parcel.objects.get(id=parcel_id)

            # Fetch or create a new CombustibleWorkflow instance associated with this parcel
            if workflow_id == '0' or workflow_id is None:
                workflow = CombustibleWorkflow.objects.create(parcel=parcel, state=CombustibleWorkflow.StateChoices.STEP_ONE)
            else:
                workflow = get_object_or_404(CombustibleWorkflow, id=workflow_id, parcel=parcel)

        except Parcel.DoesNotExist:
            return Response({'detail': 'Parcel not found.'}, status=status.HTTP_404_NOT_FOUND)
        except IntegrityError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CombustibleWorkflowSerializer(workflow)

        return Response({
            'workflow_id': workflow.id,
            'workflow': serializer.data,
            'fields': serializer.data.get('field_info', {})
        })

    def update(self, request, *args, **kwargs):
        parcel_id = kwargs.get('pk')
        workflow_id = request.query_params.get('parcelId')  # This is actually the workflow ID
        
        try:
            parcel = Parcel.objects.get(id=parcel_id)
            workflow = get_object_or_404(CombustibleWorkflow, id=workflow_id, parcel=parcel)

        except Parcel.DoesNotExist:
            return Response({'detail': 'Parcel not found.'}, status=status.HTTP_404_NOT_FOUND)
        except CombustibleWorkflow.DoesNotExist:
            return Response({'detail': 'Workflow not found.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')

        if action == 'previous':
            workflow.step_previous()
            workflow.save()
            serializer = CombustibleWorkflowSerializer(workflow)
            return Response(serializer.data)
        elif action == 'save':
            serializer = CombustibleWorkflowSerializer(workflow, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                workflow.step_next()
                workflow.save() 
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'detail': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)


class CombustibleDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = CombustibleDocumentSerializer

    def list(self, request):
        workflow_id = request.query_params.get('workflow_id')
        field_name = request.query_params.get('field_name')

        if workflow_id and field_name:
            print(workflow_id)
            documents = CombustibleDocument.objects.filter(workflow=workflow_id, document_type=field_name)
            print(documents)
            serializer = self.get_serializer(documents, many=True)
            return Response(serializer.data)
        return Response({'error': 'Missing workflow_id or field_name'}, status=status.HTTP_400_BAD_REQUEST)

    def create(self, request):
        workflow_id = request.data.get('workflow_id')
        field_name = request.data.get('field_name')
        name = request.data.get('name')
        document = request.FILES.get('document')


        if not (workflow_id and field_name and name and document):
            return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        workflow = get_object_or_404(CombustibleWorkflow, id=workflow_id)
        CombustibleDocument.objects.create(
            workflow=workflow,
            document=document,
            name=name,
            document_type=field_name
        )
        return Response({'status': 'Document uploaded'}, status=status.HTTP_201_CREATED)
    

    def destroy(self, request, pk=None):
        document = get_object_or_404(CombustibleDocument, pk=pk)
        document.delete()
        return Response({'status': 'Document deleted'}, status=status.HTTP_204_NO_CONTENT)

























