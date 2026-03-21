import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for form management
 * @param {object} initialValues - Initial form values
 * @param {object} validations - Validation functions
 * @param {Function} onSubmit - Submit handler
 */
export const useForm = (initialValues = {}, validations = {}, onSubmit = null) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validate a single field
    const validateField = useCallback((name, value) => {
        if (validations[name]) {
            const error = validations[name](value, values);
            setErrors(prev => ({ ...prev, [name]: error }));
            return error;
        }
        return null;
    }, [validations, values]);

    // Validate all fields
    const validateAll = useCallback(() => {
        const newErrors = {};
        Object.keys(validations).forEach(field => {
            const error = validations[field](values[field], values);
            if (error) {
                newErrors[field] = error;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [validations, values]);

    // Handle input change
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setValues(prev => ({ ...prev, [name]: newValue }));
        
        if (touched[name]) {
            validateField(name, newValue);
        }
    }, [touched, validateField]);

    // Handle blur event
    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, values[name]);
    }, [values, validateField]);

    // Reset form
    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    // Submit form
    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();
        
        const isValid = validateAll();
        if (!isValid) return;
        
        setIsSubmitting(true);
        
        try {
            if (onSubmit) {
                await onSubmit(values);
            }
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [values, validateAll, onSubmit]);

    // Set field value programmatically
    const setFieldValue = useCallback((field, value) => {
        setValues(prev => ({ ...prev, [field]: value }));
        if (touched[field]) {
            validateField(field, value);
        }
    }, [touched, validateField]);

    // Set field error programmatically
    const setFieldError = useCallback((field, error) => {
        setErrors(prev => ({ ...prev, [field]: error }));
    }, []);

    const isFormValid = useMemo(() => {
        return Object.keys(errors).length === 0 && 
               Object.keys(initialValues).length === Object.keys(values).length;
    }, [errors, values, initialValues]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isFormValid,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setFieldValue,
        setFieldError,
        validateAll
    };
};

export default useForm;