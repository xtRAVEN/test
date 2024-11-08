from rest_framework import serializers
from .models import OccupationWorkflow, YearlyOccupationData, OccupationDocument

class OccupationWorkflowSerializer(serializers.ModelSerializer):
    field_info = serializers.SerializerMethodField()

    class Meta:
        model = OccupationWorkflow
        fields = '__all__'

    def get_field_info(self, obj):
        """ Return detailed information about fields for the current step. """
        field_types = obj.get_fields_for_current_step()
        fields = {}

        model_field_names = [field.name for field in obj._meta.get_fields()]

        for field_name, field_type in field_types.items():
            if field_type == 'document':
                fields[field_name] = {
                    'type': 'document',
                    'required': False,  # Adjust this based on whether the document field is required
                }
            else:
                field = obj._meta.get_field(field_name)
                fields[field_name] = {
                    'type': field.get_internal_type(),
                    'required': not field.blank,
                }

        return fields

    def validate(self, data):
        """ Validate required fields based on the current step. """
        instance = self.instance

        if not isinstance(instance, OccupationWorkflow):
            raise serializers.ValidationError('Instance is not of type FoncierWorkflow.')

        required_fields = instance.get_fields_for_current_step() if instance else []

        # Get model fields for validation
        model_fields = [field.name for field in self.Meta.model._meta.get_fields()]
        valid_required_fields = [field for field in required_fields if field in model_fields]

        # Validate required fields that are part of the model
        errors = {}
        for field_name in valid_required_fields:
            if field_name not in data or not data[field_name]:
                errors[field_name] = 'This field is required.'

        if errors:
            raise serializers.ValidationError(errors)

        return data
    


from datetime import timedelta

class YearlyOccupationDataSerializer(serializers.ModelSerializer):
    field_info = serializers.SerializerMethodField()

    class Meta:
        model = YearlyOccupationData
        fields = '__all__'

    def get_field_info(self, obj):
        """ Return detailed information about fields for the current step. """
        field_types = obj.get_fields_for_current_step()
        fields = {}

        model_field_names = [field.name for field in obj._meta.get_fields()]

        for field_name, field_type in field_types.items():
            if field_type == 'document':
                fields[field_name] = {
                    'type': 'document',
                    'required': False,  # Adjust this based on whether the document field is required
                }
            else:
                field = obj._meta.get_field(field_name)
                fields[field_name] = {
                    'type': field.get_internal_type(),
                    'required': not field.blank,
                }

        return fields

    def validate(self, data):
        """ Validate required fields based on the current step. """
        instance = self.instance

        if not isinstance(instance, YearlyOccupationData):
            raise serializers.ValidationError('Instance is not of type FoncierWorkflow.')

        required_fields = instance.get_fields_for_current_step() if instance else []

        # Get model fields for validation
        model_fields = [field.name for field in self.Meta.model._meta.get_fields()]
        valid_required_fields = [field for field in required_fields if field in model_fields]

        # Validate required fields that are part of the model
        errors = {}
        for field_name in valid_required_fields:
            if field_name not in data or not data[field_name]:
                errors[field_name] = 'This field is required.'

        if errors:
            raise serializers.ValidationError(errors)

        return data
from django.utils.dateformat import format

class YearlyOccupationDataSerializertable(serializers.ModelSerializer):
    created = serializers.SerializerMethodField()

    class Meta:
        model = YearlyOccupationData
        fields = [
            'area_occupation',
            'royalty_amount',
            'created',  # Replacing updated_at with created_as
        ]

    def get_created(self, obj):
        # Format the updated_at field to 'd F Y' (e.g., 13 September 2024)
        return format(obj.updated_at, 'd F Y') if obj.updated_at else None



class OccupationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OccupationDocument
        fields = ['id', 'workflow', 'document', 'name', 'document_type', 'created_at']
        read_only_fields = ['id', 'workflow', 'created_at']
