from django.contrib import admin
from .models import OccupationWorkflow,YearlyOccupationData,OccupationDocument



admin.site.register([OccupationWorkflow,YearlyOccupationData,OccupationDocument])

# class OccupationTemporaireWorkflowAdmin(admin.ModelAdmin):
#     list_display = ('parcel', 'year', 'step', 'montant_a_payer', 'occupation_order_document', 'payment_bulletin_document')
#     list_filter = ('parcel', 'step', 'date')
#     search_fields = ('parcel__name', 'step', 'date')
#     ordering = ('-date', 'parcel')
    
#     # Define fieldsets for step-wise organization
#     fieldsets = (
#          ('Details', {
#             'fields': ('parcel', 'date', 'step'),
#             'classes': ('collapse',),
#         }),
#         ('Step 1: Arrêté d\'occupation temporaire', {
#             'fields': ('occupation_order_document',),
#             'classes': ('collapse',),
#         }),
#         ('Step 2: Montant à payer', {
#             'fields': ('montant_a_payer', 'payment_bulletin_document'),
#             'classes': ('collapse',),
#         }),
       
#     )

#     def get_form(self, request, obj=None, **kwargs):
#         form = super().get_form(request, obj, **kwargs)
#         # Customize form fields based on the step
#         if obj:
#             if obj.step == OccupationTemporaireWorkflow.STEP_ONE:
#                 # Show fields relevant to step one only
#                 form.base_fields['montant_a_payer'].widget.attrs['readonly'] = True
#                 form.base_fields['payment_bulletin_document'].widget.attrs['readonly'] = True
#             elif obj.step == OccupationTemporaireWorkflow.STEP_TWO:
#                 # Show fields relevant to step two only
#                 form.base_fields['occupation_order_document'].widget.attrs['readonly'] = True
#         return form

#     def save_model(self, request, obj, form, change):
#         # Update step based on fields before saving
#         if obj.occupation_order_document and not obj.montant_a_payer:
#             obj.step = OccupationTemporaireWorkflow.STEP_ONE
#         elif obj.montant_a_payer and not obj.payment_bulletin_document:
#             obj.step = OccupationTemporaireWorkflow.STEP_TWO
#         else:
#             obj.step = OccupationTemporaireWorkflow.STEP_ONE  # Default step if conditions are not met

#         super().save_model(request, obj, form, change)

# admin.site.register(OccupationTemporaireWorkflow, OccupationTemporaireWorkflowAdmin)
