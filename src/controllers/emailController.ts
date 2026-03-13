import { Request, Response } from 'express';
import { Email, IEmail } from '../models/Email';
import { AuthRequest } from '../middleware/auth';
import { sendEmailsToProvider } from '../services/emailProviderService';
import { emitEmailUpdate, setupSocketIO } from '../socket/socketHandler';
import { Server as HttpServer } from 'http';
import app from '../app';

  
  /**
 * Erstellt 1000 Email-Einträge in der Datenbank
 * POST /api/emails/create-batch
 */
export const createBatchEmails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.userId || 'default-owner';
    
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
export const getAllEmails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, limit = 100, skip = 0 } = req.query;
    const ownerId = req.userId;
    
    const query: any = { ownerId };
    if (status) query.status = status;
    
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
/**
 * Paginierte Email-Liste
 * GET /api/emails/paginated
 * 
 * TODO: Diese Route muss vom Bewerber implementiert werden!
 * Erwartete Query-Parameter:
 * - page: Seitennummer (default: 1)
 * - limit: Anzahl pro Seite (default: 20)
 * - status: Optionaler Filter nach Status
 * 
 * Erwartete Response:
 * {
 *   success: true,
 *   emails: [...],
 *   pagination: {
 *     page: 1,
 *     limit: 20,
 *     total: 1000,
 *     totalPages: 50,
 *     hasNext: true, // this is not needed as you can just make it disabled and not sent requests
 *     hasPrev: false// this is not needed as you can just make it disabled and not sent requests
 *   }
 * }
 */
export const getPaginatedEmails = async (req: AuthRequest, res: Response): Promise<void> => {
  // TODO: Implementiere diese Route mit Pagination
  // Der Bewerber soll hier zeigen, dass er Pagination versteht
   try {
    const { status, limit = 20,page } = req.query;
    const ownerId = req.userId;
    const skip = Number(page) === 1 ? 0 : Number(limit) * Number(page); 
    const query: any = { ownerId };
    if (status) query.status = status;
    
    const emails = await Email.find(query)
      .limit(Number(limit))
      .skip(Number(skip))
      .sort({ createdAt: -1 });
    
    const total = await Email.countDocuments(query);
    const totalPages =  Number(total) > Number(limit) ? Number(total) / Number(limit) : 1
    const pagination = {
        page,
        total,
        limit,
        totalPages: Math.round(totalPages)
      }
    res.json({
      success: true,
      emails,
      pagination
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
export const sendMails = async () =>{
  try{
const emails = await Email.find({status:{$ne: "sent"}}).limit(100).lean();
if(emails.length <= 0) {
  console.log("no emails")
  return null;
}
    const responseOfProvider = await sendEmailsToProvider(emails);
    const sentEmails = responseOfProvider.map((externalId:string| undefined, index:number) => {
      const mail = emails[index];
      const filter = {_id:mail._id}
      const update = {...mail, status:!!externalId ? "sent": "failed", externalId}
      return {updateOne: {filter,update}}
    });
    await Email.bulkWrite(sentEmails)
    return sentEmails
  }
  catch(e){
    console.error("e",e);
  }
 
}
export const postSendEmails = async(req:AuthRequest, res:Response): Promise<void> => {
  try{

  const emails = await sendMails()    
    emitEmailUpdate(app.io,"",[]);
    res.status(200).json({
      items:emails
    })
  } catch(e){
    console.error("Es konnten keine Emails gesendet werden", e);
  }
}
export const getEmailStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.userId;
    
    const stats = await Email.aggregate([
      { $match: { ownerId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await Email.countDocuments({ ownerId });
    
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