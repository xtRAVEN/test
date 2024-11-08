from django.db import models
from django.utils.translation import gettext as _
from parcel.models import Parcel

# Define choices for Foncier document fields
FONCIER_FIELD_CHOICES = [
    ('cahier_de_charges', _('Cahier de charges')),
    ('payment_document', _('Paiement')),
    ('attestation_of_split', _('Attestation de morceler')),
    ('technical_dossier', _('Dossier technique')),
    ('notary', _('Notaire')),
    ('property_certificate', _('Certificat de propriété')),
    ('cadastral_plan', _('Plan cadastral')),
    ('containment_calculation', _('Calcul de contenance')),
    ('quitus', _('Quitus')),
]

class FoncierWorkflow(models.Model):
    STEP_ONE = 'step_one'
    STEP_TWO = 'step_two'
    STEP_THREE = 'step_three'
    STEP_FOUR = 'step_four'
    STEP_FIVE = 'step_five'
    STEP_SIX = 'step_six'
    STEP_SEVEN = 'step_seven'
    COMPLETED = 'completed'

    STATE_CHOICES = [
        (STEP_ONE, _('Step One')),
        (STEP_TWO, _('Step Two')),
        (STEP_THREE, _('Step Three')),
        (STEP_FOUR, _('Step Four')),
        (STEP_FIVE, _('Step Five')),
        (STEP_SIX, _('Step Six')),
        (STEP_SEVEN, _('Step Seven')),
        (COMPLETED, _('Completed')),
    ]

    parcel = models.OneToOneField(Parcel, on_delete=models.CASCADE, related_name='foncier', verbose_name=_('Parcel'))
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default=STEP_ONE, verbose_name=_('Workflow State'))

    # Step 1 fields
    nature_du_projet = models.TextField(null=True, blank=True, verbose_name=_('Nature du Projet'))
    prix_m2 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_('Prix/m²'))
    prix_total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name=_('Prix Total'))
    proprietaire = models.CharField(max_length=255, null=True, blank=True, verbose_name=_('Propriétaire'))

    # Step 2 fields
    date_de_paiement = models.DateField(null=True, blank=True, verbose_name=_('Date de Paiement'))
    paiement_montant = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_('Montant du Paiement'))

    # Step 6 fields
    numero_de_titre = models.CharField(max_length=255, null=True, blank=True, verbose_name=_('Numéro de Titre'))

    created_at = models.DateTimeField(auto_now_add=True)

    def step_previous(self):
        """ Transition to the previous step in the workflow. """
        if self.state == self.STEP_TWO:
            self.state = self.STEP_ONE
        elif self.state == self.STEP_THREE:
            self.state = self.STEP_TWO
        elif self.state == self.STEP_FOUR:
            self.state = self.STEP_THREE
        elif self.state == self.STEP_FIVE:
            self.state = self.STEP_FOUR
        elif self.state == self.STEP_SIX:
            self.state = self.STEP_FIVE
        elif self.state == self.STEP_SEVEN:
            self.state = self.STEP_SIX
        elif self.state == self.COMPLETED:
            self.state = self.STEP_SEVEN

    def stepnext(self):
        """ Transition to the next step in the workflow. """
        if self.state == self.STEP_ONE:
            self.state = self.STEP_TWO
        elif self.state == self.STEP_TWO:
            self.state = self.STEP_THREE
        elif self.state == self.STEP_THREE:
            self.state = self.STEP_FOUR
        elif self.state == self.STEP_FOUR:
            self.state = self.STEP_FIVE
        elif self.state == self.STEP_FIVE:
            self.state = self.STEP_SIX
        elif self.state == self.STEP_SIX:
            self.state = self.STEP_SEVEN
        elif self.state == self.STEP_SEVEN:
            self.state = self.COMPLETED

    def save(self, *args, **kwargs):
        """ Save the model and update the state. """
        super().save(*args, **kwargs)

    def get_fields_for_current_step(self):
        """ Return field names and their types for the current step. """
        step_fields = {
        'step_one': {
            'nature_du_projet': 'text',
            'prix_m2': 'decimal',
            'prix_total': 'decimal',
            'proprietaire': 'text',
            'cahier_de_charges': 'document'  # Changed to lowercase for consistency
        },
        'step_two': {
            'date_de_paiement': 'date',
            'paiement_montant': 'decimal',
            'payment_document': 'document'
        },
        'step_three': {
            'attestation_of_split': 'document'
        },
        'step_four': {
            'technical_dossier': 'document'
        },
        'step_five': {
            'notary': 'document'
        },
        'step_six': {
            'numero_de_titre': 'text',
            'property_certificate': 'document',
            'cadastral_plan': 'document',
            'containment_calculation': 'document',
        },
        'step_seven': {
            'quitus': 'document'
        },
    }
    
    # Return the fields and their types corresponding to the current step
        return step_fields.get(self.state, {})
    

    class Meta:
        verbose_name = _('Foncier Workflow')
        verbose_name_plural = _('Foncier Workflows')

    def __str__(self):
        return f"Workflow for {self.parcel.name} - {self.get_state_display()}"


class FoncierDocument(models.Model):
    workflow = models.ForeignKey(
        'FoncierWorkflow', 
        on_delete=models.CASCADE, 
        related_name='documents', 
        verbose_name=_('Workflow')  # Translated
    )
    document = models.FileField(upload_to='foncier/documents/', verbose_name=_('Document'))  # Translated
    name = models.CharField(max_length=255, verbose_name=_('Name'))  # Translated
    document_type = models.CharField(
        max_length=255, 
        choices=FONCIER_FIELD_CHOICES, 
        verbose_name=_('Document Type')  # Translated
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))  # Translated


    class Meta:
        verbose_name = _('Foncier Document')
        verbose_name_plural = _('Foncier Documents')

    def __str__(self):
        return self.name