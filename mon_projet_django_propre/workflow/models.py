# workflow/models.py
from django.db import models
import uuid

class Workflow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    steps = models.JSONField(default=list)
    roles_autorises = models.JSONField(default=list)
    delai_maximum = models.IntegerField(help_text="Délai maximum en jours")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'workflow_workflows'
    
    def __str__(self):
        return self.name