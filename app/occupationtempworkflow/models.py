from datetime import date
from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class OccupationWorkflow(models.Model):
    """ Workflow model to handle the occupation process through multiple steps. """
    
    class StateChoices(models.TextChoices):
        STEP_ONE = 'step_one', _('Step 1')
        STEP_TWO = 'step_two', _('Step 2')
        COMPLETED = 'completed', _('Completed')

    # Step 1 fields
    nature_occupation = models.CharField(max_length=255, verbose_name=_("Nature of Occupation"), null=True, blank=True)
    decision_number = models.CharField(max_length=255, verbose_name=_("Decision Number"), null=True, blank=True)
    decision_date = models.DateField(verbose_name=_("Decision Date"), null=True, blank=True)
    duration = models.PositiveIntegerField(verbose_name=_("Duration (years)"), null=True, blank=True)
    route_reference = models.CharField(max_length=255, verbose_name=_("Route Reference"), null=True, blank=True)

    # ForeignKey to Parcel model
    parcel = models.ForeignKey('parcel.Parcel', on_delete=models.CASCADE, related_name="occupationwork", verbose_name=_("Parcel"))

    # Workflow state
    state = models.CharField(max_length=20, choices=StateChoices.choices, default=StateChoices.STEP_ONE, verbose_name=_("State"))
    created_at = models.DateTimeField(auto_now_add=True)

    def step_next(self):
        """ Transition to the next step in the workflow. """
        if self.state == self.StateChoices.STEP_ONE:
            if not self.nature_occupation or not self.decision_number or not self.decision_date or not self.route_reference:
                raise ValidationError(_("All fields for Step 1 must be provided to proceed to Step 2."))
            self.state = self.StateChoices.STEP_TWO
        elif self.state == self.StateChoices.STEP_TWO:
            self.loop_yearly_documents_and_fields()
            self.state = self.StateChoices.COMPLETED
        else:
            raise ValueError(_("Cannot move from the current state."))
        self.save()

    def step_previous(self):
        """ Transition to the previous step in the workflow. """
        if self.state == self.StateChoices.STEP_TWO:
            self.state = self.StateChoices.STEP_ONE
        elif self.state == self.StateChoices.COMPLETED:
            self.state = self.StateChoices.STEP_TWO
        else:
            raise ValueError(_("Cannot move from the current state."))
        self.save()

    def get_fields_for_current_step(self):
        """ Return field names and their types for the current step in the workflow. """
        step_fields = {
            'step_one': {
                'nature_occupation': 'text',
                'decision_number': 'text',
                'decision_date': 'date',
                'duration': 'integer',
                'route_reference': 'text',
                'temporary_occupation_document': 'document',
            }
        }
        return step_fields.get(self.state, {})

    def loop_yearly_documents_and_fields(self):
        """ Check yearly documents and fields based on the created_at timestamp of Step 2 data. """
        step_two_data = self.yearly_data.all()
        # for yearly_data in step_two_data:
        #     if not yearly_data.payment_receipt_document:
        #         raise ValidationError(f"Payment receipt document for the year {yearly_data.created_at.year} must be uploaded.")
    class Meta:
        verbose_name = _("Occupation Workflow")
        verbose_name_plural = _("Occupation Workflows")

    def __str__(self):
        return f"Temporary Occupation for Parcel {self.parcel.id} - {self.get_state_display()}"

class YearlyOccupationData(models.Model):
    """ Stores yearly data for Step 2, including documents and fields. """
    
    workflow = models.ForeignKey(OccupationWorkflow, on_delete=models.CASCADE, related_name='yearly_data', verbose_name=_("Workflow"))
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True)

    area_occupation = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Occupation Area (sqm)"), null=True, blank=True)
    royalty_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("Royalty Amount"), null=True, blank=True)

    @property
    def state(self):
        return self.workflow.state

    def get_fields_for_current_step(self):
        """ Return field names and their types for the current step in the workflow. """
        step_fields = {
            'step_two': {
                'area_occupation': 'decimal',
                'royalty_amount': 'decimal',
                'payment_receipt_document': 'document',  # Document required for yearly loop
            },
        }
        return step_fields.get(self.workflow.state, {})
    class Meta:
        verbose_name = _("Yearly Occupation Data")
        verbose_name_plural = _("Yearly Occupation Data")
    
    
    def clean(self):
        """ Custom validation to ensure the workflow is within its duration. """
        decision_year = self.workflow.decision_date.year
        current_year = self.created_at.year

        if not (decision_year + 1 <= current_year <= decision_year + self.workflow.duration):
            raise ValidationError(_("The data year ({current_year}) must be between {decision_year + 1} and {decision_year + self.workflow.duration}.").format(current_year=current_year, decision_year=decision_year))

    def __str__(self):
        return f"Yearly Data for {self.workflow} - Year {self.created_at.year}"

class OccupationDocument(models.Model):
    """ Model to store documents related to each step of the workflow. """
    
    class DocumentTypeChoices(models.TextChoices):
        STEP_ONE = 'temporary_occupation_document', _('Step 1')
        STEP_TWO = 'payment_receipt_document', _('Step 2')

    workflow = models.ForeignKey(OccupationWorkflow, on_delete=models.CASCADE, related_name='documents', verbose_name=_("Workflow"))
    yearly_data = models.ForeignKey(YearlyOccupationData, on_delete=models.CASCADE, related_name='documents', verbose_name=_("Yearly Data"), null=True, blank=True)
    document = models.FileField(upload_to='occupation/documents/', verbose_name=_("Document"))
    name = models.CharField(max_length=255, verbose_name=_("Name"))
    document_type = models.CharField(max_length=30, choices=DocumentTypeChoices.choices, verbose_name=_("Document Type"))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))

    class Meta:
        verbose_name = _("Occupation Document")
        verbose_name_plural = _("Occupation Documents")

    def __str__(self):
        return f"{self.name} ({self.get_document_type_display()})"
