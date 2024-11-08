from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from parcel.models import Parcel
from .models import OccupationWorkflow, YearlyOccupationData, OccupationDocument
from .serializers import OccupationWorkflowSerializer, YearlyOccupationDataSerializer, OccupationDocumentSerializer, YearlyOccupationDataSerializertable
from datetime import timedelta
from django.utils import timezone

# Assuming current_date is defined
current_date = timezone.now()

from datetime import timedelta
from django.utils import timezone






class OccupationWorkflowViewSet(viewsets.ViewSet):
    def retrieve(self, request, *args, **kwargs):
        parcel_id = kwargs.get('pk')  # Extract pk from kwargs
        pk = request.query_params.get('parcelId')
        
        current_date = timezone.now()  # Use Django's timezone-aware current date

        try:
            parcel = Parcel.objects.get(id=parcel_id)


            if pk == '0':
                workflow = OccupationWorkflow.objects.create(parcel=parcel, state=OccupationWorkflow.StateChoices.STEP_ONE)

            else:
                workflow = get_object_or_404(OccupationWorkflow, id=pk,parcel=parcel)  # Get the first OccupationWorkflow instance if it exists
                

        except Parcel.DoesNotExist:
            return Response({'detail': 'Parcel not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Workflow is in STEP_TWO state
        if workflow.state == workflow.StateChoices.STEP_TWO:
            yearly_data_exists = workflow.yearly_data.exists()
            
            # Check if yearly data exists and is one year old
            if yearly_data_exists:
                latest_yearly_data = workflow.yearly_data.latest('updated_at')
                
                # Convert to timezone-aware if it is timezone-naive
                if latest_yearly_data.updated_at.tzinfo is None:
                    latest_yearly_data.updated_at = timezone.make_aware(
                        latest_yearly_data.updated_at, timezone.get_current_timezone()
                    )

                # Check if the data is more than a year old
                is_one_year_old = (current_date - latest_yearly_data.updated_at) >= timedelta(days=365)
                if is_one_year_old:
                    data = YearlyOccupationData.objects.create(workflow=workflow)
                else:
                    data = latest_yearly_data
            else:
                data = YearlyOccupationData.objects.create(workflow=workflow)

            # Fetch all YearlyOccupationData instances related to the workflow
            all_yearly_data = workflow.yearly_data.all()
            serializer_table = YearlyOccupationDataSerializertable(all_yearly_data, many=True)
            serializer = YearlyOccupationDataSerializer(data)
            year_id = data.id

            # Add 'state' to the serialized data by creating a new dictionary
            serialized_data_with_state = serializer.data.copy()
            serialized_data_with_state['state'] = data.state

            return Response({
                'workflow_id': workflow.id,
                'year_id': year_id,
                'workflow': serialized_data_with_state,
                'fields': serialized_data_with_state.get('field_info', {}),
                'all_yearly_data': serializer_table.data,  # Return all past YearlyOccupationData
            })
        else:
            # If workflow is not in STEP_TWO, return the workflow details
            serializer = OccupationWorkflowSerializer(workflow)
            return Response({
                'workflow_id': workflow.id,
                'workflow': serializer.data,
                'fields': serializer.data.get('field_info', {}),
            })


    def update(self, request, *args, **kwargs):
        parcel_id = kwargs.get('pk')
        pk = request.query_params.get('parcelId')
        try:
            parcel = Parcel.objects.get(id=parcel_id)
            workflow = get_object_or_404(OccupationWorkflow, id=pk,parcel=parcel)  # Get the first OccupationWorkflow instance if it exists
            if not workflow:
                return Response({'detail': 'Workflow not found.'}, status=status.HTTP_404_NOT_FOUND)

        except Parcel.DoesNotExist:
            return Response({'detail': 'Parcel not found.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')

        if action == 'previous':
            workflow.step_previous()
            workflow.save()

        elif action == 'save':
            if workflow.state == OccupationWorkflow.StateChoices.STEP_TWO:
                workflow_data = workflow.yearly_data.latest('created_at')
                serializer = YearlyOccupationDataSerializer(workflow_data, data=request.data, partial=True)
            else:
                serializer = OccupationWorkflowSerializer(workflow, data=request.data, partial=True)
            print(serializer)
            if serializer.is_valid():
                serializer.save()
                workflow.step_next()  # Move to the next step
                workflow.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({'detail': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)

        # In case of 'previous' action, return the updated state
        if workflow.state == OccupationWorkflow.StateChoices.STEP_TWO:
            workflow_data = workflow.yearly_data.latest('created_at')
            serializer = YearlyOccupationDataSerializer(workflow_data)
        else:
            serializer = OccupationWorkflowSerializer(workflow)

        return Response(serializer.data)


# class YearlyOccupationDataViewSet(viewsets.ModelViewSet):
#     queryset = YearlyOccupationData.objects.all()
#     serializer_class = YearlyOccupationDataSerializer

#     def create(self, request, *args, **kwargs):
#         workflow_id = request.data.get('workflow')
#         if not workflow_id:
#             return Response({'error': 'Workflow ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
#         workflow = get_object_or_404(OccupationWorkflow, pk=workflow_id)
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         serializer.save(workflow=workflow)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)

#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
#         serializer.is_valid(raise_exception=True)
#         serializer.save()
#         return Response(serializer.data)

#     def destroy(self, request, *args, **kwargs):
#         instance = self.get_object()
#         instance.delete()
#         return Response({'status': 'Yearly data deleted'}, status=status.HTTP_204_NO_CONTENT)

class OccupationDocumentViewSet(viewsets.ModelViewSet):
    queryset = OccupationDocument.objects.all()
    serializer_class = OccupationDocumentSerializer

    def list(self, request):
        """
        List documents by workflow, document_type, and optionally by occ_year.
        """
        workflow_id = request.query_params.get('workflow_id')
        document_type = request.query_params.get('field_name')  # Use document_type to match model field
        occ_year = request.query_params.get('occ_year')

        if occ_year != 'null':
            print(occ_year)
            try:
                yearly_data = YearlyOccupationData.objects.get(id=occ_year)
                print(yearly_data,"jjdjdjdjdj")
                documents = OccupationDocument.objects.filter(workflow=workflow_id, document_type=document_type, yearly_data=yearly_data)
            except YearlyOccupationData.DoesNotExist:
                return Response({'error': 'No yearly data found for the specified year.'}, status=status.HTTP_404_NOT_FOUND)
        elif workflow_id and document_type:
            documents = OccupationDocument.objects.filter(workflow=workflow_id, document_type=document_type)
        else:
            return Response({'error': 'Missing workflow_id or document_type'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Upload a new document, optionally linking to a specific occ_year.
        """
        workflow_id = request.data.get('workflow_id')
        document_type = request.data.get('field_name')  # Use document_type to match model field
        name = request.data.get('name')
        document = request.FILES.get('document')
        occ_year = request.data.get('occ_year')

        # Check if all required fields are present
        if not all([workflow_id, document_type, name, document]):
            return Response({'error': 'workflow_id, document_type, name, and document are required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        workflow = get_object_or_404(OccupationWorkflow, pk=workflow_id)
        
        # Handle optional yearly data if occ_year is provided
        if occ_year != 'null':
            try:
                yearly_data = YearlyOccupationData.objects.get(id=occ_year)
            except YearlyOccupationData.DoesNotExist:
                return Response({'error': f'Yearly data for year {occ_year} not found.'}, status=status.HTTP_404_NOT_FOUND)

            document_instance = OccupationDocument.objects.create(
                workflow=workflow,
                document=document,
                name=name,
                document_type=document_type,
                yearly_data=yearly_data
            )
        else:
            document_instance = OccupationDocument.objects.create(
                workflow=workflow,
                document=document,
                name=name,
                document_type=document_type
            )

        serializer = self.get_serializer(document_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        """
        Delete a document by its primary key.
        """
        document = get_object_or_404(OccupationDocument, pk=pk)
        document.delete()
        return Response({'status': 'Document deleted'}, status=status.HTTP_204_NO_CONTENT)
