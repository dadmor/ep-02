// components/SchemaForm.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormSchemaStore } from '@/utility';


interface SchemaFormProps {
  schemaPath: string;
  onSubmit: (data: any) => void;
  submitLabel?: string;
  className?: string;
}

export const SchemaForm: React.FC<SchemaFormProps> = ({
  schemaPath,
  onSubmit,
  submitLabel = "Dalej",
  className = ""
}) => {
  const { getSchemaFragment, setData, getData } = useFormSchemaStore();
  const [processId] = schemaPath.split('.');
  const [formError, setFormError] = React.useState('');
  
  const schema = getSchemaFragment(schemaPath);
  const formData = getData(processId);
  
  if (!schema) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Nie znaleziono schematu dla ścieżki: {schemaPath}</AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Walidacja
    if (schema.required) {
      for (const field of schema.required) {
        if (!formData[field]) {
          setFormError(`Pole ${field} jest wymagane`);
          return;
        }
      }
    }
    
    // Custom walidacja
    if (schema.validation) {
      const error = schema.validation(formData);
      if (error) {
        setFormError(error);
        return;
      }
    }
    
    onSubmit(formData);
  };

  const updateField = (fieldName: string, value: any) => {
    setData(processId, { ...formData, [fieldName]: value });
  };

  const renderField = (fieldName: string, fieldSchema: any) => {
    const value = formData[fieldName] || '';
    
    switch (fieldSchema.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>{fieldSchema.title || fieldName}</Label>
            <Input
              id={fieldName}
              type={fieldSchema.type}
              value={value}
              placeholder={fieldSchema.placeholder}
              onChange={(e) => updateField(fieldName, e.target.value)}
              required={schema.required?.includes(fieldName)}
            />
          </div>
        );
        
      case 'select':
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>{fieldSchema.title || fieldName}</Label>
            <Select value={value} onValueChange={(val) => updateField(fieldName, val)}>
              <SelectTrigger>
                <SelectValue placeholder={fieldSchema.placeholder || "Wybierz opcję"} />
              </SelectTrigger>
              <SelectContent>
                {fieldSchema.options?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{schema.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {schema.properties && Object.entries(schema.properties).map(([fieldName, fieldSchema]) =>
            renderField(fieldName, fieldSchema)
          )}
          
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <Button type="submit" className="w-full">
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};