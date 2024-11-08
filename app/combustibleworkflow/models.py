from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

# Choices for urban/rural dropdown
class UrbanRuralChoices(models.TextChoices):
    URBAN = 'urban', _('Urban')
    RURAL = 'rural', _('Rural')

class CombustibleWorkflow(models.Model):
    # State choices
    class StateChoices(models.TextChoices):
        STEP_ONE = 'step_one', _('Step 1')
        STEP_TWO = 'step_two', _('Step 2')
        COMPLETED = 'completed', _('Completed')

    # New fields with translated verbose names
    company_name = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Company Name"))
    station_type = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Station Type"))
    urban_rural = models.CharField(max_length=10, choices=UrbanRuralChoices.choices, blank=True, null=True, verbose_name=_("Urban/Rural"))
    decision_number = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Decision Number"))
    decision_date = models.DateField(blank=True, null=True, verbose_name=_("Decision Date"))
    manager = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Manager"))
    status = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Status"))
    management_type = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Management Type"))

    parcel = models.ForeignKey('parcel.Parcel', on_delete=models.CASCADE, related_name="combustiblework", verbose_name=_("Parcel"))
    creation_number = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Creation Number"))
    creation_date = models.DateField(blank=True, null=True, verbose_name=_("Creation Date"))
    service_number = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Service Number"))
    service_date = models.DateField(blank=True, null=True, verbose_name=_("Service Date"))
    state = models.CharField(max_length=20, choices=StateChoices.choices, default=StateChoices.STEP_ONE, verbose_name=_("State"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    def step_previous(self):
        """ Transition to the previous step in the workflow. """
        if self.state == self.StateChoices.STEP_TWO:
            self.state = self.StateChoices.STEP_ONE
        elif self.state == self.StateChoices.COMPLETED:
            self.state = self.StateChoices.STEP_TWO
        else:
            raise ValueError(_("Cannot move to the previous step from the current state."))
        self.save()

    def step_next(self):
        """ Transition to the next step in the workflow. """
        if self.state == self.StateChoices.STEP_ONE:
            if not self.company_name or not self.station_type or not self.urban_rural or not self.decision_number or not self.decision_date:
                raise ValidationError(_("All fields for Step 1 must be provided to move to Step 2."))
            self.state = self.StateChoices.STEP_TWO
        elif self.state == self.StateChoices.STEP_TWO:
            if not self.service_number or not self.service_date:
                raise ValidationError(_("Service number and service date must be provided to mark as completed."))
            self.state = self.StateChoices.COMPLETED
        else:
            raise ValueError(_("Cannot move from the current state."))
        self.save()

    def get_fields_for_current_step(self):
        """ Return field names and their types for the current step. """
        step_fields = {
            self.StateChoices.STEP_ONE: {
                'company_name': 'text',
                'station_type': 'text',
                'urban_rural': 'dropdown',
                'decision_number': 'text',
                'decision_date': 'date',
                'manager': 'text',
                'status': 'text',
                'management_type': 'text',
                'combustible_creation': 'document'
            },
            self.StateChoices.STEP_TWO: {
                'service_number': 'text',
                'service_date': 'date',
                'mise_en_service': 'document'
            },
        }
        return step_fields.get(self.state, {})
    

    class Meta:
        verbose_name = _("Combustible Workflow")
        verbose_name_plural = _("Combustible Workflows")
    def __str__(self):
        return _("Workflow for Parcel {parcel_id} - {state}").format(parcel_id=self.parcel.id, state=self.get_state_display())
    

    

class CombustibleDocument(models.Model):
    # Document type choices
    class DocumentTypeChoices(models.TextChoices):
        STEP_ONE = 'combustible_creation', _('Combustible Creation')
        STEP_TWO = 'mise_en_service', _('Mise En Service')

    workflow = models.ForeignKey(CombustibleWorkflow, on_delete=models.CASCADE, related_name='documents', verbose_name=_("Workflow"))
    document = models.FileField(upload_to='combustible/documents/', verbose_name=_("Document"))
    name = models.CharField(max_length=255, verbose_name=_("Name"))
    document_type = models.CharField(max_length=20, choices=DocumentTypeChoices.choices, verbose_name=_("Document Type"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    
    class Meta:
        verbose_name = _("Combustible Document")
        verbose_name_plural = _("Combustible Documents")
    def __str__(self):
        return _("{name} ({document_type})").format(name=self.name, document_type=self.get_document_type_display())
