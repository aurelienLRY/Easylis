import { NextRequest, NextResponse } from 'next/server';
import { nodeMailerSender } from '@/services/Mailer/serverSide';
import { IEmailSendResult } from '@/services/Mailer/clientSide/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, content } = body;

    // Validation des données
    if (!to || !subject || !content) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données manquantes: to, subject et content sont requis' 
        },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Format d\'email invalide' 
        },
        { status: 400 }
      );
    }

    // Envoi de l'email via nodemailer (côté serveur)
    const result: IEmailSendResult = await nodeMailerSender(to, subject, content);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          messageId: result.messageId,
          recipient: result.recipient,
          subject: result.subject,
          timestamp: result.timestamp,
          retryCount: result.retryCount
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        type: 'UNKNOWN_ERROR',
        message: 'Erreur inattendue lors de l\'envoi de l\'email',
        details: error.message,
        retryable: true
      }
    }, { status: 500 });
  }
} 