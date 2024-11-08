from django.contrib import admin
from .models import AutorisationUrbanismeWorkflow,Document


admin.site.register([AutorisationUrbanismeWorkflow,Document])




# class DocumentInline(admin.TabularInline):
#     model = Document
#     extra = 1
#     fields = ('name', 'document_type', 'document')
#     readonly_fields = ('created_at',)

# class AutorisationUrbanismeWorkflowAdmin(admin.ModelAdmin):
#     list_display = ('parcel', 'state')
#     list_filter = ('state',)
#     search_fields = ('parcel__name',)
#     inlines = [DocumentInline]

#     def get_queryset(self, request):
#         queryset = super().get_queryset(request)
#         # Optionally filter based on user permissions or other conditions
#         return queryset

#     def get_readonly_fields(self, request, obj=None):
#         if obj:
#             return ['parcel', 'state']
#         return super().get_readonly_fields(request, obj)

# class TNBAdmin(admin.ModelAdmin):
#     list_display = ('workflow', 'payment_amount', 'payment_date')
#     search_fields = ('workflow__parcel__name',)
#     list_filter = ('payment_date',)

#     def get_queryset(self, request):
#         queryset = super().get_queryset(request)
#         # Optionally filter based on user permissions or other conditions
#         return queryset

# class AutorisationDeConstruireAdmin(admin.ModelAdmin):
#     list_display = ('workflow', 'construction_authorization_number', 'construction_authorization_date', 'plan_authorized_document')
#     search_fields = ('workflow__parcel__name', 'construction_authorization_number')
#     list_filter = ('construction_authorization_date',)

#     def get_queryset(self, request):
#         queryset = super().get_queryset(request)
#         # Optionally filter based on user permissions or other conditions
#         return queryset

# class AttestationDeConformiteAdmin(admin.ModelAdmin):
#     list_display = ('workflow', 'compliance_certificate_number', 'compliance_certificate_date')
#     search_fields = ('workflow__parcel__name', 'compliance_certificate_number')
#     list_filter = ('compliance_certificate_date',)

#     def get_queryset(self, request):
#         queryset = super().get_queryset(request)
#         # Optionally filter based on user permissions or other conditions
#         return queryset
# admin.site.register(AutorisationDeConstruire, AutorisationDeConstruireAdmin)
# admin.site.register(AutorisationUrbanismeWorkflow, AutorisationUrbanismeWorkflowAdmin)
# admin.site.register(TNB, TNBAdmin)
# admin.site.register(AttestationDeConformite, AttestationDeConformiteAdmin)
