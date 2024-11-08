# Generated by Django 5.0.7 on 2024-10-17 17:15

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('occupationtempworkflow', '0002_occupationworkflow_created_at'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='occupationdocument',
            options={'verbose_name': 'Occupation Document', 'verbose_name_plural': 'Occupation Documents'},
        ),
        migrations.AlterModelOptions(
            name='occupationworkflow',
            options={'verbose_name': 'Occupation Workflow', 'verbose_name_plural': 'Occupation Workflows'},
        ),
        migrations.AlterModelOptions(
            name='yearlyoccupationdata',
            options={'verbose_name': 'Yearly Occupation Data', 'verbose_name_plural': 'Yearly Occupation Data'},
        ),
    ]
