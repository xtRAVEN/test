from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _  # Import translation utility

# Define choices for document types
DOCUMENT_FIELD_CHOICES = [
    ('tnb_document', _('TNB')),  # Translated string
    ('plan_authorized_document', _('Plan autorisé')),  # Translated string
    ('attestation_document', _('Attestation de conformité')),  # Translated string
]

class AutorisationUrbanismeWorkflow(models.Model):
    STEP_ONE = 'step_one'
    STEP_TWO = 'step_two'
    STEP_THREE = 'step_three'
    COMPLETED = 'completed'

    STATE_CHOICES = [
        (STEP_ONE, _('Step One')),  # Translated string
        (STEP_TWO, _('Step Two')),  # Translated string
        (STEP_THREE, _('Step Three')),  # Translated string
        (COMPLETED, _('Completed')),  # Translated string
    ]

    # General Workflow Fields
    parcel = models.ForeignKey('parcel.Parcel', on_delete=models.CASCADE, related_name='upawork')
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default=STEP_ONE)

    # Fields for Step 1
    tnb_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_('Montant TNB'))  # Translated string
    tnb_payment_date = models.DateField(null=True, blank=True, verbose_name=_('Date de Paiement TNB'))  # Translated string

    # Fields for Step 2
    autorisation_number = models.CharField(max_length=250, null=True, blank=True, verbose_name=_('Numéro de Décision Autorisation'))  # Translated string
    autorisation_date = models.DateField(null=True, blank=True, verbose_name=_('Date de Décision Autorisation'))  # Translated string

    # Fields for Step 3
    attestation_number = models.CharField(max_length=250, null=True, blank=True, verbose_name=_('Numéro de Décision Attestation'))  # Translated string
    attestation_date = models.DateField(null=True, blank=True, verbose_name=_('Date de Décision Attestation'))  # Translated string

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Workflow for {self.parcel.name} - {self.get_state_display()}"

    def step_previous(self):
        """Transition to the previous step in the workflow."""
        if self.state == self.STEP_TWO:
            self.state = self.STEP_ONE
        elif self.state == self.STEP_THREE:
            self.state = self.STEP_TWO
        elif self.state == self.COMPLETED:
            self.state = self.STEP_THREE

    def stepnext(self):
        """Transition to the next step in the workflow."""
        if self.state == self.STEP_ONE:
            self.state = self.STEP_TWO
        elif self.state == self.STEP_TWO:
            self.state = self.STEP_THREE
        elif self.state == self.STEP_THREE:
            self.state = self.COMPLETED


    class Meta:
        verbose_name = _("Autorisation Urbanisme Workflow")
        verbose_name_plural = _("Autorisation Urbanisme Workflows")

    def save(self, *args, **kwargs):
        """Save the model and update the state."""
        super().save(*args, **kwargs)

    def get_fields_for_current_step(self):
        """Return field names and their types for the current step."""
        step_fields = {
            self.STEP_ONE: {
                'tnb_amount': 'decimal',
                'tnb_payment_date': 'date',
                'tnb_document': 'document'
            },
            self.STEP_TWO: {
                'autorisation_number': 'text',
                'autorisation_date': 'date',
                'plan_authorized_document': 'document'
            },
            self.STEP_THREE: {
                'attestation_number': 'text',
                'attestation_date': 'date',
                'attestation_document': 'document'
            },
        }

        # Return the fields and their types corresponding to the current step
        return step_fields.get(self.state, {})


class Document(models.Model):
    document = models.FileField(upload_to='urbanisme/documents/', verbose_name=_('Document'))  # Translated
    workflow = models.ForeignKey(
        AutorisationUrbanismeWorkflow, 
        on_delete=models.CASCADE, 
        related_name='documents', 
        verbose_name=_('Workflow')  # Translated
    )
    name = models.CharField(max_length=255, verbose_name=_('Name'))  # Translated
    document_type = models.CharField(
        max_length=255, 
        choices=DOCUMENT_FIELD_CHOICES, 
        verbose_name=_('Document Type')  # Translated
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))  # Translated


    class Meta:
        verbose_name = _("Urbanisme Document")
        verbose_name_plural = _("Urbanisme Documents")

    def __str__(self):
        return self.name