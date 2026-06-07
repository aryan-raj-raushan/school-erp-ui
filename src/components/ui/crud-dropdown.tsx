'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, Plus, Check, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inputBase } from './form';

export interface CrudDropdownItem {
  id: string;
  name: string;
}

interface CrudDropdownProps {
  items: CrudDropdownItem[];
  value?: string;
  onChange: (name: string) => void;
  onAdd: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function CrudDropdown({
  items,
  value,
  onChange,
  onAdd,
  onUpdate,
  onDelete,
  placeholder = 'Select...',
  isLoading = false,
  className,
}: CrudDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addValue, setAddValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setEditingId(null);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function startEdit(item: CrudDropdownItem, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(item.id);
    setEditValue(item.name);
  }

  function cancelEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setEditingId(null);
    setEditValue('');
  }

  async function saveEdit(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!editValue.trim()) return;
    setIsSaving(true);
    try {
      await onUpdate(id, editValue.trim());
      if (value === items.find((i) => i.id === id)?.name) onChange(editValue.trim());
      setEditingId(null);
      setEditValue('');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string, name: string, e: React.MouseEvent) {
    e.stopPropagation();
    setIsSaving(true);
    try {
      await onDelete(id);
      if (value === name) onChange('');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAdd() {
    if (!addValue.trim()) return;
    setIsSaving(true);
    try {
      await onAdd(addValue.trim());
      setAddValue('');
    } finally {
      setIsSaving(false);
    }
  }

  function selectItem(name: string) {
    onChange(name);
    setIsOpen(false);
    setEditingId(null);
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Trigger — same look as Input/Select */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          inputBase,
          'flex w-full items-center justify-between',
          isOpen && 'ring-2 ring-ring border-primary',
        )}
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground truncate'}>
          {value || placeholder}
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform ml-2', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-[8px] border border-border bg-white/90 dark:bg-white/10 backdrop-blur-sm shadow-lg">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-muted-foreground">Loading…</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-2 text-sm text-muted-foreground">No items yet. Add one below.</div>
          ) : (
            <ul className="max-h-52 overflow-y-auto py-1">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    'group flex items-center gap-1 px-3 py-1.5 text-sm',
                    editingId !== item.id && 'cursor-pointer hover:bg-muted/60',
                    value === item.name && editingId !== item.id && 'bg-muted/60 font-medium',
                  )}
                  onClick={() => editingId !== item.id && selectItem(item.name)}
                >
                  {editingId === item.id ? (
                    <>
                      <input
                        autoFocus
                        className={cn(inputBase, 'flex-1 h-8 py-1 px-2 text-sm')}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(item.id, e as unknown as React.MouseEvent);
                          if (e.key === 'Escape') cancelEdit(e as unknown as React.MouseEvent);
                        }}
                      />
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={(e) => saveEdit(item.id, e)}
                        className="p-1 rounded hover:bg-muted text-green-600 shrink-0"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="p-1 rounded hover:bg-muted text-muted-foreground shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 truncate">{item.name}</span>
                      <button
                        type="button"
                        onClick={(e) => startEdit(item, e)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={(e) => handleDelete(item.id, item.name, e)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-border px-3 py-2">
            <div className="flex items-center gap-2">
              <input
                className={cn(inputBase, 'flex-1 h-8 py-1 px-2 text-sm')}
                placeholder="Add item…"
                value={addValue}
                onChange={(e) => setAddValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
              />
              <button
                type="button"
                disabled={isSaving || !addValue.trim()}
                onClick={handleAdd}
                className="flex shrink-0 items-center gap-1 px-2 py-1 rounded-[8px] text-xs font-medium bg-primary text-primary-foreground disabled:opacity-50 transition-all"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
