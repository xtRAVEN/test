from django.contrib import admin
from .models import FoncierWorkflow, FoncierDocument


admin.site.register([FoncierWorkflow,FoncierDocument])

# class FoncierDocumentInline(admin.TabularInline):
#     model = FoncierDocument
#     extra = 1  # Number of empty forms to display

# class FoncierWorkflowAdmin(admin.ModelAdmin):
#     list_display = (
#         'parcel', 'state', 'sale_order', 'cahier_de_charges', 'payment_bulletin', 
#         'payment_amount', 'attestation_de_morceler', 'technical_dossier', 
#         'notaire', 'property_certificate', 'cadastral_plan', 
#         'containment_calculation', 'quitus'
#     )
    
#     fieldsets = (
#         (None, {'fields': ('parcel', 'state')}),
#         ('Step 1', {'fields': ('sale_order', 'cahier_de_charges'), 'classes': ('collapse',)}),
#         ('Step 2', {'fields': ('payment_bulletin', 'payment_amount'), 'classes': ('collapse',)}),
#         ('Step 3', {'fields': ('attestation_de_morceler',), 'classes': ('collapse',)}),
#         ('Step 4', {'fields': ('technical_dossier',), 'classes': ('collapse',)}),
#         ('Step 5', {'fields': ('notaire',), 'classes': ('collapse',)}),
#         ('Step 6', {'fields': ('property_certificate', 'cadastral_plan', 'containment_calculation'), 'classes': ('collapse',)}),
#         ('Step 7', {'fields': ('quitus',), 'classes': ('collapse',)}),
#     )
#     inlines = [FoncierDocumentInline]

#     def get_readonly_fields(self, request, obj=None):
#         if obj:
#             state = obj.state
#             # Set fields as readonly based on the workflow state
#             if state == FoncierWorkflow.STEP_ONE:
#                 return ('payment_bulletin', 'payment_amount', 'attestation_de_morceler', 
#                         'technical_dossier', 'notaire', 'property_certificate', 
#                         'cadastral_plan', 'containment_calculation', 'quitus')
#             elif state == FoncierWorkflow.STEP_TWO:
#                 return ('sale_order', 'cahier_de_charges', 'attestation_de_morceler', 
#                         'technical_dossier', 'notaire', 'property_certificate', 
#                         'cadastral_plan', 'containment_calculation', 'quitus')
#             elif state == FoncierWorkflow.STEP_THREE:
#                 return ('sale_order', 'cahier_de_charges', 'payment_bulletin', 
#                         'payment_amount', 'technical_dossier', 'notaire', 
#                         'property_certificate', 'cadastral_plan', 'containment_calculation', 
#                         'quitus')
#             elif state == FoncierWorkflow.STEP_FOUR:
#                 return ('sale_order', 'cahier_de_charges', 'payment_bulletin', 
#                         'payment_amount', 'attestation_de_morceler', 'notaire', 
#                         'property_certificate', 'cadastral_plan', 'containment_calculation', 
#                         'quitus')
#             elif state == FoncierWorkflow.STEP_FIVE:
#                 return ('sale_order', 'cahier_de_charges', 'payment_bulletin', 
#                         'payment_amount', 'attestation_de_morceler', 
#                         'technical_dossier', 'property_certificate', 
#                         'cadastral_plan', 'containment_calculation', 'quitus')
#             elif state == FoncierWorkflow.STEP_SIX:
#                 return ('sale_order', 'cahier_de_charges', 'payment_bulletin', 
#                         'payment_amount', 'attestation_de_morceler', 
#                         'technical_dossier', 'notaire', 
#                         'cadastral_plan', 'containment_calculation', 'quitus')
#             elif state == FoncierWorkflow.STEP_SEVEN:
#                 return ('sale_order', 'cahier_de_charges', 'payment_bulletin', 
#                         'payment_amount', 'attestation_de_morceler', 
#                         'technical_dossier', 'notaire', 
#                         'property_certificate', 'cadastral_plan', 
#                         'containment_calculation')
#             elif state == FoncierWorkflow.COMPLETED:
#                 return ('sale_order', 'cahier_de_charges', 'payment_bulletin', 
#                         'payment_amount', 'attestation_de_morceler', 
#                         'technical_dossier', 'notaire', 
#                         'property_certificate', 'cadastral_plan', 
#                         'containment_calculation')
#         return self.readonly_fields

#     def save_model(self, request, obj, form, change):
#         if obj.state == FoncierWorkflow.COMPLETED and not any([
#             obj.sale_order, obj.cahier_de_charges, obj.payment_bulletin, 
#             obj.payment_amount, obj.attestation_de_morceler, obj.technical_dossier, 
#             obj.notaire, obj.property_certificate, obj.cadastral_plan, 
#             obj.containment_calculation, obj.quitus]):
#             raise ValidationError("All fields must be filled to mark the workflow as completed.")
#         super().save_model(request, obj, form, change)

# admin.site.register(FoncierWorkflow, FoncierWorkflowAdmin)
# admin.site.register(FoncierDocument)
