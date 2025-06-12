
"use client";
import React, { useState } from 'react';
import type { DocumentType, PrimaryGoal, DocumentField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import IconResolver from './IconResolver';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

// Moved lucideIconNames generation outside the component for performance
const lucideIconNames = Object.keys(LucideIcons)
  .filter(key => {
    const iconComponent = (LucideIcons as any)[key];
    // Check if it's a valid React component (functional or forwardRef)
    return typeof iconComponent === 'function' || 
           (typeof iconComponent === 'object' && iconComponent !== null && typeof iconComponent.render === 'function');
  })
  .filter(key => key !== 'createLucideIcon' && key !== 'IconNode' && key !== 'default' && /^[A-Z]/.test(key)) // Filter out non-component exports and ensure it starts with an uppercase letter
  .sort();

interface FeatureCreatorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newDocType: DocumentType) => void;
}

export function FeatureCreatorForm({ isOpen, onClose, onSave }: FeatureCreatorFormProps) {
  const [docTypeName, setDocTypeName] = useState('');
  const [docTypeIcon, setDocTypeIcon] = useState<string | undefined>(undefined);
  const [primaryGoals, setPrimaryGoals] = useState<Array<Partial<PrimaryGoal> & { tempId: string }>>([]);
  const { toast } = useToast();

  const handleAddPrimaryGoal = () => {
    setPrimaryGoals([...primaryGoals, { tempId: Date.now().toString(), label: '', suggestedDetails: [] }]);
  };

  const handlePrimaryGoalChange = (index: number, field: keyof PrimaryGoal, value: any) => {
    const updatedGoals = [...primaryGoals];
    updatedGoals[index] = { ...updatedGoals[index], [field]: value };
    setPrimaryGoals(updatedGoals);
  };

  const handleRemovePrimaryGoal = (index: number) => {
    const updatedGoals = primaryGoals.filter((_, i) => i !== index);
    setPrimaryGoals(updatedGoals);
  };

  const handleAddSuggestedDetail = (goalIndex: number) => {
    const updatedGoals = [...primaryGoals];
    const goal = updatedGoals[goalIndex];
    if (!goal.suggestedDetails) {
      goal.suggestedDetails = [];
    }
    // Ensure detail IDs are unique enough, though tempId is mostly for mapping
    goal.suggestedDetails.push({ id: `temp_detail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, label: '' });
    setPrimaryGoals(updatedGoals);
  };

  const handleSuggestedDetailChange = (goalIndex: number, detailIndex: number, value: string) => {
    const updatedGoals = [...primaryGoals];
    if (updatedGoals[goalIndex]?.suggestedDetails) {
      updatedGoals[goalIndex].suggestedDetails![detailIndex].label = value;
      setPrimaryGoals(updatedGoals);
    }
  };

  const handleRemoveSuggestedDetail = (goalIndex: number, detailIndex: number) => {
    const updatedGoals = [...primaryGoals];
    if (updatedGoals[goalIndex]?.suggestedDetails) {
      updatedGoals[goalIndex].suggestedDetails = updatedGoals[goalIndex].suggestedDetails!.filter((_, i) => i !== detailIndex);
      setPrimaryGoals(updatedGoals);
    }
  };

  const handleSubmit = () => {
    if (!docTypeName.trim()) {
      toast({ title: "Validation Error", description: "Document type name is required.", variant: "destructive" });
      return;
    }
    if (primaryGoals.length === 0 || primaryGoals.some(pg => !pg.label?.trim())) {
      toast({ title: "Validation Error", description: "At least one primary goal with a name is required.", variant: "destructive" });
      return;
    }
    if (primaryGoals.some(pg => pg.suggestedDetails?.some(sd => !sd.label.trim()))) {
       toast({ title: "Validation Error", description: "All suggested details must have a label.", variant: "destructive" });
      return;
    }

    const newDocType: DocumentType = {
      id: docTypeName.trim().toLowerCase().replace(/\s+/g, '_') + `_${Date.now()}`, 
      label: docTypeName.trim(),
      iconName: docTypeIcon || 'FileQuestion',
      primaryGoals: primaryGoals.map((pg, pgIndex) => ({
        id: (pg.label!.trim().toLowerCase().replace(/\s+/g, '_') || `goal_${pgIndex}`) + `_${Date.now()}`,
        label: pg.label!.trim(),
        suggestedDetails: pg.suggestedDetails?.map((sd, sdIndex) => ({
          id: (sd.label.trim().toLowerCase().replace(/\s+/g, '_') || `detail_${sdIndex}`) + `_${Date.now()}`,
          label: sd.label.trim(),
        })).filter(d => d.label) || [],
      })).filter(g => g.label),
      isUserDefined: true,
    };
    onSave(newDocType);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setDocTypeName('');
    setDocTypeIcon(undefined);
    setPrimaryGoals([]);
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetForm(); onClose();} }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline">Create New Document Type Feature</DialogTitle>
          <DialogDescription>
            Define a new document type, its primary goals, and suggested details for extraction.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-200px)] p-1 pr-4"> 
        <div className="grid gap-4 py-4 pr-2"> 
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="docTypeName" className="text-right col-span-1">Name</Label>
            <Input id="docTypeName" value={docTypeName} onChange={(e) => setDocTypeName(e.target.value)} className="col-span-3" placeholder="e.g., Purchase Order" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="docTypeIcon" className="text-right col-span-1">Icon</Label>
            <Select value={docTypeIcon} onValueChange={setDocTypeIcon}>
              <SelectTrigger className="col-span-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  {docTypeIcon && <IconResolver name={docTypeIcon} className="h-4 w-4 flex-shrink-0" />}
                  <SelectValue placeholder="Select an icon (optional)" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="FileQuestion">(Default) FileQuestion</SelectItem>
                {lucideIconNames.map(name => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <h4 className="font-medium mt-4 mb-2 text-lg">Primary Goals</h4>
          {primaryGoals.map((goal, goalIndex) => (
            <div key={goal.tempId} className="border p-4 rounded-md space-y-3 bg-card">
              <div className="flex justify-between items-center">
                <Label htmlFor={`goalName-${goalIndex}`} className="font-semibold">Goal #{goalIndex + 1}</Label>
                <Button variant="ghost" size="icon" onClick={() => handleRemovePrimaryGoal(goalIndex)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`goalNameInput-${goalIndex}`}>Goal Name</Label>
                <Input
                  id={`goalNameInput-${goalIndex}`}
                  value={goal.label || ''}
                  onChange={(e) => handlePrimaryGoalChange(goalIndex, 'label', e.target.value)}
                  placeholder="e.g., Extract Contact Info"
                />
              </div>
              
              <h5 className="font-medium text-sm mt-3">Suggested Details for this Goal:</h5>
              {goal.suggestedDetails?.map((detail, detailIndex) => (
                <div key={detail.id || `suggested-detail-${goalIndex}-${detailIndex}`} className="flex items-center space-x-2">
                  <Input
                    value={detail.label}
                    onChange={(e) => handleSuggestedDetailChange(goalIndex, detailIndex, e.target.value)}
                    placeholder={`Detail ${detailIndex + 1} label`}
                    className="flex-grow"
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveSuggestedDetail(goalIndex, detailIndex)} aria-label="Remove suggested detail">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => handleAddSuggestedDetail(goalIndex)} className="mt-2">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Suggested Detail
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={handleAddPrimaryGoal} className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Primary Goal
          </Button>
        </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}><Save className="mr-2 h-4 w-4" /> Save Document Type</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    