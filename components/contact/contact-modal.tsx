'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

/** Mismo endpoint de Formspree que usaba el formulario original del sitio. */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mqalerak';

export interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setSubmitStatus('idle');
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-lg md:p-8"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="contact-modal-title"
                  className="text-[1.5rem] font-bold leading-tight text-blue"
                >
                  {t('modal.title')}
                </h2>
                {submitStatus !== 'success' && (
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-black/70">
                    {t('modal.description')}
                  </p>
                )}
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={handleClose}
                aria-label={t('modal.close')}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-black transition hover:bg-beige focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {submitStatus === 'success' ? (
              <div className="mt-6 text-center">
                <CheckCircle2
                  className="mx-auto h-14 w-14 text-blue"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h3 className="mt-4 text-[1.2rem] font-bold text-black">
                  {t('modal.success.title')}
                </h3>
                <p className="mt-2 leading-relaxed text-black/70">{t('modal.success.message')}</p>
                <button
                  type="button"
                  onClick={() => setSubmitStatus('idle')}
                  className="mt-5 font-bold text-blue underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
                >
                  {t('modal.success.button')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="contact-name" className="text-[0.9rem] font-bold text-black">
                    {t('modal.form.name')}
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('modal.form.namePlaceholder')}
                    className="mt-1 w-full rounded-xl border-2 border-black/10 bg-beige-light focus:border-blue focus:ring-0"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="text-[0.9rem] font-bold text-black">
                    {t('modal.form.email')}
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('modal.form.emailPlaceholder')}
                    className="mt-1 w-full rounded-xl border-2 border-black/10 bg-beige-light focus:border-blue focus:ring-0"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="text-[0.9rem] font-bold text-black">
                    {t('modal.form.message')}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('modal.form.messagePlaceholder')}
                    className="mt-1 w-full rounded-xl border-2 border-black/10 bg-beige-light focus:border-blue focus:ring-0"
                  />
                </div>

                {submitStatus === 'error' && (
                  <p role="alert" className="text-[0.9rem] font-bold text-red">
                    {t('modal.error')}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-[3.25rem] w-full items-center justify-center rounded-lg bg-blue px-7 text-[1.05rem] font-bold uppercase tracking-tight text-white transition hover:bg-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-black/20"
                >
                  {isSubmitting ? t('modal.form.sending') : t('modal.form.submit')}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
