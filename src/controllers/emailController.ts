import { Request, Response } from 'express';
import { Email, IEmail } from '../models/Email';

/**
 * Erstellt 1000 Email-Einträge in der Datenbank
 * POST /api/emails/create-batch
 */
export const createBatchEmails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ownerId = 'default-owner' } = req.body;
    
    const emails: Partial<IEmail>[] = [];
    const now = new Date();
    
    // Erstelle 1000 Email-Einträge
    for (let i = 0; i < 1000; i++) {
      emails.push({
        subject: `Test Email ${i + 1}`,
        toEmail: `recipient${i}@example.com`,
        fromEmail: 'sender@example.com',
        body: `Dies ist der Body der Test-Email Nummer ${i + 1}`,
        status: 'pending',
        createdAt: now,
        ownerId: ownerId
      });
    }
    
    const createdEmails = await Email.insertMany(emails);
    
    res.status(201).json({
      success: true,
      message: `${createdEmails.length} Emails erfolgreich erstellt`,
      count: createdEmails.length,
      emails: createdEmails.map(email => ({
        id: email._id,
        subject: email.subject,
        status: email.status
      }))
    });
  } catch (error) {
    console.error('Fehler beim Erstellen der Emails:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Erstellen der Emails',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
};

/**
 * Ruft alle Emails ab
 * GET /api/emails
 */
export const getAllEmails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, ownerId, limit = 100, skip = 0 } = req.query;
    
    const query: any = {};
    if (status) query.status = status;
    if (ownerId) query.ownerId = ownerId;
    
    const emails = await Email.find(query)
      .limit(Number(limit))
      .skip(Number(skip))
      .sort({ createdAt: -1 });
    
    const total = await Email.countDocuments(query);
    
    res.json({
      success: true,
      count: emails.length,
      total,
      emails
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Emails:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Emails',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
};

/**
 * Ruft eine einzelne Email ab
 * GET /api/emails/:id
 */
export const getEmailById = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = await Email.findById(req.params.id);
    
    if (!email) {
      res.status(404).json({
        success: false,
        message: 'Email nicht gefunden'
      });
      return;
    }
    
    res.json({
      success: true,
      email
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Email:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Email',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
};

/**
 * Statistiken über Email-Status
 * GET /api/emails/stats
 */
export const getEmailStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Email.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Email.countDocuments();
    
    res.json({
      success: true,
      total,
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>)
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Statistiken:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Statistiken',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
};

