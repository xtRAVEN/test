from rest_framework import serializers
from .models import FoncierWorkflow,FoncierDocument


from rest_framework import serializers
from .models import FoncierWorkflow

class FoncierWorkflowSerializer(serializers.ModelSerializer):
    field_info = serializers.SerializerMethodField()

    class Meta:
        model = FoncierWorkflow
        fields = '__all__'

    def get_field_info(self, obj):
        """ Return detailed information about fields for the current step. """
        field_types = obj.get_fields_for_current_step()
        fields = {}

        # Get model field names
        model_field_names = [field.name for field in obj._meta.get_fields()]

        for field_name, field_type in field_types.items():
            if field_type == 'document':
                # Handle document fields separately
                fields[field_name] = {
                    'type': 'document',
                    'required': False,  # Adjust this based on whether the document field is required
                }
            else: 
                # Handle model fields
                field = obj._meta.get_field(field_name)
                fields[field_name] = {
                    'type': field.get_internal_type(),
                    'required': not field.blank,
                }
          
        return fields

    def validate(self, data):
        """ Validate required fields based on the current step. """
        instance = self.instance

        if not isinstance(instance, FoncierWorkflow):
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


class FoncierDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoncierDocument
        fields = ['id', 'workflow', 'document', 'name', 'document_type', 'created_at']
        read_only_fields = ['id', 'workflow', 'created_at']