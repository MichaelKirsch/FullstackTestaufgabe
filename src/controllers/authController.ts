import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';

/**
 * Registrierung eines neuen Users
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Username und Passwort sind erforderlich'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Passwort muss mindestens 6 Zeichen lang sein'
      });
      return;
    }

    // Prüfe ob User bereits existiert
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Username bereits vergeben'
      });
      return;
    }

    // Erstelle neuen User
    const user = new User({
      username: username.toLowerCase(),
      password
    });

    await user.save();

    // Generiere Token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'User erfolgreich registriert',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler bei der Registrierung',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
};

/**
 * Login eines Users
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: 'Username und Passwort sind erforderlich'
      });
      return;
    }

    // Finde User
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Ungültige Anmeldedaten'
      });
      return;
    }

    // Prüfe Passwort
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Ungültige Anmeldedaten'
      });
      return;
    }

    // Generiere Token
    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: 'Erfolgreich angemeldet',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Fehler beim Login:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Login',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
};

