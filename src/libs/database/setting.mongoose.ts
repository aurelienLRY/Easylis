import mongoose from "mongoose";

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI must be defined");
}

// Variable pour suivre l'état de la connexion
let isConnected = false;
let connectionPromise: Promise<boolean> | null = null;

export const connectDB = async () => {
  try {
    // Si déjà connecté, on retourne directement
    if (isConnected) {
      return Promise.resolve(true);
    }

    // Si une connexion est en cours, on attend qu'elle se termine
    if (connectionPromise) {
      return connectionPromise;
    }

    // Créer une nouvelle promesse de connexion
    connectionPromise = (async () => {
      try {
        // Configuration moderne pour optimiser les connexions
        const options = {
          maxPoolSize: 10, // Nombre maximum de connexions dans le pool
          serverSelectionTimeoutMS: 5000, // Timeout de sélection du serveur
          socketTimeoutMS: 45000, // Timeout des sockets
          bufferCommands: false, // Désactiver le buffering des commandes
        };

        const { connection } = await mongoose.connect(MONGODB_URI, options);
        
        // Écouter les événements de connexion
        connection.on('connected', () => {
          console.log('MongoDB connected successfully');
          isConnected = true;
        });

        connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
          isConnected = false;
        });

        connection.on('disconnected', () => {
          console.log('MongoDB disconnected');
          isConnected = false;
        });

        // Gestion propre de la fermeture de l'application
        process.on('SIGINT', async () => {
          await mongoose.connection.close();
          process.exit(0);
        });

        if (connection.readyState === 1) {
          isConnected = true;
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        isConnected = false;
        throw error;
      } finally {
        connectionPromise = null;
      }
    })();

    return connectionPromise;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    isConnected = false;
    connectionPromise = null;
    return Promise.reject(error);
  }
};

// Version optimisée pour les routes externes (pas de déconnexion)
export const connectDBOnce = async () => {
  try {
    // Si déjà connecté, on retourne directement
    if (isConnected && mongoose.connection.readyState === 1) {
      return Promise.resolve(true);
    }

    // Si une connexion est en cours, on attend qu'elle se termine
    if (connectionPromise) {
      return connectionPromise;
    }

    return await connectDB();
  } catch (error) {
    console.error("Error in connectDBOnce:", error);
    return Promise.reject(error);
  }
};

export const disconnectDB = async () => {
  try {
    // Ne déconnecter que si on est en mode développement ou si explicitement demandé
    if (process.env.NODE_ENV === 'development' && isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      connectionPromise = null;
      console.log('MongoDB disconnected (development mode)');
    }
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
    return Promise.reject(error);
  }
};

// Fonction pour vérifier l'état de la connexion
export const isDBConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};
