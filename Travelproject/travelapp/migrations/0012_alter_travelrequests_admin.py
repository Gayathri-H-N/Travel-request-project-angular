# Generated by Django 4.2 on 2025-03-25 19:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('travelapp', '0011_alter_travelrequests_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='travelrequests',
            name='admin',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='travelapp.admin'),
        ),
    ]
