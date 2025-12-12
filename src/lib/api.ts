import { supabase } from './supabase';
import type { EmailSubmission, ContactMessage } from '../types';

export async function submitEmail(data: EmailSubmission): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('email_submissions')
      .insert({
        email: data.email,
        privacy_accepted: data.privacyAccepted,
        data_processing_accepted: data.dataProcessingAccepted,
        newsletter_opt_in: data.newsletterOptIn,
      });

    if (error) {
      if (error.code === '23505') {
        return { success: true, message: 'Email zapisany' };
      }
      console.error('Error submitting email:', error);
      return { success: false, message: 'Wystąpił błąd podczas zapisywania email' };
    }

    return { success: true, message: 'Email zapisany pomyślnie' };
  } catch (error) {
    console.error('Error in submitEmail:', error);
    return { success: false, message: 'Wystąpił błąd połączenia' };
  }
}

export async function submitContactMessage(data: ContactMessage): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: data.name,
        email: data.email,
        message: data.message,
        status: 'new',
      });

    if (error) {
      console.error('Error submitting contact message:', error);
      return { success: false, message: 'Wystąpił błąd podczas wysyłania wiadomości' };
    }

    return { success: true, message: 'Wiadomość wysłana pomyślnie' };
  } catch (error) {
    console.error('Error in submitContactMessage:', error);
    return { success: false, message: 'Wystąpił błąd połączenia' };
  }
}

export async function logAnonymization(
  sessionId: string,
  fileType: string,
  fileSizeKb: number,
  processingTimeMs: number,
  success: boolean,
  errorType?: string
): Promise<void> {
  try {
    await supabase.from('anonymization_logs').insert({
      session_id: sessionId,
      file_type: fileType,
      file_size_kb: fileSizeKb,
      processing_time_ms: processingTimeMs,
      success,
      error_type: errorType,
    });
  } catch (error) {
    console.error('Error logging anonymization:', error);
  }
}
