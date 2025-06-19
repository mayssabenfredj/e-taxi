import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface SelectMultipleProps {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const SelectMultiple: React.FC<SelectMultipleProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  className,
}) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (optionValue: string) => {
    const newValues = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValues);
  };

  const displayText =
    value.length > 0
      ? value
          .map((val) => options.find((opt) => opt.value === val)?.label)
          .filter(Boolean)
          .join(', ')
      : placeholder;

  return (
    <Select open={open} onOpenChange={setOpen}>
      <SelectTrigger className={className}>
        <SelectValue>
          {value.length > 0 ? (
            <div className="flex items-center space-x-1">
              <span className="truncate max-w-[200px]">{displayText}</span>
              <Badge variant="secondary" className="ml-2">
                {value.length}
              </Badge>
            </div>
          ) : (
            placeholder
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-60 overflow-y-auto">
        {options.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-2 px-2 py-1.5 hover:bg-accent cursor-pointer"
            onClick={() => handleToggle(option.value)}
          >
            <Checkbox
              checked={value.includes(option.value)}
              onCheckedChange={() => handleToggle(option.value)}
              id={`option-${option.value}`}
            />
            <Label htmlFor={`option-${option.value}`} className="text-sm cursor-pointer flex-1">
              {option.label}
            </Label>
          </div>
        ))}
      </SelectContent>
    </Select>
  );
};