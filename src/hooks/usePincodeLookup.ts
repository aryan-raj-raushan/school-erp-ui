'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useWatch, type FieldValues, type Path, type PathValue, type UseFormReturn } from 'react-hook-form';
import { PincodeService, type PincodeDetails } from '@/services/pincode.service';
import { REGEX } from '@/constants/regex.constants';
import { errorMessage } from '@/lib/api-error';

export function usePincodeLookup(onResolved: (details: PincodeDetails) => void) {
  const [isLooking, setIsLooking] = useState(false);
  const [lookupError, setLookupError] = useState<string | undefined>();
  const lastLookedUp = useRef<string | null>(null);
  const onResolvedRef = useRef(onResolved);
  useEffect(() => {
    onResolvedRef.current = onResolved;
  });

  const lookup = useCallback(async (pincode: string) => {
    const value = pincode.trim();
    if (!REGEX.pincodeIn.test(value)) {
      setLookupError(undefined);
      lastLookedUp.current = null;
      return;
    }
    if (lastLookedUp.current === value) return;
    lastLookedUp.current = value;
    setIsLooking(true);
    setLookupError(undefined);
    try {
      onResolvedRef.current(await PincodeService.lookup(value));
    } catch (err) {
      lastLookedUp.current = null;
      setLookupError(errorMessage(err, 'Could not find this pincode — enter city and state manually'));
    } finally {
      setIsLooking(false);
    }
  }, []);

  return { lookup, isLooking, lookupError };
}

export function usePincodeAutofill<T extends FieldValues>(
  form: UseFormReturn<T>,
  fields: { pincode: Path<T>; city: Path<T>; state: Path<T> },
) {
  const pincode = useWatch({ control: form.control, name: fields.pincode }) as string | undefined;
  const { lookup, isLooking, lookupError } = usePincodeLookup((details) => {
    const options = { shouldDirty: true, shouldValidate: true };
    form.setValue(fields.city, details.city as PathValue<T, Path<T>>, options);
    form.setValue(fields.state, details.state as PathValue<T, Path<T>>, options);
  });

  useEffect(() => {
    void lookup(String(pincode ?? ''));
  }, [pincode, lookup]);

  return { isLooking, lookupError };
}
