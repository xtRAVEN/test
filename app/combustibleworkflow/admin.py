from django.contrib import admin
from django.core.exceptions import ValidationError
from .models import CombustibleWorkflow, CombustibleDocument

# class CombustibleDocumentInline(admin.TabularInline):
#     model = CombustibleDocument
#     extra = 1  # Number of empty forms to display

# class CombustibleWorkflowAdmin(admin.ModelAdmin):
#     list_display = ('parcel', 'state', 'creation_number', 'creation_date', 'service_number', 'service_date')
#     fieldsets = (
#         (None, {'fields': ('parcel', 'state')}),
#         ('Step 1', {'fields': ('creation_number', 'creation_date'), 'classes': ('collapse',)}),
#         ('Step 2', {'fields': ('service_number', 'service_date'), 'classes': ('collapse',)}),
#     )
#     inlines = [CombustibleDocumentInline]

#     def get_readonly_fields(self, request, obj=None):
#         if obj and obj.state == 'step_one':
#             return ('service_number', 'service_date')
#         elif obj and obj.state == 'step_two':
#             return ('creation_number', 'creation_date')
#         return self.readonly_fields

#     def save_model(self, request, obj, form, change):
#         # Prevent advancing state if required fields are not filled
#         if obj.state == 'step_two' and (not obj.creation_number or not obj.creation_date):
#             raise ValidationError("Creation number and creation date must be provided to advance to step_two.")
#         if obj.state == 'completed' and (not obj.service_number or not obj.service_date):
#             raise ValidationError("Service number and service date must be provided to complete the workflow.")

#         # Call the parent class's save_model method
#         super().save_model(request, obj, form, change)

# admin.site.register(CombustibleWorkflow, CombustibleWorkflowAdmin)
# admin.site.register(CombustibleDocument)


admin.site.register([CombustibleDocument,CombustibleWorkflow])